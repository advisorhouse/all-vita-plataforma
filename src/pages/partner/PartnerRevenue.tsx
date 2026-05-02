import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Users, ArrowUpRight,
  Clock, Heart, AlertTriangle, CheckCircle2, Minus, Calculator,
  Calendar, Zap, Award, Repeat, ChevronRight,
  Wallet, Target, Sparkles, Coins,
  ShieldCheck, BarChart3, Eye, Info, Gift,
  ShoppingBag, GraduationCap, Smartphone, X, ArrowRight, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useCurrentPartner } from "@/hooks/useCurrentPartner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const } }),
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipUI>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <Info className="h-3.5 w-3.5 text-muted-foreground/40" />
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </TooltipUI>
);

// ─── Data ────────────────────────────────────────────────────
const REVENUE_MONTHLY = [
  { month: "Set", total: 4200, inicial: 1800, recorrente: 1900, bonus: 500 },
  { month: "Out", total: 5800, inicial: 2200, recorrente: 2800, bonus: 800 },
  { month: "Nov", total: 7100, inicial: 2400, recorrente: 3500, bonus: 1200 },
  { month: "Dez", total: 6400, inicial: 1800, recorrente: 3600, bonus: 1000 },
  { month: "Jan", total: 9200, inicial: 2800, recorrente: 4800, bonus: 1600 },
  { month: "Fev", total: 12480, inicial: 3200, recorrente: 7080, bonus: 2200 },
];

const COMMISSION_BY_PLAN = [
  { plan: "3 meses", clients: 18, revenue: 5346, points: 2138, avgTicket: 297, retention: 82 },
  { plan: "5 meses", clients: 22, revenue: 9834, points: 5900, avgTicket: 447, retention: 94 },
  { plan: "9 meses", clients: 8, revenue: 5576, points: 3902, avgTicket: 697, retention: 98 },
];

const PLAN_PIE = [
  { name: "3 meses", value: 2138, color: "hsl(var(--muted-foreground))" },
  { name: "5 meses", value: 5900, color: "hsl(217, 91%, 60%)" },
  { name: "9 meses", value: 3902, color: "hsl(var(--accent))" },
];

const RETENTION_COHORT = [
  { cohort: "Set/25", m1: 100, m2: 92, m3: 88, m4: 84, m5: 80, m6: 78 },
  { cohort: "Out/25", m1: 100, m2: 94, m3: 90, m4: 86, m5: 82, m6: null },
  { cohort: "Nov/25", m1: 100, m2: 96, m3: 92, m4: 88, m5: null, m6: null },
  { cohort: "Dez/25", m1: 100, m2: 95, m3: 91, m4: null, m5: null, m6: null },
  { cohort: "Jan/26", m1: 100, m2: 94, m3: null, m4: null, m5: null, m6: null },
  { cohort: "Fev/26", m1: 100, m2: null, m3: null, m4: null, m5: null, m6: null },
];

const CLIENTS_LIST = [
  { name: "Maria S.", plan: "9 meses", months: 6, consistency: 96, risk: "low", points: "836 pts", nextPayment: "03/03" },
  { name: "Ana P.", plan: "5 meses", months: 5, consistency: 92, risk: "low", points: "447 pts", nextPayment: "05/03" },
  { name: "Juliana M.", plan: "5 meses", months: 4, consistency: 88, risk: "low", points: "447 pts", nextPayment: "08/03" },
  { name: "Carla R.", plan: "3 meses", months: 3, consistency: 75, risk: "medium", points: "297 pts", nextPayment: "10/03" },
  { name: "Fernanda L.", plan: "5 meses", months: 2, consistency: 68, risk: "medium", points: "447 pts", nextPayment: "12/03" },
  { name: "Patrícia D.", plan: "3 meses", months: 1, consistency: 45, risk: "high", points: "297 pts", nextPayment: "15/03" },
  { name: "Luciana B.", plan: "9 meses", months: 4, consistency: 94, risk: "low", points: "697 pts", nextPayment: "07/03" },
  { name: "Beatriz T.", plan: "5 meses", months: 3, consistency: 82, risk: "low", points: "447 pts", nextPayment: "09/03" },
];

