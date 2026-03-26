import React from "react";
import { motion } from "framer-motion";
import { Clock, Award } from "lucide-react";

interface ActiveTimeWidgetProps {
  months: number;
}

const badges = [
  { min: 1, label: "Iniciante", color: "text-muted-foreground" },
  { min: 3, label: "Comprometido", color: "text-accent" },
  { min: 6, label: "Dedicado", color: "text-accent" },
  { min: 12, label: "Veterano", color: "text-success" },
];

const ActiveTimeWidget: React.FC<ActiveTimeWidgetProps> = ({ months }) => {
  const badge = [...badges].reverse().find((b) => months >= b.min) || badges[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-6 vision-shadow"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Tempo Ativo</h3>
          <p className="text-caption text-muted-foreground">Na Vision Lift</p>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-4xl font-semibold text-foreground">{months}</span>
        <span className="ml-1 text-lg text-muted-foreground">meses</span>
      </div>

      <p className="mb-4 text-caption text-muted-foreground">
        Você está há {months} {months === 1 ? "mês" : "meses"} cuidando da sua saúde visual.
      </p>

      <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2">
        <Award className={`h-4 w-4 ${badge.color}`} />
        <span className={`text-sm font-medium ${badge.color}`}>{badge.label}</span>
      </div>
    </motion.div>
  );
};

export default ActiveTimeWidget;
