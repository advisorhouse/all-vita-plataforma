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
    console.log(`Checking DNS for ${domain}`);

    try {
      // Try to resolve CNAME
      const records = await Deno.resolveDns(domain, "CNAME");
      console.log(`Records found for ${domain}:`, records);
      
      const isResolved = records.length > 0;

      return new Response(JSON.stringify({ 
        resolved: isResolved,
        records: records,
        domain 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (dnsError) {
      console.log(`DNS resolution failed for ${domain}:`, dnsError.message);
      
      // Also try A record just in case
      try {
        const aRecords = await Deno.resolveDns(domain, "A");
        if (aRecords.length > 0) {
          return new Response(JSON.stringify({ 
            resolved: true,
            records: aRecords,
            domain 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        // ignore
      }

      return new Response(JSON.stringify({ 
        resolved: false, 
        error: dnsError.message,
        domain 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
