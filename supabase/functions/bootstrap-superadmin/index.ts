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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  const body = await req.json();
  const { email, password, full_name, bootstrap_key } = body;

  // Simple protection: require a bootstrap key matching service role key
  if (bootstrap_key !== serviceKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Create user
    const { data: authUser, error: signupError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: full_name.split(" ")[0],
        last_name: full_name.split(" ").slice(1).join(" ") || "",
      },
    });

    if (signupError && !signupError.message?.includes("already been registered")) {
      return new Response(JSON.stringify({ error: signupError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userId: string;
    if (signupError) {
      // User already exists, find them
      const { data: users } = await adminClient.auth.admin.listUsers();
      const existing = users?.users?.find((u: any) => u.email === email);
      if (!existing) {
        return new Response(JSON.stringify({ error: "User exists but not found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = existing.id;
    } else {
      userId = authUser.user.id;
    }

    // Update profile
    await adminClient.from("profiles").update({
      first_name: full_name.split(" ")[0],
      last_name: full_name.split(" ").slice(1).join(" ") || "",
      must_change_password: false,
      onboarding_completed: true,
    }).eq("id", userId);

    // Create super_admin membership (tenant_id = null)
    const { error: memberError } = await adminClient.from("memberships").upsert({
      user_id: userId,
      tenant_id: null,
      role: "super_admin",
      active: true,
    }, { onConflict: "user_id,tenant_id" });

    if (memberError) {
      // Try insert if upsert fails
      await adminClient.from("memberships").insert({
        user_id: userId,
        tenant_id: null,
        role: "super_admin",
        active: true,
      });
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