const PROJECTION_MONTHS = [
  { month: "Mar/26", conservative: 13200, optimistic: 15400 },
  { month: "Abr/26", conservative: 14100, optimistic: 17200 },
  { month: "Mai/26", conservative: 15000, optimistic: 19600 },
];

const BONUS_TIMELINE = [
  { label: "Bônus 6 meses", clients: 6, value: "1.800 pts", status: "unlocked" },
  { label: "Bônus 12 meses", clients: 2, value: "1.200 pts", status: "partial" },
  { label: "Bônus Platina", clients: 0, value: "3.000 pts", status: "locked" },
];

const PAYMENT_HISTORY = [
  { date: "15/02/26", value: "12.480 pts", status: "Resgatado", method: "Cupom Loja" },
  { date: "15/01/26", value: "9.200 pts", status: "Resgatado", method: "Pix" },
  { date: "15/12/25", value: "6.400 pts", status: "Resgatado", method: "Cupom Loja" },
  { date: "15/11/25", value: "7.100 pts", status: "Resgatado", method: "Pix" },
  { date: "15/10/25", value: "5.800 pts", status: "Resgatado", method: "Pix" },
];

// ─── Wallet Data ─────────────────────────────────────────────
const WALLET = {
  pending: 3_420,
  available: 8_280,
  expired: 780,
  total: 48_232,
  conversionRate: 0.03, // 1 pt = R$ 0.03
};

const REDEMPTION_OPTIONS = [
  {
    id: "pix",
    icon: Smartphone,
    label: "Pix",
    description: "Resgate em dinheiro direto na sua conta. Valor mínimo: R$ 1.000. Saldo abaixo fica acumulando até atingir o mínimo.",
    minPoints: 33334,
    conversionLabel: "1 pt = R$ 0,03 · Mín. R$ 1.000",
    badge: null,
  },
  {
    id: "store",
    icon: ShoppingBag,
    label: "Loja VisionLift",
    description: "Produtos premium com desconto especial",
    minPoints: 500,
    conversionLabel: "1 pt = R$ 0,05 em produtos",
    badge: "Melhor valor",
  },
  {
    id: "courses",
    icon: GraduationCap,
    label: "Cursos & Congressos",
    description: "Acesso a formações e eventos exclusivos",
    minPoints: 2000,
    conversionLabel: "Valor fixo por curso",
    badge: null,
  },
  {
    id: "equipment",
    icon: Eye,
    label: "Equipamentos Médicos",
    description: "Parceiros certificados para equipamentos",
    minPoints: 5000,
    conversionLabel: "Catálogo especial",
    badge: "Novo",
  },
];

