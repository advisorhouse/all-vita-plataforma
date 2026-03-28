import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ChevronRight, ChevronLeft, TrendingUp,
  Users, ShieldCheck, Repeat, Coins,
  GraduationCap, Eye, Lightbulb, Clock,
  CalendarDays, Zap, Gift, CreditCard,
  Package, Lock, Activity, AlertTriangle,
  Ticket, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

import heroImg from "@/assets/partner-dashboard-hero.png";
import speakerDra from "@/assets/speaker-dra-marina.png";
import eventTraining from "@/assets/event-training.png";
import productVisionLift from "@/assets/product-vision-lift-1month.png";
import product3Month from "@/assets/product-vision-lift-3month.png";
import product5Month from "@/assets/product-vision-lift-5month.png";
import product10Month from "@/assets/product-vision-lift-10month.png";

// ─── Helpers ─────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-muted-foreground/40">
          <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
        </svg>
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </Tooltip>
);

// ─── Data ────────────────────────────────────────────────────
const KPI_CARDS = [
  { label: "Pacientes Vinculados", value: "48", change: "+5", icon: Users, tip: "Pacientes vinculados ao seu quiz com assinatura ativa." },
  { label: "Taxa de Retenção", value: "94%", change: "+2%", icon: ShieldCheck, tip: "Percentual de pacientes que renovaram. Acima de 90% é excelente." },
  { label: "Recorrência Média", value: "5.2 meses", change: "+0.3", icon: Repeat, tip: "Tempo médio que seus pacientes permanecem ativos." },
  { label: "Vitacoins Total", value: "48.200", change: "+18%", icon: Coins, tip: "Total de Vitacoins acumulados. Resgate por Pix, produtos, cursos e mais.", accent: true },
];

const POINTS_CHART = [
  { month: "Set", value: 4200 },
  { month: "Out", value: 5800 },
  { month: "Nov", value: 7100 },
  { month: "Dez", value: 6400 },
  { month: "Jan", value: 9200 },
  { month: "Fev", value: 12480 },
];

const WALLET = {
  pending: 3_840,
  released: 32_180,
  expired: 1_200,
  thisMonth: 12_480,
  pendingDays: 30,
};

const REDEMPTION_OPTIONS = [
  { icon: CreditCard, label: "Pix", desc: "Transferência bancária" },
  { icon: Gift, label: "Produtos", desc: "Loja Vision Lift" },
  { icon: GraduationCap, label: "Cursos", desc: "Educação continuada" },
  { icon: Ticket, label: "Congressos", desc: "Eventos médicos" },
  { icon: Wrench, label: "Equipamentos", desc: "Para sua clínica" },
];

const CATALOG = [
  {
    name: "Vision Lift 1 Mês",
    category: "Oftalmologia",
    description: "Proteção e longevidade da retina e mácula",
    image: productVisionLift,
    plans: [
      { tier: "1 mês", price: "R$ 196", clients: 12, points: "196 pts/venda" },
    ],
    totalClients: 12,
    active: true,
  },
  {
    name: "Vision Lift 3 Meses",
    category: "Oftalmologia",
    description: "3 meses de tratamento contínuo",
    image: product3Month,
    plans: [
      { tier: "3 meses", price: "R$ 396", clients: 18, points: "396 pts/venda", tag: "Melhor custo-benefício" },
    ],
    totalClients: 18,
    active: true,
  },
  {
    name: "Vision Lift 5 Meses",
    category: "Oftalmologia",
    description: "Resultado completo com economia de 46%",
    image: product5Month,
    plans: [
      { tier: "5 meses", price: "R$ 528", clients: 22, points: "528 pts/venda", tag: "Mais vendido" },
    ],
    totalClients: 22,
    active: true,
  },
  {
    name: "Vision Lift 10 Meses",
    category: "Oftalmologia",
    description: "Tratamento completo de longa duração",
    image: product10Month,
    plans: [
      { tier: "10 meses", price: "R$ 796", clients: 8, points: "796 pts/venda", tag: "Maior pontuação" },
    ],
    totalClients: 8,
    active: true,
  },
];

const POINTS_BY_PLAN = [
  { label: "3 meses", value: 7128, pct: 24 },
  { label: "5 meses", value: 11616, pct: 51 },
  { label: "9 meses", value: 5576, pct: 25 },
];

