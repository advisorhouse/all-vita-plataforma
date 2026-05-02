import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, TrendingUp, UserPlus, ArrowUpRight,
  CheckCircle2, AlertTriangle, Clock, Heart, Zap,
  Activity, ChevronRight, ChevronDown, Shield,
  Eye, Calendar, DollarSign, Repeat, Target,
  Info, BarChart3, Star, ArrowDown, ArrowRight,
  UserCheck, UserMinus, UserX, Sparkles, GitBranch,
  Crown, CircleDot, Minus, Plus, Award, Lock, Gem, Trophy,
  Coins, BookOpen, Lightbulb, GraduationCap, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useCurrentPartner } from "@/hooks/useCurrentPartner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import productVisionLift from "@/assets/product-vision-lift-1month.png";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

// ─── Data ────────────────────────────────────────────────────
const NETWORK_STATS = {
  totalLinked: 48,
  activeNow: 42,
  paused: 4,
  cancelled: 2,
  lifetimeRevenue: 48232,
  avgLifetime: 5.2,
  retentionRate: 87.5,
  avgTicket: 447,
  revenueThisMonth: 7080,
  newThisMonth: 3,
  churnThisMonth: 1,
};

const KPI_CARDS = [
  { label: "Total na Rede", value: "48", change: "+3", icon: Users, tip: "Todos os pacientes que entraram pela sua indicação." },
  { label: "Comprando Agora", value: "42", change: "87.5%", icon: UserCheck, tip: "Pacientes com assinatura ativa neste momento.", accent: true },
  { label: "Tempo Médio", value: "5.2m", change: "+0.3", icon: Clock, tip: "Em média, seus pacientes ficam 5.2 meses comprando." },
  { label: "Vitacoins do Mês", value: "23.600", change: "+12%", icon: Coins, tip: "Total de Vitacoins acumulados este mês com sua rede.", accent: true },
];

const GROWTH_CHART = [
  { month: "Set", total: 18, active: 18 },
  { month: "Out", total: 26, active: 25 },
  { month: "Nov", total: 32, active: 30 },
  { month: "Dez", total: 38, active: 35 },
  { month: "Jan", total: 43, active: 40 },
  { month: "Fev", total: 48, active: 42 },
];

const STATUS_PIE = [
  { name: "Comprando", value: 42, color: "hsl(var(--accent))" },
  { name: "Pausados", value: 4, color: "hsl(var(--warning))" },
  { name: "Saíram", value: 2, color: "hsl(var(--destructive))" },
];

const PLAN_BREAKDOWN = [
  { plan: "9 meses", count: 8, revenue: 5584, retention: 97, color: "hsl(var(--accent))" },
  { plan: "5 meses", count: 22, revenue: 9834, retention: 92, color: "hsl(217, 91%, 60%)" },
  { plan: "3 meses", count: 18, revenue: 5346, retention: 78, color: "hsl(var(--muted-foreground))" },
];

// ─── Progression Levels ─────────────────────────────────────
const PROGRESSION_LEVELS = [
  {
    key: "bronze",
    label: "Bronze",
    icon: Award,
    color: "text-orange-600",
    bg: "bg-orange-100",
    ring: "ring-orange-200",
    minClients: 0,
    minRetention: 0,
    commission: "10%",
    benefits: ["Link de indicação", "Acesso ao painel", "Comissão padrão"],
  },
  {
    key: "prata",
    label: "Prata",
    icon: Shield,
    color: "text-slate-500",
    bg: "bg-slate-100",
    ring: "ring-slate-200",
    minClients: 10,
    minRetention: 70,
    commission: "12%",
    benefits: ["Comissão 12%", "Materiais de venda", "Suporte rápido"],
  },
  {
    key: "ouro",
    label: "Ouro",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    minClients: 25,
    minRetention: 80,
    commission: "15%",
    benefits: ["Comissão 15%", "Bônus de permanência 2x", "Treinamentos exclusivos", "Suporte prioritário"],
  },
  {
    key: "diamante",
    label: "Diamante",
    icon: Gem,
    color: "text-accent",
    bg: "bg-accent/10",
    ring: "ring-accent/20",
    minClients: 50,
    minRetention: 90,
    commission: "18%",
    benefits: ["Comissão 18%", "Bônus de permanência 3x", "Produtos antes de todo mundo", "Gerente só seu", "Eventos especiais"],
  },
  {
    key: "lenda",
    label: "Lenda",
    icon: Trophy,
    color: "text-purple-500",
    bg: "bg-purple-50",
    ring: "ring-purple-200",
    minClients: 100,
    minRetention: 95,
    commission: "20%",
    benefits: ["Comissão máxima 20%", "Tudo de todos os níveis", "Convite para conselho de Partners", "Viagens e prêmios exclusivos"],
  },
];

