import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Gift, Check, Lock, ChevronRight, Star,
  Percent, Stethoscope, Glasses, Truck, Heart, Sparkles,
  Loader2, ShoppingBag, X, Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import imgProduct1 from "@/assets/product-vision-lift-1month.png";
import imgProduct3 from "@/assets/product-vision-lift-3month.png";
import imgProduct5 from "@/assets/product-vision-lift-5month.png";
import imgProductPro from "@/assets/product-vision-lift-pro.png";

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost_vitacoins: number;
  type: string;
  stock: number;
  active: boolean;
  image_url?: string;
}


const REWARDS: Reward[] = [
  {
    id: "r1", month: 1, title: "Kit Bem-Estar Visual",
    description: "Máscara de gel para olhos + sachê de chá de camomila",
    icon: Gift, unlocked: true, redeemed: true, image: imgProduct1,
    color: "accent",
  },
  {
    id: "r2", month: 2, title: "15% OFF na próxima compra",
    description: "Desconto aplicado automaticamente no próximo pedido",
    icon: Percent, unlocked: true, redeemed: false, image: imgProduct1,
    color: "accent",
  },
  {
    id: "r3", month: 3, title: "Consulta Online Gratuita",
    description: "Sessão com especialista parceiro · 20 min",
    icon: Stethoscope, unlocked: false, redeemed: false, partner: "Saúde Online",
    image: imgProduct3, color: "accent",
  },
  {
    id: "r4", month: 4, title: "Óculos de Sol com Proteção UV",
    description: "Modelo premium com proteção UV400 · Enviado grátis",
    icon: Glasses, unlocked: false, redeemed: false, partner: "Óticas Premium",
    image: imgProduct5, color: "accent",
  },
  {
    id: "r5", month: 5, title: "Frete Grátis por 3 meses",
    description: "Todos os seus envios sem custo adicional",
    icon: Truck, unlocked: false, redeemed: false, image: imgProduct5,
    color: "accent",
  },
  {
    id: "r6", month: 6, title: "Caixa Surpresa de Saúde",
    description: "Produtos de parceiros de saúde e bem-estar · Valor R$120+",
    icon: Heart, unlocked: false, redeemed: false, partner: "Saúde & Vida",
    image: imgProductPro, color: "accent",
  },
];

interface RewardsRoadmapProps {
  currentMonth: number;
  onRedeem?: (rewardId: string) => void;
}

const RewardsRoadmap: React.FC<RewardsRoadmapProps> = ({ currentMonth, onRedeem }) => {
  const totalUnlocked = REWARDS.filter((r) => r.month <= currentMonth).length;
  const progressPct = Math.round((totalUnlocked / REWARDS.length) * 100);
  const nextReward = REWARDS.find((r) => r.month > currentMonth) || REWARDS.find((r) => !r.redeemed && r.month === currentMonth);
  const monthsToNext = nextReward ? nextReward.month - currentMonth : 0;

  return (
    <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-accent/10 via-card to-accent/5">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15">
            <Gift className="h-7 w-7 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">Sua Trilha de Prêmios</h2>
            <p className="text-base text-muted-foreground mt-1">
              Você está no <strong className="text-foreground">mês {currentMonth}</strong>. 
              Continue usando para desbloquear os próximos presentes.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2">
            <Star className="h-4 w-4 text-accent" />
            <span className="text-base font-semibold text-foreground">{totalUnlocked}/{REWARDS.length}</span>
            <span className="text-sm text-muted-foreground">desbloqueados</span>
          </div>
        </div>

        {/* Next reward highlight */}
        {nextReward && monthsToNext > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border-2 border-accent bg-accent/10 p-5 flex flex-col sm:flex-row items-center gap-5"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent/20">
              {nextReward.image ? (
                <img src={nextReward.image} alt={nextReward.title} className="h-16 w-16 object-contain drop-shadow" />
              ) : (
                <nextReward.icon className="h-9 w-9 text-accent" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-accent uppercase tracking-wider">Próximo prêmio · Mês {nextReward.month}</p>
              <p className="text-xl font-bold text-foreground mt-1">{nextReward.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{nextReward.description}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Falta {monthsToNext === 1 ? "1 mês" : `${monthsToNext} meses`}</span>
                  <span className="font-semibold text-accent">{Math.round((currentMonth / nextReward.month) * 100)}%</span>
                </div>
                <Progress value={(currentMonth / nextReward.month) * 100} className="h-3 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Global progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso geral</span>
            <span className="font-semibold text-accent">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-3 rounded-full" />
        </div>

        {/* Rewards Grid — 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REWARDS.map((reward, i) => {
            const isCurrent = reward.month === currentMonth && !reward.redeemed && reward.unlocked;
            const isLocked = !reward.unlocked;
            const Icon = reward.icon;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <div
                  className={`relative rounded-2xl border p-5 transition-all h-full ${
                    isCurrent
                      ? "border-accent bg-accent/5 ring-2 ring-accent/20 shadow-md"
                      : reward.redeemed
                      ? "border-accent/20 bg-accent/5"
                      : isLocked
                      ? "border-border bg-muted/20"
                      : "border-border bg-card"
                  }`}
                >
                  {/* Month badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      reward.redeemed
                        ? "bg-accent/15 text-accent"
                        : isCurrent
                        ? "bg-accent text-accent-foreground"
                        : isLocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-secondary text-foreground"
                    }`}>
                      Mês {reward.month}
                    </span>
                    {reward.redeemed && (
                      <span className="flex items-center gap-1 text-xs font-medium text-accent">
                        <Check className="h-3.5 w-3.5" /> Resgatado
                      </span>
                    )}
                    {isCurrent && (
                      <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-1 text-xs font-bold text-accent"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Disponível!
                      </motion.span>
                    )}
                    {isLocked && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content row: icon/image + text */}
                  <div className="flex items-start gap-4">
                    {/* Product image or icon */}
                    <div className={`shrink-0 flex items-center justify-center rounded-xl w-16 h-16 ${
                      isLocked ? "bg-muted/40" : "bg-accent/10"
                    }`}>
                      {reward.image && !isLocked ? (
                        <img
                          src={reward.image}
                          alt={reward.title}
                          className="h-14 w-14 object-contain drop-shadow"
                        />
                      ) : (
                        <Icon className={`h-7 w-7 ${isLocked ? "text-muted-foreground" : "text-accent"}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-semibold leading-tight ${
                        isLocked ? "text-muted-foreground" : "text-foreground"
                      }`}>
                        {reward.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {reward.description}
                      </p>
                      {reward.partner && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Parceiro: {reward.partner}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  {reward.unlocked && !reward.redeemed && (
                    <Button
                      onClick={() => onRedeem?.(reward.id)}
                      className="w-full mt-4 rounded-xl h-12 text-base font-medium bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Resgatar prêmio
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}

                  {/* Locked motivational text */}
                  {isLocked && (
                    <p className="text-xs text-muted-foreground mt-3 text-center italic">
                      Continue usando para desbloquear no mês {reward.month}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom motivational CTA */}
        <div className="rounded-2xl bg-accent/10 p-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <p className="text-lg font-semibold text-foreground">Cada mês ativo = um novo presente</p>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Mantenha sua assinatura ativa e registre o uso diário para desbloquear todos os prêmios da sua trilha.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsRoadmap;
