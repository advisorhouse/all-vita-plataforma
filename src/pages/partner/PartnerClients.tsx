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
              <Info className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
              <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
            </div>
          </div>
        </motion.div>

        {/* ═══ Link & QR Widget ═══ */}
        <PremiumLinkWidget 
          referralCode={partnerData?.referral_code}
          tenantLogo={currentTenant?.logo_url}
        />

        {/* ═══ KPIs Topo — Indicadores objetivos ═══ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                icon: ClipboardList,
                value: "87",
                label: "Quiz Preenchidos",
                tip: "Total de quizzes preenchidos via seu link exclusivo.",
                accent: false,
              },
              {
                icon: Users,
                value: activeClients.toString(),
                label: "Pacientes Vinculados",
                tip: "Pacientes que finalizaram o quiz e estão vinculados a você.",
                accent: false,
              },
              {
                icon: TrendingUp,
                value: "55%",
                label: "Taxa de Conversão",
                tip: "Percentual de quizzes que resultaram em paciente vinculado ativo.",
                accent: false,
              },
              {
                icon: Coins,
                value: "12.480",
                label: "Vitacoins Gerados",
                tip: "Total de Vitacoins acumulados pela atividade dos seus pacientes.",
                accent: true,
              },
            ].map(({ icon: Icon, value, label, tip, accent }) => (
              <Card
                key={label}
                className={cn(
                  "shadow-sm",
                  accent ? "border-accent/30 bg-accent/5" : "border-border bg-card"
                )}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      accent ? "bg-accent/15" : "bg-secondary"
                    )}>
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