// ─── Component ───────────────────────────────────────────────
const PartnerRevenue: React.FC = () => {
  const { data: partner, isLoading: loadingPartner } = useCurrentPartner();
  const { toast } = useToast();
  const [simNewClients, setSimNewClients] = useState([5]);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [redeemAmount, setRedeemAmount] = useState([1000]);
  const [redeemStep, setRedeemStep] = useState<"choose" | "confirm" | "success">("choose");

  const { data: wallet } = useQuery({
    queryKey: ["partner-wallet", partner?.id],
    queryFn: async () => {
      if (!partner?.id) return null;
      const { data } = await supabase
        .from("vitacoins_wallet")
        .select("*")
        .eq("user_id", partner.user_id)
        .eq("tenant_id", partner.tenant_id)
        .maybeSingle();
      return data;
    },
    enabled: !!partner?.id
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["partner-transactions", partner?.id],
    queryFn: async () => {
      if (!partner?.id) return [];
      const { data } = await supabase
        .from("vitacoin_transactions")
        .select("*")
        .eq("user_id", partner.user_id)
        .eq("tenant_id", partner.tenant_id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!partner?.id
  });

  const { data: stats } = useQuery({
    queryKey: ["partner-revenue-stats", partner?.id],
    queryFn: async () => {
      if (!partner?.id) return null;
      // Get monthly totals for chart (simulated for now based on actual data if exists)
      return REVENUE_MONTHLY; 
    },
    enabled: !!partner?.id
  });

  const availablePoints = Number(wallet?.balance || 0);
  const totalEarnedPoints = Number(wallet?.total_earned || 0);
  const conversionRate = 0.03; 

  const avgTicket = 420;
  const commissionRate = 0.15;
  const retentionRate = 0.91;


  const simulate = (months: number) => {
    let total = 48;
    let revenue = 0;
    for (let i = 0; i < months; i++) {
      total = Math.round(total * retentionRate) + simNewClients[0];
      revenue += total * avgTicket * commissionRate;
    }
    return revenue;
  };

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  const handleRedeem = () => {
    setRedeemStep("success");
    toast({ title: "Resgate solicitado!", description: "Seu resgate será processado em até 48h." });
  };

  const closeRedeemModal = () => {
    setShowRedeemModal(false);
    setSelectedOption(null);
    setRedeemStep("choose");
    setRedeemAmount([1000]);
  };

  const selectedRedemption = REDEMPTION_OPTIONS.find(o => o.id === selectedOption);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* ═══ ROW 0 — Standardized Header ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-foreground">Meus Vitacoins</h1>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {availablePoints.toLocaleString("pt-BR")} pts disponíveis
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Acompanhe seus pontos, resgate recompensas e veja o impacto da sua dedicação.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
              <Zap className="h-3 w-3 text-warning" />
              <p className="text-[10px] text-muted-foreground">
                Vínculo: <span className="font-semibold text-foreground">Último Quiz</span>
              </p>
              <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
            </div>
          </div>
        </motion.div>

        {/* ═══ ROW 0.5 — Wallet States ═══ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pending */}
            <Card className="border-warning/20 bg-warning/5 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <h3 className="text-[12px] font-semibold text-foreground">Pendentes</h3>
                  </div>
                  <Tip text="Pontos em período de carência de 30 dias após a venda. Serão liberados automaticamente." />
                </div>
                <p className="text-2xl font-bold text-foreground">{(wallet?.total_earned || 0).toLocaleString("pt-BR")} pts</p>
                <p className="text-[10px] text-muted-foreground">≈ R$ {(Number(wallet?.total_earned || 0) * conversionRate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <Progress value={70} className="h-1 mt-1" />
                <p className="text-[9px] text-muted-foreground">Liberação: ~15/Mar</p>
              </CardContent>
            </Card>

            {/* Available */}
            <Card className="border-accent/30 bg-accent/5 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <h3 className="text-[12px] font-semibold text-foreground">Liberados</h3>
                  </div>
                  <Tip text="Pontos disponíveis para resgate imediato via Pix, produtos, cursos ou equipamentos." />
                </div>
                <p className="text-2xl font-bold text-accent">{availablePoints.toLocaleString("pt-BR")} pts</p>
                <p className="text-[10px] text-muted-foreground">≈ R$ {(availablePoints * conversionRate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <Button
                  size="sm"
                  className="w-full mt-2 text-[11px] h-8"
                  onClick={() => setShowRedeemModal(true)}
                >
                  <Gift className="h-3 w-3 mr-1.5" /> Resgatar pontos
                </Button>
              </CardContent>
            </Card>

            {/* Expired */}
            <Card className="border-border bg-secondary/20 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-[12px] font-semibold text-foreground">Expirados</h3>
                  </div>
                  <Tip text="Pontos que expiraram após 2 anos sem resgate. Resgate regularmente para evitar perda." />
                </div>
                <p className="text-2xl font-bold text-muted-foreground">0 pts</p>
                <p className="text-[10px] text-muted-foreground">Validade: 2 anos</p>
                <p className="text-[9px] text-destructive mt-1">Dica: resgate antes de expirar!</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* ═══ ROW 1 — Hero Card (8) + Side KPIs (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          {/* Hero — Earnings summary */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="relative overflow-hidden border-accent/30 shadow-sm bg-gradient-to-br from-accent via-accent/90 to-accent/70 h-full">
              <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
              <CardContent className="relative z-10 p-7 flex flex-col justify-center h-full text-accent-foreground min-h-[220px]">
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="text-[9px] font-medium bg-white/20 text-accent-foreground px-2 py-0.5 rounded-full">
                    +18% vs mês anterior
                  </span>
                  <span className="text-[9px] font-medium bg-white/15 text-accent-foreground px-2 py-0.5 rounded-full">
                    48 pacientes ativos
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <Coins className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-medium text-accent-foreground/60 uppercase tracking-wider">Vitacoins do Mês</p>
                </div>
                <h2 className="text-4xl font-bold leading-tight">12.480 pts</h2>
                <p className="text-[13px] text-accent-foreground/70 mt-1 max-w-lg">
                  Seus pontos recorrentes cresceram <strong className="text-accent-foreground">12%</strong> este mês. Continue assim — cada paciente retido gera pontos contínuos.
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { label: "Pontos Iniciais", value: "3.200 pts", icon: Zap },
                    { label: "Recorrentes", value: "7.080 pts", icon: Repeat },
                    { label: "Bônus", value: "2.200 pts", icon: Award },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl bg-white/10 p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3 w-3 text-accent-foreground/60" />
                        <p className="text-[9px] text-accent-foreground/60 uppercase tracking-wider">{label}</p>
                      </div>
                      <p className="text-base font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Side KPIs */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
              <Card className="border-border shadow-sm h-full bg-foreground">
                <CardContent className="p-4 flex flex-col justify-center h-full gap-1 text-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <h3 className="text-[12px] font-semibold">Acumulado Total</h3>
                    </div>
                    <Tip text="Total de Vitacoins acumulados desde o início da sua parceria." />
                  </div>
                  <p className="text-2xl font-bold">{totalEarnedPoints.toLocaleString("pt-BR")} pts</p>
                  <div className="flex items-center gap-1 text-accent">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-semibold">6 meses de parceria</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 rounded-lg bg-background/10 p-2">
                      <p className="text-[9px] text-background/50 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" /> Conversão
                      </p>
                      <p className="text-sm font-bold mt-0.5">1 pt = R$ 0,03</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-background/10 p-2">
                      <p className="text-[9px] text-background/50 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="h-2.5 w-2.5" /> Retenção
                      </p>
                      <p className="text-sm font-bold mt-0.5">91%</p>
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
                      { label: "Maior pontuação", value: "836 pts (Maria S.)" },
                      { label: "Plano campeão", value: "5 meses (22 pac.)" },
                      { label: "Bônus desbloqueado", value: "1.800 pts (6M)" },
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

        {/* ═══ ROW 2 — Revenue Evolution (8) + Commission by Plan Pie (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Evolução de Vitacoins</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Detalhamento por tipo de pontuação</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {[
                      { label: "Inicial", color: "hsl(var(--muted-foreground))" },
                      { label: "Recorrente", color: "hsl(217, 91%, 60%)" },
                      { label: "Bônus", color: "hsl(var(--accent))" },
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
                    <BarChart data={REVENUE_MONTHLY} barGap={1}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString("pt-BR")} pts`, ""]} />
                      <Bar dataKey="inicial" stackId="a" fill="hsl(var(--muted-foreground))" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="recorrente" stackId="a" fill="hsl(217, 91%, 60%)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="bonus" stackId="a" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-4">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <h3 className="text-[15px] font-semibold text-foreground">Pontos por Plano</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Total: 11.940 pts</p>
                <div className="flex-1 flex items-center justify-center py-4">
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={PLAN_PIE} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {PLAN_PIE.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString("pt-BR")} pts`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {PLAN_PIE.map((p) => (
                    <div key={p.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-[12px] text-muted-foreground">{p.name}</span>
                      </div>
                      <span className="text-[12px] font-semibold text-foreground">{p.value.toLocaleString("pt-BR")} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══ ROW 3 — Detalhamento por Plano ═══ */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-[15px] font-semibold text-foreground">Detalhamento por Plano</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      {["Plano", "Pacientes", "Ticket Médio", "Receita Gerada", "Vitacoins", "Retenção"].map((h) => (
                        <th key={h} className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium py-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMMISSION_BY_PLAN.map((row) => (
                      <tr key={row.plan} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4">
                          <span className="text-[13px] font-medium text-foreground">{row.plan}</span>
                        </td>
                        <td className="py-3 pr-4 text-[13px] text-foreground">{row.clients}</td>
                        <td className="py-3 pr-4 text-[13px] text-foreground">R$ {row.avgTicket}</td>
                        <td className="py-3 pr-4 text-[13px] text-foreground">R$ {row.revenue.toLocaleString("pt-BR")}</td>
                        <td className="py-3 pr-4 text-[13px] font-semibold text-accent">{row.points.toLocaleString("pt-BR")} pts</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Progress value={row.retention} className="h-1 w-16" />
                            <span className="text-[12px] text-muted-foreground">{row.retention}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-muted-foreground italic">
                Pacientes no plano de 9 meses geram 82% mais Vitacoins ao longo da jornada.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ ROW 4 — Retention Health (8) + Bonus Timeline (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Saúde da Retenção</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Quanto mais longa a jornada, mais Vitacoins recorrentes você acumula.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/60 rounded-lg px-3 py-1.5">
                    <Heart className="h-3.5 w-3.5 text-accent" />
                    <span className="text-[12px] font-semibold text-foreground">Score: 82</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Retenção 30 dias", value: 96 },
                    { label: "Retenção 3 meses", value: 91 },
                    { label: "Retenção 6 meses", value: 78 },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
                          <circle cx="50" cy="50" r="42" fill="none"
                            stroke={value >= 90 ? "hsl(var(--accent))" : value >= 80 ? "hsl(217, 91%, 60%)" : "hsl(var(--warning))"}
                            strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${(value / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-foreground">{value}%</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground text-center">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Cohort table */}
                <div className="pt-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Tabela de Cohort</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-[10px] text-muted-foreground uppercase font-medium py-1.5 text-left pr-3">Cohort</th>
                          {["M1", "M2", "M3", "M4", "M5", "M6"].map((m) => (
                            <th key={m} className="text-[10px] text-muted-foreground uppercase font-medium py-1.5 px-2">{m}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {RETENTION_COHORT.map((row) => (
                          <tr key={row.cohort} className="border-b border-border/30 last:border-0">
                            <td className="text-[11px] text-foreground font-medium py-1.5 text-left pr-3">{row.cohort}</td>
                            {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map((v, i) => (
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
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bonus timeline + Insight */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-accent" />
                    <h3 className="text-[15px] font-semibold text-foreground">Bônus por Retenção</h3>
                  </div>
                  <div className="space-y-3">
                    {BONUS_TIMELINE.map((b) => (
                      <div key={b.label} className={cn(
                        "rounded-xl border p-3 space-y-1.5",
                        b.status === "unlocked" ? "border-accent/30 bg-accent/5" : b.status === "partial" ? "border-warning/30 bg-warning/5" : "border-border bg-card"
                      )}>
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-medium text-foreground">{b.label}</p>
                          {b.status === "unlocked" && <CheckCircle2 className="h-4 w-4 text-accent" />}
                          {b.status === "partial" && <Clock className="h-4 w-4 text-warning" />}
                          {b.status === "locked" && <Minus className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground">{b.clients} pacientes elegíveis</p>
                          <p className="text-[13px] font-semibold text-foreground">{b.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border shadow-sm bg-accent/5">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <h3 className="text-[12px] font-semibold text-foreground">Insight</h3>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Se 3 pacientes do plano de 3 meses migrarem para o de 5, seus Vitacoins recorrentes aumentariam 450 pts/mês.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ═══ ROW 5 — Client Portfolio ═══ */}
        <motion.div custom={11} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-semibold text-foreground">Carteira de Pacientes</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">48 pacientes • Visão detalhada</p>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { label: "Estável", count: 5, color: "bg-accent/10 text-accent" },
                    { label: "Atenção", count: 2, color: "bg-warning/10 text-warning" },
                    { label: "Risco", count: 1, color: "bg-destructive/10 text-destructive" },
                  ].map(({ label, count, color }) => (
                    <span key={label} className={cn("text-[10px] font-medium px-2 py-1 rounded-full", color)}>
                      {count} {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {CLIENTS_LIST.map((c) => (
                  <div key={c.name} className="flex items-center gap-3 rounded-xl border border-border/50 p-3 hover:bg-secondary/20 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground shrink-0">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-foreground truncate">{c.name}</p>
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{c.plan}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{c.months} {c.months === 1 ? "mês" : "meses"} ativo</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Consistência</p>
                        <div className="flex items-center gap-1.5">
                          <Progress value={c.consistency} className="h-1 w-12" />
                          <span className="text-[11px] font-medium text-foreground">{c.consistency}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Vitacoins</p>
                        <p className="text-[12px] font-semibold text-accent">{c.points}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Próximo pag.</p>
                        <p className="text-[11px] text-foreground">{c.nextPayment}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex h-6 items-center rounded-full px-2 text-[10px] font-medium shrink-0",
                      c.risk === "low" && "bg-accent/10 text-accent",
                      c.risk === "medium" && "bg-warning/10 text-warning",
                      c.risk === "high" && "bg-destructive/10 text-destructive",
                    )}>
                      {c.risk === "low" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {c.risk === "medium" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {c.risk === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {c.risk === "low" ? "Estável" : c.risk === "medium" ? "Atenção" : "Risco"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ ROW 6 — Projeção (5) + Simulador (7) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={12} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-5">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-foreground">Projeção 3 Meses</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Cenário conservador vs otimista</p>
                </div>
                {PROJECTION_MONTHS.map((p) => (
                  <div key={p.month} className="space-y-1.5">
                    <p className="text-[11px] font-medium text-muted-foreground">{p.month}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Conservador</span>
                          <span className="text-[12px] font-semibold text-foreground">{p.conservative.toLocaleString("pt-BR")} pts</span>
                        </div>
                        <Progress value={(p.conservative / 20000) * 100} className="h-1.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-accent">Otimista</span>
                          <span className="text-[12px] font-semibold text-accent">{p.optimistic.toLocaleString("pt-BR")} pts</span>
                        </div>
                        <Progress value={(p.optimistic / 20000) * 100} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground italic">
                  Baseado na taxa de retenção de {Math.round(retentionRate * 100)}% e ritmo atual de captação.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={13} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-7">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                    <Calculator className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Simulador de Crescimento</h3>
                    <p className="text-[11px] text-muted-foreground">Ajuste para ver projeções personalizadas</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-foreground">Novos pacientes / mês</p>
                      <span className="text-lg font-bold text-foreground">{simNewClients[0]}</span>
                    </div>
                    <Slider value={simNewClients} onValueChange={setSimNewClients} min={1} max={20} step={1} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { period: "3 meses", value: simulate(3) },
                    { period: "6 meses", value: simulate(6) },
                    { period: "12 meses", value: simulate(12) },
                  ].map(({ period, value }) => (
                    <div key={period} className="rounded-xl bg-secondary/50 p-3 text-center space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{period}</p>
                      <p className="text-lg font-bold text-foreground">
                        {Math.round(value / avgTicket / commissionRate * commissionRate * 33.33).toLocaleString("pt-BR")} pts
                      </p>
                      <p className="text-[9px] text-muted-foreground">acumulado estimado</p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground italic text-center">
                  Simulação com retenção de {Math.round(retentionRate * 100)}%, ticket médio R$ {avgTicket} e taxa de pontos vigente.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══ ROW 7 — Payment History ═══ */}
        <motion.div custom={14} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-foreground">Histórico de Resgates</h3>
                <span className="text-[11px] text-muted-foreground">Últimos 5 resgates</span>
              </div>
              <div className="space-y-2">
                {PAYMENT_HISTORY.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                      <Wallet className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-foreground">{p.value}</p>
                      <p className="text-[10px] text-muted-foreground">{p.date} • {p.method}</p>
                    </div>
                    <span className="text-[11px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ REDEMPTION MODAL ═══ */}
      <AnimatePresence>
        {showRedeemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={closeRedeemModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <Gift className="h-4.5 w-4.5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-foreground">Resgatar Vitacoins</h2>
                    <p className="text-[11px] text-muted-foreground">
                      {WALLET.available.toLocaleString("pt-BR")} pts disponíveis
                    </p>
                  </div>
                </div>
                <button onClick={closeRedeemModal} className="rounded-lg p-1.5 hover:bg-secondary transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Step: Choose */}
              {redeemStep === "choose" && (
                <div className="p-5 space-y-4">
                  <p className="text-[13px] text-muted-foreground">Escolha como deseja resgatar seus pontos:</p>
                  <div className="space-y-3">
                    {REDEMPTION_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedOption === option.id;
                      const isDisabled = WALLET.available < option.minPoints;

                      return (
                        <button
                          key={option.id}
                          onClick={() => !isDisabled && setSelectedOption(option.id)}
                          disabled={isDisabled}
                          className={cn(
                            "w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                            isSelected ? "border-accent bg-accent/5 ring-1 ring-accent/30" : "border-border hover:bg-secondary/30",
                            isDisabled && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                            isSelected ? "bg-accent/15" : "bg-secondary"
                          )}>
                            <Icon className={cn("h-5 w-5", isSelected ? "text-accent" : "text-foreground")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-semibold text-foreground">{option.label}</p>
                              {option.badge && (
                                <span className="text-[9px] font-semibold bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">{option.description}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                              {option.conversionLabel} • Mínimo: {option.minPoints.toLocaleString("pt-BR")} pts
                            </p>
                          </div>
                          <div className={cn(
                            "h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center",
                            isSelected ? "border-accent bg-accent" : "border-muted-foreground/30"
                          )}>
                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-accent-foreground" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    className="w-full"
                    disabled={!selectedOption}
                    onClick={() => setRedeemStep("confirm")}
                  >
                    Continuar <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              )}

              {/* Step: Confirm */}
              {redeemStep === "confirm" && selectedRedemption && (
                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-4">
                    <selectedRedemption.icon className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{selectedRedemption.label}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedRedemption.conversionLabel}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-foreground">Quantidade de pontos</p>
                      <span className="text-lg font-bold text-accent">{redeemAmount[0].toLocaleString("pt-BR")} pts</span>
                    </div>
                    <Slider
                      value={redeemAmount}
                      onValueChange={setRedeemAmount}
                      min={selectedRedemption.minPoints}
                      max={WALLET.available}
                      step={100}
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Mín: {selectedRedemption.minPoints.toLocaleString("pt-BR")} pts</span>
                      <span>Máx: {WALLET.available.toLocaleString("pt-BR")} pts</span>
                    </div>
                  </div>

                  {selectedOption === "pix" && (
                    <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 space-y-1">
                      <p className="text-[11px] text-muted-foreground">Valor em reais</p>
                      <p className="text-xl font-bold text-foreground">
                        R$ {(redeemAmount[0] * WALLET.conversionRate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Taxa de conversão: 1 pt = R$ 0,03 • Processamento em até 48h via Pix
                      </p>
                    </div>
                  )}

                  {selectedOption === "store" && (
                    <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 space-y-1">
                      <p className="text-[11px] text-muted-foreground">Crédito na loja</p>
                      <p className="text-xl font-bold text-foreground">
                        R$ {(redeemAmount[0] * 0.05).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Taxa especial: 1 pt = R$ 0,05 em produtos • 66% a mais de valor!
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setRedeemStep("choose")}>
                      Voltar
                    </Button>
                    <Button className="flex-1" onClick={handleRedeem}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Confirmar resgate
                    </Button>
                  </div>
                </div>
              )}

              {/* Step: Success */}
              {redeemStep === "success" && (
                <div className="p-8 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mx-auto"
                  >
                    <CheckCircle2 className="h-8 w-8 text-accent" />
                  </motion.div>
                  <div>
                    <h3 className="text-[18px] font-bold text-foreground">Resgate solicitado!</h3>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      {redeemAmount[0].toLocaleString("pt-BR")} Vitacoins serão processados em até 48h.
                    </p>
                  </div>
                  <div className="rounded-xl bg-secondary/30 p-4 space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground">Método</span>
                      <span className="font-semibold text-foreground">{selectedRedemption?.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground">Pontos resgatados</span>
                      <span className="font-semibold text-foreground">{redeemAmount[0].toLocaleString("pt-BR")} pts</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-semibold text-warning">Em processamento</span>
                    </div>
                  </div>
                  <Button onClick={closeRedeemModal} className="w-full">
                    Fechar
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default PartnerRevenue;
