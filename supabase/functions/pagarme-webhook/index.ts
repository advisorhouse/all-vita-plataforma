import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const pagarmeSecret = Deno.env.get("PAGARME_SECRET_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: corsHeaders });
  }

  const { type, data, id: webhook_id } = body || {};
  const authHeader = req.headers.get("Authorization");
  const signatureValid = authHeader === `Basic ${btoa(`${pagarmeSecret}:`)}`;

  // Persist event always (audit + monitoring)
  const { data: eventRow } = await supabase
    .from("pagarme_webhook_events")
    .insert({
      event_id: webhook_id || null,
      event_type: type || "unknown",
      resource_type: data?.object || null,
      resource_id: data?.id || null,
      payload: body,
      signature: authHeader || null,
      processed: false,
      tenant_id: data?.metadata?.tenant_id || data?.code || null,
    })
    .select("id")
    .single();

  console.log(`Pagar.me webhook: ${type} (${webhook_id}) sigOk=${signatureValid}`);

  let processError: string | null = null;
  try {
    switch (type) {
      case "order.paid": {
        const order_id = data.code;
        const external_id = data.id;
        const { data: order } = await supabase.from("orders").select("*").eq("id", order_id).single();
        if (order) {
          const metadata = order.metadata || {};
          const feePercentage = metadata.all_vita_fee_percentage || 0;
          const all_vita_fee = (order.amount * feePercentage) / 100;
          const tenant_amount = order.amount - all_vita_fee;
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "confirmed",
              external_id,
              all_vita_fee,
              tenant_amount,
              metadata: { ...metadata, pagarme_data: data },
            })
            .eq("id", order_id);

          await fetch(`${supabaseUrl}/functions/v1/process-commission`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
            body: JSON.stringify({ order_id }),
          });
        }
        break;
      }

      case "order.payment_failed": {
        await supabase
          .from("orders")
          .update({ payment_status: "failed", metadata: { pagarme_failure: data } })
          .eq("id", data.code);
        break;
      }

      case "order.canceled": {
        await supabase
          .from("orders")
          .update({ payment_status: "canceled", status: "canceled", metadata: { pagarme_cancellation: data } })
          .eq("id", data.code);
        break;
      }

      case "charge.refunded": {
        const order_code = data?.order?.code;
        if (order_code) {
          await supabase
            .from("orders")
            .update({ payment_status: "refunded", metadata: { pagarme_refund: data } })
            .eq("id", order_code);
        }
        break;
      }

      case "recipient.status_changed":
      case "recipient.created":
      case "recipient.updated": {
        // data.code = nosso tenant_id (foi enviado em create-recipient)
        const tenantId = data?.code;
        const newStatus = data?.status;
        if (tenantId) {
          await supabase
            .from("tenants")
            .update({
              pagarme_recipient_status: newStatus,
              pagarme_recipient_status_reason: data?.status_reason || null,
            })
            .eq("id", tenantId);

          // Notificar tenant admins
          const { data: admins } = await supabase
            .from("memberships")
            .select("user_id")
            .eq("tenant_id", tenantId)
            .eq("role", "admin")
            .eq("active", true);

          const title =
            newStatus === "active"
              ? "Pagamentos liberados!"
              : newStatus === "refused" || newStatus === "blocked"
              ? "Cadastro Pagar.me precisa de ajustes"
              : "Status do cadastro Pagar.me atualizado";
          const message =
            newStatus === "active"
              ? "Sua conta no Pagar.me foi aprovada. Você já pode receber pagamentos."
              : data?.status_reason || `Status atual: ${newStatus}`;

          for (const a of admins || []) {
            await supabase.rpc("create_notification", {
              p_user_id: a.user_id,
              p_tenant_id: tenantId,
              p_title: title,
              p_message: message,
              p_type: newStatus === "active" ? "success" : "warning",
              p_action_url: "/core/settings",
            });
          }
        }
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
              status: data.status === "active" ? "active" : "pending",
            })
            .eq("tenant_id", tenant_id);
        }
        break;
      }
    }

    if (eventRow?.id) {
      await supabase
        .from("pagarme_webhook_events")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("id", eventRow.id);
    }
  } catch (e: any) {
    processError = e.message || String(e);
    console.error("Pagar.me webhook processing error", e);
    if (eventRow?.id) {
      await supabase
        .from("pagarme_webhook_events")
        .update({ process_error: processError, retry_count: 1 })
        .eq("id", eventRow.id);
    }
  }

  return new Response(JSON.stringify({ success: !processError, error: processError }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
