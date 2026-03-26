import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// ANALYTICS API v1.0
// Dedicated endpoints for BI tools (Power BI, Looker, etc.)
// GET /analytics-api?metric=revenue|ltv|churn|affiliate-performance
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Auth: require admin JWT or API key
  const apiKey = req.headers.get("x-api-key");
  const authHeader = req.headers.get("authorization");
  let authorized = false;

  if (apiKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const keyHash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    const { data: keyData } = await supabase.from("api_keys").select("id, active, permissions").eq("key_hash", keyHash).single();
    if (keyData?.active && (keyData.permissions || []).includes("analytics")) {
      authorized = true;
    }
  } else if (authHeader?.startsWith("Bearer ")) {
    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims } = await userSupabase.auth.getClaims(token);
    if (claims?.claims) {
      const userId = claims.claims.sub as string;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      if (roles?.some((r: any) => r.role === "admin")) authorized = true;
    }
  }

  if (!authorized) {
    return new Response(
      JSON.stringify({ error: "Forbidden. Admin JWT or API key with analytics permission required." }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const metric = url.searchParams.get("metric") || "overview";
  const period = url.searchParams.get("period") || "30d";

  const now = new Date();
  let periodStart: Date;
  switch (period) {
    case "7d": periodStart = new Date(now.getTime() - 7 * 86400000); break;
    case "90d": periodStart = new Date(now.getTime() - 90 * 86400000); break;
    case "365d": periodStart = new Date(now.getTime() - 365 * 86400000); break;
    default: periodStart = new Date(now.getTime() - 30 * 86400000);
  }

  try {
    let result: any = {};

    if (metric === "revenue" || metric === "overview") {
      const { data: orders } = await supabase.from("orders").select("amount, payment_status, created_at").gte("created_at", periodStart.toISOString());
      const paidOrders = (orders || []).filter((o: any) => o.payment_status === "paid");
      const totalRevenue = paidOrders.reduce((s: number, o: any) => s + Number(o.amount), 0);
      const avgTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

      result.revenue = {
        total: Math.round(totalRevenue * 100) / 100,
        orders_count: paidOrders.length,
        avg_ticket: Math.round(avgTicket * 100) / 100,
        failed_count: (orders || []).filter((o: any) => o.payment_status === "failed").length,
        period,
      };
    }

    if (metric === "ltv" || metric === "overview") {
      const { data: clients } = await supabase.from("client_profiles").select("ltv_prediction, level, subscription_status, age_segment");
      const activeClients = (clients || []).filter((c: any) => c.subscription_status === "active");
      const totalLtv = activeClients.reduce((s: number, c: any) => s + (Number(c.ltv_prediction) || 0), 0);
      const avgLtv = activeClients.length > 0 ? totalLtv / activeClients.length : 0;

      // LTV by segment
      const bySegment: Record<string, { count: number; total_ltv: number }> = {};
      for (const c of activeClients) {
        const seg = c.age_segment || "unknown";
        if (!bySegment[seg]) bySegment[seg] = { count: 0, total_ltv: 0 };
        bySegment[seg].count++;
        bySegment[seg].total_ltv += Number(c.ltv_prediction) || 0;
      }

      // LTV by level
      const byLevel: Record<string, { count: number; total_ltv: number }> = {};
      for (const c of activeClients) {
        const lvl = c.level || "inicio";
        if (!byLevel[lvl]) byLevel[lvl] = { count: 0, total_ltv: 0 };
        byLevel[lvl].count++;
        byLevel[lvl].total_ltv += Number(c.ltv_prediction) || 0;
      }

      result.ltv = {
        total_active_clients: activeClients.length,
        total_ltv: Math.round(totalLtv * 100) / 100,
        avg_ltv: Math.round(avgLtv * 100) / 100,
        by_segment: bySegment,
        by_level: byLevel,
      };
    }

    if (metric === "churn" || metric === "overview") {
      const { data: clients } = await supabase.from("client_profiles").select("churn_probability, risk_level, subscription_status, age_segment, level");
      const active = (clients || []).filter((c: any) => c.subscription_status === "active");
      const avgChurn = active.length > 0 ? active.reduce((s: number, c: any) => s + (Number(c.churn_probability) || 0), 0) / active.length : 0;

      const riskDistribution = { low: 0, medium: 0, high: 0 };
      for (const c of active) {
        const r = c.risk_level as keyof typeof riskDistribution;
        if (riskDistribution[r] !== undefined) riskDistribution[r]++;
      }

      const cancelled = (clients || []).filter((c: any) => c.subscription_status === "cancelled").length;
      const paused = (clients || []).filter((c: any) => c.subscription_status === "paused").length;

      result.churn = {
        avg_churn_probability: Math.round(avgChurn * 1000) / 1000,
        risk_distribution: riskDistribution,
        active_clients: active.length,
        cancelled_clients: cancelled,
        paused_clients: paused,
        total_clients: (clients || []).length,
      };
    }

    if (metric === "affiliate-performance" || metric === "overview") {
      const { data: affiliates } = await supabase.from("affiliates").select("id, affiliate_level, active_clients, total_clients, retention_score, retention_rate, recurring_revenue, total_commission_paid, status");

      const active = (affiliates || []).filter((a: any) => a.status === "active");
      const totalRecurring = active.reduce((s: number, a: any) => s + Number(a.recurring_revenue), 0);
      const avgRetention = active.length > 0 ? active.reduce((s: number, a: any) => s + Number(a.retention_score), 0) / active.length : 0;

      const byLevel: Record<string, number> = {};
      for (const a of active) {
        const lvl = a.affiliate_level || "basic";
        byLevel[lvl] = (byLevel[lvl] || 0) + 1;
      }

      result.affiliate_performance = {
        total_affiliates: (affiliates || []).length,
        active_affiliates: active.length,
        total_recurring_revenue: Math.round(totalRecurring * 100) / 100,
        avg_retention_score: Math.round(avgRetention * 100) / 100,
        total_commission_paid: active.reduce((s: number, a: any) => s + Number(a.total_commission_paid), 0),
        by_level: byLevel,
      };
    }

    return new Response(
      JSON.stringify({
        ...result,
        generated_at: new Date().toISOString(),
        api_version: "v1",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analytics API error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
