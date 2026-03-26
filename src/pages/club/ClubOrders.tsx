import React from "react";
import { motion } from "framer-motion";
import {
  Package, Check, Clock, Truck, ChevronRight, MapPin,
  Calendar, CreditCard, MessageCircle, Gift,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import productImage from "@/assets/product-vision-lift-1month.png";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const orders = [
  { id: "VL-20260215", date: "15 Fev, 2026", status: "delivered" as const, value: "R$ 196,00", reward: "Kit Bem-Estar Visual" },
  { id: "VL-20260115", date: "15 Jan, 2026", status: "delivered" as const, value: "R$ 196,00", reward: "15% OFF aplicado" },
  { id: "VL-20251215", date: "15 Dez, 2025", status: "delivered" as const, value: "R$ 196,00", reward: null },
  { id: "VL-20251115", date: "15 Nov, 2025", status: "delivered" as const, value: "R$ 196,00", reward: null },
];

const statusMap = {
  delivered: { label: "Entregue", icon: Check, bg: "bg-accent/10", color: "text-accent" },
  transit: { label: "Em trânsito", icon: Truck, bg: "bg-foreground/5", color: "text-foreground" },
  pending: { label: "Pendente", icon: Clock, bg: "bg-secondary", color: "text-muted-foreground" },
};

const ClubOrders: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="pt-2 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meus Pedidos</h1>
        <p className="text-base text-muted-foreground">Acompanhe suas entregas e prêmios recebidos.</p>
      </motion.div>

      {/* ===== NEXT SHIPMENT ===== */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-secondary/50 p-6 flex items-center gap-5">
              <img src={productImage} alt="Vision Lift" className="h-20 w-20 object-contain" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-foreground">Próximo envio</h3>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    Em preparação
                  </span>
                </div>
                <p className="text-base text-muted-foreground">Vision Lift · Ciclo #5</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status do pedido</span>
                  <span className="text-foreground font-medium">Em preparação</span>
                </div>
                <Progress value={35} className="h-2.5 rounded-full" />
              </div>

              {/* Key info */}
              <div className="grid gap-4 grid-cols-2">
                {[
                  { label: "Previsão de envio", value: "12 Mar, 2026", icon: Truck },
                  { label: "Entrega estimada", value: "15-17 Mar", icon: Calendar },
                  { label: "Endereço", value: "Rua Exemplo, 123", icon: MapPin },
                  { label: "Pagamento", value: "•••• 4829", icon: CreditCard },
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

              {/* Next reward with this order */}
              <div className="flex items-center gap-4 rounded-2xl bg-accent/5 border border-accent/20 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 shrink-0">
                  <Gift className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-accent">Prêmio deste pedido</p>
                  <p className="text-base font-semibold text-foreground">Consulta Online Gratuita</p>
                </div>
                <Gift className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== ORDER HISTORY ===== */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Histórico de entregas</h2>

            <div className="space-y-3">
              {orders.map((order, i) => {
                const s = statusMap[order.status];
                const Icon = s.icon;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.05 }}
                    className="rounded-2xl bg-secondary/30 p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                          <Icon className={`h-5 w-5 ${s.color}`} />
                        </div>
                        <div>
                          <p className="text-base font-medium text-foreground">{order.date}</p>
                          <p className="text-sm text-muted-foreground">{order.id}</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{order.value}</p>
                    </div>
                    {order.reward && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-sm">{order.reward}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== HELP ===== */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Precisa de ajuda?</h2>
            <p className="text-base text-muted-foreground">
              Problemas com entrega? Fale com nosso suporte.
            </p>
            <Button variant="outline" className="w-full rounded-xl h-14 text-base hover:bg-accent hover:text-accent-foreground hover:border-accent">
              <MessageCircle className="h-5 w-5 mr-2" />
              Falar com suporte
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClubOrders;
