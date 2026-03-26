import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, t2 } from "@/lib/emotional-copy";

interface WelcomeModalProps {
  open: boolean;
  onDismiss: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onDismiss }) => {
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
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-lg text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto"
            >
              <Check className="h-7 w-7 text-primary" />
            </motion.div>

            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {t("welcome_title")}
            </h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              {t2("welcome_title")}
            </p>

            <Button
              onClick={onDismiss}
              className="w-full rounded-xl h-12 text-[15px] font-medium bg-foreground text-background hover:bg-foreground/90"
            >
              {t("welcome_button")}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
