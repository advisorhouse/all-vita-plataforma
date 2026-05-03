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
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { tenant_id } = await req.json();

    if (!tenant_id) {
      throw new Error("tenant_id is required");
    }

    // 1. Gather historical data for the tenant
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Get orders
    const { data: orders } = await supabase
      .from("orders")
      .select("amount, created_at, status, payment_status")
      .eq("tenant_id", tenant_id)
      .gte("created_at", threeMonthsAgo.toISOString());

    // Get subscriptions
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("status, created_at, cancelled_at")
      .eq("tenant_id", tenant_id);

    // Get active clients
    const { data: clients } = await supabase
      .from("clients")
      .select("id, created_at")
      .eq("tenant_id", tenant_id);

    // Prepare data for AI
    const stats = {
      total_orders: orders?.length || 0,
      paid_orders: orders?.filter(o => o.payment_status === 'paid').length || 0,
      total_revenue: orders?.filter(o => o.payment_status === 'paid').reduce((acc, o) => acc + Number(o.amount), 0) || 0,
      active_subscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
      cancelled_subscriptions: subscriptions?.filter(s => s.status === 'cancelled').length || 0,
      total_clients: clients?.length || 0,
      last_3_months_data: orders?.map(o => ({ date: o.created_at, amount: o.amount, status: o.status }))
    };

    // 2. Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5", // User specifically asked for OpenAI
        messages: [
          {
            role: "system",
            content: "You are a senior financial analyst and data scientist. Analyze the provided multi-tenant business data and generate robust revenue, churn, and LTV predictions. Return only a valid JSON object."
          },
          {
            role: "user",
            content: `Analyze this data for tenant ${tenant_id}: ${JSON.stringify(stats)}. 
            Predict:
            1. Revenue for the next 3 and 12 months.
            2. Churn probability (0-1).
            3. Customer Lifetime Value (LTV).
            4. Business health insights.
            
            Format: {
              "projected_mrr_3m": number,
              "projected_mrr_12m": number,
              "churn_probability": number,
              "avg_ltv": number,
              "confidence_score": number,
              "insights": string[],
              "recommendations": string[]
            }`
          }
        ],
        temperature: 1,
        response_format: { type: "json_object" }
      }),
    });

    const aiResult = await response.json();
    console.log("AI Result:", JSON.stringify(aiResult));

    if (!aiResult.choices || aiResult.choices.length === 0) {
      throw new Error(`AI Gateway returned an error or no choices: ${JSON.stringify(aiResult)}`);
    }

    const predictionData = JSON.parse(aiResult.choices[0].message.content);

    // 3. Save to database
    const { error: saveError } = await supabase
      .from("ai_predictions")
      .insert({
        tenant_id,
        prediction_type: "revenue_forecast",
        data: predictionData,
        confidence_score: predictionData.confidence_score,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Valid for 7 days
      });

    if (saveError) console.error("Error saving prediction:", saveError);

    return new Response(
      JSON.stringify(predictionData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI projections error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});