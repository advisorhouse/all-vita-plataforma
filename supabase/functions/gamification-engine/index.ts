import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// GAMIFICATION ENGINE v1.0
// Updates: client levels, consistency scores, benefit unlocks,
//          challenge progress, affiliate levels
// ============================================================

// Client level thresholds
const CLIENT_LEVELS = [
  { level: "inicio", minMonths: 0, minConsistency: 0, minEngagement: 0 },
  { level: "consistencia", minMonths: 2, minConsistency: 40, minEngagement: 30 },
  { level: "protecao_ativa", minMonths: 4, minConsistency: 60, minEngagement: 50 },
  { level: "longevidade", minMonths: 8, minConsistency: 75, minEngagement: 65 },
  { level: "elite_vision", minMonths: 12, minConsistency: 85, minEngagement: 80 },
];

// Affiliate level thresholds
const AFFILIATE_LEVELS = [
  { level: "basic", minClients: 0, minRetention: 0, minMonths: 0 },
  { level: "advanced", minClients: 10, minRetention: 50, minMonths: 3 },
  { level: "premium", minClients: 25, minRetention: 70, minMonths: 6 },
  { level: "elite", minClients: 50, minRetention: 85, minMonths: 12 },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();

    // ---- 1. FETCH CLIENTS WITH SCORES ----
    const { data: clients, error: clientsErr } = await supabase
      .from("client_profiles")
      .select("id, user_id, subscription_status, consistency_score, engagement_score, behavioral_score, level, level_progress, created_at, affiliate_id");

    if (clientsErr || !clients) {
      throw new Error(`Failed to fetch clients: ${clientsErr?.message}`);
    }

    // ---- 2. FETCH BENEFITS ----
    const { data: benefits } = await supabase
      .from("gamification_benefits")
      .select("id, required_months")
      .eq("active", true);

    // ---- 3. FETCH EXISTING CLIENT BENEFITS ----
    const { data: existingBenefits } = await supabase
      .from("client_benefits")
      .select("client_id, benefit_id");

    const benefitSet = new Set(
      (existingBenefits || []).map((b: any) => `${b.client_id}:${b.benefit_id}`)
    );

    // ---- 4. FETCH ACTIVE CHALLENGES ----
    const { data: challenges } = await supabase
      .from("monthly_challenges")
      .select("id, month, year, required_usage_days, reward_consistency_bonus")
      .eq("active", true)
      .eq("month", now.getMonth() + 1)
      .eq("year", now.getFullYear());

    // ---- 5. FETCH USAGE LOGS FOR CURRENT MONTH ----
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data: usageLogs } = await supabase
      .from("client_usage_logs")
      .select("client_id, event_type, created_at")
      .eq("event_type", "usage_mark")
      .gte("created_at", monthStart);

    // Build usage days per client
    const usageDaysByClient: Record<string, Set<string>> = {};
    for (const log of usageLogs || []) {
      if (!usageDaysByClient[log.client_id]) {
        usageDaysByClient[log.client_id] = new Set();
      }
      usageDaysByClient[log.client_id].add(log.created_at.substring(0, 10));
    }

    // ---- 6. PROCESS EACH CLIENT ----
    let processedCount = 0;
    const newBenefits: any[] = [];
    const challengeUpserts: any[] = [];
    const alertsToCreate: any[] = [];

    for (const client of clients) {
      if (client.subscription_status !== "active") continue;

      const monthsActive = Math.max(
        1,
        Math.round(
          (now.getTime() - new Date(client.created_at).getTime()) /
            (30 * 24 * 60 * 60 * 1000)
        )
      );

      const consistency = Number(client.consistency_score) || 0;
      const engagement = Number(client.engagement_score) || 0;

      // --- DETERMINE CLIENT LEVEL ---
      let newLevel = "inicio";
      let levelIndex = 0;
      for (let i = CLIENT_LEVELS.length - 1; i >= 0; i--) {
        const req = CLIENT_LEVELS[i];
        if (
          monthsActive >= req.minMonths &&
          consistency >= req.minConsistency &&
          engagement >= req.minEngagement
        ) {
          newLevel = req.level;
          levelIndex = i;
          break;
        }
      }

      // Calculate progress toward next level
      let levelProgress = 100;
      if (levelIndex < CLIENT_LEVELS.length - 1) {
        const next = CLIENT_LEVELS[levelIndex + 1];
        const monthsProg = Math.min(monthsActive / next.minMonths, 1);
        const consistencyProg = Math.min(consistency / Math.max(next.minConsistency, 1), 1);
        const engagementProg = Math.min(engagement / Math.max(next.minEngagement, 1), 1);
        levelProgress = Math.round((monthsProg * 0.4 + consistencyProg * 0.3 + engagementProg * 0.3) * 100);
      }

      // --- LEVEL UP ALERT ---
      if (newLevel !== client.level && CLIENT_LEVELS.findIndex(l => l.level === newLevel) > CLIENT_LEVELS.findIndex(l => l.level === client.level)) {
        const levelNames: Record<string, string> = {
          inicio: "Início",
          consistencia: "Consistência",
          protecao_ativa: "Proteção Ativa",
          longevidade: "Longevidade",
          elite_vision: "Elite Vision",
        };
        alertsToCreate.push({
          target_role: "client",
          target_user_id: client.user_id,
          alert_type: "level_up",
          title: `Parabéns! Você alcançou o nível ${levelNames[newLevel]}`,
          description: "Continue sua jornada de cuidado visual para desbloquear ainda mais benefícios.",
          severity: "info",
          metadata: { client_id: client.id, new_level: newLevel, old_level: client.level },
        });
      }

      // --- UPDATE CLIENT ---
      await supabase
        .from("client_profiles")
        .update({ level: newLevel, level_progress: levelProgress })
        .eq("id", client.id);

      // --- UNLOCK BENEFITS ---
      for (const benefit of benefits || []) {
        if (monthsActive >= benefit.required_months) {
          const key = `${client.id}:${benefit.id}`;
          if (!benefitSet.has(key)) {
            newBenefits.push({
              client_id: client.id,
              benefit_id: benefit.id,
            });
            benefitSet.add(key);

            // Alert client
            alertsToCreate.push({
              target_role: "client",
              target_user_id: client.user_id,
              alert_type: "benefit_unlocked",
              title: "Novo benefício desbloqueado!",
              description: "Sua permanência na Vision Lift desbloqueou uma recompensa exclusiva. Confira na aba Benefícios.",
              severity: "info",
              metadata: { client_id: client.id, benefit_id: benefit.id },
            });

            // --- RETENTION BONUS FOR AFFILIATE ---
            if (client.affiliate_id && (benefit.required_months === 6 || benefit.required_months === 12)) {
              // Check if affiliate exists
              const { data: aff } = await supabase
                .from("affiliates")
                .select("user_id")
                .eq("id", client.affiliate_id)
                .single();

              if (aff) {
                alertsToCreate.push({
                  target_role: "affiliate",
                  target_user_id: aff.user_id,
                  alert_type: "retention_bonus",
                  title: `Bônus de retenção: cliente atingiu ${benefit.required_months} meses`,
                  description: "Um dos seus clientes atingiu um marco de permanência. Bônus de comissão será processado.",
                  severity: "info",
                  metadata: { client_id: client.id, months: benefit.required_months },
                });
              }
            }
          }
        }
      }

      // --- CHALLENGE PROGRESS ---
      const clientUsageDays = usageDaysByClient[client.id]?.size || 0;
      for (const challenge of challenges || []) {
        const completed = clientUsageDays >= challenge.required_usage_days;
        challengeUpserts.push({
          client_id: client.id,
          challenge_id: challenge.id,
          usage_days: clientUsageDays,
          completed,
          completed_at: completed ? now.toISOString() : null,
        });
      }

      processedCount++;
    }

    // ---- 7. BATCH INSERT BENEFITS ----
    if (newBenefits.length > 0) {
      await supabase.from("client_benefits").insert(newBenefits);
    }

    // ---- 8. UPSERT CHALLENGE PROGRESS ----
    for (const cp of challengeUpserts) {
      await supabase
        .from("client_challenge_progress")
        .upsert(cp, { onConflict: "client_id,challenge_id" });
    }

    // ---- 9. PROCESS AFFILIATE LEVELS ----
    const { data: affiliates } = await supabase
      .from("affiliates")
      .select("id, user_id, active_clients, retention_score, affiliate_level, created_at");

    for (const aff of affiliates || []) {
      const monthsActive = Math.max(
        1,
        Math.round(
          (now.getTime() - new Date(aff.created_at).getTime()) /
            (30 * 24 * 60 * 60 * 1000)
        )
      );

      const activeClients = Number(aff.active_clients) || 0;
      const retentionScore = Number(aff.retention_score) || 0;

      let newLevel = "basic";
      let levelIndex = 0;
      for (let i = AFFILIATE_LEVELS.length - 1; i >= 0; i--) {
        const req = AFFILIATE_LEVELS[i];
        if (
          activeClients >= req.minClients &&
          retentionScore >= req.minRetention &&
          monthsActive >= req.minMonths
        ) {
          newLevel = req.level;
          levelIndex = i;
          break;
        }
      }

      let progress = 100;
      if (levelIndex < AFFILIATE_LEVELS.length - 1) {
        const next = AFFILIATE_LEVELS[levelIndex + 1];
        const clientsProg = Math.min(activeClients / Math.max(next.minClients, 1), 1);
        const retentionProg = Math.min(retentionScore / Math.max(next.minRetention, 1), 1);
        const monthsProg = Math.min(monthsActive / Math.max(next.minMonths, 1), 1);
        progress = Math.round((clientsProg * 0.4 + retentionProg * 0.35 + monthsProg * 0.25) * 100);
      }

      // Level up alert
      if (newLevel !== aff.affiliate_level) {
        const levelNames: Record<string, string> = {
          basic: "Basic", advanced: "Advanced", premium: "Premium", elite: "Elite"
        };
        const oldIdx = AFFILIATE_LEVELS.findIndex(l => l.level === aff.affiliate_level);
        if (levelIndex > oldIdx) {
          alertsToCreate.push({
            target_role: "affiliate",
            target_user_id: aff.user_id,
            alert_type: "affiliate_level_up",
            title: `Você alcançou o nível ${levelNames[newLevel]}!`,
            description: "Continue mantendo sua base ativa para desbloquear benefícios ainda maiores.",
            severity: "info",
            metadata: { affiliate_id: aff.id, new_level: newLevel },
          });
        }
      }

      await supabase
        .from("affiliates")
        .update({ affiliate_level: newLevel, affiliate_progress: progress })
        .eq("id", aff.id);
    }

    // ---- 10. INSERT ALERTS ----
    if (alertsToCreate.length > 0) {
      await supabase.from("ai_alerts").insert(alertsToCreate);
    }

    // ---- 11. LOG ----
    const processingTime = Date.now() - startTime;
    await supabase.from("ai_model_logs").insert({
      model_version: "v1.0",
      model_type: "gamification_engine",
      processed_clients: processedCount,
      processing_time_ms: processingTime,
      metadata: {
        benefits_unlocked: newBenefits.length,
        challenges_updated: challengeUpserts.length,
        alerts_generated: alertsToCreate.length,
        affiliates_scored: (affiliates || []).length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed_clients: processedCount,
        benefits_unlocked: newBenefits.length,
        challenges_updated: challengeUpserts.length,
        alerts_generated: alertsToCreate.length,
        processing_time_ms: processingTime,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gamification engine error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
