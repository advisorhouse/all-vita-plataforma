import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Users, TrendingUp, ShieldCheck,
  AlertTriangle, CheckCircle2, Clock, Heart,
  ArrowUpRight,
  Zap, BarChart3, Star, Activity,
  ChevronDown, ChevronUp,
  MessageSquare, Phone, Mail, Sparkles, Coins, Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import PremiumLinkWidget from "@/components/partner/PremiumLinkWidget";
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
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
  { id: "CL-002", name: "Ana Paula Costa", initials: "AC", email: "ana@email.com", phone: "(21) 99876-5432", status: "active", plan: "5 meses", activeMonths: 6, totalPoints: 3168, monthlyPoints: 528, consistencyScore: 92, engagementScore: 88, riskLevel: "low", lastLogin: "Ontem", nextPayment: "05/03", joinedDate: "Set/25", contentConsumed: 18, daysStreak: 12, nps: 9 },
  { id: "CL-003", name: "Juliana Mendes", initials: "JM", email: "juliana@email.com", phone: "(31) 97654-3210", status: "active", plan: "5 meses", activeMonths: 5, totalPoints: 2640, monthlyPoints: 528, consistencyScore: 88, engagementScore: 82, riskLevel: "low", lastLogin: "Hoje", nextPayment: "08/03", joinedDate: "Out/25", contentConsumed: 15, daysStreak: 8, nps: 8 },
  { id: "CL-004", name: "Carla Rodrigues", initials: "CR", email: "carla@email.com", phone: "(41) 96543-2109", status: "active", plan: "3 meses", activeMonths: 4, totalPoints: 1584, monthlyPoints: 396, consistencyScore: 75, engagementScore: 64, riskLevel: "medium", lastLogin: "3 dias", nextPayment: "10/03", joinedDate: "Nov/25", contentConsumed: 8, daysStreak: 3, nps: 7 },
  { id: "CL-005", name: "Fernanda Lima", initials: "FL", email: "fernanda@email.com", phone: "(51) 95432-1098", status: "active", plan: "5 meses", activeMonths: 3, totalPoints: 1584, monthlyPoints: 528, consistencyScore: 68, engagementScore: 55, riskLevel: "medium", lastLogin: "5 dias", nextPayment: "12/03", joinedDate: "Dez/25", contentConsumed: 5, daysStreak: 0, nps: 6 },
  { id: "CL-006", name: "Patrícia Dias", initials: "PD", email: "patricia@email.com", phone: "(61) 94321-0987", status: "active", plan: "3 meses", activeMonths: 2, totalPoints: 792, monthlyPoints: 396, consistencyScore: 45, engagementScore: 32, riskLevel: "high", lastLogin: "12 dias", nextPayment: "15/03", joinedDate: "Jan/26", contentConsumed: 2, daysStreak: 0, nps: null },
  { id: "CL-007", name: "Luciana Barros", initials: "LB", email: "luciana@email.com", phone: "(71) 93210-9876", status: "active", plan: "9 meses", activeMonths: 5, totalPoints: 3485, monthlyPoints: 697, consistencyScore: 94, engagementScore: 90, riskLevel: "low", lastLogin: "Hoje", nextPayment: "07/03", joinedDate: "Out/25", contentConsumed: 22, daysStreak: 15, nps: 10 },
  { id: "CL-008", name: "Beatriz Torres", initials: "BT", email: "beatriz@email.com", phone: "(81) 92109-8765", status: "active", plan: "5 meses", activeMonths: 4, totalPoints: 2112, monthlyPoints: 528, consistencyScore: 82, engagementScore: 76, riskLevel: "low", lastLogin: "Ontem", nextPayment: "09/03", joinedDate: "Nov/25", contentConsumed: 12, daysStreak: 6, nps: 8 },
  { id: "CL-009", name: "Renata Oliveira", initials: "RO", email: "renata@email.com", phone: "(91) 91098-7654", status: "active", plan: "3 meses", activeMonths: 1, totalPoints: 396, monthlyPoints: 396, consistencyScore: 60, engagementScore: 48, riskLevel: "medium", lastLogin: "7 dias", nextPayment: "18/03", joinedDate: "Fev/26", contentConsumed: 3, daysStreak: 0, nps: null },
  { id: "CL-010", name: "Camila Souza", initials: "CS", email: "camila@email.com", phone: "(11) 90987-6543", status: "paused", plan: "5 meses", activeMonths: 3, totalPoints: 1584, monthlyPoints: 0, consistencyScore: 38, engagementScore: 20, riskLevel: "high", lastLogin: "28 dias", nextPayment: "—", joinedDate: "Dez/25", contentConsumed: 4, daysStreak: 0, nps: 4 },
  { id: "CL-011", name: "Pedro Ferreira", initials: "PF", email: "pedro@email.com", phone: "(21) 89876-5432", status: "cancelled", plan: "3 meses", activeMonths: 2, totalPoints: 792, monthlyPoints: 0, consistencyScore: 22, engagementScore: 10, riskLevel: "high", lastLogin: "45 dias", nextPayment: "—", joinedDate: "Nov/25", contentConsumed: 1, daysStreak: 0, nps: 3 },
  { id: "CL-012", name: "Roberto Nunes", initials: "RN", email: "roberto@email.com", phone: "(31) 88765-4321", status: "active", plan: "3 meses", activeMonths: 1, totalPoints: 396, monthlyPoints: 396, consistencyScore: 72, engagementScore: 58, riskLevel: "low", lastLogin: "Hoje", nextPayment: "20/03", joinedDate: "Fev/26", contentConsumed: 6, daysStreak: 5, nps: null },
];

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

