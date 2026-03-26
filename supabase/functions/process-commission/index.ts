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

    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, client_id, amount, subscription_cycle, payment_status")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Order not paid yet" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get client profile with affiliate
    const { data: client } = await supabase
      .from("client_profiles")
      .select("id, affiliate_id, affiliate_locked")
      .eq("id", order.client_id)
      .single();

    if (!client || !client.affiliate_id || !client.affiliate_locked) {
      return new Response(
        JSON.stringify({ message: "No affiliate linked, no commission generated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get affiliate level
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id, level")
      .eq("id", client.affiliate_id)
      .single();

    if (!affiliate) {
      return new Response(
        JSON.stringify({ error: "Affiliate not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Determine commission type based on cycle
    const isFirst = order.subscription_cycle === 1;
    const months = order.subscription_cycle;

    // Get all applicable rules
    const { data: rules } = await supabase
      .from("commission_rules")
      .select("*")
      .eq("level", affiliate.level)
      .eq("active", true)
      .lte("min_months", months);

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ message: "No applicable commission rules" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const commissionsCreated = [];

    for (const rule of rules) {
      // Skip initial commission if not first cycle
      if (rule.commission_type === "initial" && !isFirst) continue;
      // Skip recurring commission if first cycle
      if (rule.commission_type === "recurring" && isFirst) continue;
      // Bonus commissions only apply at exact milestone months
      if (rule.commission_type === "bonus_6m" && months !== 6) continue;
      if (rule.commission_type === "bonus_12m" && months !== 12) continue;

      const commissionAmount = (order.amount * rule.percentage) / 100;

      const { data: commission, error: commError } = await supabase
        .from("commissions")
        .insert({
          affiliate_id: affiliate.id,
          client_id: client.id,
          order_id: order.id,
          commission_type: rule.commission_type,
          percentage_applied: rule.percentage,
          amount: commissionAmount,
          paid_status: "pending",
        })
        .select()
        .single();

      if (!commError && commission) {
        commissionsCreated.push(commission);
      }
    }

    // 5. Update affiliate recurring revenue
    const { data: totalRevenue } = await supabase
      .from("commissions")
      .select("amount")
      .eq("affiliate_id", affiliate.id);

    const totalCommission = totalRevenue?.reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;

    await supabase
      .from("affiliates")
      .update({ recurring_revenue: totalCommission })
      .eq("id", affiliate.id);

    return new Response(
      JSON.stringify({ success: true, commissions: commissionsCreated }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
