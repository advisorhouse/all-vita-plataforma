import React from "react";
import { motion } from "framer-motion";
import {
  Target, TrendingUp, Clock, Gift, ShoppingBag,
  ChevronRight, Flame, CheckCircle2, AlertCircle, Zap,
  Award, CalendarDays, Trophy, Star, BarChart3, Sparkles,
  ArrowUpRight, Medal,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

import productOriginal from "@/assets/product-vision-lift-1month.png";
import product3Month from "@/assets/product-vision-lift-3month.png";
import product5Month from "@/assets/product-vision-lift-5month.png";
import product10Month from "@/assets/product-vision-lift-10month.png";

const PRODUCT_IMAGES: Record<string, string> = {
  "Vision Lift 1 Mês": productOriginal,
  "Vision Lift 3 Meses": product3Month,
  "Vision Lift 5 Meses": product5Month,
  "Vision Lift 10 Meses": product10Month,
};

const CAMPAIGNS = [
  { id: "1", name: "Blitz Vision Lift 5 Meses", product: "Vision Lift 5 Meses", status: "active" as const, goal: 50, achieved: 32, bonus: "+500 VisionPoints extra", bonusType: "percentage", startDate: "2026-02-15", endDate: "2026-03-15", description: "Indique 50 pacientes para o plano de 5 meses e ganhe 500 VisionPoints extras por indicação.", highlight: true },
  { id: "2", name: "Desafio 10 Meses — Março", product: "Vision Lift 10 Meses", status: "active" as const, goal: 30, achieved: 18, bonus: "200 pts fixo por indicação", bonusType: "fixed", startDate: "2026-03-01", endDate: "2026-03-31", description: "Cada paciente indicado para o plano 10 meses gera 200 VisionPoints extras.", highlight: false },
  { id: "3", name: "Meta Trimestral", product: "Vision Lift 3 Meses", status: "active" as const, goal: 100, achieved: 67, bonus: "Prêmio especial ao atingir meta", bonusType: "prize", startDate: "2026-02-01", endDate: "2026-03-31", description: "Atinja 100 indicações de plano 3 meses e ganhe um kit exclusivo + badge de destaque.", highlight: false },
  { id: "4", name: "Flash — Fevereiro", product: "Vision Lift 5 Meses", status: "ended" as const, goal: 40, achieved: 44, bonus: "+300 VisionPoints extra", bonusType: "percentage", startDate: "2026-02-01", endDate: "2026-02-28", description: "Campanha encerrada. Meta superada em 10%!", highlight: false },
  { id: "5", name: "Lançamento Vision Lift — Jan", product: "Vision Lift 1 Mês", status: "ended" as const, goal: 60, achieved: 48, bonus: "+200 VisionPoints extra", bonusType: "percentage", startDate: "2026-01-10", endDate: "2026-01-31", description: "Campanha de lançamento. Meta não atingida.", highlight: false },
];

const TOP_SELLERS = [
  { rank: 1, name: "Lucas Mendes", sales: 47, isMe: false },
  { rank: 2, name: "Ana Ribeiro", sales: 43, isMe: false },
  { rank: 3, name: "Pedro Alves", sales: 39, isMe: false },
  { rank: 4, name: "Camila Santos", sales: 32, isMe: true },
  { rank: 5, name: "Juliana Costa", sales: 28, isMe: false },
];

function daysRemaining(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const activeCampaigns = CAMPAIGNS.filter((c) => c.status === "active");
const endedCampaigns = CAMPAIGNS.filter((c) => c.status === "ended");

const PartnerCampaigns: React.FC = () => {
  const totalGoal = activeCampaigns.reduce((s, c) => s + c.goal, 0);
  const totalAchieved = activeCampaigns.reduce((s, c) => s + c.achieved, 0);
  const totalPct = Math.round((totalAchieved / totalGoal) * 100);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-foreground">Campanhas</h1>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {activeCampaigns.length} ativas
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Participe das campanhas, bata metas e ganhe VisionPoints extras.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
              <Zap className="h-3 w-3 text-warning" />
              <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
            </div>
          </div>
        </motion.div>

        {/* ── Summary Metrics ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Campanhas Ativas", value: String(activeCampaigns.length), icon: Target, color: "text-accent", tip: "Campanhas em andamento agora" },
            { label: "Progresso Geral", value: `${totalPct}%`, sub: `${totalAchieved}/${totalGoal}`, icon: TrendingUp, color: "text-accent", tip: "Vendas totais vs metas ativas" },
            { label: "Bônus Estimado", value: "R$ 486", icon: Gift, color: "text-warning", tip: "Projeção com base nas vendas atuais" },
            { label: "Sua Posição", value: "#4", sub: "de 48 parceiros", icon: Trophy, color: "text-accent", tip: "Ranking geral de campanhas" },
          ].map((m, i) => (
            <Tooltip key={m.label}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.04 }}
                  className="rounded-2xl border border-border bg-card p-4 vision-shadow cursor-default"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary">
                      <m.icon className={cn("h-3.5 w-3.5", m.color)} />
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground">{m.label}</p>
                  </div>
                  <p className="text-lg font-bold tracking-tight text-foreground">{m.value}</p>
                  {m.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px]">{m.tip}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* ── Hero Campaign (Dark Card) ── */}
        {activeCampaigns.filter((c) => c.highlight).map((c) => {
          const pct = Math.round((c.achieved / c.goal) * 100);
          const days = daysRemaining(c.endDate);
          const img = PRODUCT_IMAGES[c.product];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative overflow-hidden rounded-2xl bg-foreground p-6 md:p-7"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />

              <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
                {img && (
                  <div className="hidden md:flex h-28 w-28 items-center justify-center rounded-2xl bg-background/10 p-3 shrink-0">
                    <img src={img} alt={c.product} className="h-full w-full object-contain drop-shadow-lg" />
                  </div>
                )}

                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-accent" />
                    <Badge className="bg-accent/15 text-accent border-0 text-[10px] uppercase tracking-wider font-bold hover:bg-accent/20">
                      Em Destaque
                    </Badge>
                  </div>
                  <h2 className="text-lg font-bold text-background">{c.name}</h2>
                  <p className="text-[12px] text-background/55 leading-relaxed max-w-md">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-background/45 pt-0.5">
                    <span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> {c.product}</span>
                    <span className="flex items-center gap-1"><Gift className="h-3 w-3 text-accent" /> <span className="text-accent font-medium">{c.bonus}</span></span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {days}d restantes</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDate(c.startDate)} — {formatDate(c.endDate)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 min-w-[120px]">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="7" className="stroke-background/10" />
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="7" className="stroke-accent" strokeLinecap="round" strokeDasharray={`${pct * 2.64} 264`} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-bold text-background">{pct}%</span>
                      <span className="text-[9px] text-background/45">da meta</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-background/60">{c.achieved}/{c.goal} vendas</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* ══════ TWO-COLUMN LAYOUT ══════ */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

          {/* ── LEFT COLUMN (8 cols) ── */}
          <div className="lg:col-span-8 space-y-5">
            {/* Active Campaigns — horizontal list cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-foreground">Campanhas Ativas</h2>
                <span className="text-[11px] text-muted-foreground">{activeCampaigns.filter(c => !c.highlight).length} campanhas</span>
              </div>
              <div className="space-y-3">
                {activeCampaigns.filter((c) => !c.highlight).map((c, i) => {
                  const pct = Math.round((c.achieved / c.goal) * 100);
                  const days = daysRemaining(c.endDate);
                  const urgent = days <= 7;
                  const img = PRODUCT_IMAGES[c.product];
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="rounded-2xl border border-border bg-card p-4 vision-shadow hover:border-accent/30 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        {img && (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/50 p-2 shrink-0">
                            <img src={img} alt={c.product} className="h-full w-full object-contain" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <h3 className="text-[13px] font-semibold text-foreground group-hover:text-accent transition-colors truncate">{c.name}</h3>
                            <div className={cn(
                              "flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold shrink-0",
                              urgent ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                            )}>
                              {urgent ? <AlertCircle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                              {days}d
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2">{c.description}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-1.5 flex-1 [&>div]:bg-accent" />
                            <span className="text-[10px] font-bold text-foreground w-7 text-right tabular-nums">{pct}%</span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                              <span>{c.achieved}/{c.goal} vendas</span>
                              <span className="text-accent font-semibold flex items-center gap-0.5"><Zap className="h-2.5 w-2.5" />{c.bonus}</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Prêmios — full-width showcase ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-foreground">Prêmios das Campanhas</h2>
                <span className="text-[11px] text-muted-foreground">3 prêmios</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { name: "Kit Exclusivo Vision Lift", req: "100 indicações 3 meses", progress: 67, total: 100, product: "Vision Lift 3 Meses" },
                  { name: "Badge Destaque Ouro", req: "Top 3 no ranking", progress: 4, total: 3, product: "Vision Lift 5 Meses" },
                  { name: "Bônus 2.000 VisionPoints", req: "Todas as metas batidas", progress: 1, total: 3, product: "Vision Lift 10 Meses" },
                ].map((prize, i) => {
                  const done = prize.progress >= prize.total;
                  const pct = Math.min(Math.round((prize.progress / prize.total) * 100), 100);
                  const img = PRODUCT_IMAGES[prize.product];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.05 }}
                      className={cn(
                        "rounded-2xl border p-4 transition-all",
                        done
                          ? "border-accent/25 bg-gradient-to-b from-accent/8 to-transparent vision-shadow"
                          : "border-border bg-card vision-shadow"
                      )}
                    >
                      {/* Product image */}
                      <div className={cn(
                        "flex h-16 w-16 mx-auto items-center justify-center rounded-xl p-2.5 mb-3",
                        done ? "bg-accent/10" : "bg-secondary/50"
                      )}>
                        {img ? (
                          <img src={img} alt={prize.product} className={cn("h-full w-full object-contain", !done && "opacity-50")} />
                        ) : (
                          <Gift className={cn("h-6 w-6", done ? "text-accent" : "text-muted-foreground/40")} />
                        )}
                      </div>

                      <div className="text-center mb-3">
                        <p className={cn("text-[12px] font-semibold", done ? "text-accent" : "text-foreground")}>{prize.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{prize.req}</p>
                      </div>

                      <Progress value={pct} className={cn("h-1.5 mb-1.5", done ? "[&>div]:bg-accent" : "[&>div]:bg-muted-foreground/25")} />
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground">{prize.progress}/{prize.total}</span>
                        {done ? (
                          <Badge className="bg-accent/15 text-accent border-0 text-[9px] font-bold px-1.5 py-0">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Conquistado
                          </Badge>
                        ) : (
                          <span className="text-[9px] font-bold text-foreground tabular-nums">{pct}%</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Ended Campaigns — compact 2-col grid */}
            {endedCampaigns.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-foreground">Encerradas</h2>
                  <span className="text-[11px] text-muted-foreground">{endedCampaigns.length}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {endedCampaigns.map((c, i) => {
                    const pct = Math.round((c.achieved / c.goal) * 100);
                    const exceeded = c.achieved >= c.goal;
                    const img = PRODUCT_IMAGES[c.product];
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="rounded-2xl border border-border bg-card/50 p-4"
                      >
                        <div className="flex items-center gap-3 mb-2.5">
                          {img && (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/30 p-1.5 shrink-0 opacity-60">
                              <img src={img} alt={c.product} className="h-full w-full object-contain" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[12px] font-semibold text-foreground truncate">{c.name}</h3>
                            <p className="text-[9px] text-muted-foreground">{formatDate(c.startDate)} — {formatDate(c.endDate)}</p>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-bold shrink-0 px-1.5",
                            exceeded ? "border-accent/30 text-accent bg-accent/5" : "border-muted-foreground/20 text-muted-foreground"
                          )}>
                            {exceeded ? <><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Batida</> : "Não atingida"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(pct, 100)} className={cn("h-1 flex-1", exceeded ? "[&>div]:bg-accent" : "[&>div]:bg-muted-foreground/20")} />
                          <span className={cn("text-[9px] font-bold w-6 text-right tabular-nums", exceeded ? "text-accent" : "text-muted-foreground")}>{pct}%</span>
                        </div>
                        {exceeded && (
                          <p className="mt-1.5 text-[9px] text-accent/70 flex items-center gap-0.5">
                            <Award className="h-2.5 w-2.5" /> Bônus: {c.bonus}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (4 cols) ── */}
          <div className="lg:col-span-4 space-y-4">

            {/* Ranking */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-card p-4 vision-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                  <BarChart3 className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <h3 className="text-[12px] font-semibold text-foreground">Ranking da Campanha</h3>
                  <p className="text-[9px] text-muted-foreground">Blitz Vision Lift 5 Meses</p>
                </div>
              </div>
              <div className="space-y-0.5">
                {TOP_SELLERS.map((p) => (
                  <div key={p.rank} className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5",
                    p.isMe ? "bg-accent/8 border border-accent/15" : "hover:bg-secondary/30 transition-colors"
                  )}>
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold",
                      p.rank <= 3 ? "bg-warning/15 text-warning" : "bg-secondary text-muted-foreground"
                    )}>
                      {p.rank <= 3 ? <Medal className="h-2.5 w-2.5" /> : p.rank}
                    </div>
                    <p className={cn("text-[11px] font-medium flex-1 truncate", p.isMe ? "text-accent" : "text-foreground")}>
                      {p.name}{p.isMe && <span className="text-[9px] text-accent/60 ml-1">(você)</span>}
                    </p>
                    <span className="text-[10px] font-bold text-foreground tabular-nums">{p.sales}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-card p-4 vision-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                </div>
                <h3 className="text-[12px] font-semibold text-foreground">Seu Desempenho</h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "Vendas este mês", value: "32", change: "+8", positive: true },
                  { label: "Taxa de conversão", value: "18%", change: "+3pp", positive: true },
                  { label: "Bônus acumulado", value: "R$ 486", change: "3 camp.", positive: true },
                  { label: "Metas batidas", value: "1/3", change: "2 ativas", positive: false },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-foreground tabular-nums">{stat.value}</span>
                      <span className={cn(
                        "text-[8px] font-semibold px-1 py-0.5 rounded",
                        stat.positive ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
                      )}>
                        {stat.positive && <ArrowUpRight className="h-2 w-2 inline" />}{stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>




            {/* Tip + Motivation combined */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-accent/10 bg-accent/5 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <Star className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground">Dica da semana</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">
                    Parceiros que compartilham nas redes vendem <strong className="text-foreground">2,4x mais</strong> em campanhas.
                  </p>
                </div>
              </div>
              <div className="h-px bg-accent/10" />
              <div className="flex items-start gap-2.5">
                <Trophy className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground">Faltam 18 vendas</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">
                    Para bater todas as metas. Você está no <strong className="text-foreground">Top 10%</strong>!
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PartnerCampaigns;