const EDUCATION = [
  { title: "Anatomia ocular básica", progress: 100, duration: "12 min", icon: Eye },
  { title: "Como Vision Lift atua", progress: 100, duration: "8 min", icon: Lightbulb },
  { title: "Rotina de proteção visual", progress: 60, duration: "15 min", icon: ShieldCheck },
];

const EVENTS = [
  {
    title: "Live: Saúde Ocular 40+",
    date: "10 Mai • 20h",
    speaker: "Dra. Marina Alves",
    description: "Estratégias de proteção visual para o público maduro.",
    img: speakerDra,
    cta: "Inscrever-se",
  },
  {
    title: "Workshop: Abordagem Empática",
    date: "15 Mai • 19h",
    speaker: "Equipe Vision Lift",
    description: "Técnicas de comunicação que aumentam conversão em 2x.",
    img: eventTraining,
    cta: "Garantir vaga",
  },
];

// ─── Greeting Icon ────────────────────────────────────────────
const GreetingIcon: React.FC = () => {
  const h = new Date().getHours();
  if (h < 12) {
    return (
      <motion.div
        className="relative flex h-7 w-7 items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--warning) / 0.25) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg viewBox="0 0 24 24" className="h-5 w-5 relative z-10">
          <circle cx="12" cy="12" r="5" fill="hsl(var(--warning))" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line key={angle} x1="12" y1="2" x2="12" y2="4.5" stroke="hsl(var(--warning))" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${angle} 12 12)`} />
          ))}
        </svg>
      </motion.div>
    );
  }
  if (h < 18) {
    return (
      <motion.span
        className="text-lg select-none"
        animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        style={{ transformOrigin: "70% 70%", display: "inline-block" }}
      >
        👋
      </motion.span>
    );
  }
  return (
    <motion.div
      className="relative flex h-7 w-7 items-center justify-center"
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.25, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 24 24" className="h-5 w-5 relative z-10">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="hsl(var(--accent))" />
      </svg>
    </motion.div>
  );
};

// ─── Component ───────────────────────────────────────────────
const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [catalogIdx, setCatalogIdx] = useState(0);
  const currentProduct = CATALOG[catalogIdx];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* ═══ Greeting ═══ */}
        <motion.div custom={-1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-foreground">
                  {(() => {
                    const h = new Date().getHours();
                    if (h < 12) return "Bom dia, Dr. Ricardo";
                    if (h < 18) return "Boa tarde, Dr. Ricardo";
                    return "Boa noite, Dr. Ricardo";
                  })()}
                </h1>
                <GreetingIcon />
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                  Partner Premium
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Acompanhe seus pacientes vinculados e gerencie seus Vitacoins.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
              <Zap className="h-3 w-3 text-warning" />
              <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
              <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
            </div>
          </div>
        </motion.div>

        {/* ═══ ROW 1 — KPIs ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {KPI_CARDS.map(({ label, value, change, icon: Icon, tip, accent }) => (
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

        {/* ═══ ROW 2 — Evolução de Pontos + Wallet Médica ═══ */}
        <div className="grid grid-cols-12 gap-4">
          {/* Points Chart — 8 cols */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Evolução de Vitacoins</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Pontos mensais • últimos 6 meses</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-accent">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-[12px] font-semibold">+197%</span>
                    </div>
                    <Tip text="Crescimento percentual dos Vitacoins mensais comparando o primeiro e o último mês." />
                  </div>
                </div>
                <div className="flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={POINTS_CHART} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value: number) => [`${value.toLocaleString("pt-BR")} pts`, "Vitacoins"]}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Wallet Médica — 4 cols */}
          <div className="col-span-12 lg:col-span-4">
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="h-full">
              <Card className="relative border-accent/30 shadow-sm overflow-hidden h-full bg-gradient-to-br from-accent via-accent/90 to-accent/70">
                <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/5" />
                <CardContent className="relative z-10 p-5 flex flex-col justify-between h-full text-accent-foreground">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                          <Coins className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="text-[13px] font-semibold">Wallet Médica</h3>
                      </div>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">+18%</span>
                    </div>

                    {/* Pontos do mês */}
                    <p className="text-[10px] text-accent-foreground/60 uppercase tracking-wider mt-3">Pontos este mês</p>
                    <p className="text-[28px] font-bold tracking-tight">{WALLET.thisMonth.toLocaleString("pt-BR")} pts</p>
                  </div>

                  {/* Saldo detalhado */}
                  <div className="space-y-2 mt-3">
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg bg-white/15 backdrop-blur-sm p-2.5">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="h-2.5 w-2.5 text-accent-foreground/60" />
                          <p className="text-[9px] text-accent-foreground/60 uppercase tracking-wider">Pendentes</p>
                        </div>
                        <p className="text-sm font-bold">{WALLET.pending.toLocaleString("pt-BR")}</p>
                        <p className="text-[8px] text-accent-foreground/40">carência {WALLET.pendingDays}d</p>
                      </div>
                      <div className="flex-1 rounded-lg bg-white/15 backdrop-blur-sm p-2.5">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Coins className="h-2.5 w-2.5 text-accent-foreground/60" />
                          <p className="text-[9px] text-accent-foreground/60 uppercase tracking-wider">Liberados</p>
                        </div>
                        <p className="text-sm font-bold">{WALLET.released.toLocaleString("pt-BR")}</p>
                        <p className="text-[8px] text-accent-foreground/40">disponível para resgate</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/10 p-2 flex items-center justify-between">
                      <span className="text-[10px] text-accent-foreground/50">Expirados</span>
                      <span className="text-[10px] font-semibold text-accent-foreground/60">{WALLET.expired.toLocaleString("pt-BR")} pts</span>
                    </div>
                    <div className="rounded-lg bg-white/10 p-2 flex items-center justify-between">
                      <span className="text-[10px] text-accent-foreground/50">Validade</span>
                      <span className="text-[10px] font-semibold text-accent-foreground/60">2 anos</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="mt-3 w-full rounded-xl text-[12px] font-semibold bg-white/20 hover:bg-white/30 text-accent-foreground border-0 gap-1.5"
                    onClick={() => navigate("/partner/revenue")}
                  >
                    <Gift className="h-3.5 w-3.5" /> Resgatar pontos
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ═══ ROW 3 — Saúde da Rede + Pontos por Plano + Opções de Resgate ═══ */}
        <div className="grid grid-cols-12 gap-4">
          {/* Saúde da Rede */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-4">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 flex flex-col justify-between h-full gap-3">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-accent" />
                      <h3 className="text-[13px] font-semibold text-foreground">Saúde da Rede</h3>
                    </div>
                    <Tip text="Verde = ativo, Amarelo = atenção, Vermelho = risco de perda." />
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Ativos", count: 42, total: 48, color: "bg-accent", textColor: "text-accent" },
                      { label: "Pausados", count: 4, total: 48, color: "bg-warning", textColor: "text-warning" },
                      { label: "Inativos", count: 2, total: 48, color: "bg-destructive", textColor: "text-destructive" },
                    ].map((s) => (
                      <div key={s.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">{s.label}</span>
                          <span className={`text-[11px] font-semibold ${s.textColor}`}>{s.count}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.count / s.total) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-warning/10 p-2 mt-3 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                    <p className="text-[10px] text-warning">2 pacientes com consistência abaixo de 40%</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-[12px] rounded-xl w-full gap-1" onClick={() => navigate("/partner/network")}>
                  Ver minha rede <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pontos por Plano */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-4">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={productVisionLift} alt="Vision Lift" className="h-7 w-7 rounded-lg object-cover" />
                    <div>
                      <h3 className="text-[13px] font-semibold text-foreground">Pontos por Plano</h3>
                      <p className="text-[10px] text-muted-foreground">Vision Lift Original</p>
                    </div>
                  </div>
                  <Tip text="Distribuição dos Vitacoins por tipo de plano neste mês." />
                </div>
                <div className="flex-1 min-h-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={POINTS_BY_PLAN} layout="vertical" margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={60} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <RTooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value: number) => [`${value.toLocaleString("pt-BR")} pts`, ""]}
                      />
                      <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 6, 6, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground w-fit" onClick={() => navigate("/partner/revenue")}>
                  Ver detalhamento <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Opções de Resgate */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-4">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-accent" />
                    <h3 className="text-[13px] font-semibold text-foreground">Opções de Resgate</h3>
                  </div>
                  <Tip text="Escolha como deseja utilizar seus Vitacoins liberados." />
                </div>
                <div className="space-y-2">
                  {REDEMPTION_OPTIONS.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl border border-border hover:border-accent/30 transition-colors cursor-pointer group">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary group-hover:bg-accent/10 transition-colors">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition-colors" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-accent transition-colors" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
                  <Coins className="h-3 w-3 inline mr-1 text-accent" />
                  {WALLET.released.toLocaleString("pt-BR")} pontos disponíveis para resgate
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══ ROW 4 — Catálogo Carrossel ═══ */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-foreground">Catálogo de Produtos</h2>
                <Tip text="Navegue pelo catálogo para ver produtos disponíveis e futuros lançamentos." />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCatalogIdx((i) => Math.max(0, i - 1))}
                    disabled={catalogIdx === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
                  </button>
                  <button
                    onClick={() => setCatalogIdx((i) => Math.min(CATALOG.length - 1, i + 1))}
                    disabled={catalogIdx === CATALOG.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-foreground" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground">{catalogIdx + 1}/{CATALOG.length}</span>
              </div>
            </div>

            <Card className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-12 gap-0">
                  <div className="col-span-12 sm:col-span-4 lg:col-span-3 relative bg-white dark:bg-card rounded-l-xl">
                    <div className="aspect-square sm:aspect-auto sm:h-full flex items-center justify-center p-6">
                      <img
                        src={currentProduct.image}
                        alt={currentProduct.name}
                        className={`max-h-[180px] w-auto object-contain ${!currentProduct.active ? "opacity-40 grayscale" : ""}`}
                      />
                      {!currentProduct.active && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                          <div className="text-center">
                            <Lock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                            <p className="text-[11px] font-semibold text-muted-foreground">Em breve</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 sm:col-span-8 lg:col-span-9 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] font-semibold text-foreground">{currentProduct.name}</p>
                          {currentProduct.active ? (
                            <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                              {currentProduct.totalClients} pacientes
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              Lançamento futuro
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{currentProduct.category} • {currentProduct.description}</p>
                      </div>
                    </div>

                    {currentProduct.active && currentProduct.plans.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {currentProduct.plans.map((plan) => (
                            <div key={plan.tier} className="rounded-xl border border-border p-3 space-y-2 relative hover:border-accent/30 transition-colors">
                              {plan.tag && (
                                <div className="absolute -top-2 right-2 bg-accent text-accent-foreground text-[8px] font-semibold px-2 py-0.5 rounded-full">
                                  {plan.tag}
                                </div>
                              )}
                              <p className="text-[12px] font-semibold text-foreground">{plan.tier}</p>
                              <p className="text-lg font-bold text-foreground">{plan.price}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">{plan.clients} pacientes</span>
                                <span className="text-[10px] font-semibold text-accent">{plan.points}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-xl bg-secondary/40 p-3 space-y-1">
                            <p className="text-[10px] text-muted-foreground font-medium">Comissão Média</p>
                            <p className="text-[14px] font-bold text-foreground">12%</p>
                            <p className="text-[9px] text-muted-foreground">por venda recorrente</p>
                          </div>
                          <div className="rounded-xl bg-secondary/40 p-3 space-y-1">
                            <p className="text-[10px] text-muted-foreground font-medium">Ticket Médio</p>
                            <p className="text-[14px] font-bold text-foreground">R$ 198</p>
                            <p className="text-[9px] text-muted-foreground">entre todos os planos</p>
                          </div>
                          <div className="rounded-xl bg-secondary/40 p-3 space-y-1">
                            <p className="text-[10px] text-muted-foreground font-medium">Retenção</p>
                            <p className="text-[14px] font-bold text-accent">94%</p>
                            <p className="text-[9px] text-muted-foreground">taxa de renovação</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border p-6 flex flex-col items-center justify-center text-center">
                        <Package className="h-6 w-6 text-muted-foreground/40 mb-2" />
                        <p className="text-[12px] font-medium text-muted-foreground">Produto em desenvolvimento</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 max-w-xs">
                          Planos e pontuação serão anunciados quando o produto for lançado.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-1.5">
              {CATALOG.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCatalogIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === catalogIdx ? "w-5 bg-accent" : "w-1.5 bg-border hover:bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ ROW 5 — Parceiros Indicados Widget + Formação ═══ */}
        <div className="grid grid-cols-12 gap-4">
          {/* Parceiros Indicados Widget */}
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-5">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 flex flex-col justify-between h-full gap-3">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      <h3 className="text-[13px] font-semibold text-foreground">Parceiros Indicados</h3>
                    </div>
                    <Tip text="Colegas médicos que você indicou para a plataforma. Cada venda dos pacientes deles gera 10% de pontos para você." />
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: "Dr. Carlos Mendes", specialty: "Oftalmologia", initials: "CM", patients: 15, points: 1873, status: "active" as const },
                      { name: "Dra. Fernanda Alves", specialty: "Geriatria", initials: "FA", patients: 10, points: 1249, status: "active" as const },
                      { name: "Dr. Bruno Oliveira", specialty: "Clínica Geral", initials: "BO", patients: 7, points: 669, status: "active" as const },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                            {p.initials}
                          </div>
                          <div>
                            <p className="text-[12px] font-medium text-foreground">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.specialty} • {p.patients} pacientes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-accent">+{p.points.toLocaleString("pt-BR")}</span>
                          <p className="text-[9px] text-muted-foreground">pts p/ você</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-accent/5 border border-accent/10 p-2.5 mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Total de pontos da rede:</span>
                    <span className="text-[12px] font-bold text-accent">+4.040 pts</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-[12px] rounded-xl w-full gap-1" onClick={() => navigate("/partner/referred-partners")}>
                  Ver todos indicados <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Formação + Eventos */}
          <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-7 space-y-4">
            <Card className="overflow-hidden border-border shadow-sm">
              <CardContent className="p-0 relative min-h-[180px]">
                <img src={heroImg} alt="Formação" className="w-full h-full object-cover absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-transparent" />
                <div className="relative z-10 flex flex-col justify-center h-full p-5">
                  <p className="text-[10px] font-medium text-background/60 uppercase tracking-wider">Formação Partner</p>
                  <h3 className="text-[17px] font-bold mt-1 leading-tight text-background">
                    Entenda a ciência<br />por trás do produto
                  </h3>
                  <p className="text-[11px] text-background/60 mt-1">
                    Partners formados ganham <strong className="text-background">2.4x mais pontos</strong>.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Progress value={65} className="h-1.5 flex-1 bg-background/20" />
                    <span className="text-[11px] font-semibold text-background">65%</span>
                  </div>
                  <Button
                    onClick={() => navigate("/partner/formation")}
                    size="sm"
                    className="mt-3 w-fit rounded-xl text-[12px] font-semibold bg-background text-foreground hover:bg-background/90 gap-1.5"
                  >
                    Continuar <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardContent className="p-4 space-y-2.5">
                <h3 className="text-[13px] font-semibold text-foreground">Módulos em Andamento</h3>
                {EDUCATION.map((mod) => {
                  const Icon = mod.icon;
                  const isDone = mod.progress === 100;
                  return (
                    <div key={mod.title} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDone ? "bg-accent/10" : "bg-secondary"}`}>
                        <Icon className={`h-4 w-4 ${isDone ? "text-accent" : "text-muted-foreground"}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-medium text-foreground truncate">{mod.title}</p>
                          <span className={`text-[10px] font-semibold ${isDone ? "text-accent" : "text-muted-foreground"}`}>
                            {isDone ? "✓ Concluído" : `${mod.progress}%`}
                          </span>
                        </div>
                        <Progress value={mod.progress} className="h-1 mt-1.5" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  <h3 className="text-[13px] font-semibold text-foreground">Próximos Eventos</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EVENTS.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-2.5 hover:border-accent/30 transition-colors group">
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                        <img src={ev.img} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground truncate">{ev.title}</p>
                        <p className="text-[10px] text-muted-foreground">{ev.date} • {ev.speaker}</p>
                        <button className="text-[10px] font-semibold text-accent mt-1 hover:underline flex items-center gap-0.5">
                          {ev.cta} <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PartnerDashboard;
