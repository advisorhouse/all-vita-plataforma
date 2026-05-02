import React from "react";
import { motion } from "framer-motion";
import {
  Trophy, Crown, Medal, Star, TrendingUp, Users, Heart,
  Award, Zap, ArrowUpRight, ChevronUp, ChevronDown, Minus,
  Target, ShieldCheck, Sparkles, Info, Flame, Coins,
  Gift, CheckCircle2, Lock, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCurrentPartner } from "@/hooks/useCurrentPartner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import productOriginal from "@/assets/product-vision-lift-1month.png";
import product5Month from "@/assets/product-vision-lift-5month.png";
import product10Month from "@/assets/product-vision-lift-10month.png";

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

// ─── Anonymization helper ────────────────────────────────────
// Shows initials + partial CRM for privacy: "L.M. · CRM 452•••"
const anonymize = (name: string, crm: string) => {
  const parts = name.split(" ");
  const initials = parts.map(p => p[0] + ".").join("");
  const crmVisible = crm.slice(0, 3) + "•••";
  return { initials, crmLabel: `CRM ${crmVisible}` };
};

// ─── Data ────────────────────────────────────────────────────
const MY_POSITION = 7;
const TOTAL_PARTNERS = 48;

const LEADERBOARD = [
  { rank: 1, name: "Larissa Mendonça", crm: "452891", level: "Platina", clients: 92, retention: 97, points: 28400, change: 0 },
  { rank: 2, name: "Fernanda Gomes", crm: "318764", level: "Platina", clients: 78, retention: 95, points: 24200, change: 1 },
  { rank: 3, name: "Carolina Vieira", crm: "527103", level: "Platina", clients: 71, retention: 96, points: 22800, change: -1 },
  { rank: 4, name: "Bianca Torres", crm: "641285", level: "Ouro", clients: 64, retention: 94, points: 19600, change: 2 },
  { rank: 5, name: "Priscila Ribeiro", crm: "189453", level: "Ouro", clients: 58, retention: 93, points: 17800, change: 0 },
  { rank: 6, name: "Juliana Andrade", crm: "732916", level: "Ouro", clients: 52, retention: 91, points: 15400, change: -2 },
  { rank: 7, name: "Camila Santos", crm: "294107", level: "Ouro", clients: 48, retention: 91, points: 12480, change: 3, isMe: true },
  { rank: 8, name: "Tatiana Lima", crm: "856321", level: "Ouro", clients: 45, retention: 89, points: 11200, change: -1 },
  { rank: 9, name: "Amanda Ferreira", crm: "403278", level: "Prata", clients: 38, retention: 88, points: 9400, change: 0 },
  { rank: 10, name: "Daniela Costa", crm: "671594", level: "Prata", clients: 34, retention: 86, points: 8200, change: 1 },
];

const RANKINGS_BY_METRIC = [
  { metric: "Pacientes Ativos", myRank: 7, icon: Users, value: "48", percentile: "Top 15%", tip: "Quantidade de pacientes com assinatura ativa na sua rede." },
  { metric: "Taxa de Retenção", myRank: 5, icon: Heart, value: "91%", percentile: "Top 10%", tip: "Percentual de pacientes que renovaram nos últimos 3 meses." },
  { metric: "Vitacoins/mês", myRank: 7, icon: Coins, value: "12.4k", percentile: "Top 15%", tip: "Total de Vitacoins acumulados mensalmente pela sua carteira." },
  { metric: "Consistência da Rede", myRank: 4, icon: ShieldCheck, value: "82%", percentile: "Top 8%", tip: "Média de uso consistente dos seus pacientes. Alta consistência = menor churn." },
];

const ACHIEVEMENTS = [
  { title: "Primeiros 10 Pacientes", desc: "Você construiu sua primeira base sólida", unlocked: true, date: "Out/25", icon: Users },
  { title: "Retenção Exemplar", desc: "Manteve 90%+ de retenção por 3 meses seguidos", unlocked: true, date: "Jan/26", icon: ShieldCheck },
  { title: "Top 20% do Ranking", desc: "Sua performance te colocou entre os 20% melhores", unlocked: true, date: "Dez/25", icon: TrendingUp },
  { title: "Formação Completa", desc: "Conclua todos os 5 níveis de capacitação", unlocked: false, date: null, icon: Award },
  { title: "Marco de 50 Pacientes", desc: "Alcance 50 pacientes ativos na sua rede", unlocked: false, date: null, icon: Star },
  { title: "Nível Platina", desc: "Reconhecimento máximo do programa de Partners", unlocked: false, date: null, icon: Crown },
];

