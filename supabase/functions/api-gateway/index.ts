import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// VISION LIFT API GATEWAY v1
// Unified REST API: /api-gateway?path=/v1/clients/{id}
// Auth: JWT (users) or X-API-Key (partners)
// ============================================================

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const adminSupabase = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const apiPath = url.searchParams.get("path") || "";
  const method = req.method;

  // ---------- AUTH LAYER ----------
  let authRole = "";
  let authUserId = "";
  let apiKeyId: string | null = null;

  const apiKey = req.headers.get("x-api-key");
  const authHeader = req.headers.get("authorization");

  try {
    if (apiKey) {
      // API Key auth for partners
      const keyHash = await hashKey(apiKey);
      const { data: keyData, error: keyErr } = await adminSupabase
        .from("api_keys")
        .select("id, role, permissions, rate_limit_per_minute, active, expires_at")
        .eq("key_hash", keyHash)
        .single();

      if (keyErr || !keyData || !keyData.active) {
        return jsonResponse(401, { error: "Invalid or inactive API key" });
      }

      if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
        return jsonResponse(401, { error: "API key expired" });
      }

      // Rate limiting
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { count } = await adminSupabase
        .from("api_request_logs")
        .select("*", { count: "exact", head: true })
        .eq("api_key_id", keyData.id)
        .gte("created_at", oneMinuteAgo);

      if ((count || 0) >= keyData.rate_limit_per_minute) {
        return jsonResponse(429, { error: "Rate limit exceeded", retry_after_seconds: 60 });
      }

      authRole = keyData.role;
      apiKeyId = keyData.id;

      // Update last_used_at
      await adminSupabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id);

    } else if (authHeader?.startsWith("Bearer ")) {
      // JWT auth for users
      const userSupabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: claimsErr } = await userSupabase.auth.getClaims(token);

      if (claimsErr || !claims?.claims) {
        return jsonResponse(401, { error: "Invalid token" });
      }

      authUserId = claims.claims.sub as string;

      // Get role
      const { data: roles } = await adminSupabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUserId);

      if (roles && roles.length > 0) {
        const roleSet = new Set(roles.map((r: any) => r.role));
        if (roleSet.has("admin")) authRole = "admin";
        else if (roleSet.has("affiliate")) authRole = "affiliate";
        else authRole = "client";
      } else {
        authRole = "client";
      }

      // Rate limit for users (120/min)
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { count } = await adminSupabase
        .from("api_request_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", authUserId)
        .gte("created_at", oneMinuteAgo);

      if ((count || 0) >= 120) {
        return jsonResponse(429, { error: "Rate limit exceeded", retry_after_seconds: 60 });
      }
    } else {
      return jsonResponse(401, { error: "Authentication required. Use Bearer token or X-API-Key header." });
    }

    // ---------- ROUTING ----------
    let body: any = null;
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      try { body = await req.json(); } catch { body = {}; }
    }

    const result = await routeRequest(adminSupabase, apiPath, method, authRole, authUserId, body);

    // Log request
    const responseTime = Date.now() - startTime;
    await adminSupabase.from("api_request_logs").insert({
      api_key_id: apiKeyId,
      user_id: authUserId || null,
      endpoint: apiPath,
      method,
      status_code: result.status,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      user_agent: req.headers.get("user-agent"),
      response_time_ms: responseTime,
    });

    return jsonResponse(result.status, result.body);
  } catch (error) {
    console.error("API Gateway error:", error);

    const responseTime = Date.now() - startTime;
    await adminSupabase.from("api_request_logs").insert({
      api_key_id: apiKeyId,
      user_id: authUserId || null,
      endpoint: apiPath,
      method,
      status_code: 500,
      response_time_ms: responseTime,
    }).catch(() => {});

    return jsonResponse(500, { error: "Internal server error" });
  }
});

