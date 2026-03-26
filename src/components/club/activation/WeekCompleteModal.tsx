import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { t, t2 } from "@/lib/emotional-copy";

interface WeekCompleteModalProps {
  open: boolean;
  daysMarked: number;
  consistencyPercent: number;
  hasBadge: boolean;
  onDismiss: () => void;
}

const WeekCompleteModal: React.FC<WeekCompleteModalProps> = ({
  open,
  daysMarked,
  consistencyPercent,
  hasBadge,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {open && (
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
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-lg text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto"
            >
              <Award className="h-8 w-8 text-primary" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {t("activation_week_complete")}
              </h2>
              <p className="text-sm text-muted-foreground font-light">
                {t2("activation_week_complete")}
              </p>
            </div>

            {/* Week summary */}
            <div className="space-y-3 rounded-xl border border-border p-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Dias marcados</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{daysMarked}/7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Consistência</span>
                <span className="text-sm font-semibold text-foreground">{consistencyPercent}%</span>
              </div>
              <Progress value={consistencyPercent} className="h-1.5" />
            </div>

            {hasBadge && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3"
              >
                <Award className="h-5 w-5 text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{t("activation_badge")}</p>
                  <p className="text-[11px] text-muted-foreground">{t2("activation_badge")}</p>
                </div>
              </motion.div>
            )}

            <Button
              onClick={onDismiss}
              className="w-full rounded-xl h-12 text-[15px] font-medium bg-foreground text-background hover:bg-foreground/90"
            >
              Continuar jornada
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeekCompleteModal;
