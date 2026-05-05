// Temporary helper to (re)send the invite email for juridico@advisorhouse.com.br
// Uses service role internally; requires no auth (intentional one-off).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, key);

  const email = "juridico@advisorhouse.com.br";
  const tenantId = "6a1818ae-5225-4a38-8f95-6c254dec0580";
  const redirectTo = "https://lumyss.allvita.com.br/auth/reset-password";

  const meta = {
    first_name: "Dr. Tiago",
    last_name: "Parceiro Lumyss",
    full_name: "Dr. Tiago Parceiro Lumyss",
    role: "partner",
    partner_level: 1,
    tenant_id: tenantId,
    tenant_slug: "lumyss",
  };

  // Try invite first; if user already exists, fall back to generateLink (recovery)
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: meta,
    redirectTo,
  });

  if (!inviteErr) {
    return new Response(
      JSON.stringify({ ok: true, mode: "invite", user_id: invited.user?.id }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  console.log("[seed-invite] inviteUserByEmail failed:", inviteErr.message);

  // Generate a recovery link for existing users (also routes through auth-email-hook)
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (linkErr) {
    return new Response(
      JSON.stringify({ ok: false, error: linkErr.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      mode: "recovery",
      action_link: linkData?.properties?.action_link,
    }),
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
});
