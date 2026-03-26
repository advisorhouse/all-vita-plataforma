import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Shield, BarChart3, Activity, Brain, Download,
  Lightbulb, Filter, ArrowRight, DollarSign, Percent, RefreshCw,
  AlertTriangle, ChevronRight, Eye, Zap, Target, ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie,
  LineChart, Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Fallback mock data (shown when API returns empty) ─── */
const MOCK_COHORTS = [
  { cohort: "Set/25", total: 85, m1: 92, m2: 84, m3: 78, m6: 65, m12: 0 },
  { cohort: "Out/25", total: 112, m1: 90, m2: 82, m3: 76, m6: 0, m12: 0 },
  { cohort: "Nov/25", total: 98, m1: 91, m2: 85, m3: 79, m6: 0, m12: 0 },
  { cohort: "Dez/25", total: 105, m1: 89, m2: 81, m3: 0, m6: 0, m12: 0 },
  { cohort: "Jan/26", total: 120, m1: 93, m2: 0, m3: 0, m6: 0, m12: 0 },
  { cohort: "Fev/26", total: 134, m1: 94, m2: 0, m3: 0, m6: 0, m12: 0 },
];

const MOCK_FUNNEL = [
  { stage: "Visitantes", count: 12400, pct: 100 },
  { stage: "Leads", count: 3720, pct: 30 },
  { stage: "Assinantes", count: 890, pct: 24 },
  { stage: "3M+ Retidos", count: 485, pct: 54 },
  { stage: "6M+ Retidos", count: 245, pct: 51 },
  { stage: "12M+ Elite", count: 68, pct: 28 },
];

const MOCK_REVENUE = [
  { month: "Set", new_rev: 12400, recurring_rev: 5800 },
  { month: "Out", new_rev: 16200, recurring_rev: 8300 },
  { month: "Nov", new_rev: 14600, recurring_rev: 17200 },
  { month: "Dez", new_rev: 13800, recurring_rev: 25100 },
  { month: "Jan", new_rev: 15200, recurring_rev: 30000 },
  { month: "Fev", new_rev: 16400, recurring_rev: 35700 },
];

const MOCK_UNIT_ECONOMICS = {
  avg_ticket: 162.40,
  avg_ltv: 1135.80,
  avg_commission_per_client: 142.60,
  net_margin_pct: 52.6,
  total_revenue: 217150,
  total_commission: 26800,
  active_clients: 890,
  avg_churn_pct: 7.4,
  affiliate_roi: [
    { affiliate_id: "1", level: "Premium", revenue: 48200, commission: 5780, roi: 8.3, clients: 42, retention: 88 },
    { affiliate_id: "2", level: "Elite", revenue: 36500, commission: 4015, roi: 9.1, clients: 28, retention: 92 },
    { affiliate_id: "3", level: "Advanced", revenue: 28800, commission: 3744, roi: 7.7, clients: 35, retention: 78 },
    { affiliate_id: "4", level: "Basic", revenue: 15600, commission: 2340, roi: 6.7, clients: 22, retention: 65 },
    { affiliate_id: "5", level: "Premium", revenue: 32100, commission: 3852, roi: 8.3, clients: 31, retention: 85 },
  ],
};

const MOCK_INSIGHTS = [
  { message: "Clientes do segmento 35-45 têm LTV 40% superior à média. Considere campanhas focadas.", type: "ltv", impact: "high" },
  { message: "Coorte de Jan/26 está 12% acima da média de retenção M1. Investigar fonte de aquisição.", type: "retention", impact: "high" },
  { message: "Kit Trimestral apresenta churn 2x maior que Premium. Avaliar incentivos de migração.", type: "churn", impact: "warning" },
  { message: "TOP 3 afiliados geram 53% da receita. Risco de concentração elevado.", type: "risk", impact: "warning" },
  { message: "Margem líquida média estável em 52.6% — dentro da zona segura (>50%).", type: "margin", impact: "info" },
  { message: "Payback médio de aquisição estimado em 2.8 meses — excelente para o segmento.", type: "unit_economics", impact: "high" },
];

