import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ResendDnsRecord {
  record: string;
  name: string;
  type: string;
  ttl?: string | number;
  status?: string;
  value: string;
  priority?: number;
}

async function callResend(path: string, init: RequestInit = {}) {
  console.log(`[Resend] ${init.method || "GET"} ${path}`, init.body ? `body=${init.body}` : "");
  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  console.log(`[Resend] ${init.method || "GET"} ${path} -> ${res.status}`, JSON.stringify(data).slice(0, 500));
  return { ok: res.ok, status: res.status, data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY não configurada" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const tenantId = body.tenantId || url.searchParams.get("tenantId");

    if (!tenantId) {
      return new Response(JSON.stringify({ error: "tenantId obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .select("id, slug, resend_domain_id, dns_records, email_dns_status")
      .eq("id", tenantId)
      .single();

    if (tenantErr || !tenant) {
      return new Response(JSON.stringify({ error: "Tenant não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fullDomain = `${tenant.slug}.allvita.com.br`;

    // Action: verify domain
    if (action === "verify" && req.method === "POST") {
      if (!tenant.resend_domain_id) {
        return new Response(JSON.stringify({ error: "Domínio ainda não criado no Resend" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { ok, data } = await callResend(`/domains/${tenant.resend_domain_id}/verify`, {
        method: "POST",
      });

      if (ok) {
        await supabase.from("tenants").update({
          email_dns_status: data.status === "verified" ? "verified" : "pending",
        }).eq("id", tenantId);
      }

      return new Response(JSON.stringify({ ok, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET: return cached records if exist
    if (req.method === "GET" && tenant.dns_records && Array.isArray(tenant.dns_records) && tenant.dns_records.length > 0) {
      return new Response(JSON.stringify({
        domain: fullDomain,
        resend_domain_id: tenant.resend_domain_id,
        records: tenant.dns_records,
        status: tenant.email_dns_status,
        cached: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: create or fetch domain
    let resendDomainId = tenant.resend_domain_id;
    let records: ResendDnsRecord[] = [];

    if (resendDomainId) {
      // Fetch existing
      const { ok, data } = await callResend(`/domains/${resendDomainId}`);
      if (ok && data?.records) {
        records = data.records;
      }
    } else {
      // Create new
      const { ok, status, data } = await callResend(`/domains`, {
        method: "POST",
        body: JSON.stringify({ name: fullDomain, region: "sa-east-1" }),
      });

      if (!ok) {
        // If domain already exists in Resend, try to find it
        if (status === 422 || data?.message?.includes("already exists")) {
          const list = await callResend(`/domains`);
          if (list.ok && Array.isArray(list.data?.data)) {
            const found = list.data.data.find((d: any) => d.name === fullDomain);
            if (found) {
              resendDomainId = found.id;
              const detail = await callResend(`/domains/${found.id}`);
              if (detail.ok) records = detail.data.records || [];
            }
          }
        }

        if (!resendDomainId) {
          return new Response(JSON.stringify({
            error: "Falha ao criar domínio no Resend",
            details: data,
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        resendDomainId = data.id;
        records = data.records || [];
      }

      // Persist
      await supabase.from("tenants").update({
        resend_domain_id: resendDomainId,
        dns_records: records,
        email_dns_status: "pending",
      }).eq("id", tenantId);
    }

    return new Response(JSON.stringify({
      domain: fullDomain,
      resend_domain_id: resendDomainId,
      records,
      status: tenant.email_dns_status || "pending",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("resend-domain-setup error:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
