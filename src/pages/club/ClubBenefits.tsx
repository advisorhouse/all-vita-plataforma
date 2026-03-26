import React from "react";
import { motion } from "framer-motion";
import {
  Gift, Check, Heart, Eye, Shield, Clock,
  Award, ChevronRight, Truck, Star,
  BadgeCheck, Lock, Package, Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import coverLevel3 from "@/assets/cover-level-3.jpg";
import productOriginal from "@/assets/product-vision-lift-1month.png";
import product3Month from "@/assets/product-vision-lift-3month.png";
import product5Month from "@/assets/product-vision-lift-5month.png";


const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

/* ─── ACTIVE BENEFITS (unlocked) ─── */
const activeBenefits = [
  {
    title: "Frete Grátis em todos os envios",
    desc: "Suas entregas chegam sem custo adicional, direto na sua casa.",
    icon: Truck,
    month: 1,
    mockup: productOriginal,
  },
  {
    title: "Conteúdo Exclusivo de Saúde",
    desc: "Acesso a vídeos e artigos com especialistas em saúde ocular.",
    icon: Eye,
    month: 2,
    mockup: null,
  },
  {
    title: "Rastreio Prioritário",
    desc: "Acompanhe cada etapa da entrega em tempo real pelo app.",
    icon: Package,
    month: 2,
    mockup: null,
  },
  {
    title: "Kit Bem-Estar Visual",
    desc: "Máscara de gel para olhos + sachê de chá de camomila — presente do mês 1.",
    icon: Gift,
    month: 1,
    mockup: null,
  },
  {
    title: "15% OFF na Próxima Compra",
    desc: "Desconto automático aplicado no seu próximo pedido.",
    icon: Award,
    month: 2,
    mockup: null,
  },
];

/* ─── LOCKED BENEFITS (coming soon) ─── */
const lockedBenefits = [
  {
    title: "Consulta Online Gratuita",
    desc: "Sessão de 20 min com oftalmologista parceiro. Desbloqueado no mês 6.",
    icon: Heart,
    month: 6,
    mockup: null,
  },
  {
    title: "Óculos de Sol com Proteção UV",
    desc: "Modelo premium UV400 enviado gratuitamente. Desbloqueado no mês 9.",
    icon: Shield,
    month: 9,
    mockup: null,
  },
  {
    title: "Acesso VIP + Produtos Exclusivos",
    desc: "Atendimento prioritário e lançamentos antes de todos. Desbloqueado no mês 12.",
    icon: Star,
    month: 12,
    mockup: null,
  },
];

/* ─── HEALTH EVOLUTION TIMELINE ─── */
const healthSteps = [
  { period: "Semana 2-4", title: "Menos cansaço nos olhos", achieved: true },
  { period: "Mês 1-2", title: "Proteção contra luz azul ativa", achieved: true },
  { period: "Mês 2-3", title: "Barreira antioxidante completa", achieved: true },
  { period: "Mês 3-5", title: "Visão noturna aprimorada", achieved: true },
  { period: "Mês 5-6", title: "Retina e nervo óptico fortalecidos", achieved: false },
  { period: "Mês 6-12+", title: "Longevidade visual consolidada", achieved: false },
];

const ClubBenefits: React.FC = () => {
  const currentMonths = 4;
  const totalActive = activeBenefits.length;

  return (
    <div className="space-y-6 pb-12">

      {/* ===== HEADER ===== */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meus Benefícios</h1>
        <p className="text-base text-muted-foreground mt-1">
          Você já desbloqueou <span className="font-semibold text-foreground">{totalActive} benefícios</span>.
          Continue sua jornada para conquistar ainda mais.
        </p>
      </motion.div>

      {/* ===== HERO STATUS CARD ===== */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-40 overflow-hidden">
              <img src={coverLevel3} alt="Seu nível" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="text-sm text-background/70">Seu nível atual</p>
                  <p className="text-2xl font-bold text-background">Proteção Ativa</p>
                  <p className="text-sm text-background/70 mt-0.5">Membro há {currentMonths} meses</p>
                </div>
                <img src={productOriginal} alt="Vision Lift" className="h-20 w-20 object-contain drop-shadow-xl" />
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso para <span className="font-medium text-foreground">Longevidade</span></span>
                <span className="font-semibold text-foreground">4/7 meses</span>
              </div>
              <Progress value={57} className="h-2" />
              <p className="text-sm text-muted-foreground">Faltam 3 meses para desbloquear o próximo nível e mais prêmios.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== ACTIVE BENEFITS — LARGE CARDS ===== */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <Gift className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Benefícios Ativos</h2>
            <p className="text-sm text-muted-foreground">{totalActive} benefícios conquistados — aproveite!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeBenefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                custom={2 + i * 0.5}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card className="border border-border shadow-sm h-full">
                  <CardContent className="p-6 flex gap-5 items-start h-full">
                    {b.mockup ? (
                      <img
                        src={b.mockup}
                        alt={b.title}
                        className="h-20 w-20 rounded-2xl object-contain bg-secondary/50 p-2 shrink-0"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                        <Icon className="h-9 w-9 text-accent" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-accent shrink-0" />
                        <span className="text-xs font-medium text-accent">Desbloqueado · Mês {b.month}</span>
                      </div>
                      <p className="text-lg font-semibold text-foreground leading-snug">{b.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ===== LOCKED BENEFITS — UPCOMING ===== */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Próximos Benefícios</h2>
            <p className="text-sm text-muted-foreground">Continue sua assinatura para desbloquear</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {lockedBenefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                custom={5 + i * 0.5}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card className="border border-border shadow-sm h-full opacity-70">
                  <CardContent className="p-6 space-y-4 h-full flex flex-col items-center text-center">
                    {b.mockup ? (
                      <img
                        src={b.mockup}
                        alt={b.title}
                        className="h-24 w-24 rounded-2xl object-contain bg-secondary/50 p-2"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary">
                        <Icon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Mês {b.month}</span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{b.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ===== HEALTH EVOLUTION ===== */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Sua Evolução de Saúde</h2>
                <p className="text-sm text-muted-foreground">4 de 6 fases conquistadas</p>
              </div>
            </div>

            <div className="space-y-0">
              {healthSteps.map((step, i) => {
                const isLast = i === healthSteps.length - 1;
                return (
                  <div key={step.period} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          step.achieved
                            ? "bg-accent/10"
                            : "border-2 border-border bg-secondary/50"
                        }`}
                      >
                        {step.achieved ? (
                          <Check className="h-5 w-5 text-accent" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 min-h-[20px] ${step.achieved ? "bg-accent/30" : "bg-border"}`} />
                      )}
                    </div>
                    <div className={`pb-5 ${!step.achieved ? "opacity-50" : ""}`}>
                      <p className="text-xs text-muted-foreground font-medium">{step.period}</p>
                      <p className="text-base font-semibold text-foreground">{step.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== UPGRADE CTA ===== */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-accent/20 shadow-sm bg-accent/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Quer economizar mais?</h2>
                <p className="text-sm text-muted-foreground">Mude para um plano maior e pague menos por frasco.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 3 meses */}
              <div className="rounded-2xl border border-border bg-background p-5 space-y-3">
                <div className="flex items-center gap-4">
                  <img src={product3Month} alt="3 Meses" className="h-16 w-16 object-contain" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">Plano 3 Meses</p>
                    <p className="text-sm text-muted-foreground">90 dias · 3 frascos</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">R$ 132</span>
                  <span className="text-sm text-muted-foreground">/frasco</span>
                  <span className="text-sm text-muted-foreground line-through ml-1">R$ 196</span>
                </div>
                <Button variant="outline" className="w-full rounded-xl h-12 text-base hover:bg-accent hover:text-accent-foreground hover:border-accent">
                  Mudar para este plano
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* 5 meses */}
              <div className="rounded-2xl border border-accent/30 bg-background p-5 space-y-3 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground">
                  Mais vendido
                </span>
                <div className="flex items-center gap-4 pt-1">
                  <img src={product5Month} alt="5 Meses" className="h-16 w-16 object-contain" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">Plano 5 Meses</p>
                    <p className="text-sm text-muted-foreground">150 dias · 5 frascos</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">R$ 105</span>
                  <span className="text-sm text-muted-foreground">/frasco</span>
                  <span className="text-sm text-muted-foreground line-through ml-1">R$ 196</span>
                </div>
                <Button variant="outline" className="w-full rounded-xl h-12 text-base border-accent/40 hover:bg-accent hover:text-accent-foreground hover:border-accent">
                  Mudar para este plano
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== TRUST BADGES ===== */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BadgeCheck className="h-6 w-6 text-accent" />
              <p className="text-lg font-semibold text-foreground">Garantia e Confiança</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Aprovado pela ANVISA", "Indicado por oftalmologistas", "Frete grátis", "30 dias de garantia", "Ambiente seguro"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2 rounded-full bg-secondary/50 border border-border px-4 py-2 text-sm font-medium text-foreground">
                  <Check className="h-4 w-4 text-accent" />
                  {t}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClubBenefits;
