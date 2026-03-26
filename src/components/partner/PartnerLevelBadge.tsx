import React from "react";
import { motion } from "framer-motion";
import { Award, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const LEVELS = [
  { key: "basic", label: "Basic", description: "Início da jornada" },
  { key: "advanced", label: "Advanced", description: "10+ clientes ativos" },
  { key: "premium", label: "Premium", description: "25+ clientes, alta retenção" },
  { key: "elite", label: "Elite", description: "50+ clientes, excelência" },
];

interface PartnerLevelBadgeProps {
  level: string;
  progress: number;
  activeClients: number;
  retentionScore: number;
}

const PartnerLevelBadge: React.FC<PartnerLevelBadgeProps> = ({
  level,
  progress,
  activeClients,
  retentionScore,
}) => {
  const currentIdx = LEVELS.findIndex((l) => l.key === level);
  const current = LEVELS[currentIdx] || LEVELS[0];
  const next = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.06 }}
      className="rounded-2xl border border-border bg-card p-6 vision-shadow"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <Award className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Nível Partner</h3>
          <p className="text-caption text-muted-foreground">{current.description}</p>
        </div>
      </div>

      {/* Current level badge */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
        <div>
          <p className="text-lg font-semibold text-foreground">{current.label}</p>
          <p className="text-[11px] text-muted-foreground">Nível atual</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{activeClients}</p>
            <p className="text-[9px] text-muted-foreground">ativos</p>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{retentionScore}</p>
            <p className="text-[9px] text-muted-foreground">retenção</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      {next && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Próximo: <span className="font-medium text-foreground">{next.label}</span></span>
              <ChevronRight className="h-3 w-3" />
            </div>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {!next && (
        <p className="text-center text-caption text-muted-foreground">
          Nível máximo alcançado. Excelência em parceria.
        </p>
      )}

      {/* Level dots */}
      <div className="mt-4 flex items-center justify-between px-4">
        {LEVELS.map((l, i) => (
          <div key={l.key} className="flex flex-col items-center gap-1">
            <div
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i <= currentIdx ? "bg-accent" : "bg-border"
              }`}
            />
            <span className={`text-[9px] ${i <= currentIdx ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PartnerLevelBadge;
