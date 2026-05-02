import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Coins, Gift, ShieldCheck, ArrowRight, Repeat, Stethoscope, Shield,
  CreditCard, Handshake, Users, Clock, Check, AlertTriangle, GraduationCap,
  Ticket, Wrench, Monitor, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/contexts/TenantContext";
import { getTenantBrand } from "@/lib/tenant-brand";
import { useVitacoinSettings } from "@/hooks/useVitacoinSettings";

interface PartnerOnboardingTourProps {
  onClose: () => void;
}

type Screen = "welcome" | "linkage" | "flow" | "vitacoins";
const ORDER: Screen[] = ["welcome", "linkage", "flow", "vitacoins"];

const PILLARS = [
  {
    icon: Link2,
    title: "Vínculo médico–paciente",
    desc: "Envie o quiz pré-consulta. O paciente preenche, autoriza LGPD e fica vinculado a você automaticamente.",
  },
  {
    icon: Coins,
    title: "Vitacoins",
    desc: "Moeda interna da plataforma. Acumule Vitacoins por vendas, quizzes e indicações — sem comissão direta.",
  },
  {
    icon: Gift,
    title: "Resgate como preferir",
    desc: "Troque pontos por Pix, produtos, cursos, congressos ou equipamentos na sua wallet médica.",
  },
  {
    icon: ShieldCheck,
    title: "Ético e transparente",
    desc: "Modelo baseado em pontos, sem cupons e sem vínculo com prescrição. Compliance LGPD completo.",
  },
];

const LINKAGE_STEPS = [
  { icon: Link2, title: "Envie o quiz", body: "Compartilhe seu link exclusivo do quiz pré-consulta com seus pacientes — na clínica, por WhatsApp ou QR Code." },
  { icon: Stethoscope, title: "Paciente preenche", body: "O paciente responde um questionário de saúde digital antes da consulta. Dados protegidos pela LGPD." },
  { icon: Shield, title: "Autorização LGPD", body: "O paciente autoriza o uso dos dados e o vínculo médico–paciente é criado automaticamente no sistema." },
  { icon: Coins, title: "Pontos automáticos", body: "Toda compra futura desse paciente na plataforma gera Vitacoins para você — de forma automática e recorrente." },
];

const FLOW_STEPS = [
  { step: "1", title: "Paciente preenche o quiz", body: "Na sua clínica ou via link enviado por WhatsApp. O questionário de saúde vincula o paciente ao seu cadastro automaticamente." },
  { step: "2", title: "Paciente compra na plataforma", body: "Quando o paciente fizer uma compra na plataforma, o sistema reconhece o vínculo e credita Vitacoins na sua wallet." },
  { step: "3", title: "Pontos ficam pendentes (30 dias)", body: "Os pontos entram em carência de 30 dias para garantir a qualidade da venda. Após esse período, ficam liberados." },
  { step: "4", title: "Resgate como preferir", body: "Pontos liberados podem ser trocados por: transferência Pix, produtos, cursos, congressos ou equipamentos." },
];

const EARN_WAYS = [
  { icon: CreditCard, label: "Venda concluída", desc: "Paciente vinculado faz uma compra na plataforma" },
  { icon: Stethoscope, label: "Quiz preenchido", desc: "Cada novo paciente que preencher seu quiz" },
  { icon: Handshake, label: "Indicação de médico", desc: "Indique colegas — toda compra dos pacientes deles também gera pontos para você" },
  { icon: Users, label: "Rede de indicados", desc: "Quando pacientes de médicos que você indicou compram, você recebe uma parcela dos pontos automaticamente" },
  { icon: Repeat, label: "Campanhas especiais", desc: "Multiplicadores em ações sazonais" },
];

const WALLET_STATES = [
  { icon: Clock, label: "Pendentes", desc: "Carência 30 dias" },
  { icon: Check, label: "Liberados", desc: "Prontos para resgate" },
  { icon: AlertTriangle, label: "Expiram", desc: "Validade de 2 anos" },
];

const REDEEM_OPTIONS = [
  { icon: CreditCard, label: "Pix" },
  { icon: Gift, label: "Produtos" },
  { icon: GraduationCap, label: "Cursos" },
  { icon: Ticket, label: "Congressos" },
  { icon: Wrench, label: "Equipamentos" },
  { icon: Monitor, label: "Mais em breve" },
];

