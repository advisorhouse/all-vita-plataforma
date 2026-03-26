import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Sun, Droplets, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/emotional-copy";

interface DailyRitualCardProps {
  todayMarked: boolean;
  streak: number;
  onMarkToday: () => void;
}

function getRitualTip(): { icon: React.ReactNode; text: string } {
  const tips = [
    { icon: <Sun className="h-3.5 w-3.5 text-muted-foreground" />, text: "Aplique pela manhã, antes da exposição à luz azul." },
    { icon: <Droplets className="h-3.5 w-3.5 text-muted-foreground" />, text: "2 gotas são suficientes para proteção completa." },
    { icon: <Zap className="h-3.5 w-3.5 text-muted-foreground" />, text: "Consistência diária potencializa os resultados em 3x." },
  ];
  return tips[new Date().getDate() % tips.length];
}

const DailyRitualCard: React.FC<DailyRitualCardProps> = ({
  todayMarked,
  streak,
  onMarkToday,
}) => {
  const tip = getRitualTip();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                    todayMarked ? "bg-accent/10" : "bg-foreground"
                  }`}
                >
                  {todayMarked ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Check className="h-5 w-5 text-accent" />
                    </motion.div>
                  ) : (
                    <Droplets className="h-5 w-5 text-background" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {todayMarked ? "Ritual concluído" : "Seu ritual diário"}
                  </h2>
                  <p className="text-[12px] text-muted-foreground">
                    {todayMarked
                      ? `Sequência de ${streak} ${streak === 1 ? "dia" : "dias"}`
                      : "Registre o uso do seu Vision Lift"}
                  </p>
                </div>
              </div>
              {streak >= 3 && todayMarked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1"
                >
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span className="text-[10px] font-semibold text-foreground">{streak}d</span>
                </motion.div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!todayMarked && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    onClick={onMarkToday}
                    className="w-full rounded-xl h-12 text-[15px] font-medium bg-foreground text-background hover:bg-foreground/90"
                  >
                    {t("next_step_button_mark")}
                    <Check className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border bg-secondary/30 px-5 py-2.5 flex items-center gap-2">
            {tip.icon}
            <p className="text-[11px] text-muted-foreground">{tip.text}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyRitualCard;
