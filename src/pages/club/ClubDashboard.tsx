import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Check, Package, ArrowRight, Truck, CreditCard, BookOpen,
  Users, Gift, ShieldCheck, Sparkles, Heart, CalendarDays,
  Droplets, Star, UserPlus,
} from "lucide-react";
import ConsistencyCalendar from "@/components/club/ConsistencyCalendar";
import HelpButton from "@/components/club/HelpButton";
import RewardsRoadmap from "@/components/club/rewards/RewardsRoadmap";
import VideoPlaylistWidget from "@/components/club/dashboard/VideoPlaylistWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useActivationFlow } from "@/hooks/useActivationFlow";
import { useReEngagement } from "@/hooks/useReEngagement";
import { useMilestone3M } from "@/hooks/useMilestone3M";
import WelcomeModal from "@/components/club/activation/WelcomeModal";
import WeekCompleteModal from "@/components/club/activation/WeekCompleteModal";
import ActivationCard from "@/components/club/activation/ActivationCard";
import ReEngagementCard from "@/components/club/reengagement/ReEngagementCard";
import MilestoneModal from "@/components/club/milestone/MilestoneModal";
import EliteInviteCard from "@/components/club/elite/EliteInviteCard";
import { useEliteInvite } from "@/hooks/useEliteInvite";
import { t } from "@/lib/emotional-copy";
import productImage from "@/assets/product-vision-lift-1month.png";
import iconVisionLift from "@/assets/icon-vision-lift.png";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function getTimeIcon() {
  const h = new Date().getHours();
  if (h < 12)
    return (
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="h-5 w-5 text-accent"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </motion.svg>
    );
  if (h < 18)
    return (
      <motion.svg
        animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
        className="h-5 w-5 text-accent"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
      </motion.svg>
    );
  return (
    <motion.svg
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="h-5 w-5 text-accent"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    >
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </motion.svg>
  );
}

// Mock data
const userName = "Maria";
const currentDay = new Date().getDate();
const productName = "Vision Lift Original";
const nextShipment = "15 de Março, 2026";

const STEPS = [
  { icon: Droplets, title: "1. Tome diariamente", desc: "Aplique o Vision Lift todos os dias e registre aqui no app. A consistência é o segredo dos melhores resultados." },
  { icon: Star, title: "2. Ganhe prêmios", desc: "Cada mês ativo desbloqueia um benefício exclusivo: descontos, brindes e até consultas gratuitas." },
  { icon: BookOpen, title: "3. Aprenda mais", desc: "Acesse vídeos explicativos e artigos sobre saúde ocular escritos por especialistas, direto no app." },
  { icon: UserPlus, title: "4. Indique amigos", desc: "Compartilhe seu link exclusivo com amigos e familiares. Vocês dois ganham descontos especiais." },
];

