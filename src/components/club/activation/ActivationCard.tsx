import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Check, Lightbulb, TrendingUp, Gift, BookOpen, Sparkles, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { t, t2 } from "@/lib/emotional-copy";

interface ActivationCardProps {
  dayCounter: number;
  daysMarked: number[];
  consistencyPercent: number;
  onMarkToday: () => void;
  todayMarked: boolean;
  onConsumeContent: () => void;
  onDismiss: () => void;
}

const ActivationCard: React.FC<ActivationCardProps> = ({
  dayCounter,
  daysMarked,
  consistencyPercent,
  onMarkToday,
  todayMarked,
  onConsumeContent,
  onDismiss,
}) => {
  const navigate = useNavigate();

  const content = getContentForDay(
    dayCounter,
    daysMarked,
    consistencyPercent,
    onMarkToday,
    todayMarked,
    onConsumeContent,
    navigate
  );

  if (!content) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <Card className="border border-border shadow-sm relative overflow-hidden">
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary transition-colors z-10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <CardContent className="p-5 space-y-3">
            {content}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

function getContentForDay(
  day: number,
  daysMarked: number[],
  consistencyPercent: number,
  onMarkToday: () => void,
  todayMarked: boolean,
  onConsumeContent: () => void,
  navigate: ReturnType<typeof useNavigate>
) {
  switch (day) {
    case 1:
      if (todayMarked) {
        return (
          <>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                Dia 1
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">{t("activation_day1_done")}</p>
            <p className="text-[13px] text-muted-foreground">
              {t2("activation_day1_done")}
            </p>
          </>
        );
      }
      return (
        <>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Dia 1
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">{t("activation_day1_prompt")}</p>
          <Button
            onClick={onMarkToday}
            size="sm"
            className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
          >
            Marcar agora
            <Check className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </>
      );

    case 2:
      return (
        <>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Dica rápida
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {t("activation_day2")}
          </p>
          <Button
            onClick={() => navigate("/club/benefits")}
            variant="outline"
            size="sm"
            className="rounded-xl"
          >
            Continuar jornada
          </Button>
        </>
      );

    case 3:
      return (
        <>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Dia 3
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {daysMarked.length >= 2
              ? t("activation_day3_good")
              : t("activation_day3_low")}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {daysMarked.length >= 2
              ? t2("activation_day3_good")
              : t2("activation_day3_low")}
          </p>
        </>
      );

    case 4:
      return (
        <>
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Progresso
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {t("activation_day4")}
          </p>
          <Progress value={(daysMarked.length / 7) * 100} className="h-1.5" />
        </>
      );

    case 5:
      return (
        <>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Leitura · 1 min
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {t("activation_day5")}
          </p>
          <Button
            onClick={() => {
              onConsumeContent();
              navigate("/club/content");
            }}
            variant="outline"
            size="sm"
            className="rounded-xl"
          >
            Ler agora
          </Button>
        </>
      );

    case 6:
      return (
        <>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Dia 6
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {consistencyPercent > 60 ? t("activation_day6_good") : t("activation_day6_low")}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {consistencyPercent > 60
              ? t2("activation_day6_good")
              : t2("activation_day6_low")}
          </p>
        </>
      );

    default:
      return null;
  }
}

export default ActivationCard;