const MILESTONES = [
  { label: "10 Pacientes", done: true },
  { label: "25 Pacientes", done: true },
  { label: "50 Pacientes", done: false, current: true, progress: 96 },
  { label: "100 Pacientes", done: false },
];

const PRIZES_MOCK = [
  { title: "Kit Exclusivo Vision Lift", desc: "Kit premium com produtos selecionados para uso pessoal — reconhecimento por estar entre os melhores.", img: productOriginal, requirement: "Top 10 do mês", unlocked: true },
  { title: "Vision Lift 5 Meses Premium", desc: "Plano completo de 5 meses enviado para você como parceiro(a) destaque por 2 meses consecutivos.", img: product5Month, requirement: "Top 5 por 2 meses", unlocked: false },
  { title: "Vision Lift 10 Meses + 2.000 pts", desc: "Tratamento completo de 10 meses + bônus permanente de 2.000 Vitacoins.", img: product10Month, requirement: "Nível Platina", unlocked: false },
];

const levelColors: Record<string, string> = {
  Platina: "text-accent",
  Ouro: "text-warning",
  Prata: "text-muted-foreground",
};

const PartnerRanking: React.FC = () => {
  const { data: partner, isLoading: loadingPartner } = useCurrentPartner();

  const { data: rewards = [] } = useQuery({
    queryKey: ["partner-rewards", partner?.tenant_id],
    queryFn: async () => {
      if (!partner?.tenant_id) return [];
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("tenant_id", partner.tenant_id)
        .eq("active", true)
        .order("points_required", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!partner?.tenant_id
  });

  const { data: wallet } = useQuery({
    queryKey: ["partner-wallet-ranking", partner?.id],
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

  const { data: rankingPos = 0 } = useQuery({
    queryKey: ["partner-ranking-pos", partner?.tenant_id],
    queryFn: async () => {
      if (!partner?.tenant_id) return 0;
      // Simple ranking by total earned
      const { data } = await supabase
        .from("vitacoins_wallet")
        .select("user_id, total_earned")
        .eq("tenant_id", partner.tenant_id)
        .order("total_earned", { ascending: false });
      
      const pos = data?.findIndex(w => w.user_id === partner.user_id) ?? -1;
      return pos === -1 ? 0 : pos + 1;
    },
    enabled: !!partner?.tenant_id
  });

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  // For the current user, show full name; for others, anonymize
  const displayName = (p: typeof LEADERBOARD[0]) => {
    if (p.isMe) return "Você";
    const { initials, crmLabel } = anonymize(p.name, p.crm);
    return `${initials} · ${crmLabel}`;
  };

  const podiumAvatar = (p: typeof LEADERBOARD[0]) => {
    if (p.isMe) return "Você";
    const parts = p.name.split(" ");
    return parts.map(n => n[0]).join("");
  };

  if (loadingPartner) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-accent" /></div>;

  const currentPos = rankingPos || MY_POSITION;
  const currentPoints = Number(wallet?.total_earned || 0);


  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* ═══ Standardized Header ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-foreground">Ranking Partners</h1>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  #{currentPos} de {TOTAL_PARTNERS}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Acompanhe sua evolução, conquiste marcos e desbloqueie prêmios reais.
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

        {/* ═══ Hero: Posição Geral + Próxima Meta ═══ */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="relative overflow-hidden border-accent/30 shadow-sm bg-gradient-to-br from-accent via-accent/90 to-accent/70 h-full">
              <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
              <CardContent className="relative z-10 p-7 flex flex-col justify-center h-full text-accent-foreground min-h-[230px]">
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="text-[9px] font-medium bg-white/20 text-accent-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ChevronUp className="h-3 w-3" /> +3 posições este mês
                  </span>
                  <span className="text-[9px] font-medium bg-white/15 text-accent-foreground px-2 py-0.5 rounded-full">
                    Top 15%
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-medium text-accent-foreground/60 uppercase tracking-wider">Sua Posição Geral</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black">#{currentPos}</span>
                  <span className="text-[15px] text-accent-foreground/70 font-medium">de {TOTAL_PARTNERS} Partners ativos</span>
                </div>
                <p className="text-[13px] text-accent-foreground/70 mt-2 max-w-lg leading-relaxed">
                  Você subiu <strong className="text-accent-foreground">3 posições</strong> este mês graças ao crescimento da sua carteira.
                  Faltam <strong className="text-accent-foreground">4 pacientes</strong> para alcançar a <strong className="text-accent-foreground">6ª posição</strong>.
                </p>

                <div className="mt-5 flex gap-3 flex-wrap">
                  <span className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white/15 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5" /> Nível Ouro
                  </span>
                  <span className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white/15 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" /> {unlockedCount} conquistas
                  </span>
                  <span className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white/15 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> 48 pacientes ativos
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
              <Card className="border-border shadow-sm h-full bg-foreground">
                <CardContent className="p-4 flex flex-col justify-center h-full gap-1 text-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <h3 className="text-[12px] font-semibold">Próxima Posição</h3>
                    </div>
                    <Tip text="Para subir no ranking, foque em aumentar pacientes ativos e manter alta retenção." />
                  </div>
                  <p className="text-[12px] text-background/60 mt-1">
                    Para alcançar <span className="font-bold text-background">#{currentPos - 1}</span> você precisa de mais 4 pacientes ativos.
                  </p>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-background/50">48 de 52 pacientes</span>
                      <span className="text-[12px] font-bold">92%</span>
                    </div>
                    <Progress value={92} className="h-1.5 [&>div]:bg-accent" />
                  </div>
                  <div className="flex items-center gap-1 text-accent mt-1">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="text-[10px] font-semibold">No seu ritmo atual, em ~5 semanas</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
              <Card className="border-accent/20 shadow-sm h-full bg-accent/5">
                <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    <h3 className="text-[12px] font-semibold text-foreground">Seus Melhores Resultados</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Melhor posição", value: "#4 Consistência", icon: TrendingUp, tip: "Seu melhor ranking individual entre as categorias." },
                      { label: "Retenção da rede", value: "91% (Top 10%)", icon: Heart, tip: "Percentual de pacientes que renovaram — entre as 10% melhores." },
                      { label: "Próxima conquista", value: "50 Pacientes", icon: Gift, tip: "O próximo marco de crescimento da sua rede." },
                    ].map(({ label, value, icon: Icon, tip }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Icon className="h-3 w-3" /> {label}
                          <Tip text={tip} />
                        </span>
                        <span className="text-[12px] font-bold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ═══ Ranking por Categoria ═══ */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2">
          <div className="flex items-center gap-2 px-0.5">
            <Star className="h-4 w-4 text-accent" />
            <h2 className="text-[15px] font-semibold text-foreground">Sua Posição por Categoria</h2>
            <Tip text="O ranking geral é composto pela média ponderada: 40% pacientes ativos, 30% retenção e 30% Vitacoins." />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {RANKINGS_BY_METRIC.map(({ metric, myRank, icon: Icon, value, percentile, tip }) => (
              <Card key={metric} className="border-border shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-accent">{percentile}</span>
                      <Tip text={tip} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-foreground">#{myRank}</p>
                    <p className="text-[12px] text-muted-foreground">{value}</p>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground">{metric}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ Vitrine de Prêmios ═══ */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-accent" />
            <h2 className="text-[15px] font-semibold text-foreground">Vitrine de Prêmios</h2>
            <Tip text="Prêmios reais que você desbloqueia ao atingir marcos no ranking. Os itens são enviados para sua clínica." />
          </div>
          <p className="text-[12px] text-muted-foreground -mt-1 px-0.5">
            Conquiste posições no ranking e receba produtos exclusivos como reconhecimento.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.length > 0 ? rewards.map((prize: any, i) => (
              <Card key={prize.id} className={cn(
                "border shadow-sm overflow-hidden transition-all hover:shadow-md group relative",
                currentPoints >= prize.points_required ? "border-accent/30 bg-gradient-to-b from-accent/8 to-transparent" : "border-border"
              )}>
                {currentPoints >= prize.points_required && (
                  <div className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Disponível
                  </div>
                )}
                <CardContent className="p-0">
                  <div className={cn(
                    "h-40 flex items-center justify-center overflow-hidden",
                    currentPoints >= prize.points_required ? "bg-accent/5" : "bg-secondary/30"
                  )}>
                    {(prize.metadata as any)?.image_url ? (
                      <img
                        src={(prize.metadata as any).image_url}
                        alt={prize.name}
                        className={cn(
                          "h-32 w-32 object-contain transition-transform duration-300 group-hover:scale-110",
                          currentPoints < prize.points_required && "opacity-40 grayscale"
                        )}
                      />
                    ) : (
                      <Gift className={cn("h-16 w-16", currentPoints >= prize.points_required ? "text-accent" : "text-muted-foreground")} />
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-foreground leading-tight">{prize.name}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{prize.description}</p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">{prize.points_required} Vitacoins</span>
                      {currentPoints < prize.points_required ? (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Lock className="h-3 w-3" /> Bloqueado
                        </div>
                      ) : (
                        <div className="text-[10px] text-success font-bold">Resgate liberado</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : PRIZES_MOCK.map((prize, i) => (
              <Card key={i} className={cn(
                "border shadow-sm overflow-hidden transition-all hover:shadow-md group relative",
                prize.unlocked ? "border-accent/30 bg-gradient-to-b from-accent/8 to-transparent" : "border-border"
              )}>
                {prize.unlocked && (
                  <div className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Conquistado
                  </div>
                )}
                <CardContent className="p-0">
                  <div className={cn(
                    "h-40 flex items-center justify-center overflow-hidden",
                    prize.unlocked ? "bg-accent/5" : "bg-secondary/30"
                  )}>
                    <img
                      src={prize.img}
                      alt={prize.title}
                      className={cn(
                        "h-32 w-32 object-contain transition-transform duration-300 group-hover:scale-110",
                        !prize.unlocked && "opacity-40 grayscale"
                      )}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className={cn("text-[14px] font-semibold", prize.unlocked ? "text-foreground" : "text-foreground/60")}>
                      {prize.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{prize.desc}</p>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold",
                      prize.unlocked ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
                    )}>
                      {prize.unlocked ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {prize.requirement}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ Leaderboard (8) + Conquistas & Jornada (4) ═══ */}
        <div className="grid grid-cols-12 gap-4">
          {/* Leaderboard */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-accent" />
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">Top 10 Partners</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Ranking mensal • Identidades preservadas por ética médica
                      </p>
                    </div>
                  </div>
                  <Tip text="Por respeito à ética profissional, os nomes são exibidos apenas como iniciais + CRM parcial. A posição é calculada combinando: pacientes ativos (40%), retenção (30%) e Vitacoins (30%)." />
                </div>

                {/* Top 3 Podium — anonymized */}
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {LEADERBOARD.slice(0, 3).map((p) => {
                    const display = displayName(p);
                    return (
                      <div key={p.rank} className={cn(
                        "rounded-xl p-4 text-center space-y-2 border",
                        p.rank === 1 ? "bg-warning/5 border-warning/30" : "bg-secondary/30 border-border"
                      )}>
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center mx-auto",
                          p.rank === 1 ? "bg-warning/20" : p.rank === 2 ? "bg-muted" : "bg-warning/10"
                        )}>
                          {p.rank === 1 ? <Crown className="h-5 w-5 text-warning" /> : <Medal className={cn("h-5 w-5", p.rank === 2 ? "text-muted-foreground" : "text-warning/70")} />}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-foreground">{display}</p>
                          <p className={cn("text-[10px] font-semibold", levelColors[p.level])}>{p.level}</p>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <div>
                            <p className="text-[9px] text-muted-foreground">Pacientes</p>
                            <p className="text-[12px] font-bold text-foreground">{p.clients}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 justify-center">
                              <Coins className="h-2.5 w-2.5" /> Pts
                            </p>
                            <p className="text-[12px] font-bold text-foreground">{(p.points / 1000).toFixed(0)}k</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rest of leaderboard — anonymized */}
                <div className="space-y-1.5">
                  {LEADERBOARD.slice(3).map((p) => {
                    const display = displayName(p);
                    const avatar = podiumAvatar(p);
                    return (
                      <div key={p.rank} className={cn(
                        "flex items-center gap-3 rounded-xl p-3 transition-colors",
                        p.isMe ? "bg-accent/5 border border-accent/20" : "hover:bg-secondary/30"
                      )}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-muted-foreground shrink-0">
                          {p.rank}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn("text-[13px] font-semibold truncate", p.isMe ? "text-accent" : "text-foreground")}>
                            {display}
                          </p>
                          <p className={cn("text-[10px] font-medium", levelColors[p.level] || "text-muted-foreground")}>
                            {p.level}
                          </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-5">
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Pacientes</p>
                            <p className="text-[12px] font-semibold text-foreground">{p.clients}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Retenção</p>
                            <p className="text-[12px] font-semibold text-foreground">{p.retention}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                              <Coins className="h-2.5 w-2.5" /> Pts/mês
                            </p>
                            <p className="text-[12px] font-semibold text-accent">{(p.points / 1000).toFixed(1)}k</p>
                          </div>
                        </div>

                        <div className="flex items-center shrink-0">
                          {p.change > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-accent">
                              <ChevronUp className="h-3.5 w-3.5" /> {p.change}
                            </span>
                          )}
                          {p.change < 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-destructive">
                              <ChevronDown className="h-3.5 w-3.5" /> {Math.abs(p.change)}
                            </span>
                          )}
                          {p.change === 0 && <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Conquistas + Jornada + Dica */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-accent" />
                      <div>
                        <h3 className="text-[13px] font-bold text-foreground">Suas Conquistas</h3>
                        <p className="text-[10px] text-muted-foreground">Marcos alcançados na sua trajetória</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-accent">
                      {unlockedCount}/{ACHIEVEMENTS.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {ACHIEVEMENTS.map((a) => {
                      const AIcon = a.icon;
                      return (
                        <div key={a.title} className={cn(
                          "p-3 rounded-xl border transition-colors",
                          a.unlocked ? "border-accent/20 bg-accent/5" : "border-border bg-secondary/30"
                        )}>
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                              a.unlocked ? "bg-accent text-accent-foreground" : "bg-muted"
                            )}>
                              {a.unlocked
                                ? <AIcon className="h-3.5 w-3.5" />
                                : <Lock className="h-3 w-3 text-muted-foreground" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-[12px] font-semibold truncate",
                                a.unlocked ? "text-foreground" : "text-foreground/60"
                              )}>
                                {a.title}
                              </p>
                              <p className={cn(
                                "text-[10px] leading-relaxed",
                                a.unlocked ? "text-muted-foreground" : "text-muted-foreground/60"
                              )}>
                                {a.desc}
                              </p>
                            </div>
                            {a.unlocked && a.date && (
                              <span className="text-[9px] font-semibold text-accent shrink-0 bg-accent/10 px-1.5 py-0.5 rounded-md">
                                {a.date}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-accent" />
                    <div>
                      <h3 className="text-[13px] font-bold text-foreground">Jornada de Crescimento</h3>
                      <p className="text-[10px] text-muted-foreground">Marcos de pacientes ativos na sua rede</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-3">
                      {MILESTONES.map((m) => (
                        <div key={m.label} className="flex items-center gap-3 relative">
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10",
                            m.done ? "bg-accent text-accent-foreground" :
                            m.current ? "bg-accent/20 border-2 border-accent" :
                            "bg-secondary border border-border"
                          )}>
                            {m.done && <CheckCircle2 className="h-3 w-3" />}
                            {m.current && <Zap className="h-3 w-3 text-accent" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-[12px] font-semibold",
                              m.done ? "text-foreground" :
                              m.current ? "text-accent" :
                              "text-muted-foreground"
                            )}>
                              {m.label}
                            </p>
                            {m.current && m.progress && (
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={m.progress} className="h-1 flex-1" />
                                <span className="text-[10px] font-semibold text-accent">{m.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border-accent/20 shadow-sm bg-accent/5">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <h3 className="text-[12px] font-bold text-foreground">Seu Próximo Passo</h3>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Com mais <strong className="text-foreground">2 pacientes</strong> ativos, você alcança o marco de <strong className="text-foreground">50 Pacientes</strong> e desbloqueia a conquista correspondente.
                    Mantenha a retenção acima de 90% para garantir sua posição no Top 10. 🎯
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PartnerRanking;
