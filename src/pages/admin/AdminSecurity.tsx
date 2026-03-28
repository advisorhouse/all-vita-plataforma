import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Lock, Eye, Search,
  Monitor, MapPin, LogOut, Key, Users, ExternalLink, Activity,
  Globe, Ban, ChevronLeft, ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const AdminSecurity: React.FC = () => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(0);

  // Security events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["security-events", page, severityFilter, search],
    queryFn: async () => {
      let query = supabase
        .from("security_events")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (severityFilter !== "all") query = query.eq("severity", severityFilter);
      if (search) query = query.ilike("type", `%${search}%`);
      const { data, count } = await query;
      return { events: data || [], total: count || 0 };
    },
  });

  // All events for stats (last 30 days)
  const { data: allEvents = [] } = useQuery({
    queryKey: ["security-events-all"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data } = await supabase
        .from("security_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Access logs for sessions
  const { data: accessLogs = [] } = useQuery({
    queryKey: ["access-logs-security"],
    queryFn: async () => {
      const { data } = await supabase
        .from("access_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  // Super admins
  const { data: superAdmins = [] } = useQuery({
    queryKey: ["super-admins-security"],
    queryFn: async () => {
      const { data: memberships } = await supabase
        .from("memberships")
        .select("user_id")
        .eq("role", "super_admin")
        .eq("active", true);
      if (!memberships?.length) return [];
      const ids = memberships.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", ids);
      return profiles || [];
    },
  });

  const events = eventsData?.events || [];
  const totalPages = Math.ceil((eventsData?.total || 0) / PAGE_SIZE);

  // Stats
  const stats = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    const last24h = allEvents.filter((e) => new Date(e.created_at) > new Date(Date.now() - 86400000));
    allEvents.forEach((e) => {
      const s = (e.severity || "medium") as keyof typeof counts;
      if (counts[s] !== undefined) counts[s]++;
    });
    const loginFails = allEvents.filter((e) => e.type === "login_fail");
    const lockedAccounts = allEvents.filter((e) => e.type === "account_locked");
    const uniqueIps = new Set(allEvents.map((e) => e.ip).filter(Boolean));
    const suspiciousIps = allEvents
      .filter((e) => (e.severity === "high" || e.severity === "critical") && e.ip)
      .reduce((acc, e) => { acc.add(e.ip!); return acc; }, new Set<string>());

    const overallStatus = counts.critical > 0 ? "critical" : counts.high > 3 ? "alert" : "secure";

    return {
      total: allEvents.length,
      last24h: last24h.length,
      ...counts,
      loginFails: loginFails.length,
      lockedAccounts: lockedAccounts.length,
      uniqueIps: uniqueIps.size,
      suspiciousIps: Array.from(suspiciousIps),
      overallStatus,
    };
  }, [allEvents]);

  // Recent sessions (from access_logs)
  const recentSessions = useMemo(() => {
    const sessionMap = new Map<string, any>();
    accessLogs.forEach((log) => {
      if (log.user_id && !sessionMap.has(log.user_id)) {
        sessionMap.set(log.user_id, log);
      }
    });
    return Array.from(sessionMap.values()).slice(0, 20);
  }, [accessLogs]);

  // IP analysis
  const ipAnalysis = useMemo(() => {
    const ipMap = new Map<string, { count: number; lastSeen: string; severity: string; types: Set<string> }>();
    allEvents.forEach((e) => {
      if (!e.ip) return;
      const existing = ipMap.get(e.ip);
      if (existing) {
        existing.count++;
        if (new Date(e.created_at) > new Date(existing.lastSeen)) existing.lastSeen = e.created_at;
        if (e.severity === "critical" || (e.severity === "high" && existing.severity !== "critical")) existing.severity = e.severity || "medium";
        existing.types.add(e.type);
      } else {
        ipMap.set(e.ip, { count: 1, lastSeen: e.created_at, severity: e.severity || "medium", types: new Set([e.type]) });
      }
    });
    return Array.from(ipMap.entries())
      .map(([ip, data]) => ({ ip, ...data, types: Array.from(data.types) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
  }, [allEvents]);

  const statusConfig = {
    secure: { label: "Seguro", color: "bg-emerald-500", icon: ShieldCheck, textColor: "text-emerald-600" },
    alert: { label: "Alerta", color: "bg-amber-500", icon: AlertTriangle, textColor: "text-amber-600" },
    critical: { label: "Risco", color: "bg-destructive", icon: ShieldAlert, textColor: "text-destructive" },
  };
  const currentStatus = statusConfig[stats.overallStatus as keyof typeof statusConfig];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Segurança
          </h1>
          <p className="text-muted-foreground">Monitoramento em tempo real e controle de risco</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", stats.overallStatus === "secure" ? "bg-emerald-500/10" : stats.overallStatus === "alert" ? "bg-amber-500/10" : "bg-destructive/10")}>
            <div className={cn("h-2 w-2 rounded-full animate-pulse", currentStatus.color)} />
            <span className={cn("text-sm font-medium", currentStatus.textColor)}>{currentStatus.label}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/admin/audit"}>
            <ExternalLink className="h-4 w-4 mr-1" /> Auditoria
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Eventos (30d)", value: stats.total, icon: Activity, color: "text-foreground" },
          { label: "Últimas 24h", value: stats.last24h, icon: Eye, color: "text-blue-600" },
          { label: "Críticos", value: stats.critical, icon: ShieldAlert, color: "text-destructive" },
          { label: "Altos", value: stats.high, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Login falhos", value: stats.loginFails, icon: Lock, color: "text-orange-600" },
          { label: "Contas bloqueadas", value: stats.lockedAccounts, icon: Ban, color: "text-destructive" },
          { label: "IPs únicos", value: stats.uniqueIps, icon: Globe, color: "text-muted-foreground" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="access">Acessos Críticos</TabsTrigger>
          <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
          <TabsTrigger value="ips">Monitoramento de IP</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        {/* ALERTS TAB */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar eventos..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
                </div>
                <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(0); }}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Severidade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : events.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum evento encontrado</TableCell></TableRow>
                ) : events.map((evt) => {
                  const sevColors: Record<string, string> = {
                    critical: "bg-destructive/20 text-destructive",
                    high: "bg-amber-500/20 text-amber-700",
                    medium: "bg-yellow-500/10 text-yellow-700",
                    low: "bg-secondary text-muted-foreground",
                  };
                  const sev = evt.severity || "medium";
                  return (
                    <TableRow key={evt.id}>
                      <TableCell className="text-xs whitespace-nowrap">{format(new Date(evt.created_at), "dd/MM HH:mm")}</TableCell>
                      <TableCell className="font-medium text-sm">{evt.type.replace(/_/g, " ")}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-[10px]", sevColors[sev])}>{sev}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{evt.ip || "—"}</TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[100px]">{evt.user_id?.slice(0, 8) || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {evt.metadata ? JSON.stringify(evt.metadata).slice(0, 60) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t">
                <span className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* CRITICAL ACCESS TAB */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> Super Admins</CardTitle>
              <CardDescription>Usuários com acesso total à plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {superAdmins.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Nenhum super admin encontrado</TableCell></TableRow>
                  ) : superAdmins.map((admin: any) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.first_name} {admin.last_name}</TableCell>
                      <TableCell className="text-sm">{admin.email}</TableCell>
                      <TableCell><Badge variant={admin.is_active ? "default" : "destructive"}>{admin.is_active ? "Ativo" : "Inativo"}</Badge></TableCell>
                      <TableCell className="text-sm">{format(new Date(admin.created_at), "dd/MM/yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Acessos Sensíveis Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allEvents
                  .filter((e) => ["login_fail", "account_locked", "permission_escalation", "mfa_disabled"].includes(e.type))
                  .slice(0, 10)
                  .map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={cn("h-4 w-4", e.severity === "critical" ? "text-destructive" : "text-amber-600")} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{e.type.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">{e.ip || "IP desconhecido"}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{format(new Date(e.created_at), "dd/MM HH:mm")}</span>
                    </div>
                  ))}
                {allEvents.filter((e) => ["login_fail", "account_locked"].includes(e.type)).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhum evento sensível recente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SESSIONS TAB */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" /> Sessões Recentes</CardTitle>
              <CardDescription>Últimos acessos registrados na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSessions.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma sessão registrada</TableCell></TableRow>
                  ) : recentSessions.map((session: any) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-xs truncate max-w-[100px]">{session.user_id?.slice(0, 8)}...</TableCell>
                      <TableCell className="text-sm">{session.action}</TableCell>
                      <TableCell className="text-sm">{session.device || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{session.ip || "—"}</TableCell>
                      <TableCell className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {session.location || "—"}
                      </TableCell>
                      <TableCell className="text-xs">{format(new Date(session.created_at), "dd/MM HH:mm")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toast.info("Funcionalidade de encerrar sessão em desenvolvimento")}>
                          <LogOut className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP MONITORING TAB */}
        <TabsContent value="ips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Monitoramento de IP</CardTitle>
              <CardDescription>IPs com maior atividade nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Severidade Máx.</TableHead>
                    <TableHead>Tipos de Evento</TableHead>
                    <TableHead>Último Registro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipAnalysis.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum IP registrado</TableCell></TableRow>
                  ) : ipAnalysis.map((ip) => {
                    const isSuspicious = ip.severity === "critical" || ip.severity === "high";
                    return (
                      <TableRow key={ip.ip} className={isSuspicious ? "bg-destructive/5" : ""}>
                        <TableCell className="font-mono text-sm font-medium">{ip.ip}</TableCell>
                        <TableCell className="font-bold">{ip.count}</TableCell>
                        <TableCell>
                          <Badge variant={isSuspicious ? "destructive" : "secondary"}>{ip.severity}</Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{ip.types.join(", ")}</TableCell>
                        <TableCell className="text-xs">{format(new Date(ip.lastSeen), "dd/MM HH:mm")}</TableCell>
                        <TableCell>
                          {isSuspicious && (
                            <Button variant="outline" size="sm" className="text-destructive" onClick={() => toast.info("Bloqueio de IP em desenvolvimento")}>
                              <Ban className="h-3 w-3 mr-1" /> Bloquear
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFIG TAB */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Autenticação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Obrigar 2FA para admins</p>
                    <p className="text-xs text-muted-foreground">Todos os admins devem ativar autenticação de dois fatores</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Obrigar 2FA para super admins</p>
                    <p className="text-xs text-muted-foreground">Obrigatório para equipe All Vita</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tempo de expiração de sessão (min)</label>
                  <Input type="number" defaultValue="480" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Proteção contra Força Bruta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tentativas máximas de login</label>
                  <Input type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Janela de bloqueio (minutos)</label>
                  <Input type="number" defaultValue="15" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Bloqueio automático</p>
                    <p className="text-xs text-muted-foreground">Bloquear conta após tentativas excedidas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Múltiplos logins simultâneos</p>
                    <p className="text-xs text-muted-foreground">Permitir sessões em múltiplos dispositivos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="w-full">Salvar Configurações</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => window.location.href = "/admin/audit"}>
                <ExternalLink className="h-4 w-4 mr-1" /> Ver Logs de Auditoria
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/admin/users"}>
                <Users className="h-4 w-4 mr-1" /> Gerenciar Usuários
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/admin/settings"}>
                <Lock className="h-4 w-4 mr-1" /> Configurações Globais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurity;
