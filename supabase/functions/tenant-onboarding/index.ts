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
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Auth: only super_admin can create tenants
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonRes(401, { error: "Unauthorized" });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !userData?.user) {
    return jsonRes(401, { error: "Invalid token" });
  }

  const adminClient = createClient(supabaseUrl, serviceKey);

  // Check super_admin
  const { data: saCheck } = await adminClient
    .from("memberships")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("role", "super_admin")
    .is("tenant_id", null)
    .eq("active", true)
    .limit(1);

  if (!saCheck || saCheck.length === 0) {
    return jsonRes(403, { error: "Only super admins can create tenants" });
  }

  try {
    const body = await req.json();
    const {
      name, trade_name, slug, cnpj,
      primary_color, secondary_color, logo_url,
      address, owner,
    } = body;

    if (!name || !slug || !owner?.email || !owner?.full_name) {
      return jsonRes(400, { error: "name, slug, owner.email and owner.full_name are required" });
    }

    // Normalize slug
    const normalizedSlug = slug
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const { data: existingSlug } = await adminClient
      .from("tenants")
      .select("id")
      .eq("slug", normalizedSlug)
      .limit(1);

    if (existingSlug && existingSlug.length > 0) {
      return jsonRes(409, { error: "Slug already in use" });
    }

    // Check CNPJ uniqueness
    if (cnpj) {
      const cleanCnpj = cnpj.replace(/\D/g, "");
      const { data: existingCnpj } = await adminClient
        .from("tenants")
        .select("id")
        .eq("cnpj", cleanCnpj)
        .limit(1);

      if (existingCnpj && existingCnpj.length > 0) {
        return jsonRes(409, { error: "CNPJ already registered" });
      }
    }

    // 1. Create tenant
    const { data: tenant, error: tenantError } = await adminClient
      .from("tenants")
      .insert({
        name,
        trade_name: trade_name || null,
        slug: normalizedSlug,
        cnpj: cnpj ? cnpj.replace(/\D/g, "") : null,
        primary_color: primary_color || "#6366f1",
        secondary_color: secondary_color || "#8b5cf6",
        logo_url: logo_url || null,
        domain: `${normalizedSlug}.allvita.com.br`,
        status: "active",
        active: true,
      })
      .select()
      .single();

    if (tenantError) {
      console.error("Tenant creation error:", tenantError);
      return jsonRes(400, { error: tenantError.message });
    }

    // 2. Create address if provided
    if (address) {
      await adminClient.from("tenant_addresses").insert({
        tenant_id: tenant.id,
        cep: address.cep || null,
        street: address.street || null,
        number: address.number || null,
        complement: address.complement || null,
        district: address.district || null,
        city: address.city || null,
        state: address.state || null,
      });
    }

    // 3. Create owner record
    await adminClient.from("tenant_owners").insert({
      tenant_id: tenant.id,
      full_name: owner.full_name,
      cpf: owner.cpf || null,
      rg: owner.rg || null,
      email: owner.email,
      phone: owner.phone || null,
      role: owner.role || "socio",
    });

    // 4. Create master user via Supabase Auth
    const tempPassword = generateTempPassword();
    const { data: authUser, error: signupError } = await adminClient.auth.admin.createUser({
      email: owner.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: owner.full_name.split(" ")[0],
        last_name: owner.full_name.split(" ").slice(1).join(" "),
      },
    });

    if (signupError) {
      // User might already exist
      if (signupError.message?.includes("already been registered")) {
        // Get existing user
        const { data: existingUsers } = await adminClient.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find((u: any) => u.email === owner.email);
        if (existingUser) {
          // Create membership for existing user
          await adminClient.from("memberships").insert({
            user_id: existingUser.id,
            tenant_id: tenant.id,
            role: "admin",
            active: true,
          });

          // Mark as needs password change
          await adminClient
            .from("profiles")
            .update({ must_change_password: true, onboarding_completed: false })
            .eq("id", existingUser.id);

          return jsonRes(201, {
            tenant,
            master_user: { id: existingUser.id, email: owner.email, existing: true },
            subdomain: `${normalizedSlug}.allvita.com.br`,
          });
        }
      }
      console.error("User creation error:", signupError);
      return jsonRes(400, { error: `User creation failed: ${signupError.message}` });
    }

    const masterUserId = authUser.user.id;

    // 5. Update profile flags
    await adminClient
      .from("profiles")
      .update({ must_change_password: true, onboarding_completed: false })
      .eq("id", masterUserId);

    // 6. Create membership (admin of tenant)
    await adminClient.from("memberships").insert({
      user_id: masterUserId,
      tenant_id: tenant.id,
      role: "admin",
      active: true,
    });

    // 7. Send welcome email via send-email function
    try {
      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          to: owner.email,
          subject: `Bem-vindo à All Vita — ${trade_name || name}`,
          html: buildWelcomeEmail(owner.full_name, trade_name || name, normalizedSlug, tempPassword),
        }),
      });
      if (!emailRes.ok) {
        console.warn("Welcome email failed:", await emailRes.text());
      }
    } catch (emailErr) {
      console.warn("Email send error (non-blocking):", emailErr);
    }

    // 8. Audit log
    await adminClient.from("audit_logs").insert({
      user_id: userData.user.id,
      tenant_id: tenant.id,
      action: "tenant_created",
      resource: "tenants",
      resource_id: tenant.id,
      details: { name, slug: normalizedSlug, master_email: owner.email },
    });

    return jsonRes(201, {
      tenant,
      master_user: { id: masterUserId, email: owner.email },
      subdomain: `${normalizedSlug}.allvita.com.br`,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return jsonRes(500, { error: error.message });
  }
});

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  for (const byte of array) {
    password += chars[byte % chars.length];
  }
  return password;
}

function buildWelcomeEmail(name: string, company: string, slug: string, tempPassword: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
      <h1 style="color:#1a1a2e;font-size:24px">Bem-vindo à All Vita!</h1>
      <p style="color:#555;font-size:16px;line-height:1.6">
        Olá <strong>${name}</strong>,
      </p>
      <p style="color:#555;font-size:16px;line-height:1.6">
        A empresa <strong>${company}</strong> foi cadastrada com sucesso na plataforma All Vita.
      </p>
      <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin:24px 0">
        <p style="margin:0 0 8px;color:#333;font-weight:bold">Seus dados de acesso:</p>
        <p style="margin:4px 0;color:#555">
          <strong>Subdomínio:</strong> ${slug}.allvita.com.br
        </p>
        <p style="margin:4px 0;color:#555">
          <strong>Senha provisória:</strong> ${tempPassword}
        </p>
      </div>
      <p style="color:#e74c3c;font-size:14px;font-weight:bold">
        ⚠️ Este link expira em 15 minutos. Você deverá trocar a senha no primeiro acesso.
      </p>
      <a href="https://${slug}.allvita.com.br/auth/login"
         style="display:inline-block;background:#6366f1;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
        Acessar a plataforma
      </a>
      <p style="color:#999;font-size:12px;margin-top:32px">
        All Vita — Plataforma de gestão multi-tenant
      </p>
    </div>
  `;
}

function jsonRes(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
