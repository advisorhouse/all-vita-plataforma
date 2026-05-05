import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization");
  const apikeyHeader = req.headers.get("apikey");
  
  console.log(`[ManageUsers] Auth: ${authHeader ? 'present' : 'missing'}, ApiKey: ${apikeyHeader ? 'present' : 'missing'}`);
  
  const serviceKeyCheck = (authHeader?.replace("Bearer ", "").trim() === serviceKey.trim()) || (apikeyHeader?.trim() === serviceKey.trim()) || (authHeader?.trim() === serviceKey.trim());
  
  let callerUserId = "";
  let isAdminToken = false;

  if (serviceKeyCheck) {
    console.log("[ManageUsers] Admin access granted via service key");
    callerUserId = "00000000-0000-0000-0000-000000000000";
    isAdminToken = true;
  } else {
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[ManageUsers] Missing Bearer token");
      return jsonRes(401, { error: "Unauthorized" });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authError } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !userData?.user) {
      console.log("[ManageUsers] Invalid user token:", authError?.message);
      return jsonRes(401, { error: "Invalid token" });
    }
    callerUserId = userData.user.id;
    
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: staffData } = await adminClient
      .from("all_vita_staff")
      .select("role")
      .eq("user_id", callerUserId)
      .maybeSingle();
    
    isAdminToken = staffData?.role === 'super_admin' || staffData?.role === 'admin';
  }




  const tenantId = req.headers.get("X-Tenant-Id");
  const adminClient = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const action = pathParts[pathParts.length - 1] || "";

  console.log(`[ManageUsers] Action: ${action}, Caller: ${callerUserId}, Tenant: ${tenantId}`);



  // Helper to check permissions using the unified RBAC function
  const checkPermission = async (res: string, act: string, tId: string | null) => {
    const { data: allowed, error: rpcError } = await adminClient.rpc('can', {
      _user_id: callerUserId,
      _resource: res,
      _action: act,
      _tenant_id: tId
    });
    if (rpcError) {
      console.error(`[RBAC] Error checking ${res}:${act} for user ${callerUserId}:`, rpcError);
      return false;
    }
    return !!allowed;
  };

  // Determine required resource and action based on the requested endpoint
  let requiredResource = "memberships";
  let requiredAction = "read";

  switch (action) {
    case "create": requiredAction = "create"; break;
    case "update":
    case "deactivate":
    case "reset-password":
    case "resend-invite": requiredAction = "update"; break;
    case "delete": requiredAction = "delete"; break;
    case "list": requiredAction = "read"; break;
    case "auth-status": requiredAction = "read"; break; // Needs higher privilege in practice, but usually fine for staff
    case "preview-email": requiredAction = "read"; break;
    case "invite_user": requiredAction = "update"; break;
  }

  console.log(`[ManageUsers] isAdminToken: ${isAdminToken}, Action: ${action}`);
  const isAllowed = isAdminToken || await checkPermission(requiredResource, requiredAction, tenantId);

  if (!isAllowed) {
    // Specialized error for delete which traditionally only super admin did
    if (action === "delete") {
      return jsonRes(403, { error: "Apenas usuários com permissão de exclusão podem realizar esta ação." });
    }
    return jsonRes(403, { error: `Você não tem permissão para ${requiredAction} em ${requiredResource}.` });
  }




  try {
    if (action === "preview-email") {
      const body = await req.json();
      const { email, full_name, role, is_staff, tenant_id: targetId, type } = body;
      
      let tenantName = "All Vita";
      let tenantLogo = "https://fmkcxsyudgtimpbjwcjv.supabase.co/storage/v1/object/public/system-assets/allvita-logo.png"; // Official URL from project storage
      
      if (!is_staff && targetId) {
        const { data: tenant } = await adminClient
          .from("tenants")
          .select("name, trade_name, logo_url")
          .eq("id", targetId)
          .single();
        tenantName = tenant?.trade_name || tenant?.name || "All Vita";
        tenantLogo = tenant?.logo_url || tenantLogo;
      }

      const tempPassword = "SUA_SENHA_AQUI";
      let title = "Bem-vindo!";
      let content = "";
      let ctaText = "Acessar Plataforma";
      const ctaUrl = "https://app.allvita.com.br/auth/login";

      if (type === "reset-password") {
        title = "Sua senha foi resetada";
        content = `
          <p>Um administrador resetou sua senha na plataforma <strong>${tenantName}</strong>.</p>
          <p>Utilize os dados abaixo para o seu próximo acesso:</p>
          <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6B8E23">
            <p style="margin:0;color:#666;font-size:12px uppercase;letter-spacing:1px">Sua nova senha provisória:</p>
            <p style="margin:8px 0 0;font-size:20px;font-family:monospace;color:#1a1a2e;font-weight:bold">${tempPassword}</p>
          </div>
          <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Importante: Você deverá trocar esta senha no seu próximo acesso para garantir a segurança da sua conta.</p>
        `;
        ctaText = "Ir para o Login";
      } else if (is_staff) {
        title = "Bem-vindo à Equipe All Vita!";
        content = `
          <p>Você acaba de ser integrado à plataforma oficial da <strong>All Vita</strong> como membro da equipe.</p>
          <p>Como parte do nosso time, você terá acesso às ferramentas essenciais para nossa operação:</p>
          <ul style="padding-left: 20px; color: #475569;">
            <li><strong>Gestão Estratégica:</strong> Controle de parceiros, clientes e fluxos operacionais.</li>
            <li><strong>Inteligência de Dados:</strong> Acesso a dashboards e relatórios de performance em tempo real.</li>
            <li><strong>Segurança e Auditoria:</strong> Ambiente protegido com monitoramento de ações e segurança avançada.</li>
          </ul>
          <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6B8E23">
            <p style="margin:0;color:#666;font-size:12px uppercase;letter-spacing:1px">Sua senha de acesso temporária:</p>
            <p style="margin:8px 0 0;font-size:20px;font-family:monospace;color:#1a1a2e;font-weight:bold">${tempPassword}</p>
          </div>
          <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Segurança: Por política interna, altere sua senha imediatamente após o primeiro acesso.</p>
        `;
      } else {
        content = `
          <p>Você foi convidado para fazer parte da plataforma <strong>${tenantName}</strong>.</p>
          <p>Estamos muito felizes em ter você conosco! Sua conta já foi criada e você pode começar a explorar todas as funcionalidades agora mesmo.</p>
          <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6B8E23">
            <p style="margin:0;color:#666;font-size:12px uppercase;letter-spacing:1px">Sua senha de acesso temporária:</p>
            <p style="margin:8px 0 0;font-size:20px;font-family:monospace;color:#1a1a2e;font-weight:bold">${tempPassword}</p>
          </div>
          <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Importante: Troque sua senha no primeiro acesso para manter seus dados protegidos.</p>
        `;
      }

      const html = renderEmail({
        title,
        userName: full_name || 'Usuário',
        tenantName,
        tenantLogo,
        content,
        ctaText,
        ctaUrl
      });
      
      return jsonRes(200, { html, tenantName });
    }

    const { data: staffData } = await adminClient
      .from("all_vita_staff")
      .select("role")
      .eq("user_id", callerUserId)
      .maybeSingle();
    
    const isSuperAdmin = staffData?.role === 'super_admin';
    const isAdmin = staffData?.role === 'admin' || isSuperAdmin;

    switch (action) {
      case "list": {
        // List all memberships + profiles for this tenant
        const { data: members, error } = await adminClient
          .from("memberships")
          .select("id, user_id, role, active, created_at")
          .eq("tenant_id", tenantId)
          .eq("active", true);

        if (error) return jsonRes(400, { error: error.message });

        // Fetch profiles for these users
        const userIds = members?.map((m: any) => m.user_id) || [];
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("id, email, first_name, last_name, phone, avatar_url")
          .in("id", userIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        const enriched = (members || []).map((m: any) => ({
          ...m,
          profile: profileMap.get(m.user_id) || null,
        }));

        return jsonRes(200, { data: enriched });
      }

      case "auth-status": {
        // Returns email_confirmed_at, last_sign_in_at, invited_at for given user IDs
        const body = await req.json().catch(() => ({}));
        const userIds: string[] = Array.isArray(body?.userIds) ? body.userIds : [];
        if (!userIds.length) return jsonRes(200, { data: [] });

        // Paginate listUsers (max 1000 per page is the SDK default)
        const result: any[] = [];
        let pageNum = 1;
        const perPage = 1000;
        // Fetch up to 5 pages defensively
        for (let i = 0; i < 5; i++) {
          const { data: usersPage, error: pageErr } = await adminClient.auth.admin.listUsers({ page: pageNum, perPage });
          if (pageErr) break;
          const users = usersPage?.users || [];
          for (const u of users) {
            if (userIds.includes(u.id)) {
              result.push({
                id: u.id,
                email_confirmed_at: u.email_confirmed_at || null,
                last_sign_in_at: u.last_sign_in_at || null,
                invited_at: u.invited_at || null,
                confirmation_sent_at: u.confirmation_sent_at || null,
              });
            }
          }
          if (users.length < perPage) break;
          pageNum++;
        }

        return jsonRes(200, { data: result });
      }

      case "create": {
        const body = await req.json();
        const { email, full_name, phone, role, is_staff, partner_data } = body;

        if (!email || !full_name || !role) {
          return jsonRes(400, { error: "email, full_name and role are required" });
        }

        const validRoles = ["super_admin", "admin", "manager", "partner", "client"];
        if (!validRoles.includes(role)) {
          return jsonRes(400, { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
        }

        // For partners: use inviteUserByEmail so auth-email-hook is triggered
        // and the user receives a real activation link to set their own password.
        const usePartnerInvite = role === "partner";

        // Resolve tenant slug for redirect (partner invite)
        let tenantSlugForRedirect: string | null = null;
        let tenantNameForMeta: string | null = null;
        if (usePartnerInvite && tenantId) {
          const { data: t } = await adminClient
            .from("tenants")
            .select("slug, name, trade_name")
            .eq("id", tenantId)
            .maybeSingle();
          tenantSlugForRedirect = t?.slug || null;
          tenantNameForMeta = t?.trade_name || t?.name || null;
        }

        const inviteRedirectTo = usePartnerInvite
          ? (tenantSlugForRedirect
              ? `https://${tenantSlugForRedirect}.allvita.com.br/auth/reset-password`
              : `https://app.allvita.com.br/auth/reset-password`)
          : undefined;

        // Resolve inviter (parent partner) info if provided
        let inviterPartnerId: string | null = null;
        let inviterName: string | null = null;
        let partnerLevel = 1;
        if (usePartnerInvite && partner_data?.parent_partner_id) {
          inviterPartnerId = partner_data.parent_partner_id;
          const { data: parent } = await adminClient
            .from("partners")
            .select("level, user_id")
            .eq("id", inviterPartnerId)
            .maybeSingle();
          partnerLevel = (parseInt(parent?.level || "1") || 1) + 1;
          if (parent?.user_id) {
            const { data: parentProfile } = await adminClient
              .from("profiles")
              .select("first_name, last_name")
              .eq("id", parent.user_id)
              .maybeSingle();
            inviterName = [parentProfile?.first_name, parentProfile?.last_name].filter(Boolean).join(" ").trim() || null;
          }
        }

        const tempPassword = generateTempPassword();
        let userId: string;

        if (usePartnerInvite) {
          // Try invite first; if user already exists, fall back to capturing the existing id.
          const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
            data: {
              first_name: full_name.split(" ")[0],
              last_name: full_name.split(" ").slice(1).join(" "),
              full_name,
              role: "partner",
              source: "partner_onboarding",
              tenant_id: tenantId,
              tenant_slug: tenantSlugForRedirect,
              tenant_name: tenantNameForMeta,
              partner_level: partnerLevel,
              inviter_partner_id: inviterPartnerId,
              inviter_name: inviterName,
            },
            redirectTo: inviteRedirectTo,
          });

          if (inviteError) {
            const msg = inviteError.message || "";
            if (msg.includes("already been registered") || msg.toLowerCase().includes("already")) {
              const { data: existingUsers } = await adminClient.auth.admin.listUsers();
              const existing = existingUsers?.users?.find((u: any) => u.email === email);
              if (!existing) return jsonRes(400, { error: "User exists but could not be found" });
              userId = existing.id;
            } else {
              return jsonRes(400, { error: inviteError.message });
            }
          } else {
            userId = invited.user.id;
          }
        } else {
          // Non-partner: keep current behavior (auto-confirm + temp password) so internal staff/admin flow stays the same.
          const { data: authUser, error: signupError } = await adminClient.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              first_name: full_name.split(" ")[0],
              last_name: full_name.split(" ").slice(1).join(" "),
            },
          });

          if (signupError) {
            if (signupError.message?.includes("already been registered")) {
              const { data: existingUsers } = await adminClient.auth.admin.listUsers();
              const existing = existingUsers?.users?.find((u: any) => u.email === email);
              if (!existing) return jsonRes(400, { error: "User exists but could not be found" });
              userId = existing.id;
              await adminClient.auth.admin.updateUserById(userId, { email_confirm: true });
            } else {
              return jsonRes(400, { error: signupError.message });
            }
          } else {
            userId = authUser.user.id;
          }
        }

        // Update profile flags
        await adminClient
          .from("profiles")
          .update({ 
            must_change_password: true, 
            onboarding_completed: false,
            phone: phone || null 
          })
          .eq("id", userId);

        const targetTenantId = is_staff ? null : tenantId;

        // Create membership
        const { error: memberError } = await adminClient.from("memberships").upsert({
          user_id: userId,
          tenant_id: targetTenantId,
          role,
          active: true,
        }, { onConflict: "user_id,tenant_id" }).select();

        if (memberError) {
          await adminClient.from("memberships").insert({
            user_id: userId,
            tenant_id: targetTenantId,
            role,
            active: true,
          });
        }

        // If role is admin/manager, create tenant_staff record
        if (!is_staff && ["admin", "manager"].includes(role)) {
          await adminClient.from("tenant_staff").upsert({
            tenant_id: tenantId,
            user_id: userId,
            role: role === "admin" ? "admin" : "manager",
            is_active: true,
          }, { onConflict: "tenant_id,user_id" });
        }

        // If role is partner, create the partners record (level 1 by default, level 2+ if invited by another partner)
        if (usePartnerInvite && targetTenantId) {
          const { data: existingPartner } = await adminClient
            .from("partners")
            .select("id")
            .eq("user_id", userId)
            .eq("tenant_id", targetTenantId)
            .maybeSingle();

          if (!existingPartner) {
            await adminClient.from("partners").insert({
              user_id: userId,
              tenant_id: targetTenantId,
              parent_partner_id: inviterPartnerId,
              level: String(partnerLevel),
              active: true,
              pix_key_type: partner_data?.pix?.type || null,
              pix_key: partner_data?.pix?.key || null,
              metadata: partner_data || {},
            });
          }
        }

        // Send welcome email — SKIP for partners (the invite email was already sent by the auth-email-hook
        // via auth.admin.inviteUserByEmail, with the proper "set your password" link).
        if (usePartnerInvite) {
          // Audit and return early
          await adminClient.from("audit_logs").insert({
            user_id: callerUserId,
            tenant_id: tenantId,
            action: "user_invited",
            resource: "memberships",
            resource_id: userId,
            details: { email, role, full_name, partner_level: partnerLevel, inviter_partner_id: inviterPartnerId },
          });
          return jsonRes(201, { user_id: userId, email, role, invited: true, partner_level: partnerLevel });
        }

        // Send welcome email (non-partner)
        try {
          let tenantName = "All Vita";
          let tenantLogo = "https://fmkcxsyudgtimpbjwcjv.supabase.co/storage/v1/object/public/system-assets/allvita-logo.png";
          if (targetTenantId) {
            const { data: tenant } = await adminClient
              .from("tenants")
              .select("name, trade_name, logo_url")
              .eq("id", targetTenantId)
              .single();
            tenantName = tenant?.trade_name || tenant?.name || "All Vita";
            tenantLogo = tenant?.logo_url || tenantLogo;
          }

          let title = "Bem-vindo!";
          let welcomeContent = `
            <p>Você foi convidado para a plataforma <strong>${tenantName}</strong> como um <strong>Parceiro Nível 1</strong>.</p>
            <p>Estamos muito felizes em ter você conosco! Sua conta já foi criada e você agora faz parte de uma rede exclusiva de performance e bem-estar.</p>
            
            <div style="background:#f8f9fa;border-radius:12px;padding:25px;margin:24px 0;border:1px solid #e2e8f0">
              <h3 style="margin-top:0;color:${accentColor};font-size:18px">O que você pode fazer agora:</h3>
              <ul style="padding-left:20px;color:#475569;margin-bottom:0">
                <li style="margin-bottom:12px"><strong>Vínculo Médico-Paciente:</strong> Utilize nosso Quiz Pré-Consulta para vincular pacientes automaticamente e acompanhar suas jornadas.</li>
                <li style="margin-bottom:12px"><strong>Ganhe Vitacoins:</strong> Acumule pontos por cada venda realizada, quizzes preenchidos e novos parceiros indicados por você.</li>
                <li style="margin-bottom:12px"><strong>Rede de Parceiros:</strong> Como Nível 1, você pode convidar outros profissionais e construir sua própria rede, ganhando benefícios sobre o desempenho deles (Nível 2 em diante).</li>
                <li style="margin-bottom:0"><strong>Resgate de Prêmios:</strong> Troque suas Vitacoins por Pix direto na conta, produtos exclusivos, cursos e muito mais.</li>
              </ul>
            </div>

            <div style="background:#f0f7e6;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid ${accentColor}">
              <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px">Sua senha provisória:</p>
              <p style="margin:8px 0 0;font-size:24px;font-family:monospace;color:#1a1a2e;font-weight:bold">${tempPassword}</p>
            </div>
            <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Importante: Por segurança, você deverá trocar esta senha no seu primeiro acesso.</p>
          `;
          let subject = `Você foi convidado para ${tenantName}`;

          if (is_staff) {
            title = "Bem-vindo à Equipe All Vita!";
            subject = "Bem-vindo ao time All Vita - Sua conta está pronta";
            welcomeContent = `
              <p>Você acaba de ser integrado à plataforma oficial da <strong>All Vita</strong> como membro da equipe.</p>
              <p>Como parte do nosso time, você terá acesso às ferramentas essenciais para nossa operação:</p>
              <ul style="padding-left: 20px; color: #475569;">
                <li><strong>Gestão Estratégica:</strong> Controle de parceiros, clientes e fluxos operacionais.</li>
                <li><strong>Inteligência de Dados:</strong> Acesso a dashboards e relatórios de performance em tempo real.</li>
                <li><strong>Segurança e Auditoria:</strong> Ambiente protegido com monitoramento de ações e segurança avançada.</li>
              </ul>
              <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6B8E23">
                <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px">Sua senha de acesso temporária:</p>
                <p style="margin:8px 0 0;font-size:20px;font-family:monospace;color:#1a1a2e;font-weight:bold">${tempPassword}</p>
              </div>
              <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Segurança: Por política interna, altere sua senha imediatamente após o primeiro acesso.</p>
            `;
          }

          const html = renderEmail({
            title,
            userName: full_name.split(" ")[0],
            tenantName,
            tenantLogo,
            content: welcomeContent,
            ctaText: "Acessar Plataforma",
            ctaUrl: "https://app.allvita.com.br/auth/login"
          });

          await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
              to: email,
              subject,
              html,
            }),
          });
        } catch (e) {
          console.warn("Email send failed (non-blocking):", e);
        }

        // Audit
        await adminClient.from("audit_logs").insert({
          user_id: callerUserId,
          tenant_id: tenantId,
          action: "user_created",
          resource: "memberships",
          resource_id: userId,
          details: { email, role, full_name },
        });

        return jsonRes(201, { user_id: userId, email, role });
      }

      case "update": {
        const body = await req.json();
        const { user_id, role, active } = body;

        if (!user_id) return jsonRes(400, { error: "user_id required" });

        const updates: any = {};
        if (role !== undefined) updates.role = role;
        if (active !== undefined) updates.active = active;

        const { error } = await adminClient
          .from("memberships")
          .update(updates)
          .eq("user_id", user_id)
          .eq("tenant_id", tenantId);

        if (error) return jsonRes(400, { error: error.message });

        return jsonRes(200, { success: true });
      }

      case "deactivate": {
        const body = await req.json();
        const { user_id } = body;

        if (!user_id) return jsonRes(400, { error: "user_id required" });

        await adminClient
          .from("memberships")
          .update({ active: false })
          .eq("user_id", user_id)
          .eq("tenant_id", tenantId);

        await adminClient
          .from("tenant_staff")
          .update({ is_active: false })
          .eq("user_id", user_id)
          .eq("tenant_id", tenantId);

        return jsonRes(200, { success: true });
      }

      case "delete": {
        const body = await req.json();
        const { userId } = body;

        console.log(`[ManageUsers] Attempting to delete user: ${userId}`);

        if (!userId) return jsonRes(400, { error: "ID do usuário não fornecido para exclusão." });


        // Prevent self-deletion
        if (userId === callerUserId) {
          return jsonRes(400, { error: "Você não pode excluir sua própria conta." });
        }

        // Verify the user exists in auth
        const { data: targetUser, error: fetchError } = await adminClient.auth.admin.getUserById(userId);
        if (fetchError || !targetUser?.user) {
          return jsonRes(404, { error: "Usuário não encontrado no sistema de autenticação." });
        }

        // Audit log BEFORE deletion (so we keep the record)
        await adminClient.from("audit_logs").insert({
          user_id: callerUserId,
          actor_type: "super_admin",
          action: "user_deleted",
          entity_type: "user",
          entity_id: userId,
          details: {
            target_email: targetUser.user.email,
            deleted_at: new Date().toISOString(),
          },
        });

        // Clean up related records (best effort - some may not exist)
        await adminClient.from("memberships").delete().eq("user_id", userId);
        await adminClient.from("all_vita_staff").delete().eq("user_id", userId);
        await adminClient.from("partners").delete().eq("user_id", userId);
        await adminClient.from("clients").delete().eq("user_id", userId);
        await adminClient.from("profiles").delete().eq("id", userId);

        // Finally, delete from auth.users
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
        if (deleteError) {
          console.error("Auth deletion error:", deleteError);
          return jsonRes(500, { 
            error: `Falha ao excluir usuário do sistema de autenticação: ${deleteError.message}` 
          });
        }

        return jsonRes(200, { success: true, message: "Usuário excluído com sucesso." });
      }

      case "reset-password": {
        const body = await req.json();
        const { userId } = body;

        if (!userId) return jsonRes(400, { error: "ID do usuário é obrigatório" });

        // Generate new temp password
        const tempPassword = generateTempPassword();

        // Update auth user
        const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
          password: tempPassword,
          email_confirm: true,
        });

        if (updateError) return jsonRes(400, { error: updateError.message });

        // Update profile
        await adminClient.from("profiles").update({ must_change_password: true }).eq("id", userId);

        // Fetch user email and primary tenant for branding
        const { data: profile } = await adminClient.from("profiles").select("email, first_name, last_name").eq("id", userId).single();
        const { data: membership } = await adminClient.from("memberships").select("tenant_id").eq("user_id", userId).eq("active", true).limit(1).maybeSingle();

        let tenantName = "All Vita";
        let tenantLogo = "https://fmkcxsyudgtimpbjwcjv.supabase.co/storage/v1/object/public/system-assets/allvita-logo.png";
        if (membership?.tenant_id) {
          const { data: tenant } = await adminClient.from("tenants").select("name, trade_name, logo_url").eq("id", membership.tenant_id).single();
          tenantName = tenant?.trade_name || tenant?.name || "All Vita";
          tenantLogo = tenant?.logo_url || tenantLogo;
        }

        const html = renderEmail({
          title: "Sua senha foi resetada",
          userName: profile.first_name || 'Usuário',
          tenantName,
          tenantLogo,
          content: `
            <p>Um administrador resetou sua senha na plataforma <strong>${tenantName}</strong>.</p>
            <p>Utilize os dados abaixo para o seu próximo acesso:</p>
            <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6B8E23">
              <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px">Sua nova senha provisória:</p>
              <p style="margin:8px 0 0;font-size:20px;font-family:monospace;color:#1a1a2e;font-weight:bold">${tempPassword}</p>
            </div>
            <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Importante: Você deverá trocar esta senha no seu próximo acesso para garantir a segurança da sua conta.</p>
          `,
          ctaText: "Ir para o Login",
          ctaUrl: "https://app.allvita.com.br/auth/login"
        });

        // Send email
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            to: profile.email,
            subject: `Sua senha foi resetada - ${tenantName}`,
            html,
          }),
        });

        return jsonRes(200, { success: true, message: "Nova senha enviada por e-mail." });
      }

      case "resend-invite": {
        const body = await req.json();
        const { userId } = body;

        if (!userId) return jsonRes(400, { error: "ID do usuário é obrigatório" });

        // Fetch profile and memberships
        const { data: profile } = await adminClient.from("profiles").select("email, first_name, last_name").eq("id", userId).single();
        const { data: membership } = await adminClient.from("memberships").select("tenant_id, role").eq("user_id", userId).eq("active", true).limit(1).maybeSingle();

        if (!profile) return jsonRes(404, { error: "Usuário não encontrado." });

        // Generate new temp password
        const tempPassword = generateTempPassword();

        // Update auth user
        await adminClient.auth.admin.updateUserById(userId, { 
          password: tempPassword,
          email_confirm: true 
        });

        let tenantName = "All Vita";
        let tenantLogo = "https://fmkcxsyudgtimpbjwcjv.supabase.co/storage/v1/object/public/system-assets/allvita-logo.png";
        if (membership?.tenant_id) {
          const { data: tenant } = await adminClient.from("tenants").select("name, trade_name, logo_url").eq("id", membership.tenant_id).single();
          tenantName = tenant?.trade_name || tenant?.name || "All Vita";
          tenantLogo = tenant?.logo_url || tenantLogo;
        }

        const isStaff = !membership?.tenant_id;
        let title = "Seu convite chegou!";
        let subject = `Convite para ${tenantName} (Reenvio)`;
        let welcomeContent = `
          <p>Estamos reenviando seu convite para a plataforma <strong>${tenantName}</strong>.</p>
          <p>Estamos ansiosos para ter você conosco! Sua conta está pronta para ser acessada.</p>
          <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6B8E23">
            <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px">Sua senha provisória:</p>
            <p style="margin:8px 0 0;font-size:20px;font-family:monospace;color:#1a1a2e;font-weight:bold">${tempPassword}</p>
          </div>
          <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Lembre-se: Troque sua senha no primeiro acesso para garantir a segurança da sua conta.</p>
        `;

        if (isStaff) {
          title = "Bem-vindo à Equipe All Vita!";
          subject = "Acesso à Plataforma All Vita (Reenvio)";
          welcomeContent = `
            <p>Estamos reenviando seus dados de acesso à plataforma oficial da <strong>All Vita</strong>.</p>
            <p>Como membro da equipe, você possui acesso às ferramentas de gestão, inteligência de dados e segurança avançada da nossa operação.</p>
            <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6B8E23">
              <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px">Sua senha de acesso temporária:</p>
              <p style="margin:8px 0 0;font-size:20px;font-family:monospace;color:#1a1a2e;font-weight:bold">${tempPassword}</p>
            </div>
            <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Segurança: Por política interna, altere sua senha imediatamente após o primeiro acesso.</p>
          `;
        }

        const html = renderEmail({
          title,
          userName: profile.first_name || 'Usuário',
          tenantName,
          tenantLogo,
          content: welcomeContent,
          ctaText: "Acessar Plataforma",
          ctaUrl: "https://app.allvita.com.br/auth/login"
        });

        // Send welcome email
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            to: profile.email,
            subject,
            html,
          }),
        });

        return jsonRes(200, { success: true, message: "Convite reenviado com sucesso." });
      }

      case "invite_user": {
        const body = await req.json();
        const { email, first_name, last_name, tenant_id } = body;
        if (!email) return jsonRes(400, { error: "E-mail é obrigatório" });
        
        console.log(`[InviteAction] Processing ${email} for tenant ${tenant_id}`);
        
        // Use inviteUserByEmail first
        const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
          data: {
            first_name: first_name || "",
            last_name: last_name || "",
            full_name: `${first_name || ""} ${last_name || ""}`.trim(),
            role: "partner",
            partner_level: 1,
            tenant_id: tenant_id,
            tenant_slug: "lumyss"
          },
          redirectTo: `https://lumyss.allvita.com.br/auth/reset-password`
        });

        if (inviteError) {
          if (inviteError.message.includes("already")) {
            console.log(`[InviteAction] User exists, using generateLink for ${email}`);
            // For existing users, we use generateLink which also triggers the hook
            const { error: genError } = await adminClient.auth.admin.generateLink({
              type: 'invite',
              email: email,
              options: {
                data: {
                  first_name: first_name || "",
                  last_name: last_name || "",
                  full_name: `${first_name || ""} ${last_name || ""}`.trim(),
                  role: "partner",
                  partner_level: 1,
                  tenant_id: tenant_id,
                  tenant_slug: "lumyss"
                },
                redirectTo: `https://lumyss.allvita.com.br/auth/reset-password`
              }
            });
            
            if (genError) return jsonRes(400, { error: genError.message });
            return jsonRes(200, { success: true, message: "Convite reenviado com sucesso (via link)." });
          }
          return jsonRes(400, { error: inviteError.message });
        }

        return jsonRes(200, { success: true, user: invited.user });
      }


      case "delete-tenant": {
        const body = await req.json();
        const { tenantId: targetTenantId } = body;

        console.log(`[ManageUsers] Attempting to delete tenant: ${targetTenantId}`);


        if (!isAdmin) {
          return jsonRes(403, { error: "Apenas Administradores da All Vita podem excluir empresas." });
        }

        if (!targetTenantId) return jsonRes(400, { error: "tenantId é obrigatório" });

        // 1. Clean up related data for this tenant
        // This is a cascade simulation if not defined in DB
        await adminClient.from("memberships").delete().eq("tenant_id", targetTenantId);
        await adminClient.from("tenant_staff").delete().eq("tenant_id", targetTenantId);
        await adminClient.from("clients").delete().eq("tenant_id", targetTenantId);
        await adminClient.from("partners").delete().eq("tenant_id", targetTenantId);
        await adminClient.from("orders").delete().eq("tenant_id", targetTenantId);
        await adminClient.from("subscriptions").delete().eq("tenant_id", targetTenantId);
        
        // Audit log
        await adminClient.from("audit_logs").insert({
          user_id: callerUserId,
          actor_type: staffData?.role || "staff",
          action: "tenant_deleted",
          entity_type: "tenant",
          entity_id: targetTenantId,
          details: {
            deleted_at: new Date().toISOString(),
          },
        });

        // 2. Delete the tenant itself
        const { error: tenantDeleteError } = await adminClient
          .from("tenants")
          .delete()
          .eq("id", targetTenantId);

        if (tenantDeleteError) {
          return jsonRes(500, { error: `Falha ao excluir empresa: ${tenantDeleteError.message}` });
        }

        return jsonRes(200, { success: true, message: "Empresa excluída com sucesso." });
      }

      default:
        return jsonRes(404, { error: `Ação desconhecida: ${action}` });
    }
  } catch (error: any) {
    console.error(`[ManageUsers] Error in action "${action}":`, error);
    return jsonRes(500, { 
      error: `Erro ao processar a operação "${action}": ${error.message || "Erro desconhecido"}` 
    });
  }

});

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let pw = "";
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  for (const b of arr) pw += chars[b % chars.length];
  return pw;
}

