import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// COMMISSION ENGINE v2.0
// Priority-based, stackable, margin-protected, fully audited
// POST body: { order_id, client_id, affiliate_id, amount, subscription_cycle }
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { order_id, client_id, affiliate_id, amount, subscription_cycle } = await req.json();

    if (!order_id || !client_id || !affiliate_id || !amount) {
      return jsonRes(400, { error: "order_id, client_id, affiliate_id, amount required" });
    }

    const orderAmount = Number(amount);

    // ---- 1. FETCH CLIENT PROFILE ----
    const { data: client } = await supabase
      .from("client_profiles")
      .select("id, age_segment, created_at, subscription_status, level")
      .eq("id", client_id)
      .single();

    if (!client) return jsonRes(404, { error: "Client not found" });

    const now = new Date();
    const monthsActive = Math.max(1, Math.round(
      (now.getTime() - new Date(client.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)
    ));

    // ---- 2. FETCH AFFILIATE ----
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id, level, affiliate_level, user_id")
      .eq("id", affiliate_id)
      .single();

    if (!affiliate) return jsonRes(404, { error: "Affiliate not found" });

    // ---- 3. FETCH ACTIVE RULES (ordered by priority) ----
    const { data: rules } = await supabase
      .from("commission_rules")
      .select("*")
      .eq("active", true)
      .order("priority_order", { ascending: true });

    if (!rules || rules.length === 0) {
      return jsonRes(200, { success: true, commissions: [], total: 0, message: "No active rules" });
    }

    // ---- 4. CHECK ACTIVE CAMPAIGNS ----
    const { data: campaigns } = await supabase
      .from("affiliate_campaigns")
      .select("id, custom_percentage, campaign_name")
      .eq("affiliate_id", affiliate_id)
      .eq("active", true)
      .lte("start_date", now.toISOString())
      .or(`end_date.is.null,end_date.gte.${now.toISOString()}`);

    const activeCampaignIds = new Set((campaigns || []).map((c: any) => c.id));
    const campaignBonusMap: Record<string, number> = {};
    for (const c of campaigns || []) {
      campaignBonusMap[c.id] = Number(c.custom_percentage);
    }

    // ---- 5. FETCH MARGIN PROTECTION ----
    const { data: marginRules } = await supabase
      .from("margin_protection_rules")
      .select("*")
      .eq("active", true)
      .limit(1)
      .single();

    const maxCommPct = marginRules?.max_commission_percentage || 30;
    const maxCommPerClient = marginRules?.max_commission_per_client || 500;
    const marginAlertThreshold = marginRules?.margin_alert_threshold || 20;
    const marginBlockThreshold = marginRules?.margin_block_threshold || 10;

    // ---- 6. EVALUATE RULES ----
    const appliedRules: any[] = [];
    let totalCommission = 0;
    let highestPriorityApplied = false;

    for (const rule of rules) {
      // Check eligibility
      if (!isEligible(rule, monthsActive, affiliate.affiliate_level, client.age_segment, subscription_cycle, activeCampaignIds)) {
        continue;
      }

      // Stack check: if a non-stackable rule was already applied, skip further non-stackable
      if (!rule.allow_stack && highestPriorityApplied) {
        continue;
      }

      // Calculate commission
      let pct = Number(rule.percentage);
      const fixedBonus = Number(rule.fixed_bonus_value) || 0;

      // Campaign override
      if (rule.campaign_id && campaignBonusMap[rule.campaign_id]) {
        pct += campaignBonusMap[rule.campaign_id];
      }

      const commissionAmount = Math.round((orderAmount * pct / 100 + fixedBonus) * 100) / 100;

      // Margin check
      const projectedTotal = totalCommission + commissionAmount;
      const commPctOfOrder = (projectedTotal / orderAmount) * 100;

      let marginCheckPassed = true;
      let reason = `Regra "${rule.rule_name}" aplicada: ${pct}%`;

      if (commPctOfOrder > maxCommPct) {
        marginCheckPassed = false;
        reason = `BLOQUEADO: comissão acumulada ${commPctOfOrder.toFixed(1)}% excede limite de ${maxCommPct}%`;
      }

      if (projectedTotal > maxCommPerClient) {
        marginCheckPassed = false;
        reason = `BLOQUEADO: comissão R$${projectedTotal.toFixed(2)} excede limite por cliente de R$${maxCommPerClient}`;
      }

      if (marginCheckPassed) {
        totalCommission = projectedTotal;

        if (!rule.allow_stack) {
          highestPriorityApplied = true;
        }
      }

      appliedRules.push({
        rule_id: rule.id,
        rule_name: rule.rule_name,
        commission_type: rule.commission_type,
        percentage_applied: pct,
        fixed_bonus: fixedBonus,
        commission_amount: marginCheckPassed ? commissionAmount : 0,
        cumulative_total: totalCommission,
        was_stacked: rule.allow_stack,
        margin_check_passed: marginCheckPassed,
        margin_percentage: commPctOfOrder,
        reason,
      });
    }

    // ---- 7. CREATE COMMISSIONS ----
    const commissionsCreated: any[] = [];
    const auditEntries: any[] = [];

    for (const applied of appliedRules) {
      if (!applied.margin_check_passed || applied.commission_amount === 0) {
        // Still log in audit
        auditEntries.push({
          order_id,
          affiliate_id,
          client_id,
          ...applied,
          order_amount: orderAmount,
        });
        continue;
      }

      // Insert commission
      const { data: comm, error: commErr } = await supabase
        .from("commissions")
        .insert({
          affiliate_id,
          client_id,
          order_id,
          commission_type: applied.commission_type,
          percentage_applied: applied.percentage_applied,
          amount: applied.commission_amount,
          paid_status: "pending",
        })
        .select("id")
        .single();

      if (!commErr && comm) {
        commissionsCreated.push(comm);
        auditEntries.push({
          commission_id: comm.id,
          order_id,
          affiliate_id,
          client_id,
          ...applied,
          order_amount: orderAmount,
        });
      }
    }

    // ---- 8. INSERT AUDIT LOG ----
    if (auditEntries.length > 0) {
      await supabase.from("commission_audit_log").insert(auditEntries);
    }

    // ---- 9. UPDATE AFFILIATE TOTALS ----
    if (totalCommission > 0) {
      const { data: currentAff } = await supabase
        .from("affiliates")
        .select("total_commission_paid, recurring_revenue")
        .eq("id", affiliate_id)
        .single();

      if (currentAff) {
        await supabase
          .from("affiliates")
          .update({
            total_commission_paid: Number(currentAff.total_commission_paid) + totalCommission,
            recurring_revenue: Number(currentAff.recurring_revenue) + totalCommission,
          })
          .eq("id", affiliate_id);
      }
    }

    // ---- 10. MARGIN ALERTS ----
    const totalCommPct = (totalCommission / orderAmount) * 100;
    if (totalCommPct > marginAlertThreshold) {
      await supabase.from("ai_alerts").insert({
        target_role: "admin",
        alert_type: "margin_warning",
        title: "Alerta de margem",
        description: `Comissão de ${totalCommPct.toFixed(1)}% sobre pedido R$${orderAmount}. Acima do threshold de ${marginAlertThreshold}%.`,
        severity: totalCommPct > marginBlockThreshold ? "warning" : "info",
        metadata: { order_id, affiliate_id, commission_pct: totalCommPct, total_commission: totalCommission },
      });
    }

    return jsonRes(200, {
      success: true,
      order_id,
      order_amount: orderAmount,
      total_commission: totalCommission,
      commission_percentage: Math.round(totalCommPct * 100) / 100,
      rules_evaluated: rules.length,
      rules_applied: appliedRules.filter(r => r.margin_check_passed && r.commission_amount > 0).length,
      rules_blocked: appliedRules.filter(r => !r.margin_check_passed).length,
      commissions: commissionsCreated,
      audit: appliedRules,
    });
  } catch (error) {
    console.error("Commission engine v2 error:", error);
    return jsonRes(500, { error: error.message });
  }
});

function isEligible(
  rule: any,
  monthsActive: number,
  affiliateLevel: string,
  ageSegment: string | null,
  cycle: number,
  activeCampaignIds: Set<string>
): boolean {
  // Commission type check
  if (rule.commission_type === "initial" && cycle > 1) return false;
  if (rule.commission_type === "recurring" && cycle <= 1) return false;
  if (rule.commission_type === "bonus_6m" && monthsActive < 6) return false;
  if (rule.commission_type === "bonus_12m" && monthsActive < 12) return false;

  // Months active range
  if (rule.min_months && monthsActive < rule.min_months) return false;
  if (rule.max_active_months && monthsActive > rule.max_active_months) return false;

  // Affiliate level
  if (rule.affiliate_level_required && rule.affiliate_level_required !== affiliateLevel) return false;

  // Age segment
  if (rule.age_segment && rule.age_segment !== ageSegment) return false;

  // Campaign
  if (rule.campaign_id && !activeCampaignIds.has(rule.campaign_id)) return false;

  return true;
}

function jsonRes(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Content-Type": "application/json",
    },
  });
}
