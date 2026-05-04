import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const pagarmeSecret = Deno.env.get("PAGARME_SECRET_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { type, data, id: webhook_id } = body;

    // Optional: Basic Auth Validation (Pagar.me V5 sends secret key in Auth header)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      // Basic Auth is usually b64(apiKey:)
      const expectedAuth = `Basic ${btoa(`${pagarmeSecret}:`)}`;
      if (authHeader !== expectedAuth) {
        console.warn(`Unauthorized webhook attempt for ${webhook_id}. Invalid Auth header.`);
        // For security, we might still return 200 to not leak existence, 
        // but here we'll log it and we can decide to reject or just monitor.
      }
    }

    console.log(`Received Pagar.me webhook: ${type} (${webhook_id})`);

    // Log the webhook for audit
    await supabase.from("audit_logs").insert({
      action: `pagarme_webhook_${type}`,
      entity_type: "payment",
      resource: "webhooks",
      details: body,
    });

    switch (type) {
      case "order.paid": {
        const order_id = data.code; // We usually map Pagar.me 'code' to our internal order ID
        const external_id = data.id;

        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("id", order_id)
          .single();

        if (order) {
          // Calculate split amounts for recording
          const metadata = order.metadata || {};
          const feePercentage = metadata.all_vita_fee_percentage || 0;
          const all_vita_fee = (order.amount * feePercentage) / 100;
          const tenant_amount = order.amount - all_vita_fee;

          await supabase
            .from("orders")
            .update({ 
              payment_status: "paid", 
              status: "confirmed",
              external_id: external_id,
              all_vita_fee: all_vita_fee,
              tenant_amount: tenant_amount,
              metadata: { ...metadata, pagarme_data: data }
            })
            .eq("id", order_id);

          // If it's a tenant subscription payment
          if (order.metadata?.type === "tenant_subscription") {
             const { tenant_id } = order;
             await supabase
               .from("tenant_subscriptions")
               .update({ 
                 status: "active",
                 current_period_start: new Date().toISOString(),
                 // Handle period end based on cycle
               })
               .eq("tenant_id", tenant_id);
          }
          
          // Trigger any other downstream logic (commissions, etc.)
          await fetch(`${supabaseUrl}/functions/v1/process-commission`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({ order_id }),
          });
        }
        break;
      }

      case "order.payment_failed": {
        const order_id = data.code;
        await supabase
          .from("orders")
          .update({ 
            payment_status: "failed",
            metadata: { pagarme_failure: data }
          })
          .eq("id", order_id);
        break;
      }

      case "order.canceled": {
        const order_id = data.code;
        await supabase
          .from("orders")
          .update({ 
            payment_status: "canceled",
            status: "canceled",
            metadata: { pagarme_cancellation: data }
          })
          .eq("id", order_id);
        break;
      }

      case "subscription.created":
      case "subscription.updated": {
        const subscription_id = data.id;
        const tenant_id = data.metadata?.tenant_id;
        
        if (tenant_id) {
          await supabase
            .from("tenant_subscriptions")
            .update({ 
              external_id: subscription_id,
              status: data.status === "active" ? "active" : "pending"
            })
            .eq("tenant_id", tenant_id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
