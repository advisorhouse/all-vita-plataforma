import React from "react";
import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const LEVELS = [
  { key: "inicio", label: "Início", months: 0 },
  { key: "consistencia", label: "Consistência", months: 1 },
  { key: "protecao_ativa", label: "Proteção Ativa", months: 3 },
  { key: "longevidade", label: "Longevidade", months: 6 },
  { key: "elite_vision", label: "Elite Vision", months: 12 },
];

interface LevelProgressCardProps {
  currentLevel: string;
  levelProgress: number;
  activeMonths: number;
}

const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  currentLevel,
  levelProgress,
  activeMonths,
}) => {
  const navigate = useNavigate();
  const currentIdx = Math.max(LEVELS.findIndex((l) => l.label === currentLevel), 0);
  const current = LEVELS[currentIdx];
  const next = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card className="border border-border shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Nível</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {activeMonths} {activeMonths === 1 ? "mês" : "meses"} ativo
            </span>
          </div>

          {/* Current level */}
          <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 shrink-0">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{current.label}</p>
              <p className="text-[11px] text-muted-foreground">Nível atual</p>
            </div>
            {next && (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Próximo</p>
                <p className="text-[11px] font-medium text-foreground">{next.label}</p>
              </div>
            )}
          </div>

          {/* Progress */}
          {next && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium text-foreground">{levelProgress}%</span>
              </div>
              <Progress value={levelProgress} className="h-1.5" />
            </div>
          )}

          {/* Level dots */}
          <div className="flex items-center justify-between px-1">
            {LEVELS.map((l, i) => (
              <div key={l.key} className="flex flex-col items-center gap-1">
                <div className={`h-2.5 w-2.5 rounded-full transition-all ${i <= currentIdx ? "bg-accent" : "bg-border"}`} />
                <span className={`text-[8px] ${i <= currentIdx ? "text-foreground font-medium" : "text-muted-foreground/30"}`}>
                  {l.label.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/club/benefits")}
            className="w-full flex items-center justify-center gap-1 text-[12px] text-accent font-medium hover:underline"
          >
            Ver benefícios do nível
            <ChevronRight className="h-3 w-3" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LevelProgressCard;
