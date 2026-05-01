import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, XCircle,
  Search, Filter, Eye, MoreHorizontal, Calendar, Users, DollarSign,
  AlertTriangle, CheckCircle, Clock, ChevronRight, Download, Pause,
  BarChart3, Activity, Zap,
} from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, Legend, PieChart, Pie, Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Mock Data ─── */
const MRR_DATA = [
  { month: "Set", mrr: 18200, newMrr: 4200, churnMrr: 1800, expansion: 800 },
  { month: "Out", mrr: 24500, newMrr: 7300, churnMrr: 2100, expansion: 1100 },
  { month: "Nov", mrr: 31800, newMrr: 8800, churnMrr: 2500, expansion: 1000 },
  { month: "Dez", mrr: 38900, newMrr: 9200, churnMrr: 3100, expansion: 1000 },
  { month: "Jan", mrr: 45200, newMrr: 8900, churnMrr: 3600, expansion: 1000 },
  { month: "Fev", mrr: 52100, newMrr: 9800, churnMrr: 3900, expansion: 1000 },
];

const CHURN_DATA = [
  { month: "Set", rate: 9.8 },
  { month: "Out", rate: 8.6 },
  { month: "Nov", rate: 7.8 },
  { month: "Dez", rate: 7.9 },
  { month: "Jan", rate: 7.9 },
  { month: "Fev", rate: 7.4 },
];

const PRODUCTS = [
  { name: "Vision Lift Original", active: 412, new: 45, churn: 3.8, revenue: 78200, avgCycle: 5.2, icon: "🟢" },
  { name: "Vision Lift Premium", active: 245, new: 32, churn: 2.1, revenue: 61300, avgCycle: 7.8, icon: "🟣" },
  { name: "Kit Trimestral", active: 128, new: 18, churn: 8.2, revenue: 64000, avgCycle: 2.1, icon: "🔵" },
  { name: "Vision Care", active: 105, new: 12, churn: 4.5, revenue: 13650, avgCycle: 3.4, icon: "🟡" },
];

const PLAN_DISTRIBUTION = [
  { name: "Original", value: 412, color: "hsl(var(--primary))" },
  { name: "Premium", value: 245, color: "hsl(var(--accent))" },
  { name: "Trimestral", value: 128, color: "hsl(var(--success))" },
  { name: "Care", value: 105, color: "hsl(var(--warning))" },
];

const SUBSCRIPTIONS = [
  { id: "SUB-001", client: "Maria S.", plan: "Premium", status: "active", cycle: 8, mrr: 199.90, nextRenewal: "2026-03-15", risk: "low", partner: "Dra. Marina Costa" },
  { id: "SUB-002", client: "Ana P.", plan: "Original", status: "active", cycle: 6, mrr: 149.90, nextRenewal: "2026-03-22", risk: "low", partner: "Dr. Ricardo Alves" },
  { id: "SUB-003", client: "Juliana M.", plan: "Premium", status: "active", cycle: 5, mrr: 199.90, nextRenewal: "2026-03-10", risk: "medium", partner: "Dra. Marina Costa" },
  { id: "SUB-004", client: "Carla R.", plan: "Original", status: "active", cycle: 3, mrr: 149.90, nextRenewal: "2026-03-28", risk: "low", partner: "Dra. Camila Reis" },
  { id: "SUB-005", client: "Fernanda L.", plan: "Trimestral", status: "active", cycle: 2, mrr: 499.70, nextRenewal: "2026-04-15", risk: "medium", partner: "Dr. Ricardo Alves" },
  { id: "SUB-006", client: "Patrícia D.", plan: "Original", status: "active", cycle: 1, mrr: 149.90, nextRenewal: "2026-04-02", risk: "high", partner: "Dra. Camila Reis" },
  { id: "SUB-007", client: "Luciana T.", plan: "Original", status: "paused", cycle: 4, mrr: 0, nextRenewal: "—", risk: "high", partner: "Dr. Felipe Santos" },
  { id: "SUB-008", client: "Roberta F.", plan: "Original", status: "cancelled", cycle: 2, mrr: 0, nextRenewal: "—", risk: "high", partner: "Dr. Felipe Santos" },
  { id: "SUB-009", client: "Camila G.", plan: "Premium", status: "active", cycle: 10, mrr: 199.90, nextRenewal: "2026-03-08", risk: "low", partner: "Dra. Marina Costa" },
  { id: "SUB-010", client: "Beatriz N.", plan: "Care", status: "active", cycle: 3, mrr: 129.90, nextRenewal: "2026-03-20", risk: "low", partner: "Dr. Ricardo Alves" },
];

