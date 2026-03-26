import React from "react";
import { motion } from "framer-motion";
import {
  Gift, ArrowRight, Percent, Stethoscope, Glasses, Truck, Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const REWARD_ICONS: Record<number, React.ElementType> = {
  1: Gift,
  2: Percent,
  3: Stethoscope,
  4: Glasses,
  5: Truck,
  6: Heart,
};

interface NextRewardCardProps {
  currentMonth: number;
  nextRewardTitle: string;
  nextRewardEmoji: string; // kept for API compat but unused
  nextRewardMonth: number;
  onViewAll: () => void;
}

const NextRewardCard: React.FC<NextRewardCardProps> = ({
  currentMonth,
  nextRewardTitle,
  nextRewardMonth,
  onViewAll,
}) => {
  const progressPct = Math.min(100, ((currentMonth % nextRewardMonth) / 1) * 100);
  const daysRemaining = Math.max(0, (nextRewardMonth - currentMonth) * 30);
  const Icon = REWARD_ICONS[nextRewardMonth] ?? Gift;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-accent/20 bg-accent/5 shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
              <Icon className="h-7 w-7 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-accent uppercase tracking-wider">
                Próximo prêmio
              </p>
              <p className="text-xl font-semibold text-foreground">
                {nextRewardTitle}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mês {currentMonth} de {nextRewardMonth}</span>
              <span className="font-medium text-foreground">
                {daysRemaining > 0 ? `~${daysRemaining} dias` : "Disponível!"}
              </span>
            </div>
            <Progress value={progressPct > 0 ? progressPct : (currentMonth / nextRewardMonth) * 100} className="h-3 rounded-full" />
          </div>

          <button
            onClick={onViewAll}
            className="flex items-center gap-2 text-accent text-base font-medium hover:underline"
          >
            <Gift className="h-4 w-4" />
            Ver todos os prêmios
            <ArrowRight className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NextRewardCard;
