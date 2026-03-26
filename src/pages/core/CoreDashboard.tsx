import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, DollarSign, TrendingUp, ShieldCheck, Package,
  Award, AlertTriangle, BarChart3, ArrowUpRight, ArrowDownRight,
  Crown, Activity, Repeat, Brain, Zap, ChevronRight, Eye,
  Percent, Handshake, Gift, ExternalLink, UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ─── Animation ──────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.055, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-muted-foreground/30">
          <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
        </svg>
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </Tooltip>
);

/* ─── Greeting ───────────────────────────────────────────── */
const GreetingIcon: React.FC = () => {
  const h = new Date().getHours();
  if (h < 12) {
    return (
      <motion.div className="relative flex h-6 w-6 items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
        <motion.div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--warning) / 0.2) 0%, transparent 70%)" }} animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.25, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
        <svg viewBox="0 0 24 24" className="h-4 w-4 relative z-10">
          <circle cx="12" cy="12" r="5" fill="hsl(var(--warning))" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2" x2="12" y2="4.5" stroke="hsl(var(--warning))" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${a} 12 12)`} />
          ))}
        </svg>
      </motion.div>
    );
  }
  if (h < 18) return <motion.span className="text-base select-none" animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }} style={{ transformOrigin: "70% 70%", display: "inline-block" }}>👋</motion.span>;
  return (
    <motion.div className="relative flex h-6 w-6 items-center justify-center" animate={{ y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity }}>
      <svg viewBox="0 0 24 24" className="h-4 w-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="hsl(var(--accent))" /></svg>
    </motion.div>
  );
};

/* ─── Mock Data ──────────────────────────────────────────── */
const KPI_CARDS = [
  { label: "Clientes Ativos", value: "890", change: "+12%", up: true, icon: Users, tip: "Total de assinantes com status ativo.", href: "/core/customers" },
  { label: "Partners Ativos", value: "47", change: "+8%", up: true, icon: Handshake, tip: "Partners com pelo menos 1 cliente ativo.", href: "/core/partners" },
  { label: "MRR", value: "R$ 52.1k", change: "+15%", up: true, icon: DollarSign, tip: "Receita mensal recorrente.", accent: true, href: "/core/finance" },
  { label: "Ticket Médio", value: "R$ 198", change: "+3%", up: true, icon: Repeat, tip: "Valor médio por assinatura ativa." },
  { label: "Churn", value: "4.2%", change: "-0.8%", up: false, icon: AlertTriangle, tip: "Taxa de cancelamento mensal.", invertColor: true },
  { label: "Retenção 90d", value: "82%", change: "+2%", up: true, icon: ShieldCheck, tip: "Clientes retidos após 90 dias." },
];

const SPARKLINE_DATA = [
  [38, 42, 40, 48, 52, 58, 62, 68, 72, 78, 82, 89],
  [12, 15, 18, 20, 24, 28, 30, 34, 38, 40, 44, 47],
  [18, 22, 25, 28, 32, 36, 39, 42, 45, 48, 50, 52],
  [142, 148, 155, 160, 168, 175, 178, 182, 188, 192, 195, 198],
  [8, 7.5, 7, 6.8, 6.2, 5.8, 5.5, 5.2, 5, 4.8, 4.5, 4.2],
  [68, 70, 71, 73, 74, 75, 76, 77, 78, 79, 81, 82],
];

const REVENUE_DATA = [
  { month: "Set", receita: 18200, comissao: 2180 },
  { month: "Out", receita: 24500, comissao: 3120 },
  { month: "Nov", receita: 31800, comissao: 4200 },
  { month: "Dez", receita: 38900, comissao: 5100 },
  { month: "Jan", receita: 45200, comissao: 6300 },
  { month: "Fev", receita: 52100, comissao: 7400 },
];

const COHORT_DATA = [
  { cohort: "Set", m1: 100, m2: 88, m3: 79, m4: 72, m5: 68, m6: 65 },
  { cohort: "Out", m1: 100, m2: 90, m3: 82, m4: 75, m5: 70 },
  { cohort: "Nov", m1: 100, m2: 91, m3: 84, m4: 77 },
  { cohort: "Dez", m1: 100, m2: 89, m3: 81 },
  { cohort: "Jan", m1: 100, m2: 92 },
  { cohort: "Fev", m1: 100 },
];