const RISK_DISTRIBUTION = [
  { name: "Estável", value: 32, color: "hsl(var(--accent))" },
  { name: "Atenção", value: 10, color: "hsl(var(--warning))" },
  { name: "Risco", value: 6, color: "hsl(var(--destructive))" },
];

const RETENTION_BY_PLAN = [
  { plan: "3 meses", clients: 18, retention: 82, avgMonths: 2.8, avgConsistency: 62, avgNps: 6.8, monthlyPoints: 7128, churnRate: 18 },
  { plan: "5 meses", clients: 22, retention: 94, avgMonths: 4.2, avgConsistency: 84, avgNps: 8.2, monthlyPoints: 11616, churnRate: 6 },
  { plan: "9 meses", clients: 8, retention: 98, avgMonths: 6.5, avgConsistency: 95, avgNps: 9.6, monthlyPoints: 5576, churnRate: 2 },
];

const ENGAGEMENT_INSIGHTS = [
  { metric: "Login médio semanal", value: "4.2x", trend: "+0.8", up: true, icon: Activity },
  { metric: "Conteúdos consumidos/mês", value: "8.4", trend: "+1.2", up: true, icon: Star },
  { metric: "Streak médio (dias)", value: "7.8", trend: "+2.1", up: true, icon: Zap },
  { metric: "NPS médio", value: "8.1", trend: "+0.4", up: true, icon: Heart },
];

