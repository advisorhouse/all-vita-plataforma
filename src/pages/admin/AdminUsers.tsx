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

  // Fetch audit logs for selected user
  const { data: auditLogs } = useQuery({
    queryKey: ["admin-user-audit", selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("id, action, created_at, ip")
        .eq("user_id", selectedUser!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
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
        tenant_name: m.tenant_id ? (tenantMap[m.tenant_id] || m.tenant_id.slice(0, 8)) : "Global",
      }));

      let userType = "unknown";
      if (isStaff || roles.some((r) => r.role === "super_admin")) userType = "staff";
      else if (roles.some((r) => r.role === "admin" || r.role === "manager")) userType = "tenant";
      else if (roles.some((r) => r.role === "partner")) userType = "partner";
      else if (roles.some((r) => r.role === "client")) userType = "client";

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
      };
    });
  }, [profilesData, memberships, staffList, tenantMap]);

  // Apply client-side filters
  const filteredUsers = useMemo(() => {
    let list = users;
    if (typeFilter !== "all") list = list.filter((u) => u.userType === typeFilter);
    if (roleFilter !== "all") list = list.filter((u) => u.roles.some((r) => r.role === roleFilter));
    if (statusFilter !== "all") {
      list = list.filter((u) => statusFilter === "active" ? u.is_active : !u.is_active);
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

  // Reset password (placeholder — needs edge function)
  const handleResetPassword = (userId: string) => {
    toast.info("Funcionalidade de reset de senha via e-mail será implementada em breve.");
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
        onResetPassword={handleResetPassword}
        isLoading={isLoading}
      />

      <UserDrawer
        user={selectedUser}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBlockUser={(id) => blockMutation.mutate(id)}
        onResetPassword={handleResetPassword}
        auditLogs={auditLogs || []}
      />
    </div>
  );
};

export default AdminUsers;
