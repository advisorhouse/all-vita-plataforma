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

    const apiKey = config.api_key_encrypted; 
    const auth = btoa(`${apiKey}:`);

    let endpoint = "";
    let method = "POST";
    let bodyData = params;

    switch (action) {
      case "create_order":
        endpoint = "/orders";
        
        // Handle Splits for All Vita fee
        if (tenant_id) {
          // 1. Get All Vita Master recipient
          const { data: globalConfig } = await supabase
            .from("payment_integrations")
            .select("recipient_id")
            .is("tenant_id", null)
            .eq("provider", "pagarme")
            .eq("active", true)
            .single();

          // 2. Get Tenant recipient
          const { data: tenantConfig } = await supabase
            .from("payment_integrations")
            .select("recipient_id")
            .eq("tenant_id", tenant_id)
            .eq("provider", "pagarme")
            .eq("active", true)
            .single();

          // 3. Get Fee Percentage
          let feePercentage = 0;
          const { data: tenant } = await supabase
            .from("tenants")
            .select("custom_transaction_fee")
            .eq("id", tenant_id)
            .single();
          
          if (tenant?.custom_transaction_fee !== null && tenant?.custom_transaction_fee !== undefined) {
            feePercentage = tenant.custom_transaction_fee;
          } else {
            // Get from plan
            const { data: subscription } = await supabase
              .from("tenant_subscriptions")
              .select("plan_id")
              .eq("tenant_id", tenant_id)
              .eq("status", "active")
              .single();
            
            if (subscription?.plan_id) {
              const { data: plan } = await supabase
                .from("saas_plans")
                .select("transaction_fee_percentage")
                .eq("id", subscription.plan_id)
                .single();
              feePercentage = plan?.transaction_fee_percentage || 0;
            }
          }

          if (globalConfig?.recipient_id && tenantConfig?.recipient_id && feePercentage > 0) {
            // Inject splits into each payment method (usually 'credit_card' or 'pix')
            if (bodyData.payments && Array.isArray(bodyData.payments)) {
              bodyData.payments = bodyData.payments.map((payment: any) => {
                const splits = [
                  {
                    recipient_id: globalConfig.recipient_id,
                    type: "percentage",
                    amount: feePercentage,
                    options: {
                      charge_processing_fee: true,
                      charge_remainder_fee: true,
                      liable: true,
                    },
                  },
                  {
                    recipient_id: tenantConfig.recipient_id,
                    type: "percentage",
                    amount: 100 - feePercentage,
                    options: {
                      charge_processing_fee: false,
                      charge_remainder_fee: false,
                      liable: false,
                    },
                  },
                ];
                return { ...payment, split: splits };
              });
            }
          }
        }
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
      body: method === "POST" ? JSON.stringify(bodyData) : undefined,
    });

    const result = await response.json();

    // If order was created successfully and we have splits, record the estimated split in our DB
    if (action === "create_order" && response.status === 200 && result.id) {
       // We can record the split amounts here or wait for webhook
    }

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