const ClubDashboard: React.FC = () => {
  const navigate = useNavigate();
  const activation = useActivationFlow();
  const reengagement = useReEngagement();
  const milestone = useMilestone3M();
  const eliteInvite = useEliteInvite(milestone.state.elite_status, milestone.state.average_consistency);
  const [justMarked, setJustMarked] = useState(false);
  const [activationCardDismissed, setActivationCardDismissed] = useState(false);
  const [weekModalDismissed, setWeekModalDismissed] = useState(false);

  const todayMarked = activation.state.days_marked.includes(currentDay) || justMarked;
  const markedDays = [...activation.state.days_marked, ...(justMarked && !activation.state.days_marked.includes(currentDay) ? [currentDay] : [])];

  const handleMarkToday = () => {
    setJustMarked(true);
    activation.markDay(currentDay);
  };

  const showWelcome = activation.isActive && activation.currentDay === 0 && !activation.state.welcome_modal_seen;
  const showWeekComplete = activation.state.activation_completed && !weekModalDismissed;
  const showActivationCard = activation.isActive && activation.currentDay >= 1 && activation.currentDay <= 6 && !activationCardDismissed;

  const greetingKey = milestone.is12MPlus ? "greeting_12m" : milestone.is6MPlus ? "greeting_6m" : milestone.is3MPlus ? "greeting_3m" : "greeting_default";

  const streak = useMemo(() => {
    const sorted = [...new Set(markedDays)].sort((a, b) => a - b);
    let s = 0;
    for (let d = currentDay; d >= 1; d--) {
      if (sorted.includes(d)) s++;
      else break;
    }
    return s;
  }, [markedDays, currentDay]);

  const activeMonths = milestone.state.active_months || 1;

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 space-y-8">
      {/* Modals */}
      <WelcomeModal open={showWelcome} onDismiss={activation.dismissWelcome} />
      <WeekCompleteModal open={showWeekComplete} daysMarked={markedDays.length} consistencyPercent={activation.consistencyPercent} hasBadge={activation.state.badge_first_week} onDismiss={() => setWeekModalDismissed(true)} />
      <MilestoneModal open={milestone.showMilestoneModal} onDismiss={milestone.dismissModal} variant="3m" />
      <MilestoneModal open={milestone.show6MModal} onDismiss={milestone.dismiss6MModal} variant="6m" />
      <MilestoneModal open={milestone.show12MModal} onDismiss={milestone.dismiss12MModal} variant="12m" />

      {/* ===== HERO BANNER — Full width, humanized ===== */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-accent/10 via-card to-accent/5">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Left ~60% — greeting + product */}
              <div className="flex-1 p-8 space-y-4">
                <div className="flex items-center gap-2">
                  {getTimeIcon()}
                  <p className="text-lg text-muted-foreground">
                    {getTimeGreeting()}, <span className="font-semibold text-foreground">{userName}</span>
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight">
                  {t(greetingKey)}
                </h1>
                <div className="flex items-center gap-4 pt-2">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    src={productImage}
                    alt={productName}
                    className="h-24 w-auto object-contain drop-shadow-lg shrink-0"
                  />
                  <div>
                    <p className="text-xl font-semibold text-foreground">{productName}</p>
                    <p className="text-base text-muted-foreground">Plano 1 Mês · Mês {activeMonths}</p>
                  </div>
                </div>
              </div>

              {/* Right ~40% — subscription info */}
              <div className="lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-secondary/20 p-8 flex flex-col justify-center space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent w-fit">
                  <ShieldCheck className="h-4 w-4" /> Assinatura ativa
                </span>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card">
                      <Truck className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Próximo envio</p>
                      <p className="text-sm text-muted-foreground">{nextShipment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card">
                      <CreditCard className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Pagamento</p>
                      <p className="text-sm text-accent font-medium">Confirmado</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-12 text-base hover:bg-accent hover:text-accent-foreground hover:border-accent"
                  onClick={() => navigate("/club/subscription")}
                >
                  Gerenciar assinatura
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== COMO FUNCIONA — Second widget, solid accent ===== */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-md bg-secondary/30">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success">
                <Sparkles className="h-7 w-7 text-success-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Como funciona</h2>
                <p className="text-base text-muted-foreground">Siga esses passos simples para aproveitar ao máximo sua assinatura</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex flex-col items-center text-center gap-4 rounded-2xl bg-card border border-border p-6 shadow-sm"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15">
                      <Icon className="h-7 w-7 text-success" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== DAILY USE + CONSISTENCY — Side by side ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Register daily use */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Card className={`border shadow-sm overflow-hidden h-full ${todayMarked ? "border-accent/30 bg-accent/5" : "border-border"}`}>
            <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full justify-center">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${todayMarked ? "bg-accent/15" : "bg-foreground"}`}>
                {todayMarked ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Check className="h-8 w-8 text-accent" />
                  </motion.div>
                ) : (
                  <Heart className="h-7 w-7 text-background" />
                )}
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {todayMarked ? "Uso registrado hoje" : "Registre o uso de hoje"}
                </p>
                <p className="text-base text-muted-foreground mt-1">
                  {todayMarked ? "Continue assim para desbloquear seus prêmios." : "Cada dia conta para sua próxima recompensa."}
                </p>
              </div>
              {!todayMarked && (
                <Button
                  onClick={handleMarkToday}
                  size="lg"
                  className="rounded-2xl h-14 px-8 text-lg font-medium bg-accent text-accent-foreground hover:bg-accent/90 w-full"
                >
                  Registrar
                  <Check className="h-5 w-5 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Consistency Calendar */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="h-full [&>div]:h-full [&>div>div]:h-full">
            <ConsistencyCalendar
              markedDays={markedDays}
              onMarkDay={(day) => {
                if (day === currentDay) handleMarkToday();
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* ===== ACTIVATION / RE-ENGAGEMENT CARDS ===== */}
      {showActivationCard && (
        <ActivationCard
          dayCounter={activation.currentDay}
          daysMarked={markedDays}
          consistencyPercent={activation.consistencyPercent}
          onMarkToday={handleMarkToday}
          todayMarked={todayMarked}
          onConsumeContent={activation.consumeContent}
          onDismiss={() => setActivationCardDismissed(true)}
        />
      )}
      {reengagement.isPhaseVisible && (
        <ReEngagementCard
          phase={reengagement.phase}
          riskLevel={reengagement.riskLevel}
          consistencyScore={reengagement.state.consistency_score}
          recoveryStreak={reengagement.state.recovery_streak}
          onDismiss={() => reengagement.dismissPhase(reengagement.phase)}
          onMarkToday={() => { handleMarkToday(); reengagement.markRecoveryDay(); }}
          onPhase3Action={reengagement.setPhase3Action}
        />
      )}



      {/* ===== REWARDS ROADMAP — Full width highlight ===== */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <RewardsRoadmap
          currentMonth={activeMonths}
          onRedeem={(id) => console.log("Redeem:", id)}
        />
      </motion.div>

      {/* ===== VIDEO PLAYLIST — Full width ===== */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <VideoPlaylistWidget />
      </motion.div>

      {/* ===== COMMUNITY ===== */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Comunidade</h2>
                <p className="text-sm text-muted-foreground">Histórias de outros membros</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "Ana C.", text: "Já sinto diferença após 2 meses de uso consistente!", days: 58 },
                { name: "Beatriz R.", text: "O calendário me ajuda a manter o hábito todos os dias.", days: 120 },
              ].map((h) => (
                <div key={h.name} className="rounded-xl bg-secondary/50 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center text-sm font-semibold text-accent">
                      {h.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.days} dias ativos</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 italic leading-relaxed">"{h.text}"</p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full rounded-xl h-11 text-sm hover:bg-accent hover:text-accent-foreground hover:border-accent"
              onClick={() => navigate("/club/community")}
            >
              Ver comunidade
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== ELITE INVITE ===== */}
      {eliteInvite.eligible && (
        <EliteInviteCard
          canGenerateInvite={eliteInvite.canGenerateInvite}
          invitesRemaining={eliteInvite.state.max_invites_per_month - eliteInvite.state.total_invites_this_month}
          onGenerateInvite={eliteInvite.generateInvite}
        />
      )}

      <HelpButton />
    </div>
  );
};

export default ClubDashboard;
