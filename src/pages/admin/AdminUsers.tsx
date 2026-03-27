import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Users, Search, Filter, ChevronLeft, ChevronRight,
  Mail, Phone, Shield, Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Gerente",
  partner: "Parceiro",
  client: "Cliente",
};

const roleBadgeColor: Record<string, string> = {
  super_admin: "bg-destructive/10 text-destructive",
  admin: "bg-accent/10 text-accent",
  manager: "bg-primary/10 text-primary",
  partner: "bg-warning/10 text-warning",
  client: "bg-secondary text-muted-foreground",
};

const AdminUsers: React.FC = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ["admin-users-list", page, search],
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

  const { data: memberships } = useQuery({
    queryKey: ["admin-all-memberships"],
    queryFn: async () => {
      const { data } = await supabase.from("memberships").select("user_id, role, tenant_id, active");
      return data || [];
    },
  });

  const { data: tenants } = useQuery({
    queryKey: ["admin-tenants-map"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name, trade_name");
      const map: Record<string, string> = {};
      data?.forEach((t) => { map[t.id] = t.trade_name || t.name; });
      return map;
    },
  });

  const profiles = profilesData?.profiles || [];
  const total = profilesData?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getUserRoles = (userId: string) => {
    return memberships?.filter((m) => m.user_id === userId && m.active) || [];
  };

  const filteredProfiles = roleFilter === "all"
    ? profiles
    : profiles.filter((p) => getUserRoles(p.id).some((m) => m.role === roleFilter));

  return (
    <div className="space-y-6 pb-12">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" /> Usuários
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Todos os usuários da plataforma All Vita
            </p>
          </div>
          <Badge variant="outline" className="text-xs">{total} usuários</Badge>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os papéis</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="partner">Parceiro</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="p-3 text-left font-medium text-muted-foreground">Usuário</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Papéis</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Empresas</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => {
                  const roles = getUserRoles(profile.id);
                  return (
                    <tr key={profile.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold">
                            {(profile.first_name?.[0] || profile.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{profile.email}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {roles.length > 0 ? roles.map((r, i) => (
                            <Badge key={i} variant="outline" className={cn("text-[9px]", roleBadgeColor[r.role] || "")}>
                              {roleLabels[r.role] || r.role}
                            </Badge>
                          )) : (
                            <span className="text-[10px] text-muted-foreground">Sem vínculo</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {roles.filter((r) => r.tenant_id).map((r, i) => (
                            <Badge key={i} variant="secondary" className="text-[9px]">
                              {tenants?.[r.tenant_id!] || r.tenant_id?.slice(0, 8)}
                            </Badge>
                          ))}
                          {roles.some((r) => !r.tenant_id) && (
                            <Badge variant="outline" className="text-[9px] bg-accent/5 text-accent">Global</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={profile.is_active ? "default" : "secondary"} className="text-[10px]">
                          {profile.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
                {filteredProfiles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {isLoading ? "Carregando..." : "Nenhum usuário encontrado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