// ---------- ROUTER ----------
async function routeRequest(
  supabase: any,
  path: string,
  method: string,
  role: string,
  userId: string,
  body: any
): Promise<{ status: number; body: any }> {
  // Normalize path
  const cleanPath = path.replace(/^\/v1/, "").replace(/\/$/, "") || "/";
  const segments = cleanPath.split("/").filter(Boolean);

  // ===== CLIENTS =====
  if (segments[0] === "clients") {
    if (method === "GET" && segments.length === 1) {
      if (role !== "admin") return { status: 403, body: { error: "Forbidden" } };
      const { data, error } = await supabase.from("client_profiles").select("id, user_id, subscription_status, level, engagement_score, consistency_score, risk_level, created_at");
      if (error) return { status: 500, body: { error: error.message } };
      return { status: 200, body: { clients: data, count: data.length } };
    }

    if (segments.length >= 2) {
      const clientId = segments[1];

      if (method === "GET" && segments.length === 2) {
        const { data, error } = await supabase.from("client_profiles").select("id, user_id, subscription_status, level, level_progress, engagement_score, consistency_score, behavioral_score, risk_level, age_segment, created_at").eq("id", clientId).single();
        if (error) return { status: 404, body: { error: "Client not found" } };
        if (role === "client" && data.user_id !== userId) return { status: 403, body: { error: "Forbidden" } };
        // Hide sensitive AI fields from clients
        if (role === "client") {
          delete data.risk_level;
        }
        return { status: 200, body: data };
      }

      if (method === "GET" && segments[2] === "subscription") {
        const { data } = await supabase.from("client_profiles").select("id, subscription_status, level, level_progress, created_at").eq("id", clientId).single();
        if (!data) return { status: 404, body: { error: "Client not found" } };
        if (role === "client" && data.user_id !== userId) return { status: 403, body: { error: "Forbidden" } };
        return { status: 200, body: data };
      }

      if (method === "GET" && segments[2] === "engagement-score") {
        const { data } = await supabase.from("client_profiles").select("id, engagement_score, consistency_score, behavioral_score, level").eq("id", clientId).single();
        if (!data) return { status: 404, body: { error: "Client not found" } };
        return { status: 200, body: data };
      }

      if (method === "GET" && segments[2] === "consistency") {
        const { data } = await supabase.from("client_profiles").select("id, consistency_score, level, level_progress").eq("id", clientId).single();
        if (!data) return { status: 404, body: { error: "Client not found" } };
        return { status: 200, body: data };
      }

      if (method === "POST" && segments[2] === "pause") {
        if (role !== "admin" && role !== "client") return { status: 403, body: { error: "Forbidden" } };
        const { error } = await supabase.from("client_profiles").update({ subscription_status: "paused" }).eq("id", clientId);
        if (error) return { status: 500, body: { error: error.message } };
        return { status: 200, body: { success: true, message: "Subscription paused" } };
      }

      if (method === "POST" && segments[2] === "cancel") {
        if (role !== "admin" && role !== "client") return { status: 403, body: { error: "Forbidden" } };
        const { error } = await supabase.from("client_profiles").update({ subscription_status: "cancelled" }).eq("id", clientId);
        if (error) return { status: 500, body: { error: error.message } };
        return { status: 200, body: { success: true, message: "Subscription cancelled" } };
      }
    }
  }

  // ===== AFFILIATES =====
  if (segments[0] === "affiliate") {
    if (segments.length >= 2) {
      const affId = segments[1];

      if (method === "GET" && segments.length === 2) {
        const { data, error } = await supabase.from("affiliates").select("id, user_id, level, affiliate_level, affiliate_progress, active_clients, total_clients, recurring_revenue, retention_score, retention_rate, status, created_at").eq("id", affId).single();
        if (error) return { status: 404, body: { error: "Affiliate not found" } };
        if (role === "affiliate" && data.user_id !== userId) return { status: 403, body: { error: "Forbidden" } };
        return { status: 200, body: data };
      }

      if (method === "GET" && segments[2] === "dashboard") {
        const { data: aff } = await supabase.from("affiliates").select("*").eq("id", affId).single();
        if (!aff) return { status: 404, body: { error: "Affiliate not found" } };
        const { data: commissions } = await supabase.from("commissions").select("amount, commission_type, paid_status, created_at").eq("affiliate_id", affId).order("created_at", { ascending: false }).limit(20);
        return { status: 200, body: { affiliate: aff, recent_commissions: commissions || [] } };
      }

      if (method === "GET" && segments[2] === "clients") {
        if (role !== "admin" && role !== "affiliate") return { status: 403, body: { error: "Forbidden" } };
        const { data } = await supabase.from("client_profiles").select("id, subscription_status, level, engagement_score, consistency_score, created_at").eq("affiliate_id", affId);
        return { status: 200, body: { clients: data || [], count: (data || []).length } };
      }

      if (method === "GET" && segments[2] === "commissions") {
        const { data } = await supabase.from("commissions").select("id, amount, commission_type, percentage_applied, paid_status, created_at").eq("affiliate_id", affId).order("created_at", { ascending: false });
        return { status: 200, body: { commissions: data || [] } };
      }

      if (method === "GET" && segments[2] === "retention-score") {
        const { data } = await supabase.from("affiliates").select("id, retention_score, retention_rate, active_clients, affiliate_level").eq("id", affId).single();
        if (!data) return { status: 404, body: { error: "Affiliate not found" } };
        return { status: 200, body: data };
      }
    }

    if (method === "POST" && segments.length === 1) {
      // Generate affiliate link
      if (role !== "admin" && role !== "affiliate") return { status: 403, body: { error: "Forbidden" } };
      const { affiliate_id } = body || {};
      if (!affiliate_id) return { status: 400, body: { error: "affiliate_id required" } };
      const token = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
      const { data, error } = await supabase.from("affiliate_links").insert({ affiliate_id, unique_token: token }).select().single();
      if (error) return { status: 500, body: { error: error.message } };
      return { status: 201, body: data };
    }
  }

  // ===== COMMISSIONS =====
  if (segments[0] === "commissions") {
    if (method === "GET" && segments.length >= 2 && segments[1] === "projection") {
      if (role !== "admin" && role !== "affiliate") return { status: 403, body: { error: "Forbidden" } };
      // Delegate to ai-revenue-projections
      return { status: 200, body: { message: "Use /ai/projection endpoint for commission projections" } };
    }

    if (method === "GET" && segments.length >= 2) {
      const affId = segments[1];
      const { data } = await supabase.from("commissions").select("*").eq("affiliate_id", affId).order("created_at", { ascending: false });
      return { status: 200, body: { commissions: data || [] } };
    }
  }

  // ===== ATTRIBUTION =====
  if (segments[0] === "attribution") {
    if (method === "POST" && segments[1] === "track") {
      if (role !== "admin" && role !== "system" && role !== "partner_api") return { status: 403, body: { error: "Forbidden" } };
      const { affiliate_id, client_id, source, ip_address, user_agent } = body || {};
      if (!affiliate_id || !client_id) return { status: 400, body: { error: "affiliate_id and client_id required" } };
      const { data, error } = await supabase.from("attribution_logs").insert({
        affiliate_id, client_id, attribution_source: source || "api", ip_address, user_agent
      }).select().single();
      if (error) return { status: 500, body: { error: error.message } };
      return { status: 201, body: data };
    }

    if (method === "GET" && segments[1] === "logs" && segments[2]) {
      if (role !== "admin") return { status: 403, body: { error: "Forbidden" } };
      const { data } = await supabase.from("attribution_logs").select("*").eq("client_id", segments[2]).order("created_at", { ascending: false });
      return { status: 200, body: { logs: data || [] } };
    }
  }

  // ===== AI ENGINE =====
  if (segments[0] === "ai") {
    if (role !== "admin" && role !== "partner_api") return { status: 403, body: { error: "Forbidden. AI endpoints require admin or partner_api role." } };

    if (method === "GET" && segments[1] === "churn" && segments[2]) {
      const { data } = await supabase.from("client_profiles").select("id, churn_probability, risk_level, engagement_score").eq("id", segments[2]).single();
      if (!data) return { status: 404, body: { error: "Client not found" } };
      return { status: 200, body: data };
    }

    if (method === "GET" && segments[1] === "ltv" && segments[2]) {
      const { data } = await supabase.from("client_profiles").select("id, ltv_prediction, behavioral_score, level").eq("id", segments[2]).single();
      if (!data) return { status: 404, body: { error: "Client not found" } };
      return { status: 200, body: data };
    }

    if (method === "GET" && segments[1] === "affiliate-retention" && segments[2]) {
      const { data } = await supabase.from("affiliates").select("id, retention_score, retention_rate, active_clients, affiliate_level").eq("id", segments[2]).single();
      if (!data) return { status: 404, body: { error: "Affiliate not found" } };
      return { status: 200, body: data };
    }

    if (method === "GET" && segments[1] === "projection") {
      // Aggregate projection
      const { data: clients } = await supabase.from("client_profiles").select("churn_probability, ltv_prediction, engagement_score").eq("subscription_status", "active");
      if (!clients || clients.length === 0) return { status: 200, body: { active_clients: 0, avg_churn: 0, avg_ltv: 0, total_ltv: 0 } };
      const avgChurn = clients.reduce((s: number, c: any) => s + (Number(c.churn_probability) || 0), 0) / clients.length;
      const avgLtv = clients.reduce((s: number, c: any) => s + (Number(c.ltv_prediction) || 0), 0) / clients.length;
      const totalLtv = clients.reduce((s: number, c: any) => s + (Number(c.ltv_prediction) || 0), 0);
      const avgEngagement = clients.reduce((s: number, c: any) => s + (Number(c.engagement_score) || 0), 0) / clients.length;
      return {
        status: 200,
        body: {
          active_clients: clients.length,
          avg_churn_probability: Math.round(avgChurn * 1000) / 1000,
          avg_ltv: Math.round(avgLtv * 100) / 100,
          total_ltv: Math.round(totalLtv * 100) / 100,
          avg_engagement: Math.round(avgEngagement * 100) / 100,
        },
      };
    }
  }

  // ===== HEALTH =====
  if (segments[0] === "health" || cleanPath === "/") {
    return { status: 200, body: { status: "ok", version: "v1", timestamp: new Date().toISOString() } };
  }

  return { status: 404, body: { error: "Endpoint not found", path: cleanPath, available_endpoints: [
    "GET /v1/health",
    "GET /v1/clients",
    "GET /v1/clients/{id}",
    "GET /v1/clients/{id}/subscription",
    "GET /v1/clients/{id}/engagement-score",
    "GET /v1/clients/{id}/consistency",
    "POST /v1/clients/{id}/pause",
    "POST /v1/clients/{id}/cancel",
    "POST /v1/affiliate",
    "GET /v1/affiliate/{id}",
    "GET /v1/affiliate/{id}/dashboard",
    "GET /v1/affiliate/{id}/clients",
    "GET /v1/affiliate/{id}/commissions",
    "GET /v1/affiliate/{id}/retention-score",
    "GET /v1/commissions/{affiliate_id}",
    "POST /v1/attribution/track",
    "GET /v1/attribution/logs/{client_id}",
    "GET /v1/ai/churn/{client_id}",
    "GET /v1/ai/ltv/{client_id}",
    "GET /v1/ai/affiliate-retention/{affiliate_id}",
    "GET /v1/ai/projection",
  ] } };
}

function jsonResponse(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