const TOP_PARTNERS = [
  { name: "Camila S.", clients: 24, retention: 92, ltv: 1840, trend: "up" },
  { name: "Ana P.", clients: 18, retention: 88, ltv: 1620, trend: "up" },
  { name: "Julia M.", clients: 15, retention: 85, ltv: 1480, trend: "up" },
  { name: "Fernanda R.", clients: 12, retention: 78, ltv: 1120, trend: "up" },
  { name: "Patrícia L.", clients: 8, retention: 65, ltv: 780, trend: "down" },
];

const GROWTH_PROJECTION = [
  { month: "Fev", real: 890, proj: 890 },
  { month: "Mar", real: null, proj: 980 },
  { month: "Abr", real: null, proj: 1080 },
  { month: "Mai", real: null, proj: 1190 },
  { month: "Jun", real: null, proj: 1310 },
  { month: "Jul", real: null, proj: 1440 },
];

const ALERTS = [
  { type: "warning", title: "Churn acima da média", desc: "Kit Trimestral: retenção caiu 8% este mês.", icon: AlertTriangle, action: "Ver produto" },
  { type: "info", title: "Partner com potencial", desc: "Fernanda R. adicionou 5 clientes em 2 semanas.", icon: TrendingUp, action: "Ver partner" },
  { type: "danger", title: "Retenção em queda", desc: "Cohort de Dezembro abaixo do esperado no mês 3.", icon: Activity, action: "Analisar" },
];

const chartTooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 11,
  boxShadow: "0 4px 12px hsl(var(--foreground) / 0.08)",
};

