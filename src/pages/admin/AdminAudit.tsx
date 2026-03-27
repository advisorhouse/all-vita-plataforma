import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FileText, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AuditKpiCards from "@/components/admin/audit/AuditKpiCards";
import AuditFilters from "@/components/admin/audit/AuditFilters";
import AuditLogTable, { type AuditLogRow } from "@/components/admin/audit/AuditLogTable";
import AuditLogDrawer from "@/components/admin/audit/AuditLogDrawer";
import SecurityEventsPanel from "@/components/admin/audit/SecurityEventsPanel";
import AuditAnalytics from "@/components/admin/audit/AuditAnalytics";

const PAGE_SIZE = 25;

const getPeriodDate = (period: string): Date | null => {
  const now = new Date();
  if (period === "today") return new Date(now.setHours(0, 0, 0, 0));
  if (period === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
};

const AdminAudit: React.FC = () => {
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("7d");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch tenants for filter
  const { data: tenantsRaw } = useQuery({
    queryKey: ["audit-tenants"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name, trade_name");
      return data || [];
    },
  });
  const tenantsList = useMemo(() =>
    (tenantsRaw || []).map((t) => ({ id: t.id, name: t.trade_name || t.name })),
    [tenantsRaw]
  );
  const tenantMap = useMemo(() => {
    const map: Record<string, string> = {};
    tenantsRaw?.forEach((t) => { map[t.id] = t.trade_name || t.name; });
    return map;
  }, [tenantsRaw]);

  // Fetch profiles for user name enrichment
  const { data: profilesMap } = useQuery({
    queryKey: ["audit-profiles-map"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, first_name, last_name, email");
      const map: Record<string, string> = {};
      data?.forEach((p) => {
        map[p.id] = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
      });
      return map;
    },
  });

  // Fetch audit logs
  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ["admin-audit-logs", page, periodFilter, actionFilter, entityFilter, tenantFilter, search],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      const periodDate = getPeriodDate(periodFilter);
      if (periodDate) query = query.gte("created_at", periodDate.toISOString());
      if (actionFilter !== "all") query = query.ilike("action", `%${actionFilter}%`);
      if (entityFilter !== "all") query = query.or(`entity_type.eq.${entityFilter},resource.eq.${entityFilter}`);
      if (tenantFilter !== "all") query = query.eq("tenant_id", tenantFilter);
      if (search) query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%,resource.ilike.%${search}%`);

      const { data, count } = await query;
      return { logs: data || [], total: count || 0 };
    },
  });

  // Fetch security events
  const { data: securityEvents, isLoading: secLoading } = useQuery({
    queryKey: ["admin-security-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  // Fetch all logs for analytics (last 7 days, limited)
  const { data: analyticsLogs } = useQuery({
    queryKey: ["admin-audit-analytics"],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("audit_logs")
        .select("action, created_at")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(1000);
      return data || [];
    },
  });

  // Enrich logs
  const enrichedLogs: AuditLogRow[] = useMemo(() =>
    (logsData?.logs || []).map((l: any) => ({
      ...l,
      user_name: l.user_id ? (profilesMap?.[l.user_id] || l.user_id.slice(0, 8)) : "Sistema",
      tenant_name: l.tenant_id ? (tenantMap[l.tenant_id] || l.tenant_id.slice(0, 8)) : null,
    })),
    [logsData, profilesMap, tenantMap]
  );

  const enrichedSecEvents = useMemo(() =>
    (securityEvents || []).map((ev: any) => ({
      ...ev,
      user_name: ev.user_id ? (profilesMap?.[ev.user_id] || ev.user_id.slice(0, 8)) : null,
    })),
    [securityEvents, profilesMap]
  );

  const total = logsData?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // KPIs
  const kpis = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayLogs = (analyticsLogs || []).filter((l) => new Date(l.created_at) >= todayStart).length;
    const criticalEvents = (securityEvents || []).filter((e: any) =>
      e.type === "account_locked" || e.severity === "critical"
    ).length;
    return {
      totalLogs: total,
      todayLogs,
      securityEvents: securityEvents?.length || 0,
      criticalEvents,
    };
  }, [total, analyticsLogs, securityEvents]);

  // Export
  const handleExport = () => {
    const csv = [
      ["Data", "Ação", "Usuário", "Empresa", "Entidade", "IP"].join(","),
      ...enrichedLogs.map((l) =>
        [
          new Date(l.created_at).toLocaleString("pt-BR"),
          l.action,
          l.user_name || "",
          l.tenant_name || "Global",
          l.entity_type || l.resource || "",
          l.ip || "",
        ].map((v) => `"${v}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exportados com sucesso!");
  };

  const resetFilters = () => {
    setSearch(""); setPeriodFilter("7d"); setActionFilter("all");
    setEntityFilter("all"); setSeverityFilter("all"); setTenantFilter("all"); setPage(0);
  };

  return (
    <div className="space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Auditoria e Logs
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Rastreamento completo de atividades e segurança da plataforma
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" /> Exportar CSV
            </Button>
          </div>
        </div>
      </motion.div>

      <AuditKpiCards {...kpis} />

      <AuditFilters
        search={search} onSearchChange={(v) => { setSearch(v); setPage(0); }}
        periodFilter={periodFilter} onPeriodChange={(v) => { setPeriodFilter(v); setPage(0); }}
        actionFilter={actionFilter} onActionChange={(v) => { setActionFilter(v); setPage(0); }}
        entityFilter={entityFilter} onEntityChange={(v) => { setEntityFilter(v); setPage(0); }}
        severityFilter={severityFilter} onSeverityChange={(v) => { setSeverityFilter(v); setPage(0); }}
        tenantFilter={tenantFilter} onTenantChange={(v) => { setTenantFilter(v); setPage(0); }}
        tenants={tenantsList}
      />

      <Tabs defaultValue="logs" className="w-full">
        <TabsList>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="mt-4">
          <AuditLogTable
            logs={enrichedLogs}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            onViewLog={(log) => { setSelectedLog(log); setDrawerOpen(true); }}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <SecurityEventsPanel events={enrichedSecEvents} isLoading={secLoading} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AuditAnalytics logs={analyticsLogs || []} />
        </TabsContent>
      </Tabs>

      <AuditLogDrawer
        log={selectedLog}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default AdminAudit;
