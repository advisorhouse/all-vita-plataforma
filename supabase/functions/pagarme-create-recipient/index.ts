import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";

/**
 * Cria um Recipient no Pagar.me para o tenant.
 * Esperado body: { tenant_id }
 * Lê os dados bancários e fiscais já salvos em tenants e dispara POST /recipients.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("PAGARME_SECRET_KEY");
    if (!apiKey) throw new Error("PAGARME_SECRET_KEY não configurada");

    const supabase = createClient(supabaseUrl, serviceKey);
    const { tenant_id } = await req.json();
    if (!tenant_id) throw new Error("tenant_id obrigatório");

    const { data: tenant, error: tErr } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenant_id)
      .single();
    if (tErr || !tenant) throw new Error("Tenant não encontrado");

    if (!tenant.legal_document || !tenant.bank_code || !tenant.bank_account) {
      throw new Error("Dados bancários/fiscais incompletos no tenant");
    }

    const documentDigits = String(tenant.legal_document).replace(/\D/g, "");
    const isCNPJ = documentDigits.length === 14;

    const payload = {
      register_information: isCNPJ
        ? {
            type: "corporation",
            company_name: tenant.legal_name || tenant.name,
            trading_name: tenant.trade_name || tenant.name,
            email: tenant.email || tenant.contact_email || undefined,
            document: documentDigits,
            site_url: tenant.website || undefined,
            annual_revenue: 1200000,
            corporation_type: "limited",
            founding_date: "2020-01-01",
            main_address: tenant.address_street
              ? {
                  street: tenant.address_street,
                  complementary: tenant.address_complement || "",
                  street_number: tenant.address_number || "S/N",
                  neighborhood: tenant.address_district || "",
                  city: tenant.address_city || "",
                  state: tenant.address_state || "",
                  zip_code: String(tenant.address_cep || "").replace(/\D/g, ""),
                  reference_point: "",
                }
              : undefined,
            managing_partners: [
              {
                name: tenant.bank_holder_name || tenant.legal_name,
                email: tenant.email || tenant.contact_email || `tenant-${tenant_id}@allvita.com.br`,
                document: String(tenant.bank_holder_document || documentDigits).replace(/\D/g, ""),
                type: "individual",
                mother_name: "Não informado",
                birthdate: "1980-01-01",
                monthly_income: 100000,
                professional_occupation: "Empresário",
                self_declared_legal_representative: true,
              },
            ],
          }
        : {
            type: "individual",
            email: tenant.email || tenant.contact_email || `tenant-${tenant_id}@allvita.com.br`,
            document: documentDigits,
            name: tenant.legal_name || tenant.name,
            mother_name: "Não informado",
            birthdate: "1980-01-01",
            monthly_income: 100000,
            professional_occupation: "Empresário",
          },
      default_bank_account: {
        holder_name: tenant.bank_holder_name || tenant.legal_name || tenant.name,
        holder_type: isCNPJ ? "company" : "individual",
        holder_document: String(tenant.bank_holder_document || documentDigits).replace(/\D/g, ""),
        bank: tenant.bank_code,
        branch_number: tenant.bank_agency,
        branch_check_digit: tenant.bank_agency_dv || undefined,
        account_number: tenant.bank_account,
        account_check_digit: tenant.bank_account_dv || "0",
        type: tenant.bank_account_type || "checking",
      },
      transfer_settings: {
        transfer_enabled: true,
        transfer_interval: "Daily",
        transfer_day: 0,
      },
      automatic_anticipation_settings: {
        enabled: false,
      },
      code: tenant_id,
    };

    const auth = btoa(`${apiKey}:`);
    const resp = await fetch(`${PAGARME_API_URL}/recipients`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify(payload),
    });
    const result = await resp.json();

    if (!resp.ok) {
      await supabase
        .from("tenants")
        .update({
          pagarme_recipient_status: "failed",
          pagarme_recipient_status_reason: JSON.stringify(result).slice(0, 500),
        })
        .eq("id", tenant_id);
      return new Response(JSON.stringify({ error: result, sent: payload }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Persist
    await supabase.from("payment_integrations").upsert(
      {
        tenant_id,
        provider: "pagarme",
        recipient_id: result.id,
        active: true,
        metadata: { pagarme_recipient: result },
      },
      { onConflict: "tenant_id,provider" } as any,
    );

    await supabase
      .from("tenants")
      .update({
        pagarme_recipient_status: result.status || "registration",
        pagarme_recipient_created_at: new Date().toISOString(),
        pagarme_recipient_status_reason: null,
      })
      .eq("id", tenant_id);

    return new Response(JSON.stringify({ success: true, recipient: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("pagarme-create-recipient error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
