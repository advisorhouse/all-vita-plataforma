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
    const supabase = createClient(supabaseUrl, serviceKey);

    const { event, order_id, payment_data } = await req.json();

    if (!event || !order_id) {
      return new Response(
        JSON.stringify({ error: "event and order_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (event) {
      case "payment.approved": {
        // Update order status
        await supabase
          .from("orders")
          .update({ payment_status: "paid", status: "confirmed" })
          .eq("id", order_id);

        // Update client subscription
        const { data: order } = await supabase
          .from("orders")
          .select("client_id")
          .eq("id", order_id)
          .single();

        if (order) {
          await supabase
            .from("client_profiles")
            .update({ subscription_status: "active" })
            .eq("id", order.client_id);
        }

        // Trigger commission processing
        const commissionResponse = await fetch(`${supabaseUrl}/functions/v1/process-commission`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ order_id }),
        });

        const commissionResult = await commissionResponse.json();

        return new Response(
          JSON.stringify({ success: true, commission: commissionResult }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "payment.failed": {
        await supabase
          .from("orders")
          .update({ payment_status: "failed", status: "payment_failed" })
          .eq("id", order_id);

        return new Response(
          JSON.stringify({ success: true, message: "Payment failure recorded" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "subscription.cancelled": {
        const { data: order } = await supabase
          .from("orders")
          .select("client_id")
          .eq("id", order_id)
          .single();

        if (order) {
          await supabase
            .from("client_profiles")
            .update({ subscription_status: "cancelled" })
            .eq("id", order.client_id);

          // Update affiliate active clients count
          const { data: client } = await supabase
            .from("client_profiles")
            .select("affiliate_id")
            .eq("id", order.client_id)
            .single();

          if (client?.affiliate_id) {
            const { data: activeCount } = await supabase
              .from("client_profiles")
              .select("id", { count: "exact" })
              .eq("affiliate_id", client.affiliate_id)
              .eq("subscription_status", "active");

            await supabase
              .from("affiliates")
              .update({ active_clients: activeCount?.length || 0 })
              .eq("id", client.affiliate_id);
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: "Subscription cancelled" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "subscription.paused": {
        const { data: order } = await supabase
          .from("orders")
          .select("client_id")
          .eq("id", order_id)
          .single();

        if (order) {
          await supabase
            .from("client_profiles")
            .update({ subscription_status: "paused" })
            .eq("id", order.client_id);
        }

        return new Response(
          JSON.stringify({ success: true, message: "Subscription paused" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown event: ${event}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