const PartnerOnboardingTour: React.FC<PartnerOnboardingTourProps> = ({ onClose }) => {
  const { currentTenant } = useTenant();
  const brand = getTenantBrand(currentTenant);
  const { conversionRate } = useVitacoinSettings(currentTenant?.id);
  const [screen, setScreen] = useState<Screen>("welcome");

  const exampleSale = 528;
  const earnedCoins = Math.max(1, Math.round(exampleSale / (conversionRate || 1)));

  const currentIndex = ORDER.indexOf(screen);
  const goNext = () => {
    if (currentIndex < ORDER.length - 1) setScreen(ORDER[currentIndex + 1]);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={brand.logoUrl} alt={brand.displayName} className="h-7 w-auto object-contain" />
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Apresentação · {currentIndex + 1} de {ORDER.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            Pular <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* Progress */}
        <div className="h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / ORDER.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-start justify-center px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            {/* ═══ TELA 1 ═══ */}
            {screen === "welcome" && (
              <div className="flex flex-col items-center text-center">
                <img src={brand.logoUrl} alt={brand.displayName} className="h-10 w-auto mb-6" />

                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Bem-vindo(a) ao {brand.displayName} Partners
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Plataforma para profissionais de saúde. Vincule pacientes, acumule Vitacoins e resgate como preferir.
                </p>

                <div className="mt-8 w-full space-y-3">
                  {PILLARS.map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <motion.div
                        key={p.title}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
                        className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 text-left"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{p.title}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{p.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <Button className="w-full gap-2 mt-8" onClick={goNext}>
                  Começar tour <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ═══ TELA 2 ═══ */}
            {screen === "linkage" && (
              <div className="text-center space-y-8">
                <div className="space-y-3">
                  <h2 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
                    Sistema de Vínculo Médico–Paciente
                  </h2>
                  <p className="text-muted-foreground text-[15px] font-light">
                    O coração do {brand.displayName} Partners.
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <p className="text-[13px] font-semibold text-foreground px-1">Fluxo do vínculo:</p>
                  {LINKAGE_STEPS.map(({ icon: Icon, title, body }) => (
                    <div key={title} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{title}</p>
                        <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-accent" />
                    <p className="text-[13px] font-semibold text-foreground">Modelo Último Click</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Se um paciente preencher um novo quiz de outro médico, o vínculo anterior é desativado e o{" "}
                    <strong className="text-foreground">novo médico se torna o ativo</strong>. Isso garante que o profissional mais recente e relevante na jornada do paciente receba os pontos.
                  </p>
                </div>

                <Button className="w-full gap-2" onClick={goNext}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ═══ TELA 3 (FLUXO) ═══ */}
            {screen === "flow" && (
              <div className="text-center space-y-8">
                <div className="space-y-3">
                  <h2 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
                    Entenda o fluxo
                  </h2>
                  <p className="text-muted-foreground text-[15px] font-light">
                    Revise como o sistema de pontos funciona na prática.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  {FLOW_STEPS.map(({ step, title, body }) => (
                    <div key={step} className="relative flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                        {step}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-foreground">{title}</p>
                        <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-primary/10 bg-primary/5 p-5 text-left space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <p className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Ético e transparente</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    O programa é baseado em <strong className="text-foreground font-semibold">Vitacoins</strong> — a moeda interna da Allvita. <span className="underline decoration-primary/30">Não é comissão por venda</span>. Você acumula pontos pela jornada dos seus pacientes e resgata como preferir. Compliance LGPD e sem vínculo com prescrição.
                  </p>
                </div>

                <Button className="w-full gap-2" onClick={goNext}>
                  Entendi o fluxo <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ═══ TELA 4 (VITACOINS) ═══ */}
            {screen === "vitacoins" && (
              <div className="text-center space-y-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                    <Coins className="h-4 w-4 text-accent" />
                    <span className="text-[12px] font-semibold text-accent">Moeda interna</span>
                  </div>
                  <h2 className="text-[1.75rem] font-semibold tracking-tight text-foreground">Vitacoins</h2>
                  <p className="text-muted-foreground text-[15px] font-light">
                    Sua moeda dentro da plataforma. Acumule e resgate como preferir.
                  </p>
                </div>

                <div className="text-left space-y-3">
                  <p className="text-[13px] font-semibold text-foreground px-1">Como ganhar pontos:</p>
                  {EARN_WAYS.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-center gap-4 p-3.5 rounded-xl border border-border bg-card">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <Icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground">{desc}</p>
                      </div>
                      <span className="text-[11px] text-accent font-semibold whitespace-nowrap">+ pontos</span>
                    </div>
                  ))}
                </div>

                <div className="text-left space-y-3">
                  <p className="text-[13px] font-semibold text-foreground px-1">Sua Wallet Médica:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {WALLET_STATES.map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="p-3 rounded-xl border border-border bg-card text-center">
                        <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                        <p className="text-[12px] font-medium text-foreground">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left space-y-3">
                  <div className="px-1 space-y-1">
                    <p className="text-[13px] font-semibold text-foreground">Como funciona o resgate?</p>
                    <p className="text-[11px] text-muted-foreground">
                      Seus Vitacoins ficam pendentes por 30 dias (carência). Após liberados, você pode resgatar por:
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {REDEEM_OPTIONS.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                        <Icon className="h-4 w-4 text-primary/70" strokeWidth={1.5} />
                        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exemplo prático DINÂMICO */}
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-left space-y-3">
                  <p className="text-[13px] font-semibold text-foreground">💡 Exemplo prático</p>
                  <div className="space-y-2 text-[12px] text-muted-foreground leading-relaxed">
                    <p>Paciente adquire plano de R$ {exampleSale}:</p>
                    <ul className="space-y-1 pl-2">
                      <li>• Você recebe <strong className="text-foreground">{earnedCoins} Vitacoins</strong></li>
                      <li>• Pontos ficam pendentes por 30 dias</li>
                      <li>• Após carência → pontos liberados para resgate</li>
                      <li>• Renovações geram pontos recorrentes</li>
                    </ul>
                    <p className="text-[10px] text-muted-foreground/60 pt-1">
                      Cálculo baseado em 1 Vitacoin = R$ {Number(conversionRate).toFixed(2)} (definido pela administração).
                    </p>
                  </div>
                </div>

                <Button className="w-full gap-2" onClick={goNext}>
                  Ir para o painel <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartnerOnboardingTour;
