import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, ClipboardList, Users, TrendingUp, Coins,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  MessageSquare, Phone, Mail, Eye, Info, Share2,
  ShieldCheck, ArrowUpRight, Sparkles, Activity, Star, Zap, Heart, BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import PremiumLinkWidget from "@/components/partner/PremiumLinkWidget";
import ClientDetailView from "@/components/partner/ClientDetailView";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const } }),
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipUI>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-muted-foreground/40">
          <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
        </svg>
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </TooltipUI>
);

// ─── Data ────────────────────────────────────────────────────
type RiskLevel = "low" | "medium" | "high";
type ClientStatus = "active" | "paused" | "cancelled";
type FilterType = "all" | "active" | "attention" | "risk" | "new" | "cancelled";

interface Client {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  status: ClientStatus;
  plan: string;
  activeMonths: number;
  totalPoints: number;
  monthlyPoints: number;
  consistencyScore: number;
  engagementScore: number;
  riskLevel: RiskLevel;
  lastLogin: string;
  nextPayment: string;
  joinedDate: string;
  contentConsumed: number;
  daysStreak: number;
  nps: number | null;
}

const CLIENTS: Client[] = [
  { id: "CL-001", name: "Maria Silva", initials: "MS", email: "maria@email.com", phone: "(11) 98765-4321", status: "active", plan: "9 meses", activeMonths: 8, totalPoints: 5580, monthlyPoints: 697, consistencyScore: 96, engagementScore: 92, riskLevel: "low", lastLogin: "Hoje", nextPayment: "03/03", joinedDate: "Jul/25", contentConsumed: 24, daysStreak: 18, nps: 10 },
];

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-accent/10 text-accent" },
  paused: { label: "Pausado", className: "bg-warning/10 text-warning" },
  cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
};

