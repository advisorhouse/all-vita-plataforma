import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import logoVisionLift from "@/assets/logo-vision-lift.png";

interface WelcomeVideoModalProps {
  open: boolean;
  onComplete: () => void;
}

const WelcomeVideoModal: React.FC<WelcomeVideoModalProps> = ({ open, onComplete }) => {
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  const handlePlay = () => {
    setPlaying(true);
    // Simulate video ending after 5 seconds (replace with real video event)
    setTimeout(() => {
      setFinished(true);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6"
        >
          <div className="w-full max-w-xl space-y-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <img src={logoVisionLift} alt="Vision Lift" className="h-8 w-auto object-contain opacity-60" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-center space-y-2"
            >
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Conheça sua jornada Vision Lift
              </h1>
              <p className="text-sm text-muted-foreground">
                Assista ao vídeo para entender como aproveitar ao máximo sua experiência.
              </p>
            </motion.div>

            {/* Video Player Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card"
            >
              <AspectRatio ratio={16 / 9}>
                {playing ? (
                  <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      {finished ? (
                        <>
                          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-7 w-7 text-primary" />
                          </div>
                          <p className="text-sm font-medium text-foreground">Vídeo concluído!</p>
                        </>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto animate-pulse">
                            <Play className="h-5 w-5 text-foreground ml-0.5" />
                          </div>
                          <p className="text-sm text-muted-foreground">Vídeo em reprodução…</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handlePlay}
                    className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-secondary/50 to-background/80 flex items-center justify-center group cursor-pointer transition-colors hover:from-secondary/40"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-20 w-20 rounded-full bg-foreground flex items-center justify-center shadow-lg"
                      >
                        <Play className="h-8 w-8 text-background ml-1" />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-base font-medium text-foreground">
                          Toque para assistir
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          1 min · Essencial para começar
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </AspectRatio>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: finished ? 1 : 0.4, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={onComplete}
                disabled={!finished}
                className="w-full h-12 rounded-xl text-[15px] font-medium"
              >
                {finished ? "Acessar meu dashboard" : "Assista o vídeo para continuar"}
              </Button>
              {!playing && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Este vídeo é obrigatório para acessar o dashboard.
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeVideoModal;