const MOCK_SEGMENTS = [
  { segment: "25-34", clients: 180, revenue: 28800, churn: 9.2, ltv: 980 },
  { segment: "35-44", clients: 320, revenue: 72000, churn: 5.8, ltv: 1420 },
  { segment: "45-54", clients: 245, revenue: 61200, churn: 6.4, ltv: 1280 },
  { segment: "55-64", clients: 105, revenue: 36400, churn: 7.1, ltv: 1100 },
  { segment: "65+", clients: 40, revenue: 18750, churn: 4.2, ltv: 1650 },
];

type BIData = {
  cohorts?: any[];
  funnel?: any[];
  unit_economics?: any;
  insights?: any[];
  revenue_breakdown?: any;
};

const StrategicInsights: React.FC = () => {
  const [data, setData] = useState<BIData>({});
  const [loading, setLoading] = useState(false);
  const [cac, setCAC] = useState(50);
  const [useMock, setUseMock] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("financial-projections", {
        body: { report: "all" },
      });
      if (error) throw error;
      if (result && (result.cohorts?.length || result.funnel?.length || result.unit_economics)) {
        setData(result);
        setUseMock(false);
      } else {
        setUseMock(true);
      }
    } catch {
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Resolve data source
  const cohorts = useMock ? MOCK_COHORTS : (data.cohorts || MOCK_COHORTS);
  const funnel = useMock ? MOCK_FUNNEL : (data.funnel || MOCK_FUNNEL);
  const ue = useMock ? MOCK_UNIT_ECONOMICS : (data.unit_economics || MOCK_UNIT_ECONOMICS);
  const insights = useMock ? MOCK_INSIGHTS : (data.insights?.length ? data.insights : MOCK_INSIGHTS);
  const revenueByMonth = useMock ? MOCK_REVENUE : (data.revenue_breakdown?.by_month || MOCK_REVENUE);

  const payback = ue && cac > 0 && ue.avg_ticket > 0
    ? Math.ceil(cac / (ue.avg_ticket * (1 - (ue.avg_churn_pct || 0) / 100)))
    : 0;

  const exportCSV = async (report: string) => {
    try {
      const { data: result, error } = await supabase.functions.invoke("financial-projections", {
        body: { report, format: "csv" },
      });
      if (error) throw error;
      const blob = new Blob([typeof result === "string" ? result : JSON.stringify(result)], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report}.csv`;
      a.click();
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Insights & BI</h2>
          <p className="text-sm text-muted-foreground">Business Intelligence & Data Analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {useMock && (
            <Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning border-0">
              Dados de demonstração
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-1.5">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            {loading ? "Carregando..." : "Atualizar"}
          </Button>
        </div>
      </motion.div>

      {/* Top-level KPIs */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Receita Total", value: `R$ ${(ue.total_revenue / 1000).toFixed(1)}k`, icon: DollarSign, change: "+18.2%", up: true },
          { label: "LTV Médio", value: `R$ ${ue.avg_ltv.toFixed(0)}`, icon: TrendingUp, change: "+12%", up: true },
          { label: "Margem Líquida", value: `${ue.net_margin_pct}%`, icon: Shield, change: "+2.1pp", up: true },
          { label: "Churn Médio", value: `${ue.avg_churn_pct}%`, icon: Activity, change: "-0.5pp", up: false },
        ].map(({ label, value, icon: Icon, change, up }) => (
          <Card key={label} className="border border-border shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
              <p className="text-xl font-semibold text-foreground">{value}</p>
              <p className={cn("text-[10px] font-medium flex items-center gap-0.5",
                label === "Churn Médio" ? "text-success" : (up ? "text-success" : "text-destructive")
              )}>
                {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {change}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="revenue" className="gap-1.5 text-xs"><DollarSign className="h-3.5 w-3.5" />Receita</TabsTrigger>
          <TabsTrigger value="retention" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Retenção</TabsTrigger>
          <TabsTrigger value="ltv" className="gap-1.5 text-xs"><TrendingUp className="h-3.5 w-3.5" />LTV & Margem</TabsTrigger>
          <TabsTrigger value="affiliates" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Afiliados</TabsTrigger>
          <TabsTrigger value="segments" className="gap-1.5 text-xs"><Target className="h-3.5 w-3.5" />Segmentos</TabsTrigger>
          <TabsTrigger value="insights" className="gap-1.5 text-xs"><Brain className="h-3.5 w-3.5" />Insights IA</TabsTrigger>
        </TabsList>

        {/* ===== RECEITA ===== */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">Receita Mensal: Nova vs Recorrente</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportCSV("revenue-breakdown")} className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
                        formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="new_rev" name="Nova" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} stackId="rev" />
                      <Bar dataKey="recurring_rev" name="Recorrente" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} stackId="rev" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== RETENÇÃO ===== */}
        <TabsContent value="retention" className="space-y-4 mt-4">
          {/* Cohort */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">Análise de Coorte — Retenção (%)</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportCSV("cohorts")} className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />CSV
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">Coorte</th>
                      <th className="py-2 px-3 text-center font-medium text-muted-foreground">Total</th>
                      {["M1", "M2", "M3", "M6", "M12"].map(m => (
                        <th key={m} className="py-2 px-3 text-center font-medium text-muted-foreground">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map((row: any) => (
                      <tr key={row.cohort} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium text-foreground">{row.cohort}</td>
                        <td className="py-2 px-3 text-center font-semibold text-foreground">{row.total}</td>
                        {[row.m1, row.m2, row.m3, row.m6, row.m12].map((v: number, i: number) => (
                          <td key={i} className="py-2 px-3 text-center">
                            {v > 0 ? (
                              <span className={cn("inline-block rounded px-2 py-0.5 text-[10px] font-medium",
                                v >= 85 ? "bg-success/15 text-success" :
                                v >= 70 ? "bg-success/10 text-success" :
                                v >= 50 ? "bg-warning/10 text-warning" :
                                "bg-destructive/10 text-destructive"
                              )}>{v}%</span>
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

          {/* Funnel */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">Funil de Conversão & Retenção</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportCSV("funnel")} className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {funnel.map((stage: any, i: number) => (
                    <div key={stage.stage} className="flex items-center gap-3">
                      <div className="w-28 text-[11px] font-medium text-foreground truncate">{stage.stage}</div>
                      <div className="flex-1">
                        <div className="relative h-6 rounded-full bg-secondary overflow-hidden">
                          <div className="absolute inset-y-0 left-0 rounded-full bg-accent/20 transition-all"
                            style={{ width: `${i === 0 ? 100 : stage.pct}%` }} />
                          <div className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all"
                            style={{ width: `${i === 0 ? 100 : Math.min(stage.pct, 100)}%`, opacity: 0.6 }} />
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-xs font-semibold text-foreground">{stage.count.toLocaleString("pt-BR")}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">({stage.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== LTV & MARGEM ===== */}
        <TabsContent value="ltv" className="space-y-4 mt-4">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Ticket Médio", value: `R$ ${ue.avg_ticket.toFixed(2)}` },
              { title: "LTV Médio", value: `R$ ${ue.avg_ltv.toFixed(0)}` },
              { title: "Comissão/Cliente", value: `R$ ${ue.avg_commission_per_client.toFixed(2)}` },
              { title: "Margem Líquida", value: `${ue.net_margin_pct}%`, accent: ue.net_margin_pct >= 50 },
            ].map(({ title, value, accent }) => (
              <Card key={title} className="border border-border shadow-sm">
                <CardContent className="p-4">
                  <p className="text-[10px] text-muted-foreground uppercase">{title}</p>
                  <p className={cn("text-xl font-semibold mt-1", accent ? "text-success" : "text-foreground")}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Unit Economics with CAC */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Unit Economics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-6 flex-wrap">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">CAC Manual (R$)</Label>
                    <Input type="number" value={cac} onChange={(e) => setCAC(Number(e.target.value) || 0)} className="h-8 w-32 text-sm" />
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Payback: </span>
                    <span className="font-semibold text-foreground">{payback} meses</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">LTV/CAC: </span>
                    <span className={cn("font-semibold", (cac > 0 && ue.avg_ltv / cac >= 3) ? "text-success" : "text-foreground")}>
                      {cac > 0 ? (ue.avg_ltv / cac).toFixed(1) : "—"}x
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Receita Total</p>
                    <p className="text-lg font-semibold text-foreground">R$ {ue.total_revenue.toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Comissão Total</p>
                    <p className="text-lg font-semibold text-foreground">R$ {ue.total_commission.toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Clientes Ativos</p>
                    <p className="text-lg font-semibold text-foreground">{ue.active_clients}</p>
                  </div>
                </div>
                {/* Margin bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Margem Líquida Média</span>
                    <span className={cn("font-medium", ue.net_margin_pct >= 50 ? "text-success" : ue.net_margin_pct >= 30 ? "text-warning" : "text-destructive")}>
                      {ue.net_margin_pct}%
                    </span>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, ue.net_margin_pct))} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== AFILIADOS ===== */}
        <TabsContent value="affiliates" className="space-y-4 mt-4">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold">Ranking de Afiliados por ROI</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportCSV("unit-economics")} className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />CSV
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">#</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">Nível</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Receita</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Comissão</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">ROI</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Clientes</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Retenção</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ue.affiliate_roi || []).map((a: any, i: number) => (
                      <tr key={a.affiliate_id} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium text-foreground">{i + 1}</td>
                        <td className="py-2 px-3">
                          <Badge variant="secondary" className={cn("text-[10px]",
                            a.level === "Elite" ? "bg-accent/10 text-accent" :
                            a.level === "Premium" ? "bg-success/10 text-success" :
                            ""
                          )}>{a.level}</Badge>
                        </td>
                        <td className="py-2 px-3 text-right text-foreground">R$ {a.revenue.toLocaleString("pt-BR")}</td>
                        <td className="py-2 px-3 text-right text-foreground">R$ {a.commission.toLocaleString("pt-BR")}</td>
                        <td className="py-2 px-3 text-right font-semibold text-foreground">{a.roi}x</td>
                        <td className="py-2 px-3 text-right text-foreground">{a.clients}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={cn("font-medium",
                            a.retention >= 85 ? "text-success" : a.retention >= 70 ? "text-foreground" : "text-warning"
                          )}>{a.retention}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== SEGMENTOS ===== */}
        <TabsContent value="segments" className="space-y-4 mt-4">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Performance por Faixa Etária</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">Segmento</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Clientes</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Receita</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Churn</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">LTV</th>
                      <th className="py-2 px-3 font-medium text-muted-foreground">Distribuição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_SEGMENTS.map((seg) => {
                      const totalClients = MOCK_SEGMENTS.reduce((s, x) => s + x.clients, 0);
                      return (
                        <tr key={seg.segment} className="border-b border-border/50">
                          <td className="py-2 px-3 font-semibold text-foreground">{seg.segment}</td>
                          <td className="py-2 px-3 text-right text-foreground">{seg.clients}</td>
                          <td className="py-2 px-3 text-right text-foreground">R$ {(seg.revenue / 1000).toFixed(1)}k</td>
                          <td className="py-2 px-3 text-right">
                            <span className={cn("font-medium",
                              seg.churn <= 5 ? "text-success" : seg.churn <= 7 ? "text-warning" : "text-destructive"
                            )}>{seg.churn}%</span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-foreground">R$ {seg.ltv.toLocaleString("pt-BR")}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                                <div className="h-full rounded-full bg-accent" style={{ width: `${(seg.clients / totalClients) * 100}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-8 text-right">{((seg.clients / totalClients) * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chart */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">LTV por Segmento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_SEGMENTS} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                      <YAxis type="category" dataKey="segment" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} width={50} />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
                        formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "LTV"]} />
                      <Bar dataKey="ltv" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== INSIGHTS IA ===== */}
        <TabsContent value="insights" className="space-y-4 mt-4">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Brain className="h-4 w-4 text-accent" />
                  Insights Automáticos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className={cn("flex items-start gap-3 rounded-xl px-4 py-3",
                      insight.impact === "high" ? "bg-accent/5 border border-accent/20" :
                      insight.impact === "warning" ? "bg-warning/5 border border-warning/20" :
                      "bg-secondary border border-border"
                    )}>
                    {insight.impact === "high" ? <Zap className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" /> :
                     insight.impact === "warning" ? <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" /> :
                     <Lightbulb className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-[12px] text-foreground">{insight.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[9px]">{insight.type}</Badge>
                        <Badge variant="secondary" className={cn("text-[9px]",
                          insight.impact === "high" ? "bg-accent/10 text-accent border-0" :
                          insight.impact === "warning" ? "bg-warning/10 text-warning border-0" : ""
                        )}>
                          {insight.impact === "high" ? "Alto impacto" : insight.impact === "warning" ? "Atenção" : "Info"}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategicInsights;
