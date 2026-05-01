import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { tenant_id, role, metadata } = body;

    if (!tenant_id || !role) {
      return new Response(JSON.stringify({ error: "tenant_id and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify tenant exists and is active
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id, name, slug")
      .eq("id", tenant_id)
      .eq("active", true)
      .single();

    if (tenantError || !tenant) {
      return new Response(JSON.stringify({ error: "Tenant not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if membership already exists
    const { data: existingMembership } = await supabaseAdmin
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("tenant_id", tenant_id)
      .single();

    if (existingMembership) {
      return new Response(JSON.stringify({ error: "User already has a membership in this tenant" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create membership
    const { error: membershipError } = await supabaseAdmin
      .from("memberships")
      .insert({
        user_id: user.id,
        tenant_id,
        role,
        active: true,
      });

    if (membershipError) {
      console.error("Membership insert error:", membershipError);
      return new Response(JSON.stringify({ error: "Failed to create membership" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Role-specific records
    if (role === "client") {
      const profile = await supabaseAdmin
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("id", user.id)
        .single();

      const fullName = profile.data
        ? [profile.data.first_name, profile.data.last_name].filter(Boolean).join(" ")
        : user.user_metadata?.full_name || "";

      const { error: clientError } = await supabaseAdmin
        .from("clients")
        .insert({
          user_id: user.id,
          tenant_id,
          full_name: fullName || null,
          phone: profile.data?.phone || null,
          metadata: metadata || {},
        });

      if (clientError) {
        console.error("Client insert error:", clientError);
      }

      // Create initial order if product info provided
      if (metadata?.product_id) {
        const { error: orderError } = await supabaseAdmin
          .from("orders")
          .insert({
            client_id: (await supabaseAdmin
              .from("clients")
              .select("id")
              .eq("user_id", user.id)
              .eq("tenant_id", tenant_id)
              .single()).data?.id,
            tenant_id,
            product_id: metadata.product_id,
            amount: metadata.amount || 0,
            status: "active",
            payment_status: "paid",
            metadata: { source: "onboarding", product_label: metadata.product_label },
          });

        if (orderError) {
          console.error("Order insert error:", orderError);
        }
      }
    }

    if (role === "partner") {
      // Generate unique referral code
      const referralCode = `${tenant.slug?.toUpperCase().replace(/-/g, "").slice(0, 4)}-${user.id.slice(0, 6).toUpperCase()}`;

      const { error: partnerError } = await supabaseAdmin
        .from("partners")
        .insert({
          user_id: user.id,
          tenant_id,
          referral_code: referralCode,
          parent_partner_id: metadata?.parent_partner_id || user.user_metadata?.parent_partner_id || null,
          level: "bronze",
          active: true,
          metadata: metadata || {},
        });

      if (partnerError) {
        console.error("Partner insert error:", partnerError);
      }
    }

    // Log audit
    await supabaseAdmin.rpc("create_audit_log", {
      _user_id: user.id,
      _tenant_id: tenant_id,
      _actor_type: "user",
      _action: `${role}_onboarding_completed`,
      _entity_type: role,
      _metadata: { role, source: "tenant-signup" },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
