import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Building2, Users, ShieldCheck, Activity, TrendingUp,
  AlertTriangle, DollarSign, ArrowUpRight, ChevronRight,
  Globe, UserPlus, FileText, Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: tenants } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name, trade_name, slug, active, status, created_at").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: recentAudit } = useQuery({
    queryKey: ["admin-recent-audit"],
    queryFn: async () => {
      const { data } = await supabase.from("audit_logs").select("id, action, entity_type, created_at, user_id").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const { data: securityEvents } = useQuery({
    queryKey: ["admin-security-events"],
    queryFn: async () => {
      const { data } = await supabase.from("security_events").select("id, type, severity, created_at").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const activeTenants = tenants?.filter((t) => t.active).length || 0;
  const totalTenants = tenants?.length || 0;
  const criticalEvents = securityEvents?.filter((e) => e.severity === "high" || e.severity === "critical").length || 0;

  const KPI_CARDS = [
    { label: "Empresas Ativas", value: String(activeTenants), sub: `${totalTenants} total`, icon: Building2, href: "/admin/tenants", color: "text-accent" },
    { label: "Usuários Totais", value: String(profiles || 0), sub: "na plataforma", icon: Users, href: "/admin/users", color: "text-primary" },
    { label: "Eventos de Segurança", value: String(securityEvents?.length || 0), sub: `${criticalEvents} críticos`, icon: ShieldCheck, href: "/admin/security", color: criticalEvents > 0 ? "text-destructive" : "text-success" },
    { label: "Logs de Auditoria", value: String(recentAudit?.length || 0), sub: "últimos registros", icon: FileText, href: "/admin/audit", color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Greeting */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Painel All Vita</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Visão geral da plataforma multi-tenant</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-xs text-success font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Plataforma online
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map(({ label, value, sub, icon: Icon, href, color }) => (
            <Card
              key={label}
              className="cursor-pointer hover:border-accent/30 hover:shadow-md transition-all"
              onClick={() => navigate(href)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-secondary")}>
                    <Icon className={cn("h-4 w-4", color)} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold">Empresas Recentes</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/tenants")}>
                  Ver todas <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="space-y-2">
                {tenants?.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        <Globe className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.trade_name || t.name}</p>
                        <p className="text-[11px] text-muted-foreground">{t.slug}.allvita.com.br</p>
                      </div>
                    </div>
                    <Badge variant={t.active ? "default" : "secondary"} className="text-[10px]">
                      {t.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                ))}
                {(!tenants || tenants.length === 0) && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Nenhuma empresa cadastrada ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Audit Logs */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Atividade Recente</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/audit")}>
                  Ver tudo <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="space-y-2">
                {recentAudit?.map((log) => (
                  <div key={log.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{log.action}</p>
                        <p className="text-[11px] text-muted-foreground">{log.entity_type || "sistema"}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
                {(!recentAudit || recentAudit.length === 0) && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Nenhum log registrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Events */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-warning" />
                  <h3 className="text-sm font-semibold">Eventos de Segurança</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/security")}>
                  Ver tudo <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="space-y-2">
                {securityEvents?.map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        evt.severity === "high" || evt.severity === "critical" ? "bg-destructive/10" : "bg-warning/10"
                      )}>
                        <AlertTriangle className={cn(
                          "h-3.5 w-3.5",
                          evt.severity === "high" || evt.severity === "critical" ? "text-destructive" : "text-warning"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{evt.type}</p>
                        <Badge variant="outline" className="text-[9px] mt-0.5">
                          {evt.severity || "medium"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(evt.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
                {(!securityEvents || securityEvents.length === 0) && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Nenhum evento registrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Nova Empresa", icon: Building2, href: "/admin/tenants", color: "bg-accent/10 text-accent" },
                  { label: "Gerenciar Usuários", icon: Users, href: "/admin/users", color: "bg-primary/10 text-primary" },
                  { label: "Auditoria", icon: FileText, href: "/admin/audit", color: "bg-warning/10 text-warning" },
                  { label: "Segurança", icon: ShieldCheck, href: "/admin/security", color: "bg-destructive/10 text-destructive" },
                ].map(({ label, icon: Icon, href, color }) => (
                  <button
                    key={label}
                    onClick={() => navigate(href)}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
