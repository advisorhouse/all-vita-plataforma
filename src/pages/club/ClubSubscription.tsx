import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, MapPin, CreditCard, Pause, X, MessageCircle,
  Gift, ChevronRight, ArrowLeft, Calendar, Shield,
  Truck, Clock, Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import productImage from "@/assets/product-vision-lift-1month.png";

type CancelStep = "none" | "confirm";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

// Mock data
const currentMonth = 2;
const planLabel = "1 Mês";
const planPrice = "R$ 196,00";

const nextReward = { title: "Consulta Online Gratuita", month: 3 };

const ClubSubscription: React.FC = () => {
  const [cancelStep, setCancelStep] = useState<CancelStep>("none");

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      {/* Page header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="pt-2 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Minha Assinatura</h1>
        <p className="text-base text-muted-foreground">Seu plano, entregas e prêmios em um só lugar.</p>
      </motion.div>

      {/* ===== PRODUCT + STATUS ===== */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-secondary/50 p-6 flex items-center gap-5">
              <img src={productImage} alt="Vision Lift" className="h-20 w-20 object-contain" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-foreground">Vision Lift</h3>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    Ativa
                  </span>
                </div>
                <p className="text-base text-muted-foreground">Plano {planLabel} · Ciclo #2</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid gap-4 grid-cols-2">
                {[
                  { label: "Valor mensal", value: planPrice, icon: CreditCard },
                  { label: "Próxima cobrança", value: "15 Mar, 2026", icon: Calendar },
                  { label: "Membro desde", value: "Nov, 2025", icon: Shield },
                  { label: "Mês atual", value: `Mês ${currentMonth}`, icon: Gift },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-base font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== NEXT REWARD HIGHLIGHT ===== */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-accent/20 bg-accent/5 shadow-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 shrink-0">
                <Gift className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-accent uppercase tracking-wider">Próximo prêmio · Mês {nextReward.month}</p>
                <p className="text-xl font-semibold text-foreground">{nextReward.title}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mês {currentMonth} de {nextReward.month}</span>
                <span className="font-medium text-foreground">Falta {nextReward.month - currentMonth} mês</span>
              </div>
              <Progress value={(currentMonth / nextReward.month) * 100} className="h-3 rounded-full" />
            </div>
            <p className="text-sm text-muted-foreground">
              Continue com sua assinatura ativa para desbloquear.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== NEXT SHIPMENT ===== */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Próximo envio</h2>
            </div>

            <div className="rounded-2xl bg-secondary/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-foreground">Vision Lift · {planLabel}</p>
                  <p className="text-sm text-muted-foreground">Previsão: 15 de Março, 2026</p>
                </div>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-foreground font-medium">Em preparação</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Entrega em 3 a 5 dias úteis após envio</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== UPGRADE SUGGESTION ===== */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Economize com planos maiores</h2>
            <div className="space-y-3">
              {[
                { label: "3 Meses", price: "R$ 396,00", perMonth: "R$ 132/mês", saving: "Economia de R$ 192" },
                { label: "5 Meses", price: "R$ 528,00", perMonth: "R$ 105,60/mês", saving: "Economia de R$ 452" },
              ].map((plan) => (
                <button
                  key={plan.label}
                  className="w-full flex items-center justify-between rounded-2xl border-2 border-border bg-card p-5 text-left transition-all hover:border-accent/40 hover:bg-accent/5"
                >
                  <div>
                    <p className="text-lg font-semibold text-foreground">{plan.label}</p>
                    <p className="text-sm text-muted-foreground">{plan.perMonth} · {plan.saving}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">{plan.price}</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== ADDRESS ===== */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Endereço de entrega</h2>
            </div>
            <div className="rounded-2xl bg-secondary/40 p-5">
              <p className="text-base font-medium text-foreground">Maria Silva</p>
              <p className="text-sm text-muted-foreground mt-1">
                Rua Exemplo, 123 — Apto 42<br />
                Jardim Paulista · São Paulo, SP<br />
                CEP 01310-100
              </p>
            </div>
            <Button variant="outline" className="w-full rounded-xl h-12 text-sm hover:bg-accent hover:text-accent-foreground hover:border-accent">
              Alterar endereço
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== PAYMENT ===== */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Pagamento</h2>
            </div>
            <div className="rounded-2xl bg-secondary/40 p-5 flex items-center gap-4">
              <div className="h-10 w-16 rounded-lg bg-foreground/5 border border-border flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">•••• •••• •••• 4829</p>
                <p className="text-sm text-muted-foreground">Validade: 08/28</p>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-xl h-12 text-sm hover:bg-accent hover:text-accent-foreground hover:border-accent">
              Alterar cartão
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== ORDER HISTORY ===== */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Histórico de entregas</h2>
            <div className="space-y-3">
              {[
                 { date: "15 Fev, 2026", id: "VL-20260215", value: "R$ 196,00", reward: "Kit Bem-Estar Visual" },
                { date: "15 Jan, 2026", id: "VL-20260115", value: "R$ 196,00", reward: "15% OFF aplicado" },
                { date: "15 Dez, 2025", id: "VL-20251215", value: "R$ 196,00", reward: null },
                { date: "15 Nov, 2025", id: "VL-20251115", value: "R$ 196,00", reward: null },
              ].map((order) => (
                <div key={order.id} className="rounded-2xl bg-secondary/30 p-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                        <Check className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-foreground">{order.date}</p>
                        <p className="text-sm text-muted-foreground">{order.id}</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{order.value}</p>
                  </div>
                  {order.reward && (
                    <p className="text-sm text-muted-foreground pl-13">{order.reward}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== ACTIONS ===== */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
        <Button
          variant="outline"
          className="w-full rounded-xl h-14 text-base hover:bg-accent hover:text-accent-foreground hover:border-accent"
        >
          <Pause className="h-5 w-5 mr-2" />
          Pausar assinatura
        </Button>
        <button
          onClick={() => setCancelStep("confirm")}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base text-muted-foreground transition-colors hover:text-destructive"
        >
          <X className="h-4 w-4" />
          Cancelar assinatura
        </button>
      </motion.div>

      {/* Cancellation Retention */}
      <AnimatePresence>
        {cancelStep === "confirm" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <Card className="border border-destructive/20 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Antes de sair…</h3>
                  <p className="text-base text-muted-foreground mt-1">
                    Cancelando agora, você perde o prêmio do Mês {nextReward.month}:
                  </p>
                  <div className="flex items-center gap-3 mt-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
                      <Gift className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{nextReward.title}</p>
                      <p className="text-sm text-muted-foreground">Falta apenas {nextReward.month - currentMonth} mês para desbloquear</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: Pause, label: "Pausar por 30 dias", desc: "Sua assinatura volta automaticamente" },
                    { icon: Gift, label: "Manter para ganhar o prêmio", desc: "Continue e resgate no próximo mês" },
                    { icon: MessageCircle, label: "Falar com suporte", desc: "Podemos encontrar a melhor solução" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className="flex items-center gap-4 w-full rounded-2xl bg-secondary/40 p-5 text-left transition-colors hover:bg-secondary/70"
                    >
                      <opt.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-base font-medium text-foreground">{opt.label}</p>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    onClick={() => setCancelStep("none")}
                    className="flex-1 rounded-xl h-14 text-base bg-foreground text-background hover:bg-foreground/90"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <button className="flex-1 rounded-xl py-3 text-sm text-muted-foreground hover:text-destructive transition-colors">
                    Confirmar cancelamento
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubSubscription;
