import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// RETENTION ENGINE v1.0
// Calculates: churn_probability, engagement_score, ltv_prediction,
//             risk_level, affiliate retention_score
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ---- 1. FETCH ALL CLIENTS ----
    const { data: clients, error: clientsErr } = await supabase
      .from("client_profiles")
      .select("id, user_id, subscription_status, age_segment, created_at, affiliate_id");

    if (clientsErr || !clients) {
      throw new Error(`Failed to fetch clients: ${clientsErr?.message}`);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // ---- 2. FETCH USAGE LOGS (last 30d) ----
    const { data: usageLogs } = await supabase
      .from("client_usage_logs")
      .select("client_id, event_type, created_at")
      .gte("created_at", thirtyDaysAgo);

    // ---- 3. FETCH ORDERS (last 90d for payment history) ----
    const { data: orders } = await supabase
      .from("orders")
      .select("client_id, payment_status, amount, subscription_cycle, created_at")
      .gte("created_at", ninetyDaysAgo);

    // ---- 4. BUILD USAGE MAP ----
    const usageByClient: Record<string, Record<string, number>> = {};
    for (const log of usageLogs || []) {
      if (!usageByClient[log.client_id]) {
        usageByClient[log.client_id] = {};
      }
      usageByClient[log.client_id][log.event_type] =
        (usageByClient[log.client_id][log.event_type] || 0) + 1;
    }

    // ---- 5. BUILD ORDER MAP ----
    const ordersByClient: Record<string, typeof orders> = {};
    for (const order of orders || []) {
      if (!ordersByClient[order.client_id]) {
        ordersByClient[order.client_id] = [];
      }
      ordersByClient[order.client_id].push(order);
    }

    // ---- 6. PROCESS EACH CLIENT ----
    let processedCount = 0;
    const alertsToCreate: any[] = [];

    for (const client of clients) {
      const usage = usageByClient[client.id] || {};
      const clientOrders = ordersByClient[client.id] || [];

      // --- ENGAGEMENT SCORE (0-100) ---
      const loginCount = usage["login"] || 0;
      const usageMarks = usage["usage_mark"] || 0;
      const contentViews = usage["content_view"] || 0;
      const profileUpdates = usage["profile_update"] || 0;
      const benefitInteractions = usage["benefit_interaction"] || 0;

      const loginScore = Math.min(loginCount / 20, 1) * 25;         // max 25 for 20+ logins/month
      const usageScore = Math.min(usageMarks / 25, 1) * 30;         // max 30 for 25+ usage marks
      const contentScore = Math.min(contentViews / 10, 1) * 20;     // max 20 for 10+ views
      const profileScore = Math.min(profileUpdates / 2, 1) * 10;    // max 10
      const benefitScore = Math.min(benefitInteractions / 3, 1) * 15; // max 15

      const engagementScore = Math.round(
        loginScore + usageScore + contentScore + profileScore + benefitScore
      );

      // --- CHURN PROBABILITY (0-1) ---
      const monthsActive = Math.max(
        1,
        Math.round(
          (now.getTime() - new Date(client.created_at).getTime()) /
            (30 * 24 * 60 * 60 * 1000)
        )
      );

      // Factors that increase churn
      const failedPayments = clientOrders.filter(
        (o: any) => o.payment_status === "failed"
      ).length;
      const isPaused = client.subscription_status === "paused" ? 1 : 0;
      const isCancelled = client.subscription_status === "cancelled" ? 1 : 0;

      // Normalize factors (0-1 each, weighted)
      const engagementFactor = 1 - engagementScore / 100;                // low engagement = high churn
      const tenureFactor = Math.max(0, 1 - monthsActive / 12);          // newer = higher risk
      const paymentFactor = Math.min(failedPayments / 3, 1);            // payment issues
      const pauseFactor = isPaused * 0.3;
      const cancelFactor = isCancelled * 1.0;

      let churnProbability =
        engagementFactor * 0.35 +
        tenureFactor * 0.20 +
        paymentFactor * 0.20 +
        pauseFactor +
        cancelFactor * 0.25;

      churnProbability = Math.max(0, Math.min(1, churnProbability));

      // Risk level classification
      let riskLevel = "low";
      if (churnProbability >= 0.65) riskLevel = "high";
      else if (churnProbability >= 0.35) riskLevel = "medium";

      // --- LTV PREDICTION ---
      const avgTicket =
        clientOrders.length > 0
          ? clientOrders.reduce((s: number, o: any) => s + Number(o.amount), 0) /
            clientOrders.length
          : 149.9;

      const predictedMonthsRemaining = Math.round(
        (1 / Math.max(churnProbability, 0.05)) * (1 - churnProbability) * 12
      );
      const ltvPrediction = Math.round(
        (monthsActive + predictedMonthsRemaining) * avgTicket * 100
      ) / 100;

      // --- CONSISTENCY SCORE ---
      const consistencyScore = Math.round(
        Math.min(usageMarks / 25, 1) * 100
      );

      // --- BEHAVIORAL SCORE ---
      const behavioralScore = Math.round(
        (engagementScore * 0.4 + consistencyScore * 0.4 + Math.min(monthsActive / 12, 1) * 100 * 0.2)
      );

      // --- UPDATE CLIENT PROFILE ---
      await supabase
        .from("client_profiles")
        .update({
          churn_probability: Math.round(churnProbability * 100) / 100,
          engagement_score: engagementScore,
          ltv_prediction: ltvPrediction,
          consistency_score: consistencyScore,
          behavioral_score: behavioralScore,
          risk_level: riskLevel,
        })
        .eq("id", client.id);

      processedCount++;

      // --- GENERATE ALERTS ---
      // High risk client → alert admin
      if (churnProbability >= 0.65 && client.subscription_status === "active") {
        alertsToCreate.push({
          target_role: "admin",
          alert_type: "client_at_risk",
          title: "Cliente em alto risco de cancelamento",
          description: `Cliente ${client.id} possui risco alto de churn (score: ${Math.round(churnProbability * 100)}).`,
          severity: "warning",
          metadata: { client_id: client.id, churn_score: churnProbability },
        });

        // Alert affiliate if exists
        if (client.affiliate_id) {
          const { data: aff } = await supabase
            .from("affiliates")
            .select("user_id")
            .eq("id", client.affiliate_id)
            .single();

          if (aff) {
            alertsToCreate.push({
              target_role: "affiliate",
              target_user_id: aff.user_id,
              alert_type: "client_at_risk",
              title: "Cliente em risco de cancelamento",
              description: "Um dos seus clientes pode estar considerando cancelar. Considere entrar em contato.",
              severity: "warning",
              metadata: { client_id: client.id },
            });
          }
        }

        // Auto incentive trigger for client
        alertsToCreate.push({
          target_role: "client",
          target_user_id: client.user_id,
          alert_type: "incentive_trigger",
          title: "Oferta especial para você",
          description: "Valorizamos sua jornada conosco. Confira um benefício exclusivo na sua área de assinatura.",
          severity: "info",
          metadata: { client_id: client.id, type: "retention_incentive" },
        });
      }
    }

    // ---- 7. PROCESS AFFILIATE RETENTION SCORES ----
    const { data: affiliates } = await supabase
      .from("affiliates")
      .select("id, user_id, active_clients, total_clients");

    for (const aff of affiliates || []) {
      // Get all clients of this affiliate
      const { data: affClients } = await supabase
        .from("client_profiles")
        .select("id, churn_probability, engagement_score, ltv_prediction, subscription_status, created_at")
        .eq("affiliate_id", aff.id);

      if (!affClients || affClients.length === 0) {
        await supabase
          .from("affiliates")
          .update({ retention_score: 0 })
          .eq("id", aff.id);
        continue;
      }

      const activeClients = affClients.filter(
        (c: any) => c.subscription_status === "active"
      );
      const retentionRate =
        affClients.length > 0 ? (activeClients.length / affClients.length) * 100 : 0;

      const avgEngagement =
        affClients.reduce((s: number, c: any) => s + (Number(c.engagement_score) || 0), 0) /
        affClients.length;

      const avgChurn =
        affClients.reduce((s: number, c: any) => s + (Number(c.churn_probability) || 0), 0) /
        affClients.length;

      const avgLtv =
        affClients.reduce((s: number, c: any) => s + (Number(c.ltv_prediction) || 0), 0) /
        affClients.length;

      const avgMonthsActive =
        affClients.reduce((s: number, c: any) => {
          const months = Math.round(
            (now.getTime() - new Date(c.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)
          );
          return s + months;
        }, 0) / affClients.length;

      // Affiliate retention score (0-100)
      const retentionScore = Math.round(
        retentionRate * 0.30 +
        avgEngagement * 0.25 +
        (1 - avgChurn) * 100 * 0.25 +
        Math.min(avgMonthsActive / 12, 1) * 100 * 0.20
      );

      await supabase
        .from("affiliates")
        .update({
          retention_score: retentionScore,
          retention_rate: Math.round(retentionRate * 100) / 100,
          active_clients: activeClients.length,
        })
        .eq("id", aff.id);

      // Alert if affiliate retention is below average
      if (retentionScore < 40 && affClients.length >= 5) {
        alertsToCreate.push({
          target_role: "admin",
          alert_type: "low_retention_affiliate",
          title: "Afiliado com retenção baixa",
          description: `Afiliado ${aff.id} possui score de retenção ${retentionScore}/100, significativamente abaixo da média.`,
          severity: "warning",
          metadata: { affiliate_id: aff.id, retention_score: retentionScore },
        });
      }
    }

    // ---- 8. SEGMENT INSIGHTS ----
    const segmentGroups: Record<string, { count: number; avgChurn: number; avgLtv: number }> = {};
    for (const client of clients) {
      const seg = client.age_segment || "unknown";
      if (!segmentGroups[seg]) {
        segmentGroups[seg] = { count: 0, avgChurn: 0, avgLtv: 0 };
      }
      segmentGroups[seg].count++;
    }

    // Fetch updated scores for segment analysis
    const { data: updatedClients } = await supabase
      .from("client_profiles")
      .select("age_segment, churn_probability, ltv_prediction");

    for (const c of updatedClients || []) {
      const seg = c.age_segment || "unknown";
      if (segmentGroups[seg]) {
        segmentGroups[seg].avgChurn += Number(c.churn_probability || 0);
        segmentGroups[seg].avgLtv += Number(c.ltv_prediction || 0);
      }
    }

    for (const [seg, data] of Object.entries(segmentGroups)) {
      if (data.count > 0) {
        data.avgChurn /= data.count;
        data.avgLtv /= data.count;
      }
    }

    // Find segments with anomalies
    const avgChurnAll = clients.length > 0
      ? Object.values(segmentGroups).reduce((s, g) => s + g.avgChurn * g.count, 0) / clients.length
      : 0;

    for (const [seg, data] of Object.entries(segmentGroups)) {
      if (seg === "unknown" || data.count < 3) continue;

      if (data.avgChurn > avgChurnAll * 1.3) {
        alertsToCreate.push({
          target_role: "admin",
          alert_type: "churn_spike",
          title: `Churn elevado na faixa ${seg}`,
          description: `A faixa ${seg} apresenta churn ${Math.round((data.avgChurn / Math.max(avgChurnAll, 0.01) - 1) * 100)}% acima da média.`,
          severity: "warning",
          metadata: { segment: seg, avg_churn: data.avgChurn, global_avg: avgChurnAll },
        });
      }

      if (data.avgLtv > 0) {
        const avgLtvAll = Object.values(segmentGroups).reduce((s, g) => s + g.avgLtv * g.count, 0) / clients.length;
        if (data.avgLtv > avgLtvAll * 1.2) {
          alertsToCreate.push({
            target_role: "admin",
            alert_type: "segment_insight",
            title: `Faixa ${seg} tem maior LTV`,
            description: `Clientes na faixa ${seg} possuem LTV ${Math.round((data.avgLtv / Math.max(avgLtvAll, 1) - 1) * 100)}% acima da média.`,
            severity: "info",
            metadata: { segment: seg, avg_ltv: data.avgLtv },
          });
        }
      }
    }

    // ---- 9. INSERT ALERTS (batch) ----
    if (alertsToCreate.length > 0) {
      await supabase.from("ai_alerts").insert(alertsToCreate);
    }

    // ---- 10. LOG ENGINE RUN ----
    const processingTime = Date.now() - startTime;
    await supabase.from("ai_model_logs").insert({
      model_version: "v1.0",
      model_type: "retention_engine_full",
      processed_clients: processedCount,
      processing_time_ms: processingTime,
      metadata: {
        alerts_generated: alertsToCreate.length,
        segments_analyzed: Object.keys(segmentGroups).length,
        affiliates_scored: (affiliates || []).length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed_clients: processedCount,
        alerts_generated: alertsToCreate.length,
        processing_time_ms: processingTime,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Retention engine error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
