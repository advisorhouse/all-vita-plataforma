import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// WEBHOOK RECEIVER v1.0
// Receives webhooks from payment gateways, ERPs, CRMs
// Logs everything immutably, processes events
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const source = url.searchParams.get("source") || "unknown";

  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    payload = { raw: "non-json body" };
  }

  const eventType = payload.event || payload.type || payload.event_type || "unknown";

  // Log webhook immediately (immutable)
  const { data: logEntry, error: logErr } = await supabase
    .from("webhook_logs")
    .insert({
      source,
      event_type: eventType,
      payload,
      status: "received",
    })
    .select("id")
    .single();

  if (logErr) {
    console.error("Failed to log webhook:", logErr);
    return new Response(
      JSON.stringify({ error: "Failed to log webhook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Process based on event type
  try {
    let processed = false;
    let responseMessage = "Event received but not processed";

    // Payment approved
    if (eventType === "payment.approved" || eventType === "payment_intent.succeeded" || eventType === "charge.succeeded") {
      const clientId = payload.client_id || payload.metadata?.client_id;
      const amount = payload.amount || payload.data?.object?.amount;
      const cycle = payload.subscription_cycle || payload.metadata?.cycle || 1;

      if (clientId && amount) {
        // Create order
        await supabase.from("orders").insert({
          client_id: clientId,
          amount: typeof amount === "number" && amount > 1000 ? amount / 100 : amount, // handle cents
          payment_status: "paid",
          status: "confirmed",
          subscription_cycle: cycle,
        });

        // Ensure client is active
        await supabase.from("client_profiles")
          .update({ subscription_status: "active" })
          .eq("id", clientId);

        processed = true;
        responseMessage = "Payment processed, order created";
      }
    }

    // Payment failed
    if (eventType === "payment.failed" || eventType === "payment_intent.payment_failed" || eventType === "charge.failed") {
      const clientId = payload.client_id || payload.metadata?.client_id;
      if (clientId) {
        await supabase.from("orders").insert({
          client_id: clientId,
          amount: payload.amount || 0,
          payment_status: "failed",
          status: "failed",
        });

        // Alert admin
        await supabase.from("ai_alerts").insert({
          target_role: "admin",
          alert_type: "payment_failed",
          title: "Pagamento falhou",
          description: `Pagamento do cliente ${clientId} falhou. Verificar gateway.`,
          severity: "warning",
          metadata: { client_id: clientId, source },
        });

        processed = true;
        responseMessage = "Payment failure recorded";
      }
    }

    // Subscription cancelled
    if (eventType === "subscription.cancelled" || eventType === "customer.subscription.deleted") {
      const clientId = payload.client_id || payload.metadata?.client_id;
      if (clientId) {
        await supabase.from("client_profiles")
          .update({ subscription_status: "cancelled" })
          .eq("id", clientId);

        await supabase.from("ai_alerts").insert({
          target_role: "admin",
          alert_type: "subscription_cancelled",
          title: "Assinatura cancelada via webhook",
          description: `Cliente ${clientId} cancelou a assinatura via ${source}.`,
          severity: "warning",
          metadata: { client_id: clientId, source },
        });

        processed = true;
        responseMessage = "Cancellation processed";
      }
    }

    // Client reactivated
    if (eventType === "subscription.reactivated" || eventType === "customer.subscription.resumed") {
      const clientId = payload.client_id || payload.metadata?.client_id;
      if (clientId) {
        await supabase.from("client_profiles")
          .update({ subscription_status: "active" })
          .eq("id", clientId);

        processed = true;
        responseMessage = "Reactivation processed";
      }
    }

    // Update webhook log status (via new insert since logs are immutable)
    // We use service role which bypasses the trigger
    // Actually the trigger prevents UPDATE, so we'll track status via a separate approach
    // For now, the initial insert status is the final status

    return new Response(
      JSON.stringify({
        success: true,
        webhook_id: logEntry?.id,
        processed,
        message: responseMessage,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        webhook_id: logEntry?.id,
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
