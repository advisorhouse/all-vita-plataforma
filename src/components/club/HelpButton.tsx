import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, MessageCircle, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HelpButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fixed button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-background shadow-lg hover:bg-foreground/90 transition-colors"
      >
        <HelpCircle className="h-5 w-5" />
        <span className="text-[15px] font-medium">Precisa de ajuda?</span>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm px-4 pb-4 sm:items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-lg space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Como podemos ajudar?</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  className="w-full flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-4 hover:bg-secondary transition-colors text-left"
                  onClick={() => setOpen(false)}
                >
                  <BookOpen className="h-5 w-5 text-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-foreground">Perguntas frequentes</p>
                    <p className="text-[13px] text-muted-foreground">Respostas rápidas</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  className="w-full flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-4 hover:bg-secondary transition-colors text-left"
                  onClick={() => setOpen(false)}
                >
                  <MessageCircle className="h-5 w-5 text-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-foreground">Falar com suporte</p>
                    <p className="text-[13px] text-muted-foreground">Resposta em até 24h</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpButton;