const CURRENT_LEVEL_KEY = "ouro";
const CURRENT_CLIENTS = 34;
const CURRENT_RETENTION = 87;

// Network tree data
interface NetworkNode {
  name: string;
  initials: string;
  status: "active" | "paused" | "cancelled";
  months: number;
  plan: string;
  revenue: number;
  consistency: number;
  joinedDate: string;
  lastPurchase: string;
  nextRenewal: string;
  commissionRate: number;
}

const NETWORK_TREE: NetworkNode[] = [
  { name: "Maria Silva", initials: "MS", status: "active", months: 8, plan: "9 meses", revenue: 5593, consistency: 96, joinedDate: "Jul/25", lastPurchase: "28/02/26", nextRenewal: "15/03/26", commissionRate: 18 },
  { name: "Ana Paula Costa", initials: "AC", status: "active", months: 6, plan: "5 meses", revenue: 2685, consistency: 92, joinedDate: "Set/25", lastPurchase: "20/02/26", nextRenewal: "20/03/26", commissionRate: 15 },
  { name: "Luciana Barros", initials: "LB", status: "active", months: 5, plan: "9 meses", revenue: 3495, consistency: 94, joinedDate: "Out/25", lastPurchase: "15/02/26", nextRenewal: "15/03/26", commissionRate: 18 },
  { name: "Juliana Mendes", initials: "JM", status: "active", months: 5, plan: "5 meses", revenue: 2237, consistency: 88, joinedDate: "Out/25", lastPurchase: "18/02/26", nextRenewal: "18/03/26", commissionRate: 15 },
  { name: "Beatriz Torres", initials: "BT", status: "active", months: 4, plan: "5 meses", revenue: 1790, consistency: 82, joinedDate: "Nov/25", lastPurchase: "22/02/26", nextRenewal: "22/03/26", commissionRate: 15 },
  { name: "Carla Rodrigues", initials: "CR", status: "active", months: 4, plan: "3 meses", revenue: 1198, consistency: 75, joinedDate: "Nov/25", lastPurchase: "25/02/26", nextRenewal: "25/03/26", commissionRate: 12 },
  { name: "Fernanda Lima", initials: "FL", status: "active", months: 3, plan: "5 meses", revenue: 1342, consistency: 68, joinedDate: "Dez/25", lastPurchase: "10/02/26", nextRenewal: "10/03/26", commissionRate: 15 },
  { name: "Patrícia Dias", initials: "PD", status: "active", months: 2, plan: "3 meses", revenue: 599, consistency: 45, joinedDate: "Jan/26", lastPurchase: "05/02/26", nextRenewal: "05/03/26", commissionRate: 12 },
  { name: "Roberto Nunes", initials: "RN", status: "active", months: 1, plan: "3 meses", revenue: 299, consistency: 72, joinedDate: "Fev/26", lastPurchase: "28/02/26", nextRenewal: "28/03/26", commissionRate: 12 },
  { name: "Camila Souza", initials: "CS", status: "paused", months: 3, plan: "5 meses", revenue: 1342, consistency: 38, joinedDate: "Dez/25", lastPurchase: "15/01/26", nextRenewal: "—", commissionRate: 0 },
  { name: "Pedro Ferreira", initials: "PF", status: "cancelled", months: 2, plan: "3 meses", revenue: 599, consistency: 22, joinedDate: "Nov/25", lastPurchase: "20/12/25", nextRenewal: "—", commissionRate: 0 },
];

const RETENTION_MONTHS = [
  { month: "Jul/25", entered: 5, active: 5, rate: 100 },
  { month: "Set/25", entered: 6, active: 6, rate: 100 },
  { month: "Out/25", entered: 8, active: 7, rate: 87.5 },
  { month: "Nov/25", entered: 8, active: 6, rate: 75 },
  { month: "Dez/25", entered: 7, active: 6, rate: 85.7 },
  { month: "Jan/26", entered: 8, active: 7, rate: 87.5 },
  { month: "Fev/26", entered: 6, active: 5, rate: 83.3 },
];

