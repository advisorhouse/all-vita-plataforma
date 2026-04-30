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
      .select("id, client_id, tenant_id, amount, subscription_cycle, payment_status")
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

    // 2. Get referral for this client
    const { data: referral } = await supabase
      .from("referrals")
      .select("partner_id")
      .eq("client_id", order.client_id)
      .eq("status", "active")
      .single();

    if (!referral || !referral.partner_id) {
      return new Response(
        JSON.stringify({ message: "No active referral found, no commission generated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get partner details
    const { data: partner } = await supabase
      .from("partners")
      .select("id, user_id, level")
      .eq("id", referral.partner_id)
      .single();

    if (!partner) {
      return new Response(
        JSON.stringify({ error: "Partner not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Get applicable commission rules
    const months = order.subscription_cycle || 1;
    const isFirst = months === 1;

    const { data: rules } = await supabase
      .from("commission_rules")
      .select("*")
      .eq("level", partner.level)
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
      // Logic for different commission types
      if (rule.commission_type === "initial" && !isFirst) continue;
      if (rule.commission_type === "recurring" && isFirst) continue;
      if (rule.commission_type === "bonus_6m" && months !== 6) continue;
      if (rule.commission_type === "bonus_12m" && months !== 12) continue;

      const commissionAmount = (order.amount * rule.percentage) / 100;

      // Create commission record
      const { data: commission, error: commError } = await supabase
        .from("commissions")
        .insert({
          partner_id: partner.id,
          client_id: order.client_id,
          tenant_id: order.tenant_id,
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

        // 5. Generate Vitacoins for the partner (Internal Repayment)
        // Assume 1 Vitacoin = 1 unit of currency (e.g. 1 BRL)
        const vitacoinAmount = commissionAmount;

        const { error: vitaError } = await supabase
          .from("vitacoin_transactions")
          .insert({
            user_id: partner.user_id,
            tenant_id: order.tenant_id,
            type: "credit",
            amount: vitacoinAmount,
            source: "commission",
            reference_id: commission.id,
            reference_type: "commission",
            description: `Comissão da venda ${order.id}`,
          });
        
        if (vitaError) {
          console.error("Error creating Vitacoin transaction:", vitaError);
        }

        // Update Partner/User wallet balance (handled by triggers usually, but let's be safe if no trigger exists)
        const { data: wallet } = await supabase
          .from("vitacoins_wallet")
          .select("balance")
          .eq("user_id", partner.user_id)
          .eq("tenant_id", order.tenant_id)
          .single();
        
        if (wallet) {
          await supabase
            .from("vitacoins_wallet")
            .update({ balance: wallet.balance + vitacoinAmount })
            .eq("user_id", partner.user_id)
            .eq("tenant_id", order.tenant_id);
        } else {
          await supabase
            .from("vitacoins_wallet")
            .insert({ 
              user_id: partner.user_id, 
              tenant_id: order.tenant_id, 
              balance: vitacoinAmount 
            });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, commissions: commissionsCreated }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Process commission error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
