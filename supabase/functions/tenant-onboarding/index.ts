import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const url = new URL(req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  // Handle send-activation sub-route
  if (url.pathname.endsWith("/send-activation") && req.method === "POST") {
    try {
      const { tenantId } = await req.json();
      if (!tenantId) return jsonRes(400, { error: "tenantId is required" });

      const { data: tenant, error: tErr } = await adminClient
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (tErr || !tenant) return jsonRes(404, { error: "Tenant not found" });

      const { data: owners } = await adminClient
        .from("tenant_owners")
        .select("*")
        .eq("tenant_id", tenantId)
        .limit(1);
      
      const owner = owners?.[0];
      if (!owner) return jsonRes(404, { error: "Owner not found" });

      // Find user by email
      const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;
      
      const authUser = usersData.users.find(u => u.email?.toLowerCase() === owner.email.toLowerCase());
      if (!authUser) return jsonRes(404, { error: "User not found in Auth" });

      // Check profile to see if they already completed onboarding
      const { data: profile } = await adminClient
        .from("profiles")
        .select("onboarding_completed, must_change_password")
        .eq("id", authUser.id)
        .single();

      let passwordToShow = "Sua senha pessoal";
      
      // Only reset password if they haven't completed onboarding
      if (!profile?.onboarding_completed) {
        const newTempPassword = generateTempPassword();
        const { error: updateError } = await adminClient.auth.admin.updateUserById(authUser.id, {
          password: newTempPassword,
        });
        if (updateError) throw updateError;

        await adminClient
          .from("profiles")
          .update({ must_change_password: true })
          .eq("id", authUser.id);
        
        passwordToShow = newTempPassword;
      }

      // Build the email content with the real temporary password (or "Sua senha pessoal")
      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          to: owner.email,
          subject: `Acesso Liberado: All Vita — ${tenant.trade_name || tenant.name}`,
          html: buildWelcomeEmail(owner.full_name, tenant.trade_name || tenant.name, tenant.slug, passwordToShow, owner.email),
        }),
      });

      if (!emailRes.ok) throw new Error(await emailRes.text());

      await adminClient.from("tenants").update({ activation_email_sent: true }).eq("id", tenantId);

      return jsonRes(200, { success: true });
    } catch (err) {
      console.error("Activation error:", err);
      return jsonRes(500, { error: err.message });
    }
  }

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

  // Check staff role (super_admin or admin)
  const { data: staffMember } = await adminClient
    .from("all_vita_staff")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("is_active", true)
    .single();

  if (!staffMember || !["super_admin", "admin"].includes(staffMember.role)) {
    return jsonRes(403, { error: "Você não tem permissão para cadastrar empresas. Contate o super administrador para isso." });
  }

  try {
    const body = await req.json();
    const {
      name, trade_name, slug, cnpj, segment,
      primary_color, secondary_color, logo_url,
      address, owner, skip_email = true,
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
        segment: segment || null,
        primary_color: primary_color || "#6366f1",
        secondary_color: secondary_color || "#8b5cf6",
        logo_url: logo_url || null,
        domain: `${normalizedSlug}.allvita.com.br`,
        status: "pending_dns",
        active: true,
        dns_status: "pending",
        manual_activation_required: true,
        activation_email_sent: false,
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

    // 7. Send welcome email via send-email function (ONLY if not skipped)
    if (!skip_email) {
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
            html: buildWelcomeEmail(owner.full_name, trade_name || name, normalizedSlug, tempPassword, owner.email),
          }),
        });
        if (emailRes.ok) {
          // Mark email as sent
          await adminClient.from("tenants").update({ activation_email_sent: true }).eq("id", tenant.id);
        } else {
          console.warn("Welcome email failed:", await emailRes.text());
        }
      } catch (emailErr) {
        console.warn("Email send error (non-blocking):", emailErr);
      }
    } else {
      console.log(`Skipping initial welcome email for ${owner.email} - awaiting DNS activation.`);
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

function buildWelcomeEmail(name: string, company: string, slug: string, tempPassword: string, email: string): string {
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; color: #1a1a1a; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 28px; font-weight: 800; margin: 0; color: #000; letter-spacing: -0.02em;">All Vita</h1>
        <p style="font-size: 14px; color: #666; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.1em;">Ecossistema de Alta Performance</p>
      </div>
      
      <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px; color: #1a1a1a;">Olá, ${name}!</h2>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #444;">
        Seja bem-vindo à All Vita. É um prazer ter a <strong>${company}</strong> como parceira. 
        A partir de agora, você tem em mãos uma infraestrutura tecnológica completa para escalar sua operação com inteligência e eficiência.
      </p>

      <div style="background-color: #f8fafc; border-radius: 12px; padding: 28px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 20px;">Seu Primeiro Acesso Administrativo</h3>
        
        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 13px; color: #64748b; display: block; margin-bottom: 4px;">Link do Painel Administrativo (Core):</span>
          <a href="https://app.allvita.com.br/${slug}/core" style="font-size: 16px; color: #2563eb; text-decoration: none; font-weight: 700;">app.allvita.com.br/${slug}/core</a>
        </div>
        
        <div style="display: flex; gap: 40px;">
          <div>
            <span style="font-size: 13px; color: #64748b; display: block; margin-bottom: 4px;">E-mail de Acesso:</span>
            <span style="font-size: 15px; color: #1e293b; font-weight: 600;">${email}</span>
          </div>
          <div>
            <span style="font-size: 13px; color: #64748b; display: block; margin-bottom: 4px;">Senha Provisória:</span>
            <code style="font-size: 16px; color: #1e293b; font-weight: 700; font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code>
          </div>
        </div>
      </div>

      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #1a1a1a;">Explore os 3 Portais do seu Ecossistema:</h3>
      
      <div style="margin-bottom: 16px; padding: 16px; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h4 style="margin: 0 0 8px; color: #2563eb; font-size: 16px;">1. Portal CORE (Administrativo)</h4>
        <p style="margin: 0 0 12px; font-size: 14px; color: #666; line-height: 1.5;">Onde tudo acontece. É aqui que você, como admin, fará a gestão completa: cadastrar colaboradores, configurar produtos, gerenciar finanças e acompanhar métricas em tempo real.</p>
        <a href="https://app.allvita.com.br/${slug}/core" style="font-size: 13px; font-weight: 600; color: #2563eb; text-decoration: none;">Acessar Core &rarr;</a>
      </div>

      <div style="margin-bottom: 16px; padding: 16px; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h4 style="margin: 0 0 8px; color: #10b981; font-size: 16px;">2. Portal PARTNER (Parceiros/Afiliados)</h4>
        <p style="margin: 0 0 12px; font-size: 14px; color: #666; line-height: 1.5;">Área dedicada aos seus parceiros de vendas. Eles terão acesso a materiais de apoio, links de indicação, acompanhamento de comissões e treinamentos.</p>
        <a href="https://app.allvita.com.br/${slug}/partner" style="font-size: 13px; font-weight: 600; color: #10b981; text-decoration: none;">Acessar Partner &rarr;</a>
      </div>

      <div style="margin-bottom: 32px; padding: 16px; border: 1px solid #f0f0f0; border-radius: 8px;">
        <h4 style="margin: 0 0 8px; color: #6366f1; font-size: 16px;">3. Portal CLUB (Área do Cliente)</h4>
        <p style="margin: 0 0 12px; font-size: 14px; color: #666; line-height: 1.5;">A experiência do seu cliente final. Aqui ele gerencia sua assinatura, consome conteúdos exclusivos e participa da comunidade da sua marca.</p>
        <a href="https://app.allvita.com.br/${slug}/club" style="font-size: 13px; font-weight: 600; color: #6366f1; text-decoration: none;">Acessar Club &rarr;</a>
      </div>

      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 32px;">
        <p style="margin: 0; font-size: 15px; color: #92400e; line-height: 1.6;">
          <strong>Próximos passos:</strong> Ao logar no <strong>Portal Core</strong> pela primeira vez, o sistema solicitará a troca de senha. Em seguida, inicie o processo de configuração — que é super simples e intuitivo — começando pelo cadastro dos seus primeiros colaboradores.
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="https://app.allvita.com.br/${slug}/auth/login" style="background-color: #000; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 700; display: inline-block; transition: all 0.2s;">
          Começar Agora
        </a>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; text-align: center; margin-bottom: 0;">
        Este é um e-mail automático. Caso precise de ajuda, nossa equipe de suporte está pronta para te auxiliar através dos nossos canais oficiais.
      </p>
      
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f0f0f0; text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          All Vita — A tecnologia por trás da sua performance profissional.
        </p>
      </div>
    </div>
  `;
}

function jsonRes(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
