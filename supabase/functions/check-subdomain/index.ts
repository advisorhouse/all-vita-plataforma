import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Step 1: DNS resolution (A or CNAME)
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

    // Step 2: HTTP reachability (avoid Cloudflare 1001 false positives)
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
      // Cloudflare error pages return 5xx; treat 2xx/3xx/4xx (auth) as reachable.
      // 530/521/522/523/524/525/526 = Cloudflare origin/DNS errors
      const cfErrors = [530, 521, 522, 523, 524, 525, 526];
      httpReachable = !cfErrors.includes(res.status);
    } catch (e) {
      httpError = (e as Error).message;
      // DNS-level fetch failure (Cloudflare 1001 is returned as a 530 normally,
      // but if Cloudflare can't even find the zone the fetch may fail entirely)
      httpReachable = false;
    }

    const fullyResolved = dnsResolved && httpReachable;

    return new Response(JSON.stringify({
      resolved: fullyResolved,
      dnsResolved,
      httpReachable,
      httpStatus,
      stage: fullyResolved ? "ok" : (dnsResolved ? "http" : "dns"),
      records: dnsRecords,
      error: !fullyResolved
        ? (httpError || `Servidor respondeu ${httpStatus} (provável erro Cloudflare 1001 — subdomínio não existe no DNS do allvita.com.br)`)
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
