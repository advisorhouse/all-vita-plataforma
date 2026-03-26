import React from "react";
import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UsageJourneyProps {
  markedDays: number;
  streak: number;
  activeMonths: number;
  contentConsumed: number;
}

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  milestone: string;
  completed: boolean;
  current: boolean;
}

function getSteps(props: UsageJourneyProps): JourneyStep[] {
  return [
    {
      id: "first_use",
      title: "Primeiro uso",
      description: "O início da sua proteção visual.",
      milestone: "Dia 1",
      completed: props.markedDays >= 1,
      current: props.markedDays === 0,
    },
    {
      id: "first_week",
      title: "Primeira semana",
      description: "Seu corpo começa a absorver os nutrientes.",
      milestone: "7 dias",
      completed: props.markedDays >= 7,
      current: props.markedDays >= 1 && props.markedDays < 7,
    },
    {
      id: "habit_formed",
      title: "Hábito formado",
      description: "21 dias criam um novo hábito de proteção.",
      milestone: "21 dias",
      completed: props.markedDays >= 21,
      current: props.markedDays >= 7 && props.markedDays < 21,
    },
    {
      id: "first_cycle",
      title: "Ciclo completo",
      description: "Luteína em concentração ideal na mácula.",
      milestone: "30 dias",
      completed: props.markedDays >= 30,
      current: props.markedDays >= 21 && props.markedDays < 30,
    },
    {
      id: "protection_active",
      title: "Proteção consolidada",
      description: "Barreira retiniana plenamente ativa.",
      milestone: "3 meses",
      completed: props.activeMonths >= 3,
      current: props.markedDays >= 30 && props.activeMonths < 3,
    },
    {
      id: "longevity",
      title: "Longevidade visual",
      description: "Proteção contínua a longo prazo.",
      milestone: "6 meses",
      completed: props.activeMonths >= 6,
      current: props.activeMonths >= 3 && props.activeMonths < 6,
    },
  ];
}

const UsageJourney: React.FC<UsageJourneyProps> = (props) => {
  const steps = getSteps(props);
  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card className="border border-border shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Sua evolução</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Cada etapa fortalece sua proteção
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {completedCount}/{steps.length}
            </span>
          </div>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex gap-3"
              >
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
                      step.completed
                        ? "bg-foreground"
                        : step.current
                        ? "border-2 border-accent bg-background"
                        : "border border-border bg-secondary/50"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="h-3 w-3 text-background" strokeWidth={3} />
                    ) : step.current ? (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-1.5 w-1.5 rounded-full bg-accent"
                      />
                    ) : (
                      <Circle className="h-1.5 w-1.5 text-muted-foreground/30" />
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-px flex-1 min-h-[20px] ${step.completed ? "bg-foreground/20" : "bg-border"}`} />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-3.5 flex-1 ${!step.completed && !step.current ? "opacity-35" : ""}`}>
                  <div className="flex items-center gap-2">
                    <p className={`text-[13px] font-medium leading-tight ${step.current || step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                    <span className={`text-[9px] rounded-full px-1.5 py-0.5 font-medium ${
                      step.completed
                        ? "bg-foreground/5 text-foreground"
                        : step.current
                        ? "bg-accent/10 text-accent"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {step.milestone}
                    </span>
                  </div>
                  {(step.completed || step.current) && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UsageJourney;
