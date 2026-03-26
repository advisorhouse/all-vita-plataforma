import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// FINANCIAL PROJECTIONS & BI ENGINE v2.0
// Cohort analysis, funnel, unit economics, automated insights
// GET ?report=cohorts|funnel|unit-economics|insights|revenue-breakdown|all
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  let report = url.searchParams.get("report") || "all";
  let format = url.searchParams.get("format") || "json";

  // Also support POST body params (supabase.functions.invoke sends POST)
  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body.report) report = body.report;
      if (body.format) format = body.format;
    } catch (_) { /* no body */ }
  }

  try {
    let result: any = {};

    // ---- COHORT ANALYSIS ----
    if (report === "cohorts" || report === "all") {
      const { data: clients } = await supabase
        .from("client_profiles")
        .select("id, created_at, subscription_status, updated_at");

      const cohorts: Record<string, { total: number; retained: Record<number, number> }> = {};
      const now = new Date();

      for (const c of clients || []) {
        const cohortKey = c.created_at.substring(0, 7);
        if (!cohorts[cohortKey]) cohorts[cohortKey] = { total: 0, retained: {} };
        cohorts[cohortKey].total++;

        const acquisitionDate = new Date(c.created_at);
        const isActive = c.subscription_status === "active";
        const endDate = isActive ? now : new Date(c.updated_at);
        const monthsSurvived = Math.floor(
          (endDate.getTime() - acquisitionDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
        );

        for (const m of [1, 2, 3, 6, 12]) {
          if (monthsSurvived >= m) {
            cohorts[cohortKey].retained[m] = (cohorts[cohortKey].retained[m] || 0) + 1;
          }
        }
      }

      const cohortTable = Object.entries(cohorts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          cohort: month,
          total: data.total,
          m1: data.total > 0 ? Math.round((data.retained[1] || 0) / data.total * 100) : 0,
          m2: data.total > 0 ? Math.round((data.retained[2] || 0) / data.total * 100) : 0,
          m3: data.total > 0 ? Math.round((data.retained[3] || 0) / data.total * 100) : 0,
          m6: data.total > 0 ? Math.round((data.retained[6] || 0) / data.total * 100) : 0,
          m12: data.total > 0 ? Math.round((data.retained[12] || 0) / data.total * 100) : 0,
        }));

      result.cohorts = cohortTable;
    }

    // ---- FUNNEL ----
    if (report === "funnel" || report === "all") {
      const { data: allClients } = await supabase
        .from("client_profiles")
        .select("id, created_at, subscription_status");

      const { data: orders } = await supabase
        .from("orders")
        .select("client_id, subscription_cycle, payment_status")
        .eq("payment_status", "paid");

      const totalRegistered = (allClients || []).length;
      const clientOrders: Record<string, number> = {};
      for (const o of orders || []) {
        clientOrders[o.client_id] = Math.max(clientOrders[o.client_id] || 0, o.subscription_cycle);
      }

      const withPurchase = Object.keys(clientOrders).length;
      const with2nd = Object.values(clientOrders).filter(c => c >= 2).length;
      const with3rd = Object.values(clientOrders).filter(c => c >= 3).length;

      const now2 = new Date();
      const activeMonths: Record<string, number> = {};
      for (const c of allClients || []) {
        if (c.subscription_status === "active") {
          const months = Math.floor((now2.getTime() - new Date(c.created_at).getTime()) / (30*24*60*60*1000));
          activeMonths[c.id] = months;
        }
      }
      const with6m = Object.values(activeMonths).filter(m => m >= 6).length;
      const with12m = Object.values(activeMonths).filter(m => m >= 12).length;

      result.funnel = [
        { stage: "Cadastro", count: totalRegistered, pct: 100 },
        { stage: "1ª Compra", count: withPurchase, pct: totalRegistered > 0 ? Math.round(withPurchase / totalRegistered * 100) : 0 },
        { stage: "2ª Compra", count: with2nd, pct: withPurchase > 0 ? Math.round(with2nd / withPurchase * 100) : 0 },
        { stage: "3ª Compra", count: with3rd, pct: with2nd > 0 ? Math.round(with3rd / with2nd * 100) : 0 },
        { stage: "6 Meses Ativo", count: with6m, pct: with3rd > 0 ? Math.round(with6m / with3rd * 100) : 0 },
        { stage: "12 Meses Ativo", count: with12m, pct: with6m > 0 ? Math.round(with12m / with6m * 100) : 0 },
      ];
    }

    // ---- UNIT ECONOMICS ----
    if (report === "unit-economics" || report === "all") {
      const { data: paidOrders } = await supabase
        .from("orders")
        .select("amount, client_id")
        .eq("payment_status", "paid");

      const { data: clients } = await supabase
        .from("client_profiles")
        .select("id, ltv_prediction, subscription_status, churn_probability");

      const { data: commissions } = await supabase
        .from("commissions")
        .select("amount, client_id");

      const { data: affiliates } = await supabase
        .from("affiliates")
        .select("id, affiliate_level, recurring_revenue, total_commission_paid, active_clients, retention_rate")
        .eq("status", "active");

      const activeClients = (clients || []).filter((c: any) => c.subscription_status === "active");
      const totalRevenue = (paidOrders || []).reduce((s: number, o: any) => s + Number(o.amount), 0);
      const totalCommission = (commissions || []).reduce((s: number, c: any) => s + Number(c.amount), 0);
      const avgTicket = paidOrders && paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
      const avgLTV = activeClients.length > 0
        ? activeClients.reduce((s: number, c: any) => s + (Number(c.ltv_prediction) || 0), 0) / activeClients.length
        : 0;
      const avgChurn = activeClients.length > 0
        ? activeClients.reduce((s: number, c: any) => s + (Number(c.churn_probability) || 0), 0) / activeClients.length
        : 0;
      const avgCommPerClient = activeClients.length > 0 ? totalCommission / activeClients.length : 0;
      const netMargin = totalRevenue > 0 ? ((totalRevenue - totalCommission) / totalRevenue) * 100 : 0;

      const affiliateROI = (affiliates || []).map((a: any) => ({
        affiliate_id: a.id,
        level: a.affiliate_level,
        revenue: Number(a.recurring_revenue),
        commission: Number(a.total_commission_paid),
        roi: Number(a.total_commission_paid) > 0
          ? Math.round((Number(a.recurring_revenue) / Number(a.total_commission_paid)) * 100) / 100
          : 0,
        clients: a.active_clients,
        retention: Number(a.retention_rate),
      }));

      result.unit_economics = {
        avg_ticket: Math.round(avgTicket * 100) / 100,
        avg_ltv: Math.round(avgLTV * 100) / 100,
        avg_churn_pct: Math.round(avgChurn * 100) / 100,
        avg_commission_per_client: Math.round(avgCommPerClient * 100) / 100,
        net_margin_pct: Math.round(netMargin * 100) / 100,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        total_commission: Math.round(totalCommission * 100) / 100,
        active_clients: activeClients.length,
        total_orders: (paidOrders || []).length,
        affiliate_roi: affiliateROI.sort((a: any, b: any) => b.roi - a.roi),
      };
    }

    // ---- AUTOMATED INSIGHTS ----
    if (report === "insights" || report === "all") {
      const { data: clients } = await supabase
        .from("client_profiles")
        .select("id, age_segment, level, ltv_prediction, churn_probability, subscription_status, consistency_score, engagement_score, affiliate_id");

      const { data: affiliates } = await supabase
        .from("affiliates")
        .select("id, affiliate_level, retention_rate, active_clients, total_clients");

      const insights: { message: string; type: string; impact: string }[] = [];
      const active = (clients || []).filter((c: any) => c.subscription_status === "active");

      // LTV by age segment
      const segLTV: Record<string, { sum: number; count: number }> = {};
      for (const c of active) {
        const seg = c.age_segment || "unknown";
        if (!segLTV[seg]) segLTV[seg] = { sum: 0, count: 0 };
        segLTV[seg].sum += Number(c.ltv_prediction) || 0;
        segLTV[seg].count++;
      }
      const segAvgs = Object.entries(segLTV).map(([seg, d]) => ({ seg, avg: d.count > 0 ? d.sum / d.count : 0 }));
      if (segAvgs.length > 1) {
        const sorted = segAvgs.sort((a, b) => b.avg - a.avg);
        const best = sorted[0]; const worst = sorted[sorted.length - 1];
        if (best.avg > 0 && worst.avg > 0) {
          const diff = Math.round(((best.avg - worst.avg) / worst.avg) * 100);
          if (diff > 10) {
            insights.push({ message: `Clientes ${best.seg} possuem LTV ${diff}% maior que ${worst.seg}.`, type: "ltv_segment", impact: "high" });
          }
        }
      }

      // Churn by affiliate level
      const levelChurn: Record<string, { sum: number; count: number }> = {};
      for (const a of affiliates || []) {
        const lvl = a.affiliate_level || "basic";
        if (!levelChurn[lvl]) levelChurn[lvl] = { sum: 0, count: 0 };
        levelChurn[lvl].sum += Number(a.retention_rate);
        levelChurn[lvl].count++;
      }
      const levelAvgs = Object.entries(levelChurn).map(([lvl, d]) => ({ lvl, avgRetention: d.count > 0 ? d.sum / d.count : 0 }));
      if (levelAvgs.length > 1) {
        const sorted = levelAvgs.sort((a, b) => b.avgRetention - a.avgRetention);
        const best = sorted[0]; const worst = sorted[sorted.length - 1];
        if (best.avgRetention > 0 && worst.avgRetention > 0) {
          const diff = Math.round(((best.avgRetention - worst.avgRetention) / worst.avgRetention) * 100);
          if (diff > 10) {
            insights.push({ message: `Afiliados nível ${best.lvl} possuem retenção ${diff}% maior que ${worst.lvl}.`, type: "affiliate_quality", impact: "high" });
          }
        }
      }

      // Gamification impact
      const levelGroups: Record<string, { churn: number; count: number }> = {};
      for (const c of active) {
        const lvl = c.level || "inicio";
        if (!levelGroups[lvl]) levelGroups[lvl] = { churn: 0, count: 0 };
        levelGroups[lvl].churn += Number(c.churn_probability) || 0;
        levelGroups[lvl].count++;
      }
      const inicio = levelGroups["inicio"];
      const advanced = ["consistencia", "protecao_ativa", "longevidade", "elite_vision"]
        .filter(l => levelGroups[l])
        .reduce((acc, l) => ({ churn: acc.churn + levelGroups[l].churn, count: acc.count + levelGroups[l].count }), { churn: 0, count: 0 });
      if (inicio && inicio.count > 0 && advanced.count > 0) {
        const inicioAvg = inicio.churn / inicio.count;
        const advAvg = advanced.churn / advanced.count;
        if (inicioAvg > advAvg && inicioAvg > 0) {
          const reduction = Math.round(((inicioAvg - advAvg) / inicioAvg) * 100);
          if (reduction > 5) {
            insights.push({ message: `Gamificação reduziu churn em ${reduction}% para clientes acima do nível início.`, type: "gamification_impact", impact: "medium" });
          }
        }
      }

      // Behavior summary
      const avgEngagement = active.length > 0
        ? active.reduce((s: number, c: any) => s + (Number(c.engagement_score) || 0), 0) / active.length : 0;
      const avgConsistency = active.length > 0
        ? active.reduce((s: number, c: any) => s + (Number(c.consistency_score) || 0), 0) / active.length : 0;
      if (avgEngagement > 0 || avgConsistency > 0) {
        insights.push({ message: `Engajamento médio: ${avgEngagement.toFixed(1)}. Consistência média: ${avgConsistency.toFixed(1)}.`, type: "behavior_summary", impact: "info" });
      }

      // Concentration risk
      if (affiliates && affiliates.length > 2) {
        const sorted = [...affiliates].sort((a: any, b: any) => b.active_clients - a.active_clients);
        const topAffiliate = sorted[0];
        const totalActive = sorted.reduce((s, a: any) => s + a.active_clients, 0);
        if (totalActive > 0) {
          const concentration = Math.round((topAffiliate.active_clients / totalActive) * 100);
          if (concentration > 30) {
            insights.push({ message: `Top afiliado concentra ${concentration}% dos clientes ativos. Diversificação recomendada.`, type: "concentration_risk", impact: "warning" });
          }
        }
      }

      result.insights = insights;
    }

    // ---- REVENUE BREAKDOWN ----
    if (report === "revenue-breakdown" || report === "all") {
      const { data: orders } = await supabase
        .from("orders")
        .select("amount, payment_status, created_at, subscription_cycle, client_id")
        .eq("payment_status", "paid");

      const { data: clients } = await supabase
        .from("client_profiles")
        .select("id, age_segment, affiliate_id");

      const clientMap: Record<string, any> = {};
      for (const c of clients || []) clientMap[c.id] = c;

      const byMonth: Record<string, { total: number; new_rev: number; recurring_rev: number }> = {};
      for (const o of orders || []) {
        const m = o.created_at.substring(0, 7);
        if (!byMonth[m]) byMonth[m] = { total: 0, new_rev: 0, recurring_rev: 0 };
        const amt = Number(o.amount);
        byMonth[m].total += amt;
        if (o.subscription_cycle <= 1) byMonth[m].new_rev += amt;
        else byMonth[m].recurring_rev += amt;
      }

      const byAge: Record<string, number> = {};
      for (const o of orders || []) {
        const seg = clientMap[o.client_id]?.age_segment || "unknown";
        byAge[seg] = (byAge[seg] || 0) + Number(o.amount);
      }

      result.revenue_breakdown = {
        by_month: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, d]) => ({ month, ...d })),
        by_age_segment: Object.entries(byAge).map(([segment, total]) => ({ segment, total: Math.round(total * 100) / 100 })),
      };
    }

    // CSV export
    if (format === "csv" && report !== "all") {
      const csvData = result[report] || result[Object.keys(result)[0]];
      if (Array.isArray(csvData) && csvData.length > 0) {
        const headers = Object.keys(csvData[0]).join(",");
        const rows = csvData.map((r: any) => Object.values(r).join(",")).join("\n");
        return new Response(`${headers}\n${rows}`, {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/csv", "Content-Disposition": `attachment; filename=${report}.csv` },
        });
      }
    }

    return new Response(
      JSON.stringify({ ...result, generated_at: new Date().toISOString(), api_version: "v1" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Financial projections error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