function renderEmail(options: {
  title: string,
  userName: string,
  tenantName: string,
  tenantLogo?: string | null,
  content: string,
  ctaText?: string,
  ctaUrl?: string,
  footer?: string
}) {
  const primaryColor = "#1a1a2e";
  const accentColor = "#6B8E23";
  const logoUrl = options.tenantLogo || "https://fmkcxsyudgtimpbjwcjv.supabase.co/storage/v1/object/public/system-assets/allvita-logo.png";
  const isAllVita = options.tenantName === "All Vita";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${options.title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 50px 40px 40px 40px; border-bottom: 1px solid #f0f4f8;">
                  <img src="${logoUrl}" alt="${options.tenantName}" style="max-height: 55px; width: auto; display: block; margin-bottom: 25px;">
                  <h1 style="margin: 0; color: ${primaryColor}; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">${options.title}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 45px 45px 35px 45px; color: #334155; font-size: 16px; line-height: 1.7;">
                  <p style="margin: 0 0 24px 0;">Olá, <strong style="color: ${primaryColor};">${options.userName}</strong>!</p>
                  
                  <div style="margin-bottom: 30px;">
                    ${options.content}
                    
                    ${isAllVita ? `
                      <p style="margin-top: 24px;">A <strong>All Vita</strong> é dedicada a proporcionar a melhor experiência em gestão de performance e bem-estar, ajudando você e sua equipe a alcançarem novos patamares de excelência.</p>
                    ` : `
                      <p style="margin-top: 24px;">Estamos comprometidos em oferecer uma experiência excepcional através da plataforma <strong>${options.tenantName}</strong>, impulsionada pela tecnologia All Vita.</p>
                    `}
                  </div>

                  ${options.ctaUrl ? `
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 45px 0 25px 0;">
                      <tr>
                        <td align="center">
                          <a href="${options.ctaUrl}" style="background-color: ${accentColor}; color: #ffffff; padding: 16px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 8px 15px rgba(107, 142, 35, 0.25);">
                            ${options.ctaText || 'Acessar Plataforma'}
                          </a>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                  
                  <p style="margin: 40px 0 0 0; font-size: 14px; color: #64748b; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 30px;">
                    Dúvidas? Nossa equipe está pronta para ajudar. Basta responder a este e-mail ou escrever para <a href="mailto:contato@allvita.com.br" style="color: ${accentColor}; text-decoration: none;">contato@allvita.com.br</a>.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 35px 45px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 13px;">
                  <p style="margin: 0 0 12px 0; color: #64748b; font-weight: 700; font-size: 14px;">${options.tenantName}</p>
                  ${options.footer || `<p style="margin: 0;">Tecnologia <strong style="color: #64748b;">All Vita</strong> — Plataforma de Performance e Bem-Estar</p>`}
                  <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #cbd5e1;">
                    Este é um comunicado oficial enviado automaticamente pelo sistema.
                  </div>
                </td>
              </tr>
            </table>
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin-top: 25px;">
              <tr>
                <td align="center" style="color: #94a3b8; font-size: 12px;">
                  <p style="margin: 0;">© ${new Date().getFullYear()} All Vita. Todos os direitos reservados.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function jsonRes(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id",
      "Content-Type": "application/json",
    },
  });
}
