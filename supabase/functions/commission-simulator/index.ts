import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// COMMISSION SIMULATOR v1.0
// Pure math — no DB writes. Calculates financial projections.
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      avg_ticket = 149.90,
      gross_margin_pct = 65,
      avg_churn_pct = 8,
      initial_commission_pct = 15,
      recurring_commission_pct = 10,
      bonus_6m_pct = 5,
      bonus_12m_pct = 5,
      initial_clients = 100,
      monthly_growth_pct = 5,
      months_to_project = 12,
    } = await req.json();

    const ticket = Number(avg_ticket);
    const grossMargin = Number(gross_margin_pct) / 100;
    const monthlyChurn = Number(avg_churn_pct) / 100;
    const initialComm = Number(initial_commission_pct) / 100;
    const recurringComm = Number(recurring_commission_pct) / 100;
    const bonus6m = Number(bonus_6m_pct) / 100;
    const bonus12m = Number(bonus_12m_pct) / 100;
    const startClients = Number(initial_clients);
    const monthlyGrowth = Number(monthly_growth_pct) / 100;
    const months = Math.min(Number(months_to_project), 36);

    // Simulate month by month
    const monthlyData: any[] = [];
    let totalRevenue = 0;
    let totalCommission = 0;
    let totalGrossProfit = 0;
    let totalNetProfit = 0;
    let cumulativeClients = 0;

    // Cohort-based simulation
    const cohorts: { startMonth: number; clients: number }[] = [];

    for (let m = 1; m <= months; m++) {
      // New clients this month
      const newClients = Math.round(startClients * Math.pow(1 + monthlyGrowth, m - 1));
      cohorts.push({ startMonth: m, clients: newClients });

      let monthRevenue = 0;
      let monthCommission = 0;
      let monthActiveClients = 0;

      for (const cohort of cohorts) {
        const cohortAge = m - cohort.startMonth; // months since cohort joined
        const surviving = Math.round(cohort.clients * Math.pow(1 - monthlyChurn, cohortAge));
        if (surviving <= 0) continue;

        monthActiveClients += surviving;
        const cohortRevenue = surviving * ticket;
        monthRevenue += cohortRevenue;

        // Commission calculation
        let cohortComm = 0;
        if (cohortAge === 0) {
          // Initial commission
          cohortComm = cohortRevenue * initialComm;
        } else {
          // Recurring commission
          cohortComm = cohortRevenue * recurringComm;
        }

        // Retention bonuses
        if (cohortAge === 6) {
          cohortComm += surviving * ticket * bonus6m;
        }
        if (cohortAge === 12) {
          cohortComm += surviving * ticket * bonus12m;
        }

        monthCommission += cohortComm;
      }

      const monthGrossProfit = monthRevenue * grossMargin;
      const monthNetProfit = monthGrossProfit - monthCommission;
      const commPct = monthRevenue > 0 ? (monthCommission / monthRevenue) * 100 : 0;
      const netMarginPct = monthRevenue > 0 ? (monthNetProfit / monthRevenue) * 100 : 0;

      totalRevenue += monthRevenue;
      totalCommission += monthCommission;
      totalGrossProfit += monthGrossProfit;
      totalNetProfit += monthNetProfit;
      cumulativeClients += newClients;

      monthlyData.push({
        month: m,
        new_clients: newClients,
        active_clients: monthActiveClients,
        revenue: Math.round(monthRevenue * 100) / 100,
        commission: Math.round(monthCommission * 100) / 100,
        gross_profit: Math.round(monthGrossProfit * 100) / 100,
        net_profit: Math.round(monthNetProfit * 100) / 100,
        commission_pct: Math.round(commPct * 100) / 100,
        net_margin_pct: Math.round(netMarginPct * 100) / 100,
      });
    }

    // Summary metrics
    const avgCommPerClient = cumulativeClients > 0 ? totalCommission / cumulativeClients : 0;
    const avgLTV = ticket / Math.max(monthlyChurn, 0.01);
    const avgCommOverLTV = avgLTV > 0 ? (avgCommPerClient / avgLTV) * 100 : 0;
    const paybackMonths = recurringComm > 0
      ? Math.ceil((ticket * initialComm) / (ticket * recurringComm * (1 - monthlyChurn)))
      : 0;

    // Margin safety
    const avgCommPct = totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0;
    const avgNetMarginPct = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

    let marginStatus = "safe";
    if (avgNetMarginPct < 10) marginStatus = "critical";
    else if (avgNetMarginPct < 20) marginStatus = "warning";

    return new Response(
      JSON.stringify({
        summary: {
          total_revenue: Math.round(totalRevenue * 100) / 100,
          total_commission: Math.round(totalCommission * 100) / 100,
          total_gross_profit: Math.round(totalGrossProfit * 100) / 100,
          total_net_profit: Math.round(totalNetProfit * 100) / 100,
          avg_commission_pct: Math.round(avgCommPct * 100) / 100,
          avg_net_margin_pct: Math.round(avgNetMarginPct * 100) / 100,
          avg_commission_per_client: Math.round(avgCommPerClient * 100) / 100,
          estimated_ltv: Math.round(avgLTV * 100) / 100,
          commission_over_ltv_pct: Math.round(avgCommOverLTV * 100) / 100,
          payback_months: paybackMonths,
          cumulative_clients: cumulativeClients,
          margin_status: marginStatus,
        },
        monthly: monthlyData,
        parameters: {
          avg_ticket: ticket,
          gross_margin_pct: grossMargin * 100,
          avg_churn_pct: monthlyChurn * 100,
          initial_commission_pct: initialComm * 100,
          recurring_commission_pct: recurringComm * 100,
          bonus_6m_pct: bonus6m * 100,
          bonus_12m_pct: bonus12m * 100,
          initial_clients: startClients,
          monthly_growth_pct: monthlyGrowth * 100,
          months_projected: months,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Simulator error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
