import React from "react";
import { motion } from "framer-motion";
import { Target, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MonthlyChallengeWidgetProps {
  title: string;
  requiredDays: number;
  currentDays: number;
  completed: boolean;
  rewardDescription: string;
}

const MonthlyChallengeWidget: React.FC<MonthlyChallengeWidgetProps> = ({
  title,
  requiredDays,
  currentDays,
  completed,
  rewardDescription,
}) => {
  const progress = Math.min(Math.round((currentDays / requiredDays) * 100), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-border bg-card p-6 vision-shadow"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            completed ? "bg-success/10" : "bg-secondary"
          }`}>
            {completed ? (
              <Check className="h-5 w-5 text-success" />
            ) : (
              <Target className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Desafio Mensal</h3>
            <p className="text-caption text-muted-foreground">{title}</p>
          </div>
        </div>
        {completed && (
          <span className="rounded-full bg-success/10 px-3 py-1 text-[11px] font-medium text-success">
            Concluído
          </span>
        )}
      </div>

      <div className="mb-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{currentDays}/{requiredDays} dias</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="rounded-xl bg-secondary/50 px-4 py-2.5">
        <p className="text-[11px] text-muted-foreground">Recompensa</p>
        <p className="text-caption font-medium text-foreground">{rewardDescription}</p>
      </div>
    </motion.div>
  );
};

export default MonthlyChallengeWidget;
