import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar, TrendingUp, Sparkles, Gift, X, MessageCircle, Pause, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ReEngagementPhase, RiskLevel } from "@/hooks/useReEngagement";
import { t, t2 } from "@/lib/emotional-copy";

interface ReEngagementCardProps {
  phase: ReEngagementPhase;
  riskLevel: RiskLevel;
  consistencyScore: number;
  recoveryStreak: number;
  onDismiss: () => void;
  onMarkToday: () => void;
  onPhase3Action: (action: string) => void;
}

const ReEngagementCard: React.FC<ReEngagementCardProps> = ({
  phase,
  riskLevel,
  consistencyScore,
  recoveryStreak,
  onDismiss,
  onMarkToday,
  onPhase3Action,
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        {phase === "phase1" && (
          <Card className="border border-border shadow-sm relative">
            <button onClick={onDismiss} className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary transition-colors z-10">
              <X className="h-3.5 w-3.5" />
            </button>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                  Consistência
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {t("reengagement_phase1")}
              </p>
              <p className="text-[13px] text-muted-foreground">
                {t2("reengagement_phase1")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => navigate("/club/benefits")}
              >
                Ver calendário
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === "phase2" && (
          <Card className="border border-border shadow-sm relative">
            <button onClick={onDismiss} className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary transition-colors z-10">
              <X className="h-3.5 w-3.5" />
            </button>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                  Seu ciclo
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {t("reengagement_phase2")}
              </p>
              <p className="text-[13px] text-muted-foreground">
                {t2("reengagement_phase2")}
              </p>

              {/* Recovery streak incentive */}
              <div className="rounded-xl bg-secondary/50 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-[12px] font-medium text-foreground">
                    {t("reengagement_phase2_recovery")}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((d) => (
                    <div
                      key={d}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        d <= recoveryStreak ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={onMarkToday}
                size="sm"
                className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
              >
                Retomar hoje
                <Sparkles className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === "phase3" && (
          <ReEngagementModal
            onAction={onPhase3Action}
            onDismiss={onDismiss}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Phase 3 — elegant modal
const ReEngagementModal: React.FC<{
  onAction: (action: string) => void;
  onDismiss: () => void;
}> = ({ onAction, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm px-6"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 12 }}
      transition={{ duration: 0.35, ease: "easeOut" as const }}
      className="w-full max-w-sm rounded-2xl border border-border bg-background p-7 shadow-lg space-y-5"
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {t("reengagement_phase3_title")}
        </h2>
        <p className="text-sm text-muted-foreground font-light">
          {t2("reengagement_phase3_title")}
        </p>
      </div>

      <div className="space-y-2.5">
        <Button
          onClick={() => onAction("continue")}
          className="w-full rounded-xl h-12 text-[14px] font-medium bg-foreground text-background hover:bg-foreground/90 justify-start px-4"
        >
          <ChevronRight className="h-4 w-4 mr-2.5 shrink-0" />
          {t("reengagement_phase3_continue")}
        </Button>
        <Button
          onClick={() => onAction("pause")}
          variant="outline"
          className="w-full rounded-xl h-12 text-[14px] font-medium justify-start px-4"
        >
          <Pause className="h-4 w-4 mr-2.5 shrink-0" />
          {t("reengagement_phase3_pause")}
        </Button>
        <Button
          onClick={() => onAction("support")}
          variant="outline"
          className="w-full rounded-xl h-12 text-[14px] font-medium justify-start px-4"
        >
          <MessageCircle className="h-4 w-4 mr-2.5 shrink-0" />
          {t("reengagement_phase3_support")}
        </Button>
      </div>

      <button
        onClick={onDismiss}
        className="w-full text-center text-[12px] text-muted-foreground/60 hover:text-muted-foreground transition-colors pt-1"
      >
        Fechar
      </button>
    </motion.div>
  </motion.div>
);

export default ReEngagementCard;