const COHORT_DATA = [
  { cohort: "Set/25", total: 85, m1: 92, m2: 84, m3: 78, m4: 72, m5: 68, m6: 65 },
  { cohort: "Out/25", total: 112, m1: 90, m2: 82, m3: 76, m4: 71, m5: 67, m6: 0 },
  { cohort: "Nov/25", total: 98, m1: 91, m2: 85, m3: 79, m4: 73, m5: 0, m6: 0 },
  { cohort: "Dez/25", total: 105, m1: 89, m2: 81, m3: 74, m4: 0, m5: 0, m6: 0 },
  { cohort: "Jan/26", total: 120, m1: 93, m2: 86, m3: 0, m4: 0, m5: 0, m6: 0 },
  { cohort: "Fev/26", total: 134, m1: 94, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0 },
];

const CoreSubscriptions: React.FC = () => {
  const { currentTenant } = useTenant();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "cancelled">("all");

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ["core-subscriptions", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;

      const [subsRes, productsRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select(`
            *,
            clients (id, full_name),
            products (id, name, price)
          `)
          .eq("tenant_id", currentTenant.id),
        supabase
          .from("products")
          .select("*")
          .eq("tenant_id", currentTenant.id)
      ]);

      if (subsRes.error) throw subsRes.error;
      if (productsRes.error) throw productsRes.error;

      const subs = subsRes.data || [];
      const products = productsRes.data || [];

      // Calculate MRR Data for last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return {
          month: format(d, "MMM", { locale: ptBR }),
          start: startOfMonth(d),
          end: endOfMonth(d),
          mrr: 0,
          newMrr: 0,
          churnMrr: 0,
          expansion: 0
        };
      });

      last6Months.forEach(month => {
        subs.forEach(s => {
          const createdAt = new Date(s.created_at);
          const price = (s as any).products?.price || 0;
          
          if (isWithinInterval(createdAt, { start: month.start, end: month.end })) {
            month.newMrr += price;
          }
          
          if (s.status === 'active' && createdAt <= month.end) {
            month.mrr += price;
          }

          if (s.status === 'cancelled' && s.cancelled_at) {
            const cancelledAt = new Date(s.cancelled_at);
            if (isWithinInterval(cancelledAt, { start: month.start, end: month.end })) {
              month.churnMrr += price;
            }
          }
        });
      });

      // Plan Distribution
      const distributionMap = new Map();
      subs.filter(s => s.status === 'active').forEach(s => {
        const name = (s as any).products?.name || "Outros";
        distributionMap.set(name, (distributionMap.get(name) || 0) + 1);
      });

      const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"];
      const planDistribution = Array.from(distributionMap.entries()).map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length]
      }));

      // Product Stats
      const productStats = products.map(p => {
        const pSubs = subs.filter(s => s.product_id === p.id);
        const activeCount = pSubs.filter(s => s.status === 'active').length;
        const newThisMonth = pSubs.filter(s => {
          const d = new Date(s.created_at);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        
        return {
          name: p.name,
          active: activeCount,
          new: newThisMonth,
          churn: activeCount > 0 ? (pSubs.filter(s => s.status === 'cancelled').length / pSubs.length * 100).toFixed(1) : 0,
          revenue: activeCount * p.price,
          avgCycle: 0, // Mock for now
          icon: "🟢"
        };
      });

      return {
        subs: subs.map(s => ({
          id: s.id.slice(0, 8).toUpperCase(),
          client: (s as any).clients?.full_name || "Desconhecido",
          plan: (s as any).products?.name || "Plano",
          status: s.status,
          cycle: 1, // Mock
          mrr: (s as any).products?.price || 0,
          nextRenewal: s.renewal_date ? format(new Date(s.renewal_date), "dd/MM/yyyy") : "—",
          risk: "low", // Mock
          partner: "—" // Need referral join for this
        })),
        mrrData: last6Months,
        planDistribution,
        productStats
      };
    },
    enabled: !!currentTenant?.id
  });

  const mrrData = subscriptionData?.mrrData || MRR_DATA;
  const planDistribution = subscriptionData?.planDistribution || PLAN_DISTRIBUTION;
  const productStats = subscriptionData?.productStats || PRODUCTS;
  const subs = subscriptionData?.subs || [];

  const filteredSubs = subs.filter(
    (s) =>
      (statusFilter === "all" || s.status === statusFilter) &&
      (s.client.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
  );

  const currentMonthData = mrrData[mrrData.length - 1];
  const activeSubs = subs.filter(s => s.status === "active");
  const totalMRR = activeSubs.reduce((sum, s) => sum + s.mrr, 0);

  return (
    <div className="space-y-6 pb-12">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Visão Geral</TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" />Assinaturas</TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" />Por Produto</TabsTrigger>
          <TabsTrigger value="cohorts" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Coortes</TabsTrigger>
        </TabsList>

        {/* ===== VISÃO GERAL ===== */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* KPIs */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "MRR", value: `R$ ${(totalMRR / 1000).toFixed(1)}k`, change: "+0%", up: true, icon: DollarSign, sparkData: mrrData.map(d => d.mrr), tip: "Monthly Recurring Revenue: receita mensal recorrente de todas as assinaturas ativas." },
              { label: "Assinaturas Ativas", value: activeSubs.length.toString(), change: "+0%", up: true, icon: Package, sparkData: mrrData.map(d => d.mrr), tip: "Total de assinaturas com status ativo e pagamento em dia." },
              { label: "Renovações/mês", value: activeSubs.length.toString(), change: "+0%", up: true, icon: RefreshCw, sparkData: mrrData.map(d => d.mrr), tip: "Quantidade de renovações bem-sucedidas no mês corrente." },
              { label: "Churn Rate", value: "0%", change: "0pp", up: false, icon: XCircle, sparkData: mrrData.map(d => d.churnMrr), tip: "Taxa de cancelamento mensal. Abaixo de 5% é considerado saudável para o segmento." },
            ].map(({ label, value, change, up, icon: Icon, sparkData, tip }) => (
              <Card key={label} className="border border-border shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                        <InfoTip text={tip} />
                      </div>
                    </div>
                    {/* Mini sparkline */}
                    <svg viewBox="0 0 60 20" className="h-5 w-12">
                      <polyline
                        fill="none"
                        stroke={label === "Churn Rate" ? "hsl(var(--success))" : "hsl(var(--accent))"}
                        strokeWidth="1.5"
                        points={sparkData.map((v, i) => {
                          const max = Math.max(...sparkData);
                          const min = Math.min(...sparkData);
                          const x = (i / (sparkData.length - 1)) * 60;
                          const y = 18 - ((v - min) / (max - min || 1)) * 16;
                          return `${x},${y}`;
                        }).join(" ")}
                      />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-foreground">{value}</p>
                  <p className={cn("text-[10px] font-medium flex items-center gap-0.5",
                    label === "Churn Rate" ? "text-success" : (up ? "text-success" : "text-destructive")
                  )}>
                    {label === "Churn Rate" ? <ArrowDownRight className="h-3 w-3" /> : (up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
                    {change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* MRR Breakdown Chart */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">Evolução MRR — Composição</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />CSV</Button>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mrrData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
                        formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="newMrr" name="Novo MRR" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} stackId="mrr" />
                      <Bar dataKey="expansion" name="Expansão" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} stackId="mrr" />
                      <Bar dataKey="churnMrr" name="Churn MRR" fill="hsl(var(--destructive)/0.6)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Churn Trend + Distribution side by side */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-4 lg:grid-cols-5">
            <Card className="border border-border shadow-sm lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Tendência de Churn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mrrData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
                        formatter={(v: number) => [`${v}%`, "Churn"]} />
                      <Area type="monotone" dataKey="churnMrr" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.08} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Distribuição por Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                        {planDistribution.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PLAN_DISTRIBUTION.map((p) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-[10px] text-muted-foreground">{p.name}</span>
                      <span className="text-[10px] font-semibold text-foreground ml-auto">{p.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== ASSINATURAS (TABLE) ===== */}
        <TabsContent value="subscriptions" className="space-y-4 mt-4">
          {/* Filters */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por cliente ou ID..." className="pl-9 h-9" />
            </div>
            {(["all", "active", "paused", "cancelled"] as const).map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={cn("rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
                  statusFilter === f ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-secondary/80"
                )}>
                {f === "all" ? "Todos" : f === "active" ? "Ativos" : f === "paused" ? "Pausados" : "Cancelados"}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{filteredSubs.length} resultado{filteredSubs.length !== 1 ? "s" : ""}</Badge>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />Exportar</Button>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm overflow-hidden">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">ID</TableHead>
                      <TableHead className="text-[10px]">Cliente</TableHead>
                      <TableHead className="text-[10px]">Plano</TableHead>
                      <TableHead className="text-[10px]">Status</TableHead>
                      <TableHead className="text-[10px] text-right">Ciclo</TableHead>
                      <TableHead className="text-[10px] text-right">MRR</TableHead>
                      <TableHead className="text-[10px]">Partner</TableHead>
                      <TableHead className="text-[10px]">Próx. Renovação</TableHead>
                      <TableHead className="text-[10px]">Risco</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubs.map((sub) => (
                      <TableRow key={sub.id} className="group cursor-pointer">
                        <TableCell className="text-[11px] font-mono text-muted-foreground">{sub.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                              {sub.client.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="text-sm font-medium text-foreground">{sub.client}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">{sub.plan}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            sub.status === "active" ? "bg-success/10 text-success" :
                            sub.status === "paused" ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          )}>
                            {sub.status === "active" ? <CheckCircle className="h-3 w-3" /> :
                             sub.status === "paused" ? <Pause className="h-3 w-3" /> :
                             <XCircle className="h-3 w-3" />}
                            {sub.status === "active" ? "Ativo" : sub.status === "paused" ? "Pausado" : "Cancelado"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-foreground">{sub.cycle}</TableCell>
                        <TableCell className="text-right text-sm font-semibold text-foreground">
                          {sub.mrr > 0 ? `R$ ${sub.mrr.toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{sub.partner}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">{sub.nextRenewal}</TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={cn("inline-block h-2.5 w-2.5 rounded-full",
                                sub.risk === "low" ? "bg-success" : sub.risk === "medium" ? "bg-warning" : "bg-destructive"
                              )} />
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px]">
                              {sub.risk === "low" ? "Risco baixo" : sub.risk === "medium" ? "Atenção" : "Risco alto de churn"}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== POR PRODUTO ===== */}
        <TabsContent value="products" className="space-y-4 mt-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2">
            {PRODUCTS.map((p) => (
              <Card key={p.name} className="border border-border shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.icon}</span>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">R$ {(p.revenue / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Ativos</p>
                      <p className="text-lg font-semibold text-foreground">{p.active}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Novos/mês</p>
                      <p className="text-lg font-semibold text-accent">+{p.new}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Churn</p>
                      <p className={cn("text-lg font-semibold", p.churn > 5 ? "text-destructive" : p.churn > 3 ? "text-warning" : "text-success")}>{p.churn}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Ciclo Méd.</p>
                      <p className="text-lg font-semibold text-foreground">{p.avgCycle}m</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Share do MRR</span>
                      <span className="font-medium text-foreground">{((p.revenue / 217150) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(p.revenue / 217150) * 100} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </TabsContent>

        {/* ===== COORTES ===== */}
        <TabsContent value="cohorts" className="space-y-4 mt-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">Tabela de Retenção por Coorte (%)</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />CSV</Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">Coorte</th>
                      <th className="py-2 px-3 text-center font-medium text-muted-foreground">Total</th>
                      {["M1", "M2", "M3", "M4", "M5", "M6"].map(m => (
                        <th key={m} className="py-2 px-3 text-center font-medium text-muted-foreground">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COHORT_DATA.map((row) => (
                      <tr key={row.cohort} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium text-foreground">{row.cohort}</td>
                        <td className="py-2 px-3 text-center font-semibold text-foreground">{row.total}</td>
                        {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map((v, i) => (
                          <td key={i} className="py-2 px-3 text-center">
                            {v > 0 ? (
                              <span className={cn("inline-block rounded px-2 py-0.5 text-[10px] font-medium",
                                v >= 85 ? "bg-success/15 text-success" :
                                v >= 70 ? "bg-success/10 text-success" :
                                v >= 50 ? "bg-warning/10 text-warning" :
                                "bg-destructive/10 text-destructive"
                              )}>
                                {v}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Insights */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  Insights de Retenção
                </h3>
                <div className="space-y-2">
                  {[
                    { text: "Coorte de Fev/26 apresenta melhor M1 (94%) — investigar fonte de aquisição", type: "positive" },
                    { text: "Kit Trimestral tem churn 2x maior que Premium — considerar incentivos de renovação", type: "warning" },
                    { text: "Queda consistente no churn geral: de 9.8% para 7.4% em 6 meses", type: "positive" },
                  ].map((insight, i) => (
                    <div key={i} className={cn("flex items-start gap-3 rounded-xl px-4 py-3",
                      insight.type === "positive" ? "bg-success/5 border border-success/20" : "bg-warning/5 border border-warning/20"
                    )}>
                      {insight.type === "positive" ? <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> :
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />}
                      <p className="text-[12px] text-foreground">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoreSubscriptions;
