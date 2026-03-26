import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Share2, Heart, Gift, Copy, Check, ExternalLink,
  Users, Award, Star, Sparkles, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import coverLevel4 from "@/assets/cover-level-4.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const REFERRAL_CODE = "CARLOS-VL2026";
const REFERRAL_LINK = `https://visionlift.com.br/convite/${REFERRAL_CODE}`;

const REWARDS = [
  { target: 1, title: "1ª indicação", reward: "10% de desconto no próximo envio", icon: Gift, unlocked: true },
  { target: 3, title: "3 indicações", reward: "Frete grátis por 3 meses", icon: Star, unlocked: true },
  { target: 5, title: "5 indicações", reward: "Upgrade gratuito para Vision Lift 3 Meses", icon: Sparkles, unlocked: false },
  { target: 10, title: "10 indicações", reward: "1 mês grátis de assinatura", icon: Award, unlocked: false },
];

const REFERRED_FRIENDS = [
  { name: "Ana Paula R.", status: "ativa", months: 3 },
  { name: "Marcos V.", status: "ativa", months: 1 },
  { name: "Juliana S.", status: "pendente", months: 0 },
];

const ClubReferrals: React.FC = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const referralCount = REFERRED_FRIENDS.filter(f => f.status === "ativa").length;
  const nextReward = REWARDS.find(r => !r.unlocked) || REWARDS[REWARDS.length - 1];

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    toast({ title: "Link copiado!", description: "Compartilhe com quem você quer cuidar." });
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Descobri algo que fez diferença na minha saúde ocular. Olha só: ${REFERRAL_LINK}`)}`;

  return (
    <div className="space-y-6 pb-12">

      {/* ===== HEADER ===== */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Indicações</h1>
        <p className="text-base text-muted-foreground mt-1">
          Compartilhe saúde com quem você ama e ganhe recompensas a cada indicação.
        </p>
      </motion.div>

      {/* ===== HERO BANNER ===== */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-44 overflow-hidden">
              <img src={coverLevel4} alt="Indicações" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
              <div className="absolute inset-0 flex items-center px-7">
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-background">Cuide de quem importa</p>
                  <p className="text-sm text-background/70 max-w-md leading-relaxed">
                    Cada indicação é um gesto de saúde. Quem você indica ganha 
                    <span className="font-semibold text-background"> 15% no primeiro envio</span>.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== SHARE SECTION — LARGE ===== */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <Share2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Seu link exclusivo</h2>
                <p className="text-sm text-muted-foreground">Envie para amigos e familiares</p>
              </div>
            </div>

            {/* Link + copy */}
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-2xl bg-secondary/40 px-5 py-4 text-sm text-muted-foreground font-mono truncate">
                {REFERRAL_LINK}
              </div>
              <Button
                onClick={handleCopy}
                className="rounded-xl h-14 px-6 text-base gap-2 shrink-0"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>

            {/* WhatsApp CTA — primary action */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full rounded-2xl bg-[#25D366] px-6 py-4 text-lg font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.01]"
            >
              <MessageCircle className="h-6 w-6" />
              Enviar pelo WhatsApp
              <ExternalLink className="h-4 w-4 opacity-60" />
            </a>

            {/* Benefit reminder */}
            <div className="rounded-2xl bg-accent/5 border border-accent/10 p-5 flex items-start gap-4">
              <Heart className="h-6 w-6 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-semibold text-foreground">Você ganha a cada indicação</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Descontos, frete grátis e até produtos exclusivos. Veja abaixo todas as recompensas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== REWARDS LADDER — LARGE CARDS ===== */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <Gift className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Recompensas</h2>
                <p className="text-sm text-muted-foreground">{referralCount} indicações ativas — continue!</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso: {referralCount} de {nextReward.target}</span>
                <span className="font-semibold text-accent">Próxima: {nextReward.title}</span>
              </div>
              <Progress value={(referralCount / nextReward.target) * 100} className="h-2.5" />
            </div>

            {/* Rewards list */}
            <div className="space-y-3">
              {REWARDS.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.target}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl p-5 transition-colors",
                      r.unlocked
                        ? "bg-accent/5 border border-accent/15"
                        : "bg-secondary/30 border border-border"
                    )}
                  >
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl shrink-0",
                      r.unlocked ? "bg-accent/10" : "bg-secondary"
                    )}>
                      <Icon className={cn("h-7 w-7", r.unlocked ? "text-accent" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-lg font-semibold", r.unlocked ? "text-foreground" : "text-muted-foreground")}>
                        {r.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{r.reward}</p>
                    </div>
                    {r.unlocked && (
                      <span className="shrink-0 flex items-center gap-1.5 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
                        <Check className="h-4 w-4" />
                        Conquistado
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== REFERRED FRIENDS ===== */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Suas Indicações</h2>
                <p className="text-sm text-muted-foreground">{REFERRED_FRIENDS.length} pessoas indicadas</p>
              </div>
            </div>

            <div className="space-y-3">
              {REFERRED_FRIENDS.map((f, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl bg-secondary/30 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground shrink-0">
                    <span className="text-sm font-semibold text-background">
                      {f.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground">{f.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {f.status === "ativa" ? `Membro há ${f.months} ${f.months === 1 ? "mês" : "meses"}` : "Aguardando ativação"}
                    </p>
                  </div>
                  <span className={cn(
                    "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium",
                    f.status === "ativa" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
                  )}>
                    {f.status === "ativa" ? "Ativa" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== IMPACT STATS ===== */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-accent/20 shadow-sm bg-accent/5">
          <CardContent className="p-6">
            <p className="text-lg font-semibold text-foreground mb-4">Seu impacto até agora</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Pessoas impactadas", value: "3", Icon: Heart },
                { label: "Meses de cuidado gerados", value: "7", Icon: Users },
                { label: "Desconto acumulado", value: "R$ 45", Icon: Gift },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-background border border-border p-5 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 mx-auto mb-2">
                    <s.Icon className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClubReferrals;
