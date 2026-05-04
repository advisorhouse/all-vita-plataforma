import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";

/**
 * Espelha um produto do banco no Pagar.me (POST /products) e gera link de checkout.
 * Esperado body: { product_id }
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("PAGARME_SECRET_KEY");
    if (!apiKey) throw new Error("PAGARME_SECRET_KEY não configurada");

    const supabase = createClient(supabaseUrl, serviceKey);
    const { product_id } = await req.json();
    if (!product_id) throw new Error("product_id obrigatório");

    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();
    if (pErr || !product) throw new Error("Produto não encontrado");

    const auth = btoa(`${apiKey}:`);

    // Pagar.me v5 /orders aceita itens ad-hoc; /products é opcional para catálogo.
    // Tentamos espelhar via endpoint /products (catálogo), tolerando se não existir nessa conta.
    const productPayload: any = {
      name: product.name?.slice(0, 64) || "Produto",
      description: (product.description || product.name || "").slice(0, 256),
      amount: Math.round(Number(product.price) * 100),
      status: product.active ? "active" : "inactive",
      code: product.id,
    };

    let pagarmeProductId: string | null = product.pagarme_product_id || null;
    let syncError: string | null = null;
    let raw: any = null;

    try {
      const endpoint = pagarmeProductId
        ? `${PAGARME_API_URL}/products/${pagarmeProductId}`
        : `${PAGARME_API_URL}/products`;
      const method = pagarmeProductId ? "PUT" : "POST";
      const r = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
        body: JSON.stringify(productPayload),
      });
      raw = await r.json();
      if (r.ok && raw?.id) {
        pagarmeProductId = raw.id;
      } else {
        syncError = `Pagar.me products endpoint: ${r.status} ${JSON.stringify(raw).slice(0, 300)}`;
      }
    } catch (e: any) {
      syncError = e.message;
    }

    // Link de checkout interno (transparente) — Pagar.me não obriga ID; o checkout é montado em runtime.
    // Apontamos para a rota pública /checkout/:productId no subdomínio do tenant (atribuição via ?ref=).
    // O URL absoluto exato será montado no client com base no hostname do tenant.
    const checkoutPath = `/checkout/${product.id}`;

    await supabase
      .from("products")
      .update({
        pagarme_product_id: pagarmeProductId,
        pagarme_sync_status: syncError ? "error" : "synced",
        pagarme_sync_error: syncError,
        pagarme_last_sync_at: new Date().toISOString(),
        checkout_url: checkoutPath,
      })
      .eq("id", product_id);

    return new Response(
      JSON.stringify({
        success: !syncError,
        pagarme_product_id: pagarmeProductId,
        checkout_url: checkoutPath,
        error: syncError,
        raw,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("pagarme-sync-product error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
