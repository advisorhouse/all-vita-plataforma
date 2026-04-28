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

  const callerUserId = userData.user.id;
  const tenantId = req.headers.get("X-Tenant-Id");
  const adminClient = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const action = pathParts[pathParts.length - 1] || "";

  console.log(`[ManageUsers] Action: ${action}, Caller: ${callerUserId}, Tenant: ${tenantId}`);



  // Check if caller is super admin (global)
  const { data: superAdminCheck } = await adminClient
    .from("memberships")
    .select("role")
    .eq("user_id", callerUserId)
    .eq("role", "super_admin")
    .eq("active", true)
    .is("tenant_id", null)
    .maybeSingle();

  const isSuperAdmin = !!superAdminCheck;

  // For 'delete' action: only super admin can perform it (global operation, no tenant required)
  if (action === "delete") {
    if (!isSuperAdmin) {
      return jsonRes(403, { error: "Apenas Super Administradores podem excluir usuários permanentemente." });
    }
  } else if (action === "auth-status") {
    if (!isSuperAdmin) {
      return jsonRes(403, { error: "Apenas Super Administradores podem consultar status de autenticação." });
    }
  } else {
    // All other actions usually require X-Tenant-Id, EXCEPT global staff creation by super_admin
    // OR global operations like reset-password/resend-invite/delete which are handled by super_admin
    if (!tenantId && !(isSuperAdmin && ["create", "reset-password", "resend-invite", "delete"].includes(action))) {
      return jsonRes(400, { error: "X-Tenant-Id header required" });
    }

    // Check caller is admin or super_admin for this tenant (or global super admin)
    if (!isSuperAdmin) {
      if (!tenantId) return jsonRes(400, { error: "X-Tenant-Id header required" });

      const { data: callerMembership } = await adminClient
        .from("memberships")
        .select("role")
        .eq("user_id", callerUserId)
        .eq("active", true)
        .eq("tenant_id", tenantId)
        .limit(1);

      const isAdmin = callerMembership?.some((m: any) => m.role === "admin");
      if (!isAdmin) {
        return jsonRes(403, { error: "Only admins can manage users" });
      }
    }
  }




  try {
    if (action === "preview-email") {
      const body = await req.json();
      const { email, full_name, role, is_staff, tenant_id: targetId, type } = body;
      
      let tenantName = "All Vita";
      let tenantLogo = "https://allvita.com.br/logo.png"; // Placeholder/Default
      
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
        const { email, full_name, phone, role, is_staff } = body;

        if (!email || !full_name || !role) {
          return jsonRes(400, { error: "email, full_name and role are required" });
        }

        const validRoles = ["super_admin", "admin", "manager", "partner", "client"];
        if (!validRoles.includes(role)) {
          return jsonRes(400, { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
        }

        // Generate temp password
        const tempPassword = generateTempPassword();

        // Create user via Supabase Auth
        let userId: string;
        const { data: authUser, error: signupError } = await adminClient.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: false, // Do NOT auto-confirm email, so user shows as 'pending' until they login
          user_metadata: {
            first_name: full_name.split(" ")[0],
            last_name: full_name.split(" ").slice(1).join(" "),
          },
        });

        if (signupError) {
          if (signupError.message?.includes("already been registered")) {
            // Find existing user
            const { data: existingUsers } = await adminClient.auth.admin.listUsers();
            const existing = existingUsers?.users?.find((u: any) => u.email === email);
            if (!existing) return jsonRes(400, { error: "User exists but could not be found" });
            userId = existing.id;
          } else {
            return jsonRes(400, { error: signupError.message });
          }
        } else {
          userId = authUser.user.id;
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

        // Send welcome email
        try {
          let tenantName = "a plataforma";
          if (targetTenantId) {
            const { data: tenant } = await adminClient
              .from("tenants")
              .select("name, trade_name")
              .eq("id", targetTenantId)
              .single();
            tenantName = tenant?.trade_name || tenant?.name || "a plataforma";
          }

          await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
              to: email,
              subject: `Você foi convidado para ${tenantName}`,
              html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
                  <h1 style="color:#1a1a2e;font-size:24px">Bem-vindo!</h1>
                  <p>Olá <strong>${full_name}</strong>,</p>
                  <p>Você foi convidado para a plataforma <strong>${tenantName}</strong>.</p>
                  <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin:24px 0">
                    <p style="margin:4px 0"><strong>Senha provisória:</strong> ${tempPassword}</p>
                  </div>
                  <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Troque sua senha no primeiro acesso.</p>
                  <p style="color:#999;font-size:12px;margin-top:32px">All Vita</p>
                </div>
              `,
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
        });

        if (updateError) return jsonRes(400, { error: updateError.message });

        // Update profile
        await adminClient.from("profiles").update({ must_change_password: true }).eq("id", userId);

        // Fetch user email and primary tenant for branding
        const { data: profile } = await adminClient.from("profiles").select("email, first_name, last_name").eq("id", userId).single();
        const { data: membership } = await adminClient.from("memberships").select("tenant_id").eq("user_id", userId).eq("active", true).limit(1).maybeSingle();

        let tenantName = "All Vita";
        if (membership?.tenant_id) {
          const { data: tenant } = await adminClient.from("tenants").select("name, trade_name").eq("id", membership.tenant_id).single();
          tenantName = tenant?.trade_name || tenant?.name || "All Vita";
        }

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
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
                <h1 style="color:#1a1a2e;font-size:24px">Sua senha foi resetada</h1>
                <p>Olá <strong>${profile.first_name || 'Usuário'}</strong>,</p>
                <p>Um administrador resetou sua senha na plataforma <strong>${tenantName}</strong>.</p>
                <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin:24px 0">
                  <p style="margin:4px 0"><strong>Nova senha provisória:</strong> ${tempPassword}</p>
                </div>
                <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Você deverá trocar esta senha no seu próximo acesso.</p>
                <p style="color:#999;font-size:12px;margin-top:32px">All Vita</p>
              </div>
            `,
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
        await adminClient.auth.admin.updateUserById(userId, { password: tempPassword });

        let tenantName = "All Vita";
        if (membership?.tenant_id) {
          const { data: tenant } = await adminClient.from("tenants").select("name, trade_name").eq("id", membership.tenant_id).single();
          tenantName = tenant?.trade_name || tenant?.name || "All Vita";
        }

        // Send welcome email
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            to: profile.email,
            subject: `Convite para ${tenantName} (Reenvio)`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
                <h1 style="color:#1a1a2e;font-size:24px">Bem-vindo novamente!</h1>
                <p>Olá <strong>${profile.first_name || 'Usuário'}</strong>,</p>
                <p>Estamos reenviando seu convite para a plataforma <strong>${tenantName}</strong>.</p>
                <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin:24px 0">
                  <p style="margin:4px 0"><strong>Senha provisória:</strong> ${tempPassword}</p>
                </div>
                <p style="color:#e74c3c;font-size:14px;font-weight:bold">⚠️ Lembre-se de trocar sua senha no primeiro acesso.</p>
                <p style="color:#999;font-size:12px;margin-top:32px">All Vita</p>
              </div>
            `,
          }),
        });

        return jsonRes(200, { success: true, message: "Convite reenviado com sucesso." });
      }

      case "delete-tenant": {
        const body = await req.json();
        const { tenantId: targetTenantId } = body;

        console.log(`[ManageUsers] Attempting to delete tenant: ${targetTenantId}`);


        if (!isSuperAdmin) {
          return jsonRes(403, { error: "Apenas Super Administradores podem excluir empresas." });
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
          actor_type: "super_admin",
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
