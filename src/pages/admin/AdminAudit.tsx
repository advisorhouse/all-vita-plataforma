import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  FileText, Search, Filter, Calendar, User, Activity,
  ChevronLeft, ChevronRight, Download,
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

const AdminAudit: React.FC = () => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", page, actionFilter, search],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }
      if (search) {
        query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%`);
      }

      const { data: logs, count } = await query;
      return { logs: logs || [], total: count || 0 };
    },
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const actionColor = (action: string) => {
    if (action.includes("create") || action.includes("insert")) return "bg-success/10 text-success";
    if (action.includes("delete") || action.includes("deactivat")) return "bg-destructive/10 text-destructive";
    if (action.includes("update") || action.includes("change")) return "bg-warning/10 text-warning";
    return "bg-primary/10 text-primary";
  };

  return (
    <div className="space-y-6 pb-12">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" /> Auditoria
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Registro completo de todas as ações na plataforma
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {total} registros
          </Badge>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ação, entidade..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
              </div>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="user_created">Usuário criado</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="tenant_created">Tenant criado</SelectItem>
                  <SelectItem value="permission_changed">Permissão alterada</SelectItem>
                  <SelectItem value="lgpd_anonymization">LGPD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs Table */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="p-3 text-left font-medium text-muted-foreground">Data/Hora</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Ação</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Entidade</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Tipo Ator</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={cn("text-[10px]", actionColor(log.action))}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-foreground">
                        {log.entity_type || log.resource || "—"}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {log.actor_type || "system"}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground font-mono">
                        {log.ip || "—"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        {isLoading ? "Carregando..." : "Nenhum log encontrado"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </p>
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
      </motion.div>
    </div>
  );
};

export default AdminAudit;