const TIMELINE = [
  { date: "28 Fev", event: "Roberto Nunes entrou na rede", type: "new" as const, detail: "Plano 3 meses • via link Instagram" },
  { date: "25 Fev", event: "Renata Oliveira entrou na rede", type: "new" as const, detail: "Plano 5 meses • via QR Code evento" },
  { date: "18 Jan", event: "Patrícia Dias entrou na rede", type: "new" as const, detail: "Plano 3 meses • via link WhatsApp" },
  { date: "12 Jan", event: "Pedro Ferreira cancelou", type: "churn" as const, detail: "Plano 3 meses • ficou 2 meses" },
  { date: "05 Dez", event: "Fernanda Lima entrou na rede", type: "new" as const, detail: "Plano 5 meses • via indicação" },
  { date: "01 Dez", event: "Camila Souza pausou", type: "pause" as const, detail: "Plano 5 meses • ficou 3 meses" },
];

const statusStyle: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  active: { label: "Ativo", cls: "bg-accent/10 text-accent", icon: UserCheck },
  paused: { label: "Pausado", cls: "bg-warning/10 text-warning", icon: Clock },
  cancelled: { label: "Saiu", cls: "bg-destructive/10 text-destructive", icon: UserX },
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <Info className="h-3.5 w-3.5 text-muted-foreground/40" />
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </Tooltip>
);

