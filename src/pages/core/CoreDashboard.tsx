import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import {
  Users, DollarSign, TrendingUp, ShieldCheck, Package,
  Award, AlertTriangle, BarChart3, ArrowUpRight, ArrowDownRight,
  Crown, Activity, Repeat, Brain, Zap, ChevronRight, Eye,
  Percent, Handshake, Gift, ExternalLink, UserPlus, FileText, Download,
} from "lucide-react";
import { generateManualPDF } from "@/lib/manualGenerator";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
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

const SPARKLINE_DATA = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
  const max = Math.max(...data) || 1;
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
  const { currentTenant } = useTenant();

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single();
      return data;
    }
  });

  const { data: metrics } = useQuery({
    queryKey: ["core-dashboard-metrics", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;

      const [clientsCount, partnersCount, ordersData] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", currentTenant.id),
        supabase.from("partners").select("id", { count: "exact", head: true }).eq("tenant_id", currentTenant.id),
        supabase.from("orders").select("amount, created_at").eq("tenant_id", currentTenant.id).eq("payment_status", "paid")
      ]);

      const totalRevenue = (ordersData.data || []).reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
      
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const mrr = (ordersData.data || [])
        .filter(o => {
          const d = new Date(o.created_at);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

      return {
        clients: clientsCount.count || 0,
        partners: partnersCount.count || 0,
        revenue: totalRevenue,
        mrr: mrr,
        avgTicket: clientsCount.count ? totalRevenue / clientsCount.count : 0
      };
    },
    enabled: !!currentTenant?.id
  });

  const KPI_CARDS = [
    { label: "Clientes Ativos", value: metrics?.clients?.toString() || "0", change: "+0%", up: true, icon: Users, tip: "Total de assinantes com status ativo.", href: "/core/customers" },
    { label: "Partners Ativos", value: metrics?.partners?.toString() || "0", change: "+0%", up: true, icon: Handshake, tip: "Partners com pelo menos 1 cliente ativo.", href: "/core/partners" },
    { label: "MRR", value: `R$ ${(metrics?.mrr || 0).toLocaleString("pt-BR")}`, change: "+0%", up: true, icon: DollarSign, tip: "Receita mensal recorrente estimativa.", accent: true, href: "/core/finance" },
    { label: "Ticket Médio", value: `R$ ${(metrics?.avgTicket || 0).toLocaleString("pt-BR")}`, change: "+0%", up: true, icon: Repeat, tip: "Valor médio por assinatura ativa." },
    { label: "Churn", value: "0%", change: "0%", up: false, icon: AlertTriangle, tip: "Taxa de cancelamento mensal.", invertColor: true },
    { label: "Retenção 90d", value: "100%", change: "0%", up: true, icon: ShieldCheck, tip: "Clientes retidos após 90 dias." },
  ];

  const REVENUE_DATA = [
    { month: "Mês atual", receita: metrics?.mrr || 0, comissao: (metrics?.mrr || 0) * 0.15 },
  ];

  const ALERTS = [
    { type: "info", title: "Configuração Concluída", desc: "A plataforma está pronta para uso.", icon: ShieldCheck, action: "Explorar" },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* ═══ GREETING ═══ */}
        <motion.div id="core-greeting" custom={-1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">
                  {(() => { 
                    const h = new Date().getHours(); 
                    const greeting = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
                    const firstName = profile?.first_name ? profile.first_name.charAt(0).toUpperCase() + profile.first_name.slice(1).toLowerCase() : "Admin";
                    return `${greeting}, ${firstName}`;
                  })()}
                </h1>
                <GreetingIcon />
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">Master</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">Visão consolidada do ecossistema — clientes, partners e receita.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => navigate("/core/partners?register=true")}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Cadastrar Partner
              </button>
              <a
                href="/manuais/Manual_AllVita_Completo.pdf"
                download="Manual_AllVita_Completo.pdf"
                className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar Manual de Testes
              </a>
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Sistema operacional
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ KPIs with Sparklines ═══ */}
        <motion.div id="core-kpis" custom={0} variants={fadeUp} initial="hidden" animate="visible">
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
                    <p className="text-[11px] text-muted-foreground mt-0.5">Evolução mensal</p>
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
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
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
            <motion.div id="core-revenue-hero" custom={2} variants={fadeUp} initial="hidden" animate="visible">
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
                  <p className="text-3xl font-bold tracking-tight">R$ {(metrics?.revenue || 0).toLocaleString("pt-BR")}</p>
                  <p className="text-[11px] text-background/50 mt-1">Operação ativa</p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {[
                      { label: "MRR", value: `R$ ${(metrics?.mrr || 0).toLocaleString("pt-BR")}` },
                      { label: "Margem", value: "100%" },
                      { label: "Ticket", value: `R$ ${(metrics?.avgTicket || 0).toLocaleString("pt-BR")}` },
                      { label: "Crescimento", value: "+0%" },
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
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum produto cadastrado.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ═══ ROW 3 — Alerts (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-12">
             <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ALERTS.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <Card key={alert.title} className="border-border bg-secondary/30">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          alert.type === "warning" ? "bg-warning/10 text-warning" : 
                          alert.type === "danger" ? "bg-destructive/10 text-destructive" : 
                          "bg-accent/10 text-accent"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[12px] font-semibold text-foreground">{alert.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-snug">{alert.desc}</p>
                          <button className="text-[10px] font-medium text-accent hover:underline">{alert.action}</button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CoreDashboard;