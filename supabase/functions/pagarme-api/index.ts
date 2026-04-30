import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, params, tenant_id } = await req.json();

    // Get Pagar.me config
    // First try tenant-specific, then global
    let config;
    if (tenant_id) {
      const { data: tenantConfig } = await supabase
        .from("payment_integrations")
        .select("*")
        .eq("tenant_id", tenant_id)
        .eq("provider", "pagarme")
        .eq("active", true)
        .single();
      config = tenantConfig;
    }

    if (!config) {
      const { data: globalConfig } = await supabase
        .from("payment_integrations")
        .select("*")
        .is("tenant_id", null)
        .eq("provider", "pagarme")
        .eq("active", true)
        .single();
      config = globalConfig;
    }

    if (!config) {
      return new Response(JSON.stringify({ error: "Pagar.me integration not found or inactive" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = config.api_key_encrypted; // Assuming it's the raw key for now or decrypted via some vault
    const auth = btoa(`${apiKey}:`);

    let endpoint = "";
    let method = "POST";

    switch (action) {
      case "create_order":
        endpoint = "/orders";
        break;
      case "create_customer":
        endpoint = "/customers";
        break;
      case "get_order":
        endpoint = `/orders/${params.order_id}`;
        method = "GET";
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch(`${PAGARME_API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: method === "POST" ? JSON.stringify(params) : undefined,
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
