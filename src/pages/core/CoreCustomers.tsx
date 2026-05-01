import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, AlertTriangle, Activity,
  CheckCircle2, TrendingUp,
  BarChart3, Shield,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InfoTip } from "@/components/ui/info-tip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { format } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const LEVEL_DISTRIBUTION = [
  { name: "Início", value: 0, fill: "hsl(var(--muted-foreground))" },
  { name: "3M+", value: 0, fill: "hsl(var(--primary))" },
  { name: "6M+", value: 0, fill: "hsl(var(--accent-foreground))" },
  { name: "Elite", value: 0, fill: "hsl(var(--destructive))" },
];

const RISK_DISTRIBUTION = [
  { name: "Baixo", value: 0, fill: "hsl(var(--primary))" },
  { name: "Médio", value: 0, fill: "hsl(var(--accent-foreground))" },
  { name: "Alto", value: 0, fill: "hsl(var(--destructive))" },
];

const MONTHLY_EVOLUTION: any[] = [];
const ENGAGEMENT_TREND: any[] = [];

const CoreCustomers: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "cancelled">("all");
  const { currentTenant } = useTenant();

  const { data: clientData, isLoading } = useQuery({
    queryKey: ["core-customers", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      
      const [clientsRes, ordersRes] = await Promise.all([
        supabase
          .from("clients")
          .select(`
            id,
            full_name,
            phone,
            created_at,
            metadata,
            profiles:user_id (email)
          `)
          .eq("tenant_id", currentTenant.id),
        supabase
          .from("orders")
          .select("client_id, amount, payment_status")
          .eq("tenant_id", currentTenant.id)
      ]);
      
      if (clientsRes.error) throw clientsRes.error;
      if (ordersRes.error) throw ordersRes.error;
      
      const orders = ordersRes.data || [];
      const clientLtvMap = new Map();
      orders.filter(o => o.payment_status === 'paid').forEach(o => {
        if (o.client_id) {
          clientLtvMap.set(o.client_id, (clientLtvMap.get(o.client_id) || 0) + Number(o.amount));
        }
      });

      const clients = (clientsRes.data || []).map(c => {
        const metadata = c.metadata as any || {};
        const monthsActive = Math.floor((new Date().getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        return {
          id: c.id,
          name: c.full_name || "Sem nome",
          email: (c.profiles as any)?.email || "Sem email",
          status: metadata.status || "active",
          months: monthsActive,
          engagement: metadata.engagement || 85, // Default for now
          consistency: metadata.consistency || 90,
          risk: metadata.risk || "low",
          level: monthsActive >= 12 ? "Elite" : monthsActive >= 6 ? "6M+" : monthsActive >= 3 ? "3M+" : "Início",
          plan: metadata.plan || "Original",
          ltv: clientLtvMap.get(c.id) || 0,
          lastLogin: metadata.lastLogin || format(new Date(c.created_at), "dd/MM/yyyy"),
          partner: metadata.partner || "Direto"
        };
      });

      // Distributions
      const levels = { "Início": 0, "3M+": 0, "6M+": 0, "Elite": 0 };
      const risks = { "low": 0, "medium": 0, "high": 0 };
      
      clients.forEach(c => {
        (levels as any)[c.level]++;
        (risks as any)[c.risk]++;
      });

      const levelDistribution = Object.entries(levels).map(([name, value]) => ({
        name, value, fill: name === "Elite" ? "hsl(var(--destructive))" : name === "6M+" ? "hsl(var(--accent-foreground))" : name === "3M+" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
      }));

      const riskDistribution = [
        { name: "Baixo", value: risks.low, fill: "hsl(var(--primary))" },
        { name: "Médio", value: risks.medium, fill: "hsl(var(--accent-foreground))" },
        { name: "Alto", value: risks.high, fill: "hsl(var(--destructive))" },
      ];

      return {
        clients,
        levelDistribution,
        riskDistribution
      };
    },
    enabled: !!currentTenant?.id
  });

  const clients = clientData?.clients || [];
  const levelDistribution = clientData?.levelDistribution || LEVEL_DISTRIBUTION;
  const riskDistribution = clientData?.riskDistribution || RISK_DISTRIBUTION;

  const filtered = clients.filter(
    (c) =>
      (filter === "all" || c.status === filter) &&
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const active = clients.filter(c => c.status === "active").length;
  const paused = clients.filter(c => c.status === "paused").length;
  const cancelled = clients.filter(c => c.status === "cancelled").length;
  const avgEngagement = clients.length > 0 ? Math.round(clients.reduce((s, c) => s + c.engagement, 0) / clients.length) : 0;
  const highRisk = clients.filter(c => c.risk === "high").length;
  const totalLtv = clients.reduce((s, c) => s + c.ltv, 0);

  return (
    <TooltipProvider delayDuration={200}>
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}
      {/* KPIs */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total clientes", value: clients.length, icon: Users, sub: `${active} ativos`, tip: "Número total de clientes cadastrados na plataforma, incluindo ativos, pausados e cancelados." },
          { label: "Ativos", value: active, icon: CheckCircle2, sub: `${clients.length > 0 ? Math.round((active / clients.length) * 100) : 0}% da base`, tip: "Clientes com assinatura ativa e pagamento em dia." },
          { label: "Engajamento médio", value: `${avgEngagement}%`, icon: Activity, sub: "+3pp vs mês anterior", tip: "Média ponderada de uso do produto, login e interações com conteúdo da plataforma." },
          { label: "Risco alto", value: highRisk, icon: AlertTriangle, sub: "Requerem atenção", tip: "Clientes com probabilidade elevada de cancelamento baseado em engajamento, consistência e tempo sem login." },
          { label: "LTV total", value: `R$ ${(totalLtv / 1000).toFixed(1)}k`, icon: TrendingUp, sub: "Lifetime value", tip: "Valor total estimado que todos os clientes geram ao longo da vida útil da assinatura." },
        ].map(({ label, value, icon: Icon, sub, tip }) => (
          <Card key={label} className="border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                  <InfoTip text={tip} />
                </div>
                <p className="text-lg font-semibold text-foreground leading-tight">{value}</p>
                <p className="text-[9px] text-muted-foreground">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="text-xs gap-1"><Users className="h-3 w-3" /> Base de Clientes</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1"><BarChart3 className="h-3 w-3" /> Analytics</TabsTrigger>
          <TabsTrigger value="risk" className="text-xs gap-1"><Shield className="h-3 w-3" /> Gestão de Risco</TabsTrigger>
        </TabsList>

        {/* Tab: Client List */}
        <TabsContent value="list" className="space-y-4">
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..." className="pl-9 h-9 text-xs" />
            </div>
            {(["all", "active", "paused", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
                  filter === f ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                {f === "all" ? "Todos" : f === "active" ? "Ativos" : f === "paused" ? "Pausados" : "Cancelados"}
              </button>
            ))}
          </motion.div>

          <Card className="border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Cliente</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                    <TableHead className="text-[10px]">Plano</TableHead>
                    <TableHead className="text-[10px]"><span className="flex items-center gap-1">Nível <InfoTip text="Nível de fidelidade baseado em meses ativos, consistência de uso e engajamento." /></span></TableHead>
                    <TableHead className="text-[10px]">Meses</TableHead>
                    <TableHead className="text-[10px]"><span className="flex items-center gap-1">Engajamento <InfoTip text="Score de 0-100% baseado em frequência de login, consumo de conteúdo e interações." /></span></TableHead>
                    <TableHead className="text-[10px]"><span className="flex items-center gap-1">Consistência <InfoTip text="Regularidade de uso do produto ao longo do tempo. Quanto maior, menor a chance de churn." /></span></TableHead>
                    <TableHead className="text-[10px]"><span className="flex items-center gap-1">LTV <InfoTip text="Lifetime Value: receita total gerada pelo cliente desde a primeira compra." /></span></TableHead>
                    <TableHead className="text-[10px]">Partner</TableHead>
                    <TableHead className="text-[10px]"><span className="flex items-center gap-1">Risco <InfoTip text="Classificação de risco de churn: Estável (baixo), Atenção (médio) ou Risco (alto)." /></span></TableHead>
                    <TableHead className="text-[10px]">Último acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.name} className="cursor-pointer">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                            {c.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.status === "active" ? "default" : c.status === "paused" ? "secondary" : "destructive"} className="text-[9px] px-1.5">
                          {c.status === "active" ? "Ativo" : c.status === "paused" ? "Pausado" : "Cancelado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-foreground">{c.plan}</TableCell>
                      <TableCell>
                        <span className="text-[10px] font-medium text-foreground">{c.level}</span>
                      </TableCell>
                      <TableCell className="text-xs text-foreground">{c.months}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={c.engagement} className="h-1.5 w-12" />
                          <span className="text-[10px] text-muted-foreground">{c.engagement}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={c.consistency} className="h-1.5 w-12" />
                          <span className="text-[10px] text-muted-foreground">{c.consistency}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">R$ {c.ltv}</TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground">{c.partner}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[9px] px-1.5",
                          c.risk === "low" && "border-primary/30 text-primary",
                          c.risk === "medium" && "border-accent text-accent-foreground",
                          c.risk === "high" && "border-destructive/30 text-destructive",
                        )}>
                          {c.risk === "low" ? "Estável" : c.risk === "medium" ? "Atenção" : "Risco"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{c.lastLogin}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</div>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-1.5"><CardTitle className="text-sm font-medium text-foreground">Evolução da Base</CardTitle><InfoTip text="Quantidade de clientes ativos, novos e cancelados por mês. Mostra a saúde do crescimento." /></div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={MONTHLY_EVOLUTION}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="ativos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="novos" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cancelados" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-1.5"><CardTitle className="text-sm font-medium text-foreground">Engajamento Médio</CardTitle><InfoTip text="Score médio de engajamento de toda a base ao longo dos meses. Tendência ascendente indica maior aderência." /></div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={ENGAGEMENT_TREND}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-1.5"><CardTitle className="text-sm font-medium text-foreground">Distribuição por Nível</CardTitle><InfoTip text="Classificação dos clientes por nível de fidelidade: Início, 3M+, 6M+ e Elite (12M+)." /></div>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={levelDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {levelDistribution.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {levelDistribution.map((l: any) => (
                    <div key={l.name} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.fill }} />
                      <span className="text-[10px] text-muted-foreground">{l.name}: {l.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Distribuição por Risco</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {riskDistribution.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {riskDistribution.map((r: any) => (
                    <div key={r.name} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.fill }} />
                      <span className="text-[10px] text-muted-foreground">{r.name}: {r.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Risk Management */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Risco Alto", count: highRisk, color: "text-destructive", bgColor: "bg-destructive/10", clients: clients.filter(c => c.risk === "high") },
              { title: "Atenção", count: clients.filter(c => c.risk === "medium").length, color: "text-accent-foreground", bgColor: "bg-accent/10", clients: clients.filter(c => c.risk === "medium") },
              { title: "Estável", count: clients.filter(c => c.risk === "low").length, color: "text-primary", bgColor: "bg-primary/10", clients: clients.filter(c => c.risk === "low") },
            ].map(group => (
              <Card key={group.title} className="border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn("text-sm font-medium", group.color)}>{group.title}</CardTitle>
                    <Badge variant="outline" className={cn("text-[10px]", group.color)}>{group.count}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.clients.map(c => (
                    <div key={c.name} className={cn("rounded-lg p-3 space-y-1.5", group.bgColor)}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">{c.name}</p>
                        <span className="text-[9px] text-muted-foreground">{c.lastLogin}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Engajamento</p>
                          <Progress value={c.engagement} className="h-1" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Consistência</p>
                          <Progress value={c.consistency} className="h-1" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                        <span>{c.plan}</span>
                        <span>·</span>
                        <span>{c.months}m</span>
                        <span>·</span>
                        <span>{c.level}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
};

export default CoreCustomers;