// ─── Level Explanation Widget ──────────────────────────────
const PartnerLevelExplainer: React.FC = () => {
  return (
    <Card className="border-accent/20 bg-accent/5 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accent" />
          <CardTitle className="text-base font-bold">Como funcionam os níveis?</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Sua jornada como Partner é recompensada à medida que sua rede cresce e se mantém saudável.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-[13px] font-semibold flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-accent" /> Expansão (Volume)
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Quanto mais pacientes ativos você tiver, maior seu nível. Isso mostra sua capacidade de educar e trazer novos membros para o ecossistema.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-[13px] font-semibold flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-accent" /> Retenção (Qualidade)
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Não basta apenas trazer, é preciso cuidar. Pacientes que continuam comprando (recorrência) aumentam sua taxa de retenção e garantem bônus extras.
            </p>
          </div>
        </div>

        <div className="bg-white/50 rounded-xl p-3 border border-accent/10 space-y-2">
          <h4 className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-warning" /> Dica de Ouro
          </h4>
          <p className="text-[11px] text-muted-foreground italic">
            "Um Partner de sucesso não é um vendedor, é um educador. Ao elevar o nível de consciência do seu paciente sobre a saúde, a venda e a retenção tornam-se consequências naturais."
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" className="text-[11px] gap-2 h-8 rounded-full">
            <GraduationCap className="h-3.5 w-3.5" /> Ver Academy Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Progression Level Widget ───────────────────────────────
const ProgressionWidget: React.FC<{ partner: any; stats: any }> = ({ partner, stats }) => {
  const currentLevelLabel = partner?.level || "Bronze";
  const currentIdx = PROGRESSION_LEVELS.findIndex((l) => l.label.toLowerCase() === currentLevelLabel.toLowerCase());
  const current = PROGRESSION_LEVELS[currentIdx] || PROGRESSION_LEVELS[0];
  const next = currentIdx < PROGRESSION_LEVELS.length - 1 ? PROGRESSION_LEVELS[currentIdx + 1] : null;

  const currentClients = stats?.activeNow || 0;
  const currentRetention = stats?.retentionRate || 0;

  // Progress toward next level
  const clientProgress = next ? Math.min((currentClients / next.minClients) * 100, 100) : 100;
  const retentionProgress = next ? Math.min((currentRetention / next.minRetention) * 100, 100) : 100;
  const overallProgress = next ? Math.round((clientProgress + retentionProgress) / 2) : 100;

  const clientsNeeded = next ? Math.max(next.minClients - currentClients, 0) : 0;
  const retentionNeeded = next ? Math.max(next.minRetention - currentRetention, 0) : 0;

  const CurrentIcon = current.icon;


  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header with current level */}
        <div className={cn("p-5 relative overflow-hidden", current.bg)}>
          <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-20" style={{ background: "currentColor" }} />
          <div className="relative z-10 flex items-center gap-4">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl ring-2 bg-white/80", current.ring)}>
              <CurrentIcon className={cn("h-7 w-7", current.color)} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Seu Nível Atual</p>
              <h3 className={cn("text-xl font-bold", current.color)}>{current.label}</h3>
              <p className="text-[11px] text-muted-foreground">Comissão de {current.commission}</p>
            </div>
            {next && (
              <div className="text-right">
                <p className="text-[28px] font-bold text-foreground">{overallProgress}%</p>
                <p className="text-[10px] text-muted-foreground">pro próximo</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* What you already have */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <h4 className="text-[13px] font-semibold text-foreground">O que você já conquistou</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {current.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-success/5 px-3 py-2">
                  <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                  <span className="text-[11px] text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next level progress */}
          {next && (
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", next.bg)}>
                    <next.icon className={cn("h-4.5 w-4.5", next.color)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Próximo nível</p>
                    <h4 className={cn("text-[14px] font-bold", next.color)}>{next.label}</h4>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">Comissão {next.commission}</span>
              </div>

              {/* Client requirement */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3 w-3" /> Pacientes ativos
                  </span>
                  <span className="font-semibold text-foreground">{currentClients} / {next.minClients}</span>
                </div>
                <Progress value={clientProgress} className="h-2" />
                {clientsNeeded > 0 && (
                  <p className="text-[10px] text-accent font-medium flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> Faltam {clientsNeeded} pacientes
                  </p>
                )}
              </div>

              {/* Retention requirement */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Heart className="h-3 w-3" /> Pacientes que ficam
                  </span>
                  <span className="font-semibold text-foreground">{currentRetention}% / {next.minRetention}%</span>
                </div>
                <Progress value={retentionProgress} className="h-2" />
                {retentionNeeded > 0 && (
                  <p className="text-[10px] text-accent font-medium flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> Faltam {retentionNeeded}% a mais
                  </p>
                )}
              </div>

              {/* What you'll unlock */}
              <div className="pt-2 border-t border-border/60">
                <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-accent" /> Vai desbloquear:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {next.benefits.filter(b => !current.benefits.includes(b)).map((b, i) => (
                    <span key={i} className="text-[10px] bg-accent/10 text-accent font-medium px-2 py-1 rounded-full">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All levels roadmap */}
          <div>
            <h4 className="text-[12px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Todos os Níveis</h4>
            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-1">
                {PROGRESSION_LEVELS.map((level, i) => {
                  const LvlIcon = level.icon;
                  const isCompleted = i < currentIdx;
                  const isCurrent = i === currentIdx;
                  const isLocked = i > currentIdx;

                  return (
                    <div key={level.key} className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                      isCurrent && "bg-secondary/80 ring-1 ring-accent/20",
                      isCompleted && "opacity-70",
                    )}>
                      {/* Node dot */}
                      <div className={cn(
                        "relative z-10 flex h-9 w-9 items-center justify-center rounded-full shrink-0 transition-all",
                        isCompleted && "bg-success/10",
                        isCurrent && cn(level.bg, "ring-2", level.ring),
                        isLocked && "bg-secondary",
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : isLocked ? (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                        ) : (
                          <LvlIcon className={cn("h-4 w-4", level.color)} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-[12px] font-semibold",
                            isLocked ? "text-muted-foreground" : "text-foreground"
                          )}>{level.label}</p>
                          {isCurrent && (
                            <span className="text-[9px] font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                              VOCÊ ESTÁ AQUI
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[9px] font-medium text-success">✓ Conquistado</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {level.minClients === 0
                            ? `Comissão ${level.commission}`
                            : `${level.minClients}+ clientes · ${level.minRetention}%+ ficam · ${level.commission}`
                          }
                        </p>
                      </div>

                      <span className={cn(
                        "text-[11px] font-bold shrink-0",
                        isCompleted ? "text-success" : isCurrent ? level.color : "text-muted-foreground/40"
                      )}>
                        {level.commission}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Network Tree Visual Component ──────────────────────────
const NetworkTreeView: React.FC<{ nodes: NetworkNode[]; partner: any; stats: any }> = ({ nodes, partner, stats }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const toggleNode = (name: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const activeNodes = nodes.filter((n) => n.status === "active");
  const pausedNodes = nodes.filter((n) => n.status === "paused");
  const cancelledNodes = nodes.filter((n) => n.status === "cancelled");

  const displayedActive = showAll ? activeNodes : activeNodes.slice(0, 5);

  const renderNode = (node: NetworkNode, level: number) => {
    const isExpanded = expandedNodes.has(node.name);
    const s = statusStyle[node.status];
    const StatusIcon = s.icon;

    return (
      <motion.div
        key={node.name}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="relative"
      >
        {level > 0 && (
          <div className="absolute -left-4 top-0 h-full w-px">
            <div className="absolute top-5 left-0 w-4 border-t border-border/60" />
            <div className="absolute top-0 left-0 h-5 border-l border-border/60" />
          </div>
        )}

        <div className={cn(
          "rounded-xl border transition-all cursor-pointer",
          isExpanded ? "border-accent/30 bg-accent/5 shadow-sm" : "border-border hover:border-accent/20"
        )}>
          <button onClick={() => toggleNode(node.name)} className="w-full p-3 text-left">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold shrink-0",
                  node.status === "active" ? "bg-accent/10 text-accent ring-2 ring-accent/20" :
                  node.status === "paused" ? "bg-warning/10 text-warning ring-2 ring-warning/20" :
                  "bg-destructive/10 text-destructive ring-2 ring-destructive/20"
                )}>
                  {node.initials}
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center",
                  node.status === "active" ? "bg-accent" : node.status === "paused" ? "bg-warning" : "bg-destructive"
                )}>
                  <StatusIcon className="h-2 w-2 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-foreground truncate">{node.name}</p>
                  <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0", s.cls)}>
                    {s.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" /> {node.joinedDate}
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" /> {node.months} {node.months === 1 ? "mês" : "meses"}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                    <Coins className="h-2.5 w-2.5" /> Points
                  </p>
                  <p className="text-[12px] font-bold text-accent">{node.revenue.toLocaleString("pt-BR")} pts</p>
                </div>
                {node.status === "active" && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                      <Activity className="h-2.5 w-2.5" /> Uso
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Progress value={node.consistency} className="h-1 w-8" />
                      <span className={cn("text-[11px] font-medium", node.consistency >= 80 ? "text-accent" : node.consistency >= 50 ? "text-foreground" : "text-warning")}>
                        {node.consistency}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                isExpanded ? "bg-accent/10" : "bg-secondary"
              )}>
                {isExpanded ? <Minus className="h-3 w-3 text-accent" /> : <Plus className="h-3 w-3 text-muted-foreground" />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 border-t border-border/50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    <div className="rounded-xl bg-secondary/60 p-2.5 flex items-start gap-2">
                      <Target className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] text-muted-foreground">Plano</p>
                        <p className="text-sm font-bold text-foreground">{node.plan}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-2.5 flex items-start gap-2">
                       <Coins className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] text-muted-foreground">Pts/mês</p>
                        <p className="text-sm font-bold text-accent">{node.commissionRate > 0 ? Math.round(node.revenue / node.months) : 0} pts</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-2.5 flex items-start gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] text-muted-foreground">Última compra</p>
                        <p className="text-sm font-bold text-foreground">{node.lastPurchase}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-2.5 flex items-start gap-2">
                      <Repeat className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] text-muted-foreground">Próx. renovação</p>
                        <p className="text-sm font-bold text-foreground">{node.nextRenewal}</p>
                      </div>
                    </div>
                  </div>
                  {node.consistency < 50 && node.status === "active" && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-warning/10 p-2.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                      <p className="text-[10px] text-warning">Esse cliente está usando pouco o produto. Bom falar com ele!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <GitBranch className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Árvore da Rede</h3>
              <p className="text-[11px] text-muted-foreground">Visualize cada pessoa da sua rede</p>
            </div>
          </div>
          <Tip text="Clique em cada pessoa para ver mais detalhes. Sua rede é organizada por quem está comprando, pausou ou saiu." />
        </div>

        {/* Root node */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-sm ring-2 ring-accent/30">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-foreground">Você (Partner)</p>
              <p className="text-[10px] text-muted-foreground">{stats?.totalLinked || 0} pacientes na rede • {stats?.activeNow || 0} comprando</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold">Nível {partner?.level || "Bronze"}</span>
            </div>
          </div>
          <div className="ml-6 h-4 border-l-2 border-accent/20" />
        </div>

        {/* Active branch */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10">
              <UserCheck className="h-3 w-3 text-accent" />
            </div>
            <p className="text-[12px] font-semibold text-accent">Comprando ({activeNodes.length})</p>
            <div className="flex-1 border-t border-accent/10" />
          </div>
          <div className="ml-4 space-y-2">
            {displayedActive.map((node) => renderNode(node, 1))}
            {activeNodes.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2 text-[11px] font-medium text-accent hover:text-accent/80 transition-colors ml-2"
              >
                {showAll ? (
                  <><Minus className="h-3 w-3" /> Mostrar menos</>
                ) : (
                  <><Plus className="h-3 w-3" /> Ver mais {activeNodes.length - 5} clientes</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Paused branch */}
        {pausedNodes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-3 w-3 text-warning" />
              </div>
              <p className="text-[12px] font-semibold text-warning">Pausados ({pausedNodes.length})</p>
              <div className="flex-1 border-t border-warning/10" />
            </div>
            <div className="ml-4 space-y-2">
              {pausedNodes.map((node) => renderNode(node, 1))}
            </div>
          </div>
        )}

        {/* Cancelled branch */}
        {cancelledNodes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10">
                <UserX className="h-3 w-3 text-destructive" />
              </div>
              <p className="text-[12px] font-semibold text-destructive">Saíram ({cancelledNodes.length})</p>
              <div className="flex-1 border-t border-destructive/10" />
            </div>
            <div className="ml-4 space-y-2">
              {cancelledNodes.map((node) => renderNode(node, 1))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main Page ──────────────────────────────────────────────
const PartnerNetwork: React.FC = () => {
  const { data: partner, isLoading: loadingPartner } = useCurrentPartner();

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["partner-network-stats", partner?.id],
    queryFn: async () => {
      if (!partner?.id) return null;

      const { count: totalLinked } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partner.id);

      const { count: activeNow } = await supabase
        .from("conversions")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partner.id);

      const { data: pointsData } = await supabase
        .from("vitacoin_transactions")
        .select("amount")
        .eq("user_id", partner.user_id)
        .eq("tenant_id", partner.tenant_id);

      const totalEarned = pointsData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      return {
        totalLinked: totalLinked || 0,
        activeNow: activeNow || 0,
        paused: 0,
        cancelled: 0,
        lifetimeRevenue: totalEarned,
        avgLifetime: 0,
        retentionRate: 0, // In a real app, calculate this
        avgTicket: 0,
        revenueThisMonth: 0,
        newThisMonth: 0,
        churnThisMonth: 0,
      };
    },
    enabled: !!partner?.id
  });

  const { data: networkTree = [] } = useQuery({
    queryKey: ["partner-network-tree", partner?.id],
    queryFn: async () => {
      if (!partner?.id) return [];

      const { data, error } = await supabase
        .from("conversions")
        .select(`
          id,
          created_at,
          clients (
            first_name,
            last_name
          )
        `)
        .eq("partner_id", partner.id);

      if (error) throw error;

      return data.map((c: any) => ({
        name: `${c.clients?.first_name || ""} ${c.clients?.last_name || ""}`.trim() || "Paciente",
        initials: (c.clients?.first_name?.[0] || "") + (c.clients?.last_name?.[0] || ""),
        status: "active" as const,
        months: 1,
        plan: "Padrão",
        revenue: 0,
        consistency: 100,
        joinedDate: format(new Date(c.created_at), "MMM/yy", { locale: ptBR }),
        lastPurchase: format(new Date(c.created_at), "dd/MM/yy"),
        nextRenewal: "—",
        commissionRate: 15,
      }));
    },
    enabled: !!partner?.id
  });

  const currentLevelLabel = partner?.level || "Bronze";
  const currentIdx = PROGRESSION_LEVELS.findIndex((l) => l.label.toLowerCase() === currentLevelLabel.toLowerCase());
  const current = PROGRESSION_LEVELS[currentIdx] || PROGRESSION_LEVELS[0];

  const kpiCards = [
    { label: "Total na Rede", value: String(stats?.totalLinked || 0), change: "+0", icon: Users, tip: "Todos os pacientes que entraram pela sua indicação." },
    { label: "Comprando Agora", value: String(stats?.activeNow || 0), change: "100%", icon: UserCheck, tip: "Pacientes com assinatura ativa neste momento.", accent: true },
    { label: "Tempo Médio", value: "0m", change: "+0", icon: Clock, tip: "Em média, seus pacientes ficam X meses comprando." },
    { label: "Vitacoins Totais", value: (stats?.lifetimeRevenue || 0).toLocaleString("pt-BR"), change: "+0%", icon: Coins, tip: "Total de Vitacoins acumulados com sua rede.", accent: true },
  ];

  if (loadingPartner || loadingStats) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* ═══ Header ═══ */}
        <motion.div custom={-1} variants={fadeUp} initial="hidden" animate="visible">
           <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-foreground">Minha Rede</h1>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {stats?.totalLinked || 0} pacientes
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Acompanhe seus pacientes vinculados e o crescimento da sua rede.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
              <Zap className="h-3 w-3 text-warning" />
              <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
              <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
            </div>
          </div>
        </motion.div>

        {/* ═══ ROW 1 — KPI Cards (uniform 4-column) ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map(({ label, value, change, icon: Icon, tip, accent }) => (
              <Card key={label} className={accent ? "border-accent/20 shadow-sm bg-accent/5" : "border-border shadow-sm"}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-accent/10" : "bg-secondary"}`}>
                      <Icon className={`h-4 w-4 ${accent ? "text-accent" : "text-foreground"}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-accent">{change}</span>
                      <Tip text={tip} />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ ROW 2 — Progression Widget + Growth Chart ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-5 space-y-4">
            <ProgressionWidget partner={partner} stats={stats} />
            <PartnerLevelExplainer />
          </motion.div>

          <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
            {/* Growth chart */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
              <Card className="border-border shadow-sm h-full">
                <CardContent className="p-5 space-y-3 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <div>
                        <h3 className="text-[15px] font-semibold text-foreground">Sua Rede Crescendo</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Últimos 6 meses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-accent">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-semibold">+167%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={GROWTH_CHART} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                        <Area type="monotone" dataKey="total" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 3" fill="none" name="Na rede" />
                        <Area type="monotone" dataKey="active" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} fill="url(#activeGrad)" name="Comprando" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Side info cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <Card className="border-accent/20 shadow-sm bg-accent/5">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-3.5 w-3.5 text-accent" />
                      <h3 className="text-[12px] font-semibold text-foreground">Seu Cliente, Pra Sempre</h3>
                    </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Cada paciente que entra pela sua indicação fica <strong className="text-foreground">ligado a você para sempre</strong>.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-accent font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Garantido
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-accent font-medium">
                        <Shield className="h-3 w-3" /> Protegido
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <Card className="border-border shadow-sm bg-foreground">
                  <CardContent className="p-4 space-y-1 text-background">
                    <div className="flex items-center gap-2">
                      <Coins className="h-3.5 w-3.5" />
                      <h3 className="text-[12px] font-semibold">Vitacoins Totais</h3>
                    </div>
                    <p className="text-xl font-bold">160.773</p>
                    <div className="flex items-center gap-1 text-accent">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-[10px] font-semibold">+18% vs mês passado</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ═══ ROW 3 — Network Tree (full width) ═══ */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <NetworkTreeView nodes={NETWORK_TREE} />
        </motion.div>

        {/* ═══ ROW 4 — Status Pie + Plan Breakdown + Prediction ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 sm:col-span-6 lg:col-span-4">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <CircleDot className="h-4 w-4 text-accent" />
                  <h3 className="text-[13px] font-semibold text-foreground">Situação da Rede</h3>
                </div>
                <div className="flex-1 flex items-center justify-center py-2">
                  <div className="w-24 h-24 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={STATUS_PIE} cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {STATUS_PIE.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-foreground">{NETWORK_STATS.retentionRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {STATUS_PIE.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-[11px] text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 sm:col-span-6 lg:col-span-4">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-4 space-y-3 h-full flex flex-col">
                <div className="flex items-center gap-2.5">
                  <img src={productVisionLift} alt="Vision Lift" className="h-7 w-7 rounded-lg object-cover" />
                  <div>
                    <h3 className="text-[13px] font-semibold text-foreground">Por Plano</h3>
                    <p className="text-[10px] text-muted-foreground">Vision Lift Original</p>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  {PLAN_BREAKDOWN.map((p) => (
                    <div key={p.plan} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-foreground flex items-center gap-1.5">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          {p.plan}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Users className="h-2.5 w-2.5" /> {p.count}
                          </span>
                          <span className="text-[10px] font-semibold text-accent">{p.revenue.toLocaleString("pt-BR")} pts</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={p.retention} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-medium text-muted-foreground">{p.retention}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-accent/5 p-2.5">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-accent" />
                    Plano 9 meses: <strong className="text-foreground">97% continuam comprando</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-4">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-4 space-y-3 h-full flex flex-col">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <h3 className="text-[13px] font-semibold text-foreground">Previsão do Próximo Mês</h3>
                </div>
                <p className="text-[11px] text-muted-foreground">Se continuar assim, você vai acumular:</p>
                <p className="text-2xl font-bold text-foreground">27.170 pts</p>
                <div className="flex items-center gap-1 text-accent">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">+15% a mais que este mês</span>
                </div>
                <div className="flex gap-2 pt-1 flex-1 items-end">
                  <div className="flex-1 rounded-xl bg-secondary/60 p-2.5">
                    <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <UserPlus className="h-2.5 w-2.5" /> Novos esperados
                    </p>
                    <p className="text-base font-bold text-foreground mt-0.5">+4</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-secondary/60 p-2.5">
                    <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Coins className="h-2.5 w-2.5" /> Média/paciente
                    </p>
                    <p className="text-base font-bold text-foreground mt-0.5">1.490 pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══ ROW 5 — Retention Table + Timeline + Tip ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">Quem Ficou por Mês</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">De cada grupo que entrou, quantos continuam comprando</p>
                    </div>
                  </div>
                  <Tip text="Mostra os clientes que entraram em cada mês e quantos continuam ativos hoje." />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border">
                        {["Mês de Entrada", "Entraram", "Ainda Ativos", "% Ficaram", ""].map((h) => (
                          <th key={h} className="py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RETENTION_MONTHS.map((c) => (
                        <tr key={c.month} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 text-[12px] font-medium text-foreground flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {c.month}
                          </td>
                          <td className="py-2.5 text-[12px] text-muted-foreground">
                            <span className="flex items-center gap-1"><UserPlus className="h-3 w-3" /> {c.entered}</span>
                          </td>
                          <td className="py-2.5 text-[12px] font-semibold text-foreground">{c.active}</td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <Progress value={c.rate} className="h-1.5 w-16" />
                              <span className={cn("text-[11px] font-semibold", c.rate >= 90 ? "text-accent" : c.rate >= 75 ? "text-foreground" : "text-warning")}>
                                {c.rate}%
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5">
                            {c.rate === 100 && (
                              <span className="flex items-center gap-1 text-[10px] text-warning font-medium">
                                <Star className="h-3.5 w-3.5 fill-warning" /> Todos ficaram!
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-4 space-y-4">
            {/* Month summary */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent" />
                  <h3 className="text-[13px] font-semibold text-foreground">Resumo do Mês</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-accent/10 p-2.5 text-center">
                    <UserPlus className="h-4 w-4 text-accent mx-auto" />
                    <p className="text-base font-bold text-foreground mt-1">{NETWORK_STATS.newThisMonth}</p>
                    <p className="text-[9px] text-muted-foreground">Entraram</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-2.5 text-center">
                    <Repeat className="h-4 w-4 text-foreground mx-auto" />
                    <p className="text-base font-bold text-foreground mt-1">39</p>
                    <p className="text-[9px] text-muted-foreground">Renovaram</p>
                  </div>
                  <div className="rounded-lg bg-destructive/10 p-2.5 text-center">
                    <UserMinus className="h-4 w-4 text-destructive mx-auto" />
                    <p className="text-base font-bold text-foreground mt-1">{NETWORK_STATS.churnThisMonth}</p>
                    <p className="text-[9px] text-muted-foreground">Saíram</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tip card */}
            <Card className="border-accent/20 shadow-sm bg-accent/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10">
                    <Zap className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <h3 className="text-[12px] font-semibold text-foreground">Dica de Ouro</h3>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Se seus <strong className="text-foreground">{NETWORK_STATS.paused} pacientes parados</strong> voltarem a comprar, você acumula <strong className="text-accent">+4.133 pts a mais</strong> por mês!
                </p>
                <Button variant="ghost" size="sm" className="text-[11px] text-accent p-0 h-auto font-semibold hover:bg-transparent hover:text-accent/80">
                  Como trazer eles de volta <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══ ROW 6 — Timeline ═══ */}
        <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <h3 className="text-[13px] font-semibold text-foreground">O Que Aconteceu</h3>
                <Tip text="Tudo que aconteceu na sua rede nos últimos meses." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TIMELINE.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                      t.type === "new" ? "bg-accent/10" : t.type === "pause" ? "bg-warning/10" : "bg-destructive/10"
                    )}>
                      {t.type === "new" && <UserPlus className="h-4 w-4 text-accent" />}
                      {t.type === "pause" && <Clock className="h-4 w-4 text-warning" />}
                      {t.type === "churn" && <UserX className="h-4 w-4 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-foreground">{t.event}</p>
                      <p className="text-[10px] text-muted-foreground">{t.detail}</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" /> {t.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default PartnerNetwork;
