import React from "react";
import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const LEVELS = [
  { key: "inicio", label: "Início", icon: "🌱" },
  { key: "consistencia", label: "Consistência", icon: "🔄" },
  { key: "protecao_ativa", label: "Proteção Ativa", icon: "🛡️" },
  { key: "longevidade", label: "Longevidade", icon: "⏳" },
  { key: "elite_vision", label: "Elite Vision", icon: "💎" },
];

interface VisionProgressWidgetProps {
  level: string;
  levelProgress: number;
  months: number;
}

const VisionProgressWidget: React.FC<VisionProgressWidgetProps> = ({
  level,
  levelProgress,
  months,
}) => {
  const currentIdx = LEVELS.findIndex((l) => l.key === level);
  const current = LEVELS[currentIdx] || LEVELS[0];
  const next = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="rounded-2xl border border-border bg-card p-6 vision-shadow"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <Shield className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Vision Progress</h3>
          <p className="text-caption text-muted-foreground">{months} {months === 1 ? "mês" : "meses"} ativo</p>
        </div>
      </div>

      {/* Current level */}
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
        <span className="text-xl">{current.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{current.label}</p>
          <p className="text-[11px] text-muted-foreground">Nível atual</p>
        </div>
        {next && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Próximo:</span>
            <span className="font-medium text-foreground">{next.label}</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Progress bar */}
      {next && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progresso para {next.label}</span>
            <span className="font-medium text-foreground">{levelProgress}%</span>
          </div>
          <Progress value={levelProgress} className="h-1.5" />
        </div>
      )}

      {!next && (
        <p className="text-center text-caption text-muted-foreground">
          Você alcançou o nível máximo. Parabéns pela sua dedicação!
        </p>
      )}

      {/* Level dots */}
      <div className="mt-4 flex items-center justify-between px-2">
        {LEVELS.map((l, i) => (
          <div key={l.key} className="flex flex-col items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                i <= currentIdx ? "bg-accent" : "bg-border"
              }`}
            />
            <span className={`text-[9px] ${i <= currentIdx ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {l.icon}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default VisionProgressWidget;
