import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { toast } from "sonner";
import UserKpiCards from "@/components/admin/users/UserKpiCards";
import UserFilters from "@/components/admin/users/UserFilters";
import UserTable, { type UserRow } from "@/components/admin/users/UserTable";
import UserDrawer from "@/components/admin/users/UserDrawer";
import CreateUserDialog from "@/components/admin/users/CreateUserDialog";

const PAGE_SIZE = 20;

const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch profiles
  const { data: profilesData, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) {
        query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }
      const { data, count } = await query;
      return { profiles: data || [], total: count || 0 };
    },
  });

  // Fetch all memberships
  const { data: memberships } = useQuery({
    queryKey: ["admin-all-memberships"],
    queryFn: async () => {
      const { data } = await supabase.from("memberships").select("user_id, role, tenant_id, active");
      return data || [];
    },
  });

  // Fetch all vita staff
  const { data: staffList } = useQuery({
    queryKey: ["admin-all-vita-staff"],
    queryFn: async () => {
      const { data } = await supabase.from("all_vita_staff").select("user_id, role, is_active");
      return data || [];
    },
  });

  // Fetch tenants
  const { data: tenantsRaw } = useQuery({
    queryKey: ["admin-tenants-list"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name, trade_name");
      return data || [];
    },
  });

  const tenantMap = useMemo(() => {
    const map: Record<string, string> = {};
    tenantsRaw?.forEach((t) => { map[t.id] = t.trade_name || t.name; });
    return map;
  }, [tenantsRaw]);

  const tenantsList = useMemo(() =>
    (tenantsRaw || []).map((t) => ({ id: t.id, name: t.trade_name || t.name })),
    [tenantsRaw]
  );

  // Fetch auth status (email_confirmed_at, last_sign_in_at) for current page profiles
  const profileIds = useMemo(
    () => (profilesData?.profiles || []).map((p: any) => p.id),
    [profilesData]
  );

  const { data: authStatusList } = useQuery({
    queryKey: ["admin-users-auth-status", profileIds],
    enabled: profileIds.length > 0,
    queryFn: async () => {
      const res = await supabase.functions.invoke("manage-users/auth-status", {
        body: { userIds: profileIds },
      });
      if (res.error) {
        console.warn("[AdminUsers] auth-status error:", res.error.message);
        return [];
      }
      return res.data?.data || [];
    },
  });

  const authStatusMap = useMemo(() => {
    const map: Record<string, { email_confirmed_at: string | null; last_sign_in_at: string | null; confirmation_sent_at: string | null; invited_at: string | null }> = {};
    (authStatusList || []).forEach((a: any) => { map[a.id] = a; });
    return map;
  }, [authStatusList]);

  // Fetch audit logs for selected user
  const { data: auditLogs } = useQuery({
    queryKey: ["admin-user-audit", selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("id, action, created_at, ip, entity_type, details")
        .eq("user_id", selectedUser!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      
      const { data: security } = await supabase
        .from("security_events")
        .select("id, type, created_at, ip, severity")
        .eq("user_id", selectedUser!.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Merge and sort by date
      const merged = [
        ...(logs || []).map(l => ({ ...l, type: 'audit' })),
        ...(security || []).map(s => ({ ...s, action: s.type, type: 'security' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return merged.slice(0, 30);
    },
  });

  // Build enriched user rows
  const users: UserRow[] = useMemo(() => {
    const profiles = profilesData?.profiles || [];
    return profiles.map((p) => {
      const userMemberships = (memberships || []).filter((m) => m.user_id === p.id && m.active);
      const isStaff = (staffList || []).some((s) => s.user_id === p.id && s.is_active);

      const roles = userMemberships.map((m) => ({
        role: m.role,
        tenant_id: m.tenant_id,
        tenant_name: m.tenant_id 
          ? (tenantMap[m.tenant_id] || m.tenant_id.slice(0, 8)) 
          : "All Vita",
      }));

      let userType = "unknown";
      if (isStaff || roles.some((r) => r.role === "super_admin")) userType = "staff";
      else if (roles.some((r) => r.role === "admin" || r.role === "manager")) userType = "tenant";
      else if (roles.some((r) => r.role === "partner")) userType = "partner";
      else if (roles.some((r) => r.role === "client")) userType = "client";

      const auth = authStatusMap[p.id];

      return {
        id: p.id,
        email: p.email,
        first_name: p.first_name,
        last_name: p.last_name,
        avatar_url: p.avatar_url,
        is_active: p.is_active,
        created_at: p.created_at,
        phone: p.phone,
        roles,
        userType,
        has2FA: false, // TODO: check MFA factors
        emailConfirmedAt: auth?.email_confirmed_at,
        lastSignInAt: auth?.last_sign_in_at,
        confirmationSentAt: auth?.confirmation_sent_at,
      };
    });
  }, [profilesData, memberships, staffList, tenantMap, authStatusMap]);

  // Apply client-side filters
  const filteredUsers = useMemo(() => {
    let list = users;
    if (typeFilter !== "all") list = list.filter((u) => u.userType === typeFilter);
    if (roleFilter !== "all") list = list.filter((u) => u.roles.some((r) => r.role === roleFilter));
    if (statusFilter !== "all") {
      list = list.filter((u) => statusFilter === "active" ? u.is_active : !u.is_active);
    }
    if (classificationFilter !== "all") {
      list = list.filter((u) => {
        const isGlobal = u.userType === 'staff';
        return classificationFilter === 'global' ? isGlobal : !isGlobal;
      });
    }
    if (tenantFilter !== "all") {
      list = list.filter((u) => u.roles.some((r) => r.tenant_id === tenantFilter));
    }
    return list;
  }, [users, typeFilter, roleFilter, statusFilter, tenantFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      total: profilesData?.total || 0,
      active: users.filter((u) => u.is_active).length,
      newThisMonth: users.filter((u) => new Date(u.created_at) > thirtyDaysAgo).length,
      byType: {
        staff: users.filter((u) => u.userType === "staff").length,
        tenant: users.filter((u) => u.userType === "tenant").length,
        partner: users.filter((u) => u.userType === "partner").length,
        client: users.filter((u) => u.userType === "client").length,
      },
    };
  }, [users, profilesData]);

  const totalPages = Math.ceil((profilesData?.total || 0) / PAGE_SIZE);

  // Block/unblock user
  const blockMutation = useMutation({
    mutationFn: async (userId: string) => {
      const user = users.find((u) => u.id === userId);
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !user?.is_active })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status do usuário atualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDrawerOpen(false);
    },
    onError: (e: any) => toast.error("Erro", { description: e.message }),
  });

  // Delete user
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("manage-users/delete", {
        body: { userId }
      });
      
      // Network/invocation error
      if (error) {
        // Try to extract response body for more details
        const ctx: any = (error as any).context;
        if (ctx?.body) {
          try {
            const parsed = typeof ctx.body === 'string' ? JSON.parse(ctx.body) : ctx.body;
            if (parsed?.error) throw new Error(parsed.error);
          } catch (parseErr) {
            // fall through
          }
        }
        throw new Error(error.message || "Erro ao chamar a função de exclusão.");
      }
      
      // Function returned an error in the body
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success("Usuário excluído com sucesso", {
        description: data?.message || "O usuário foi removido permanentemente da plataforma.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-memberships"] });
      setDrawerOpen(false);
    },
    onError: (e: Error) => {
      const message = e.message || "Erro desconhecido";
      let title = "Falha ao excluir usuário";
      let description = message;

      // Map common errors to friendlier messages
      if (message.includes("não pode excluir sua própria")) {
        title = "Operação bloqueada";
      } else if (message.includes("Super Administradores")) {
        title = "Permissão negada";
        description = "Apenas Super Administradores podem excluir usuários permanentemente.";
      } else if (message.toLowerCase().includes("não encontrado")) {
        title = "Usuário não encontrado";
        description = "Este usuário pode já ter sido excluído. Atualize a página.";
      } else if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
        title = "Erro de conexão";
        description = "Não foi possível conectar ao servidor. Verifique sua conexão.";
      }

      toast.error(title, { description, duration: 6000 });
    },
  });

  // Reset password
  const handleResetPassword = async (userId: string) => {
    const promise = supabase.functions.invoke("manage-users/reset-password", {
      body: { userId }
    });

    toast.promise(promise, {
      loading: "Gerando nova senha e enviando e-mail...",
      success: (res) => {
        if (res.error) throw new Error(res.error.message);
        if (res.data?.error) throw new Error(res.data.error);
        return "Senha resetada e e-mail enviado!";
      },
      error: (e: any) => `Erro: ${e.message}`,
    });
  };

  // Resend invitation
  const handleResendInvite = async (userId: string) => {
    const promise = supabase.functions.invoke("manage-users/resend-invite", {
      body: { userId }
    });

    toast.promise(promise, {
      loading: "Reenviando convite...",
      success: (res) => {
        if (res.error) throw new Error(res.error.message);
        if (res.data?.error) throw new Error(res.data.error);
        return "Convite reenviado com sucesso!";
      },
      error: (e: any) => `Erro: ${e.message}`,
    });
  };

  const handleViewUser = (user: UserRow) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Usuários
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gestão de acessos e permissões da plataforma
            </p>
          </div>
          <CreateUserDialog tenants={tenantsList} onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })} />
        </div>
      </motion.div>

      <UserKpiCards {...kpis} />

      <UserFilters
        search={search} onSearchChange={(v) => { setSearch(v); setPage(0); }}
        typeFilter={typeFilter} onTypeChange={(v) => { setTypeFilter(v); setPage(0); }}
        classificationFilter={classificationFilter} onClassificationChange={(v) => { setClassificationFilter(v); setPage(0); }}
        roleFilter={roleFilter} onRoleChange={(v) => { setRoleFilter(v); setPage(0); }}
        statusFilter={statusFilter} onStatusChange={(v) => { setStatusFilter(v); setPage(0); }}
        tenantFilter={tenantFilter} onTenantChange={(v) => { setTenantFilter(v); setPage(0); }}
        tenants={tenantsList}
      />

      <UserTable
        users={filteredUsers}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onViewUser={handleViewUser}
        onBlockUser={(id) => blockMutation.mutate(id)}
        onDeleteUser={(id) => deleteMutation.mutate(id)}
        onResetPassword={handleResetPassword}
        onResendInvite={handleResendInvite}
        isLoading={isLoading}
        deletingUserId={deleteMutation.isPending ? (deleteMutation.variables as string) : null}
        blockingUserId={blockMutation.isPending ? (blockMutation.variables as string) : null}
      />

      <UserDrawer
        user={selectedUser}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBlockUser={(id) => blockMutation.mutate(id)}
        onDeleteUser={(id) => deleteMutation.mutate(id)}
        onResetPassword={handleResetPassword}
        onResendInvite={handleResendInvite}
        auditLogs={auditLogs || []}
        isDeleting={deleteMutation.isPending}
        isBlocking={blockMutation.isPending}
      />
    </div>
  );
};

export default AdminUsers;