/* ─── Mini Sparkline ─────────────────────────────────────── */
const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = "hsl(var(--primary))" }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Component ──────────────────────────────────────────── */
const CoreDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* ═══ GREETING ═══ */}
        <motion.div custom={-1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">
                  {(() => { const h = new Date().getHours(); return h < 12 ? "Bom dia, Admin" : h < 18 ? "Boa tarde, Admin" : "Boa noite, Admin"; })()}
                </h1>
                <GreetingIcon />
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">Master</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">Visão consolidada do ecossistema — clientes, partners e receita.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate("/core/partners?register=true")}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Cadastrar Partner
              </button>
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Sistema operacional
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ KPIs with Sparklines ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {KPI_CARDS.map(({ label, value, change, up, icon: Icon, tip, accent, invertColor, href }, idx) => (
              <Card
                key={label}
                onClick={() => href && navigate(href)}
                className={cn(
                  "group transition-all duration-200",
                  accent ? "border-accent/20 bg-accent/[0.03]" : "border-border",
                  href && "cursor-pointer hover:border-accent/30 hover:shadow-md hover:-translate-y-0.5"
                )}
              >
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", accent ? "bg-accent/10" : "bg-secondary")}>
                      <Icon className={cn("h-3.5 w-3.5", accent ? "text-accent" : "text-muted-foreground")} strokeWidth={1.8} />
                    </div>
                    <Tip text={tip} />
                  </div>
                  <div className="flex items-end justify-between gap-1">
                    <div>
                      <p className={cn("text-lg font-bold tracking-tight", accent ? "text-accent" : "text-foreground")}>{value}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{label}</p>
                    </div>
                    <Sparkline data={SPARKLINE_DATA[idx]} color={accent ? "hsl(var(--accent))" : "hsl(var(--primary) / 0.4)"} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn("text-[10px] font-semibold flex items-center gap-0.5",
                      invertColor ? (up ? "text-destructive" : "text-success") : (up ? "text-success" : "text-destructive")
                    )}>
                      {up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {change}
                    </span>
                    <span className="text-[9px] text-muted-foreground">vs mês anterior</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ ROW 2 — Revenue (8) + Revenue Card (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border h-full">
              <CardContent className="p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Receita & Comissões</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Evolução mensal • 6 meses</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Receita</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive/50" /> Comissão</span>
                  </div>
                </div>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="coreRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
                      <Area type="monotone" dataKey="receita" stroke="hsl(var(--accent))" fill="url(#coreRevGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="comissao" stroke="hsl(var(--destructive) / 0.45)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Revenue Hero Card */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/15 blur-xl" />
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/10 blur-lg" />
                <CardContent className="relative z-10 p-5 text-background">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20">
                      <DollarSign className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <h3 className="text-[12px] font-semibold text-background/80 uppercase tracking-wider">Receita Acumulada</h3>
                  </div>
                  <p className="text-3xl font-bold tracking-tight">R$ 210k</p>
                  <p className="text-[11px] text-background/50 mt-1">6 meses de operação</p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {[
                      { label: "MRR", value: "R$ 52.1k" },
                      { label: "Margem", value: "85.8%" },
                      { label: "Comissões", value: "R$ 28.3k" },
                      { label: "Crescimento", value: "+22%" },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg bg-background/10 backdrop-blur-sm px-2.5 py-2">
                        <p className="text-[9px] text-background/50 uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-bold mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Products mini */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      <h3 className="text-[12px] font-semibold text-foreground">Mix de Produtos</h3>
                    </div>
                    <button onClick={() => navigate("/core/subscriptions")} className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
                      Ver tudo <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  {[
                    { label: "Original", val: "412", pct: 46, color: "bg-accent" },
                    { label: "Premium", val: "245", pct: 28, color: "bg-success" },
                    { label: "Kit Trimestral", val: "128", pct: 14, color: "bg-warning" },
                    { label: "Vision Care", val: "105", pct: 12, color: "bg-muted-foreground" },
                  ].map(({ label, val, pct, color }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-foreground font-medium flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
                          {label}
                        </span>
                        <span className="text-muted-foreground">{val} <span className="text-muted-foreground/50">({pct}%)</span></span>
                      </div>
                      <Progress value={pct} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ═══ ROW 3 — Cohort (8) + Retention + Alerts (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Cohort de Retenção</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">% de clientes retidos por mês de aquisição</p>
                  </div>
                  <button onClick={() => navigate("/core/reports")} className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
                    Insights <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left py-2 pr-3 font-medium">Cohort</th>
                        {["M1", "M2", "M3", "M4", "M5", "M6"].map(m => (
                          <th key={m} className="text-center py-2 px-2 font-medium">{m}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COHORT_DATA.map((row) => (
                        <tr key={row.cohort} className="border-b border-border/30">
                          <td className="py-2.5 pr-3 font-semibold text-foreground">{row.cohort}</td>
                          {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map((val, i) => (
                            <td key={i} className="text-center py-2.5 px-2">
                              {val != null ? (
                                <span className={cn(
                                  "inline-block rounded-md px-2 py-0.5 font-semibold text-[10px]",
                                  val >= 85 ? "bg-success/10 text-success" :
                                  val >= 70 ? "bg-accent/10 text-accent" :
                                  "bg-destructive/10 text-destructive"
                                )}>
                                  {val}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground/20">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Retention rings */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    <h3 className="text-[12px] font-semibold text-foreground">Retenção por Período</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "30d", value: 94 },
                      { label: "90d", value: 82 },
                      { label: "180d", value: 68 },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5">
                        <div className="relative flex h-14 w-14 items-center justify-center">
                          <svg viewBox="0 0 80 80" className="absolute inset-0">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                            <circle cx="40" cy="40" r="34" fill="none"
                              stroke={value >= 80 ? "hsl(var(--success))" : value >= 60 ? "hsl(var(--accent))" : "hsl(var(--warning))"}
                              strokeWidth="4" strokeLinecap="round"
                              strokeDasharray={`${(value / 100) * 213.6} 213.6`} transform="rotate(-90 40 40)" />
                          </svg>
                          <span className="text-[13px] font-bold text-foreground">{value}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Alerts */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5 text-accent" />
                      <h3 className="text-[12px] font-semibold text-foreground">Alertas Inteligentes</h3>
                    </div>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-[9px] font-bold text-destructive">{ALERTS.length}</span>
                  </div>
                  {ALERTS.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div key={i} className={cn(
                        "flex items-start gap-2.5 rounded-xl px-3 py-2.5 group cursor-pointer transition-colors",
                        a.type === "danger" ? "bg-destructive/5 border border-destructive/15 hover:bg-destructive/8" :
                        a.type === "warning" ? "bg-warning/5 border border-warning/15 hover:bg-warning/8" :
                        "bg-secondary border border-border hover:bg-secondary/80"
                      )}>
                        <Icon className={cn(
                          "h-3.5 w-3.5 mt-0.5 shrink-0",
                          a.type === "danger" ? "text-destructive" : a.type === "warning" ? "text-warning" : "text-accent"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-foreground">{a.title}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{a.desc}</p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-foreground transition-colors mt-0.5 shrink-0" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ═══ ROW 4 — Partners (8) + Levels (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Top Partners</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Ranking por volume e retenção</p>
                  </div>
                  <button onClick={() => navigate("/core/partners")} className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
                    Ver todos <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Table header */}
                <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Partner</div>
                  <div className="col-span-2 text-right">Clientes</div>
                  <div className="col-span-2 text-right">Retenção</div>
                  <div className="col-span-2 text-right">LTV Médio</div>
                  <div className="col-span-1 text-right">Trend</div>
                </div>

                {TOP_PARTNERS.map((p, i) => (
                  <div key={p.name} className="grid grid-cols-12 items-center gap-2 rounded-xl border border-border/50 p-3 hover:bg-secondary/30 transition-colors cursor-pointer group">
                    <div className="col-span-1">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                        i === 0 ? "bg-warning/15 text-warning" : i === 1 ? "bg-muted text-muted-foreground" : "bg-secondary text-foreground"
                      )}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="col-span-4 sm:col-span-4">
                      <p className="text-[13px] font-medium text-foreground truncate">{p.name}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-[13px] font-semibold text-foreground">{p.clients}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={cn(
                        "inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                        p.retention >= 85 ? "bg-success/10 text-success" :
                        p.retention >= 70 ? "bg-accent/10 text-accent" :
                        "bg-destructive/10 text-destructive"
                      )}>
                        {p.retention}%
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-[12px] font-medium text-foreground">R$ {p.ltv}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      {p.trend === "up" ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-success inline-block" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-destructive inline-block" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5 text-warning" />
                      <h3 className="text-[12px] font-semibold text-foreground">Clientes por Nível</h3>
                    </div>
                    <button onClick={() => navigate("/core/gamification")} className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
                      Config <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  {[
                    { label: "Elite (12M+)", pct: 8, count: 71 },
                    { label: "6M+", pct: 18, count: 160 },
                    { label: "3M+", pct: 32, count: 285 },
                    { label: "< 3M", pct: 42, count: 374 },
                  ].map(({ label, pct, count }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-foreground font-medium">{label}</span>
                        <span className="text-muted-foreground">{count} <span className="text-muted-foreground/50">({pct}%)</span></span>
                      </div>
                      <Progress value={pct} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-accent" />
                    <h3 className="text-[12px] font-semibold text-foreground">Partners por Nível</h3>
                  </div>
                  {[
                    { label: "Elite Partner", pct: 6, count: 3 },
                    { label: "Avançado", pct: 15, count: 7 },
                    { label: "Crescimento", pct: 30, count: 14 },
                    { label: "Estruturado", pct: 28, count: 13 },
                    { label: "Início", pct: 21, count: 10 },
                  ].map(({ label, pct, count }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-foreground font-medium">{label}</span>
                        <span className="text-muted-foreground">{count} <span className="text-muted-foreground/50">({pct}%)</span></span>
                      </div>
                      <Progress value={pct} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ═══ ROW 5 — Growth Projection (8) + Quick Actions (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Mapa de Crescimento</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Clientes ativos — real vs projeção</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Real</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-foreground/20" /> Projeção</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={GROWTH_PROJECTION} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <RTooltip contentStyle={chartTooltipStyle} />
                      <Line type="monotone" dataKey="real" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--accent))" }} connectNulls={false} />
                      <Line type="monotone" dataKey="proj" stroke="hsl(var(--foreground) / 0.2)" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            <motion.div custom={11} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-3.5 w-3.5 text-warning" />
                    <h3 className="text-[12px] font-semibold text-foreground">Bônus & Brindes</h3>
                  </div>
                  {[
                    { label: "Brindes ativos", value: "3 programas" },
                    { label: "Custo/mês", value: "R$ 4.2k" },
                    { label: "Impacto retenção", value: "+12%" },
                    { label: "Impacto upgrade", value: "+8%" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                      <span className="text-[11px] text-muted-foreground">{label}</span>
                      <span className="text-[12px] font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={12} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-[12px] font-semibold text-foreground">Acesso Rápido</h3>
                  </div>
                  {[
                    { label: "Regras de comissão", href: "/core/commissions", icon: Percent },
                    { label: "Gamificação", href: "/core/gamification", icon: Gift },
                    { label: "Insights & BI", href: "/core/reports", icon: Brain },
                  ].map(({ label, href, icon: QIcon }) => (
                    <button
                      key={label}
                      onClick={() => navigate(href)}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-left hover:bg-secondary/40 transition-colors group"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary">
                        <QIcon className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <span className="text-[11px] font-medium text-foreground flex-1">{label}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

      </div>
    </TooltipProvider>
  );
};

export default CoreDashboard;
