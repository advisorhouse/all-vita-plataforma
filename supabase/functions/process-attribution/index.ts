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

    const { client_id, affiliate_token, ip_address, user_agent } = await req.json();

    if (!client_id || !affiliate_token) {
      return new Response(
        JSON.stringify({ error: "client_id and affiliate_token are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Check if client is already locked
    const { data: clientProfile, error: clientError } = await supabase
      .from("client_profiles")
      .select("id, affiliate_locked, affiliate_id, user_id")
      .eq("id", client_id)
      .single();

    if (clientError || !clientProfile) {
      return new Response(
        JSON.stringify({ error: "Client not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (clientProfile.affiliate_locked) {
      return new Response(
        JSON.stringify({ error: "Client already attributed", affiliate_id: clientProfile.affiliate_id }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Resolve affiliate from token
    const { data: link, error: linkError } = await supabase
      .from("affiliate_links")
      .select("affiliate_id")
      .eq("unique_token", affiliate_token)
      .single();

    if (linkError || !link) {
      return new Response(
        JSON.stringify({ error: "Invalid affiliate token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Anti-fraud: check self-referral
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("user_id")
      .eq("id", link.affiliate_id)
      .single();

    if (affiliate && affiliate.user_id === clientProfile.user_id) {
      // Log fraud alert
      await supabase.from("fraud_alerts").insert({
        client_id,
        affiliate_id: link.affiliate_id,
        risk_level: "critical",
        reason: "Self-referral attempt detected",
      });

      return new Response(
        JSON.stringify({ error: "Self-referral is not allowed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Anti-fraud: check duplicate IP in short period
    const { data: recentIpLogs } = await supabase
      .from("attribution_logs")
      .select("id")
      .eq("ip_address", ip_address)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(5);

    if (recentIpLogs && recentIpLogs.length >= 3) {
      await supabase.from("fraud_alerts").insert({
        client_id,
        affiliate_id: link.affiliate_id,
        risk_level: "high",
        reason: `Multiple attributions from same IP in 24h (${recentIpLogs.length} found)`,
      });
    }

    // 5. Lock attribution
    const { error: updateError } = await supabase
      .from("client_profiles")
      .update({
        affiliate_id: link.affiliate_id,
        affiliate_locked: true,
      })
      .eq("id", client_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to lock attribution", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Create immutable attribution log
    await supabase.from("attribution_logs").insert({
      client_id,
      affiliate_id: link.affiliate_id,
      ip_address,
      user_agent,
      attribution_source: affiliate_token,
    });

    // 7. Update affiliate counters
    await supabase.rpc("increment_affiliate_clients", { aff_id: link.affiliate_id });

    return new Response(
      JSON.stringify({ success: true, affiliate_id: link.affiliate_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
