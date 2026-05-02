import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * process-attribution
 *
 * Attributes a sale (order) to the partner referenced by `referral_code`,
 * creates the corresponding `referrals` and `conversions` rows, and triggers
 * the multi-level commission engine (mt_commissions) for the upline.
 *
 * Body:
 *  - tenant_id   (uuid, required)
 *  - order_id    (uuid, required) — must already exist in `orders`
 *  - referral_code (string, required)
 *  - ip / user_agent (optional, for audit)
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const { tenant_id, order_id, referral_code, ip, user_agent } = body ?? {};

    if (!tenant_id || !order_id || !referral_code) {
      return new Response(
        JSON.stringify({ error: "tenant_id, order_id and referral_code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Use the SECURITY DEFINER RPC for atomic attribution
    const { data: rpcData, error: rpcErr } = await supabase.rpc("attribute_sale", {
      _order_id: order_id,
      _referral_code: referral_code,
    });

    if (rpcErr) {
      console.error("attribute_sale rpc error:", rpcErr);
      return new Response(
        JSON.stringify({ error: rpcErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = rpcData as { success: boolean; partner_id?: string; error?: string };

    if (!result?.success) {
      return new Response(
        JSON.stringify({ error: result?.error || "attribution_failed" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Audit log (best-effort)
    await supabase.rpc("create_audit_log", {
      _user_id: null,
      _tenant_id: tenant_id,
      _actor_type: "system",
      _action: "sale_attributed",
      _entity_type: "order",
      _entity_id: order_id,
      _ip: ip ?? null,
      _user_agent: user_agent ?? null,
      _metadata: { partner_id: result.partner_id, referral_code },
    });

    // Fire multi-level commission engine (best-effort, async)
    try {
      const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/commission-engine-v2`;
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ order_id, tenant_id, partner_id: result.partner_id }),
      }).catch((e) => console.error("commission-engine-v2 invoke error:", e));
    } catch (e) {
      console.error("Failed to invoke commission-engine-v2:", e);
    }

    return new Response(
      JSON.stringify({ success: true, partner_id: result.partner_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("process-attribution unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err.message ?? "unknown_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