const riskConfig: Record<RiskLevel, { label: string; icon: React.ElementType; className: string }> = {
  low: { label: "Estável", icon: CheckCircle2, className: "bg-accent/10 text-accent" },
  medium: { label: "Atenção", icon: AlertTriangle, className: "bg-warning/10 text-warning" },
  high: { label: "Risco", icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
};

// removed unused PARTNER_NAME

const GROWTH_DATA = [
  { month: "Set", ativos: 18, novos: 6, cancelados: 1 },
  { month: "Out", ativos: 24, novos: 8, cancelados: 2 },
  { month: "Nov", ativos: 30, novos: 9, cancelados: 3 },
  { month: "Dez", ativos: 36, novos: 10, cancelados: 4 },
  { month: "Jan", ativos: 42, novos: 11, cancelados: 5 },
  { month: "Fev", ativos: 48, novos: 9, cancelados: 3 },
];

const PLAN_DISTRIBUTION = [
  { name: "3 meses", value: 18, color: "hsl(var(--muted-foreground))" },
  { name: "5 meses", value: 22, color: "hsl(217, 91%, 60%)" },
  { name: "9 meses", value: 8, color: "hsl(var(--accent))" },
];

const ENGAGEMENT_INSIGHTS = [
  { metric: "Login médio semanal", value: "4.2x", trend: "+0.8", up: true, icon: Activity },
  { metric: "Conteúdos consumidos/mês", value: "8.4", trend: "+1.2", up: true, icon: Star },
  { metric: "Streak médio (dias)", value: "7.8", trend: "+2.1", up: true, icon: Zap },
  { metric: "NPS médio", value: "8.1", trend: "+0.4", up: true, icon: Heart },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

// ─── Component ───────────────────────────────────────────────
const PartnerClients: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClient, setExpandedClient] = useState<string | null>(null); const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);
  const { currentTenant } = useTenant();
  const { user } = useAuth();

  const { data: partnerData } = useQuery({
    queryKey: ["partner-link-data", currentTenant?.id, user?.id],
    queryFn: async () => {
      if (!currentTenant?.id || !user?.id) return null;
      const { data } = await supabase
        .from("partners")
        .select("referral_code")
        .eq("user_id", user.id)
        .eq("tenant_id", currentTenant.id)
        .single();
      return data;
    },
    enabled: !!currentTenant?.id && !!user?.id
  });

  const activeClients = CLIENTS.filter((c) => c.status === "active").length;
  const riskClients = CLIENTS.filter((c) => c.riskLevel === "high").length;
  const avgConsistency = Math.round(CLIENTS.filter((c) => c.status === "active").reduce((a, c) => a + c.consistencyScore, 0) / activeClients);
  const totalMonthlyPoints = CLIENTS.filter((c) => c.status === "active").reduce((a, c) => a + c.monthlyPoints, 0);

  const filtered = CLIENTS.filter((c) => {
    const matchFilter =
      filter === "all" ||
      (filter === "active" && c.status === "active" && c.riskLevel === "low") ||
      (filter === "attention" && c.riskLevel === "medium") ||
      (filter === "risk" && c.riskLevel === "high") ||
      (filter === "new" && c.activeMonths <= 1) ||
      (filter === "cancelled" && (c.status === "cancelled" || c.status === "paused"));
    const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (selectedClientForDetail) { return <ClientDetailView client={selectedClientForDetail} onBack={() => setSelectedClientForDetail(null)} />; } return ( <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* ═══ Header ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-foreground">Meus Pacientes</h1>
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                  {activeClients} vinculados
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Panorama completo dos seus pacientes vinculados e desempenho.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
                <Info className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
                <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 h-9 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Share2 className="h-3.5 w-3.5" />
                    Compartilhar Canal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl p-0 bg-transparent border-0 shadow-none">
                  <PremiumLinkWidget
                    referralCode={partnerData?.referral_code}
                    tenantLogo={currentTenant?.logo_url}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* ═══ KPIs Topo (Funil de Aquisição) ═══ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: ClipboardList, value: "87", label: "Quiz Preenchidos", tip: "Total de quizzes preenchidos via seu link exclusivo.", accent: false },
              { icon: Users, value: activeClients.toString(), label: "Pacientes Vinculados", tip: "Pacientes ativos vinculados a você.", accent: false },
              { icon: TrendingUp, value: "55%", label: "Taxa de Conversão", tip: "Percentual de quizzes que viraram paciente ativo.", accent: false },
              { icon: Coins, value: "12.480", label: "Vitacoins Gerados", tip: "Total de Vitacoins acumulados pela atividade dos pacientes.", accent: true },
            ].map(({ icon: Icon, value, label, tip, accent }) => (
              <Card key={label} className={cn("shadow-sm", accent ? "border-accent/30 bg-accent/5" : "border-border bg-card")}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", accent ? "bg-accent/15" : "bg-secondary")}>
                      <Icon className={cn("h-4 w-4", accent ? "text-accent" : "text-foreground")} strokeWidth={1.5} />
                    </div>
                    <Tip text={tip} />
                  </div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ Hero Card (8) + Side KPIs (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="relative overflow-hidden border-accent/30 shadow-sm bg-gradient-to-br from-accent via-accent/90 to-accent/70 h-full">
              <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
              <CardContent className="relative z-10 p-7 flex flex-col justify-center h-full text-accent-foreground min-h-[220px]">
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="text-[9px] font-medium bg-white/20 px-2 py-0.5 rounded-full">+9 novos este mês</span>
                  <span className="text-[9px] font-medium bg-white/15 px-2 py-0.5 rounded-full">{activeClients} ativos</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-medium text-accent-foreground/60 uppercase tracking-wider">Visão Geral dos Pacientes</p>
                </div>
                <h2 className="text-[22px] font-bold leading-tight">Você tem {activeClients} pacientes vinculados</h2>
                <p className="text-[13px] text-accent-foreground/70 mt-1 max-w-lg">
                  {riskClients} pacientes precisam de atenção. Consistência média de <strong className="text-accent-foreground">{avgConsistency}%</strong>. Vitacoins recorrentes: <strong className="text-accent-foreground">{totalMonthlyPoints.toLocaleString("pt-BR")} pts/mês</strong>.
                </p>
                <div className="mt-5 flex gap-3 flex-wrap">
                  {[
                    { label: "Estável", count: CLIENTS.filter((c) => c.riskLevel === "low" && c.status === "active").length, cls: "bg-white/20" },
                    { label: "Atenção", count: CLIENTS.filter((c) => c.riskLevel === "medium").length, cls: "bg-warning/40" },
                    { label: "Risco", count: riskClients, cls: "bg-destructive/40" },
                  ].map(({ label, count, cls }) => (
                    <span key={label} className={cn("text-[11px] font-semibold px-3 py-1.5 rounded-full", cls)}>
                      {count} {label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
              <Card className="border-border shadow-sm h-full bg-foreground">
                <CardContent className="p-4 flex flex-col justify-center h-full gap-1 text-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <h3 className="text-[12px] font-semibold">Saúde dos Pacientes</h3>
                    </div>
                    <Tip text="Média de consistência de todos os seus pacientes ativos." />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="relative w-16 h-16">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsla(0,0%,100%,0.15)" strokeWidth="7" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="7" strokeLinecap="round"
                          strokeDasharray={`${(avgConsistency / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">{avgConsistency}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-background/60">Consistência média</p>
                      <div className="flex items-center gap-1 text-accent">
                        <ArrowUpRight className="h-3 w-3" />
                        <span className="text-[11px] font-semibold">+3% vs mês anterior</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
              <Card className="border-accent/20 shadow-sm h-full bg-accent/5">
                <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    <h3 className="text-[12px] font-semibold text-foreground">Destaques do Mês</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Retenção geral", value: "91.6%" },
                      { label: "NPS médio", value: "8.1" },
                      { label: "Melhor streak", value: "18 dias (Maria S.)" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">{label}</span>
                        <span className="text-[12px] font-bold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ═══ Engajamento KPIs ═══ */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ENGAGEMENT_INSIGHTS.map(({ metric, value, trend, up, icon: Icon }) => (
              <Card key={metric} className="border-border shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                    </div>
                    <span className={cn("text-[11px] font-semibold", up ? "text-accent" : "text-destructive")}>
                      {up ? "+" : ""}{trend}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{metric}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ Evolução (8) + Distribuição Plano (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Evolução da Carteira</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Pacientes ativos, novos e cancelados por mês</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {[
                      { label: "Ativos", color: "hsl(var(--accent))" },
                      { label: "Novos", color: "hsl(217, 91%, 60%)" },
                      { label: "Cancelados", color: "hsl(var(--destructive))" },
                    ].map(({ label, color }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={GROWTH_DATA} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <RTooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="ativos" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="novos" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cancelados" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-4">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-[13px] font-semibold text-foreground">Por Plano</h3>
                <div className="flex items-center justify-center py-2">
                  <div className="w-28 h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={PLAN_DISTRIBUTION} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {PLAN_DISTRIBUTION.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {PLAN_DISTRIBUTION.map((p) => (
                    <div key={p.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-[11px] text-muted-foreground">{p.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">{p.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">Lista de Pacientes</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{filtered.length} pacientes • Clique para expandir</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-[13px] rounded-xl"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {([
                { id: "all" as const, label: "Todos" },
                { id: "active" as const, label: "Estáveis" },
                { id: "attention" as const, label: "Atenção" },
                { id: "risk" as const, label: "Risco" },
                { id: "new" as const, label: "Novos" },
                { id: "cancelled" as const, label: "Inativos" },
              ]).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                    filter === id ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Client rows */}
          <div className="space-y-2">
            {filtered.map((client) => {
              const risk = riskConfig[client.riskLevel];
              const status = statusConfig[client.status];
              const RiskIcon = risk.icon;
              const isExpanded = expandedClient === client.id;

              return (
                <Card key={client.id} className="border-border shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                    className="w-full text-left"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-foreground shrink-0">
                          {client.initials}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold text-foreground truncate">{client.name}</p>
                            <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0", status.className)}>
                              {status.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded shrink-0">
                              {client.plan}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {client.activeMonths} {client.activeMonths === 1 ? "mês" : "meses"} • Desde {client.joinedDate} • Último login: {client.lastLogin}
                          </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Consistência</p>
                            <div className="flex items-center gap-1.5">
                              <Progress value={client.consistencyScore} className="h-1 w-12" />
                              <span className="text-[11px] font-medium text-foreground">{client.consistencyScore}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Pts/mês</p>
                            <p className="text-[12px] font-semibold text-accent">{client.monthlyPoints > 0 ? `${client.monthlyPoints} pts` : "—"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Próx. pag.</p>
                            <p className="text-[11px] text-foreground">{client.nextPayment}</p>
                          </div>
                        </div>

                        <div className={cn("flex h-6 items-center rounded-full px-2 text-[10px] font-medium shrink-0", risk.className)}>
                          <RiskIcon className="h-3 w-3 mr-1" />
                          {risk.label}
                        </div>

                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                      </div>
                    </CardContent>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Contato</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[12px] text-foreground">
                              <Mail className="h-3 w-3 text-muted-foreground" /> {client.email}
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-foreground">
                              <Phone className="h-3 w-3 text-muted-foreground" /> {client.phone}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Engajamento</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Conteúdos</span>
                              <span className="text-[12px] font-medium text-foreground">{client.contentConsumed}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Streak</span>
                              <span className="text-[12px] font-medium text-foreground">{client.daysStreak} dias</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Engajamento</span>
                              <span className="text-[12px] font-medium text-foreground">{client.engagementScore}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Vitacoins</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Total acumulado</span>
                              <span className="text-[12px] font-medium text-accent">{client.totalPoints.toLocaleString("pt-BR")} pts</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Pts/mês</span>
                              <span className="text-[12px] font-medium text-foreground">{client.monthlyPoints > 0 ? `${client.monthlyPoints} pts` : "—"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">NPS</span>
                              <span className="text-[12px] font-medium text-foreground">{client.nps ?? "—"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Ações</p>
                          <div className="space-y-1.5">
                            <Button variant="outline" size="sm" className="w-full text-[11px] h-8 rounded-lg gap-1.5 justify-start">
                              <MessageSquare className="h-3 w-3" /> Enviar mensagem
                            </Button>
                            <Button variant="outline" size="sm" className="w-full text-[11px] h-8 rounded-lg gap-1.5 justify-start">
                              <Eye className="h-3 w-3" /> Ver perfil completo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Card>
              );
            })}
          </div>
        </motion.div>

      </div>
    </TooltipProvider>
  );
};

export default PartnerClients;
