import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Gem, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, t2 } from "@/lib/emotional-copy";

interface MilestoneModalProps {
  open: boolean;
  onDismiss: () => void;
  variant?: "3m" | "6m" | "12m";
}

const copyKeys = {
  "3m": { title: "milestone_3m_title", badge: "Proteção Ativa" },
  "6m": { title: "milestone_6m_title", badge: "Longevidade Vision" },
  "12m": { title: "milestone_12m_title", badge: "Elite Vision" },
};

const config = {
  "3m": {
    icon: Shield,
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  "6m": {
    icon: Gem,
    badgeBg: "bg-foreground/10",
    badgeText: "text-foreground",
    iconBg: "bg-foreground/10",
    iconColor: "text-foreground",
  },
  "12m": {
    icon: Crown,
    badgeBg: "bg-foreground",
    badgeText: "text-background",
    iconBg: "bg-foreground",
    iconColor: "text-background",
  },
};

const MilestoneModal: React.FC<MilestoneModalProps> = ({ open, onDismiss, variant = "3m" }) => {
  const c = config[variant];
  const ck = copyKeys[variant];
  const Icon = c.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-10 shadow-lg text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.2 }}
              className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl ${c.iconBg} mx-auto`}
            >
              <Icon className={`h-10 w-10 ${c.iconColor}`} strokeWidth={1.5} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {t(ck.title)}
              </h2>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {t2(ck.title)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className={`inline-flex items-center gap-2 rounded-full ${c.badgeBg} px-4 py-2`}
            >
              <Icon className={`h-4 w-4 ${c.badgeText}`} />
              <span className={`text-sm font-semibold ${c.badgeText}`}>{ck.badge}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={onDismiss}
                className="w-full rounded-xl h-12 text-[15px] font-medium bg-foreground text-background hover:bg-foreground/90"
              >
                Continuar
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MilestoneModal;
