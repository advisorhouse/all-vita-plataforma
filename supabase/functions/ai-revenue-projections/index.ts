import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// AI REVENUE PROJECTIONS v1.0
// Uses churn_probability + engagement data for smart projections
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all active clients with their AI scores
    const { data: activeClients } = await supabase
      .from("client_profiles")
      .select("id, churn_probability, ltv_prediction, engagement_score, affiliate_id, created_at")
      .eq("subscription_status", "active");

    if (!activeClients || activeClients.length === 0) {
      return new Response(
        JSON.stringify({
          current_mrr: 0,
          projected_mrr_3m: 0,
          projected_mrr_12m: 0,
          projected_commission_3m: 0,
          projected_margin_3m: 0,
          confidence: "low",
          active_clients: 0,
          avg_churn_probability: 0,
          avg_engagement: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get recent orders for avg ticket
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("amount")
      .eq("payment_status", "paid")
      .gte("created_at", threeMonthsAgo);

    const totalRevenue = recentOrders?.reduce((s: number, o: any) => s + Number(o.amount), 0) || 0;
    const avgTicket = recentOrders && recentOrders.length > 0 ? totalRevenue / recentOrders.length : 149.9;

    // Current MRR
    const currentMRR = activeClients.length * avgTicket;

    // AI-enhanced projections using individual churn probabilities
    const avgChurn = activeClients.reduce((s: number, c: any) => s + (Number(c.churn_probability) || 0.1), 0) / activeClients.length;
    const avgEngagement = activeClients.reduce((s: number, c: any) => s + (Number(c.engagement_score) || 50), 0) / activeClients.length;

    // Per-client survival probability for more accurate projection
    let projectedClients3m = 0;
    let projectedClients12m = 0;

    for (const client of activeClients) {
      const monthlyChurn = Number(client.churn_probability) || 0.1;
      const monthlySurvival = 1 - monthlyChurn;

      projectedClients3m += Math.pow(monthlySurvival, 3);
      projectedClients12m += Math.pow(monthlySurvival, 12);
    }

    const projectedMRR3m = Math.round(projectedClients3m * avgTicket * 100) / 100;
    const projectedMRR12m = Math.round(projectedClients12m * avgTicket * 100) / 100;

    // Cumulative revenue projection (sum of MRR over months)
    let cumulativeRevenue3m = 0;
    let cumulativeRevenue12m = 0;

    for (let month = 1; month <= 12; month++) {
      let monthClients = 0;
      for (const client of activeClients) {
        const monthlyChurn = Number(client.churn_probability) || 0.1;
        monthClients += Math.pow(1 - monthlyChurn, month);
      }
      const monthRevenue = monthClients * avgTicket;
      if (month <= 3) cumulativeRevenue3m += monthRevenue;
      cumulativeRevenue12m += monthRevenue;
    }

    // Commission projections
    const { data: commRules } = await supabase
      .from("commission_rules")
      .select("percentage")
      .eq("commission_type", "recurring")
      .eq("active", true);

    const avgCommRate = commRules && commRules.length > 0
      ? commRules.reduce((s: number, r: any) => s + Number(r.percentage), 0) / commRules.length
      : 10;

    const projectedCommission3m = Math.round(cumulativeRevenue3m * (avgCommRate / 100) * 100) / 100;
    const projectedMargin3m = Math.round((cumulativeRevenue3m - projectedCommission3m) * 100) / 100;

    const projectedCommission12m = Math.round(cumulativeRevenue12m * (avgCommRate / 100) * 100) / 100;
    const projectedMargin12m = Math.round((cumulativeRevenue12m - projectedCommission12m) * 100) / 100;

    // Confidence based on data quality
    let confidence = "high";
    if (activeClients.length < 10) confidence = "low";
    else if (activeClients.length < 50) confidence = "medium";

    // Total LTV of entire base
    const totalLTV = activeClients.reduce((s: number, c: any) => s + (Number(c.ltv_prediction) || 0), 0);

    return new Response(
      JSON.stringify({
        current_mrr: Math.round(currentMRR * 100) / 100,
        projected_mrr_3m: projectedMRR3m,
        projected_mrr_12m: projectedMRR12m,
        cumulative_revenue_3m: Math.round(cumulativeRevenue3m * 100) / 100,
        cumulative_revenue_12m: Math.round(cumulativeRevenue12m * 100) / 100,
        projected_commission_3m: projectedCommission3m,
        projected_commission_12m: projectedCommission12m,
        projected_margin_3m: projectedMargin3m,
        projected_margin_12m: projectedMargin12m,
        total_ltv_base: Math.round(totalLTV * 100) / 100,
        active_clients: activeClients.length,
        avg_ticket: Math.round(avgTicket * 100) / 100,
        avg_churn_probability: Math.round(avgChurn * 1000) / 1000,
        avg_engagement: Math.round(avgEngagement * 100) / 100,
        confidence,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI projections error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
