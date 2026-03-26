import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface WelcomeVideoCardProps {
  watched: boolean;
  onWatch: () => void;
}

const WelcomeVideoCard: React.FC<WelcomeVideoCardProps> = ({ watched, onWatch }) => {
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    setPlaying(true);
    onWatch();
  };

  if (watched && !playing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
    >
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <AspectRatio ratio={16 / 9}>
              {playing ? (
                <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto">
                      <Play className="h-5 w-5 text-foreground ml-0.5" />
                    </div>
                    <p className="text-sm text-muted-foreground">Vídeo em reprodução</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-secondary/50 to-background/80 flex items-center justify-center group cursor-pointer transition-colors hover:from-secondary/40"
                >
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-16 w-16 rounded-full bg-foreground flex items-center justify-center shadow-lg"
                    >
                      <Play className="h-6 w-6 text-background ml-1" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Conheça sua jornada Vision Lift
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        1 min · Essencial para começar
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </AspectRatio>
          </div>
          <div className="px-5 py-3 flex items-center gap-2">
            {watched ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
            )}
            <p className="text-[12px] text-muted-foreground">
              {watched
                ? "Vídeo assistido — você pode rever quando quiser."
                : "Assista antes de começar — ajuda na sua experiência."}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeVideoCard;