const COHORT_DATA = [
  { cohort: "Jul/25", m1: 100, m2: 96, m3: 94, m4: 92, m5: 90, m6: 88, m7: 86, m8: 85 },
  { cohort: "Set/25", m1: 100, m2: 94, m3: 92, m4: 90, m5: 88, m6: 86, m7: null, m8: null },
  { cohort: "Nov/25", m1: 100, m2: 92, m3: 88, m4: 84, m5: null, m6: null, m7: null, m8: null },
  { cohort: "Jan/26", m1: 100, m2: 90, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null },
  { cohort: "Fev/26", m1: 100, m2: null, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null },
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

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

// removed unused PARTNER_NAME

// ─── Component ───────────────────────────────────────────────
const PartnerClients: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
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

  return (
    <TooltipProvider delayDuration={200}>
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
            <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
              <Zap className="h-3 w-3 text-warning" />
              <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
              <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
            </div>
          </div>
        </motion.div>

        {/* ═══ ROW 1 — Hero Card (8) + Side KPIs (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          {/* Hero — Accent gradient */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="relative overflow-hidden border-accent/30 shadow-sm bg-gradient-to-br from-accent via-accent/90 to-accent/70 h-full">
              <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
              <CardContent className="relative z-10 p-7 flex flex-col justify-center h-full text-accent-foreground min-h-[220px]">
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="text-[9px] font-medium bg-white/20 text-accent-foreground px-2 py-0.5 rounded-full">
                    +9 novos este mês
                  </span>
                  <span className="text-[9px] font-medium bg-white/15 text-accent-foreground px-2 py-0.5 rounded-full">
                    {activeClients} ativos
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-medium text-accent-foreground/60 uppercase tracking-wider">Visão Geral dos Pacientes</p>
                </div>
                 <h2 className="text-[22px] font-bold leading-tight">
                   Você tem {activeClients} pacientes vinculados
                 </h2>
                 <p className="text-[13px] text-accent-foreground/70 mt-1 max-w-lg">
                   {riskClients} pacientes precisam de atenção. Consistência média de <strong className="text-accent-foreground">{avgConsistency}%</strong>. Vitacoins recorrentes: <strong className="text-accent-foreground">{totalMonthlyPoints.toLocaleString("pt-BR")} pts/mês</strong>.
                </p>

                <div className="mt-5 flex gap-3">
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

          {/* Side KPIs */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
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
                        <circle cx="50" cy="50" r="42" fill="none"
                          stroke="hsl(var(--accent))"
                          strokeWidth="7" strokeLinecap="round"
                          strokeDasharray={`${(avgConsistency / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                        />
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

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
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

        {/* ═══ ROW 2 — KPI Cards ═══ */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
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

        {/* ═══ ROW 3 — Growth Chart (8) + Distributions (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
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

          <div className="col-span-12 lg:col-span-4 space-y-4">
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-[13px] font-semibold text-foreground">Por Plano</h3>
                  <div className="flex items-center justify-center py-2">
                    <div className="w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={PLAN_DISTRIBUTION} cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={3} dataKey="value" strokeWidth={0}>
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

            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-[13px] font-semibold text-foreground">Por Risco</h3>
                  <div className="space-y-2">
                    {RISK_DISTRIBUTION.map((r) => (
                      <div key={r.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                            <span className="text-[11px] text-muted-foreground">{r.name}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-foreground">{r.value}</span>
                        </div>
                        <Progress value={(r.value / 48) * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ═══ ROW 4 — Retention by Plan Table ═══ */}
        <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-[15px] font-semibold text-foreground">Análise por Plano</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                       {["Plano", "Pacientes", "Retenção", "Meses Médio", "Consistência", "NPS", "Pts/Mês", "Churn"].map((h) => (
                         <th key={h} className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium py-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RETENTION_BY_PLAN.map((row) => (
                      <tr key={row.plan} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4 text-[13px] font-medium text-foreground">{row.plan}</td>
                        <td className="py-3 pr-4 text-[13px] text-foreground">{row.clients}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Progress value={row.retention} className="h-1 w-12" />
                            <span className="text-[12px] text-foreground">{row.retention}%</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-[13px] text-foreground">{row.avgMonths}</td>
                        <td className="py-3 pr-4 text-[13px] text-foreground">{row.avgConsistency}%</td>
                        <td className="py-3 pr-4 text-[13px] text-foreground">{row.avgNps}</td>
                        <td className="py-3 pr-4 text-[13px] font-semibold text-accent">{row.monthlyPoints.toLocaleString("pt-BR")} pts</td>
                        <td className="py-3 pr-4">
                          <span className={cn(
                            "text-[11px] font-medium px-2 py-0.5 rounded-full",
                            row.churnRate <= 5 ? "bg-accent/10 text-accent" : row.churnRate <= 10 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                          )}>
                            {row.churnRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ ROW 5 — Cohort Table ═══ */}
        <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Tabela de Cohort</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Retenção por mês de aquisição</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-[10px] text-muted-foreground uppercase font-medium py-1.5 text-left pr-3">Cohort</th>
                      {["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"].map((m) => (
                        <th key={m} className="text-[10px] text-muted-foreground uppercase font-medium py-1.5 px-2">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COHORT_DATA.map((row) => (
                      <tr key={row.cohort} className="border-b border-border/30 last:border-0">
                        <td className="text-[11px] text-foreground font-medium py-1.5 text-left pr-3">{row.cohort}</td>
                        {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6, row.m7, row.m8].map((v, i) => (
                          <td key={i} className="py-1.5 px-2">
                            {v !== null ? (
                              <span className={cn(
                                "text-[11px] font-medium px-2 py-0.5 rounded-full",
                                v >= 90 ? "bg-accent/10 text-accent" : v >= 80 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                              )}>
                                {v}%
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground/30">—</span>
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

        {/* ═══ ROW 6 — Client List ═══ */}
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

        {/* ═══ ROW 7 — Insight ═══ */}
        <motion.div custom={11} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm bg-accent/5">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <h3 className="text-[13px] font-semibold text-foreground">Insight da Semana</h3>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Clientes com consistência acima de 80% têm <strong className="text-foreground">3x menos chance</strong> de cancelamento.
                Foque em engajar Carla R., Fernanda L. e Patrícia D. — um simples "como vai sua rotina?" pode fazer toda a diferença.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default PartnerClients;
