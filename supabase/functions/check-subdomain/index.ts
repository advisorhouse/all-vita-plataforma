import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug } = await req.json();
    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const domain = `${slug}.allvita.com.br`;
    console.log(`Checking DNS+HTTP for ${domain}`);

    // Step 1: DNS resolution
    let dnsResolved = false;
    let dnsRecords: string[] = [];
    let dnsError: string | null = null;

    try {
      const aRecords = await Deno.resolveDns(domain, "A");
      if (aRecords.length > 0) {
        dnsResolved = true;
        dnsRecords = aRecords;
      }
    } catch (e) {
      dnsError = (e as Error).message;
    }

    if (!dnsResolved) {
      try {
        const cnameRecords = await Deno.resolveDns(domain, "CNAME");
        if (cnameRecords.length > 0) {
          dnsResolved = true;
          dnsRecords = cnameRecords;
        }
      } catch (e) {
        dnsError = dnsError || (e as Error).message;
      }
    }

    if (!dnsResolved) {
      return new Response(JSON.stringify({
        resolved: false,
        dnsResolved: false,
        httpReachable: false,
        stage: "dns",
        error: dnsError || "DNS não resolvido",
        domain,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Step 2: HTTP reachability
    let httpReachable = false;
    let httpStatus: number | null = null;
    let httpError: string | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`https://${domain}`, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "AllVita-DNS-Check/1.0" },
      });
      clearTimeout(timeout);
      httpStatus = res.status;
      const cfErrors = [530, 521, 522, 523, 524, 525, 526];
      httpReachable = !cfErrors.includes(res.status);
    } catch (e) {
      const msg = (e as Error).message;
      httpError = msg;
      if (msg.includes("HandshakeFailure") || msg.includes("ssl") || msg.includes("certificate")) {
        httpError = "DNS apontado corretamente! Aguardando ativação do certificado SSL (HTTPS)...";
      }
      httpReachable = false;
    }

    const fullyResolved = dnsResolved && httpReachable;

    // Side effect: update registration_status if resolved
    if (fullyResolved) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Get current status first to avoid redundant notifications
      const { data: tenant } = await supabaseAdmin
        .from("tenants")
        .select("registration_status")
        .eq("slug", slug)
        .maybeSingle();

      if (tenant && tenant.registration_status === 'pending') {
        console.log(`Tenant ${slug} is now dns_ready! Updating database...`);
        await supabaseAdmin
          .from("tenants")
          .update({ 
            registration_status: 'dns_ready',
            pending_registration_notification: true 
          })
          .eq("slug", slug);
      }
    }

    return new Response(JSON.stringify({
      resolved: fullyResolved,
      dnsResolved,
      httpReachable,
      httpStatus,
      stage: fullyResolved ? "ok" : (dnsResolved ? "http" : "dns"),
      records: dnsRecords,
      error: !fullyResolved
        ? (httpError || `Servidor respondeu ${httpStatus}`)
        : null,
      domain,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
