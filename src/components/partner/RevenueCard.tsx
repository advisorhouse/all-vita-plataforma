import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, DollarSign, ArrowUpRight } from "lucide-react";

const RevenueCard: React.FC = () => {
  const points = 4872;
  const variation = 12.4;
  const activeClients = 34;
  const isPositive = variation > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-6 vision-shadow-lg"
    >
      <div className="mb-1 flex items-center justify-between">
        <p className="text-caption font-medium text-muted-foreground">Pontos Acumulados no Mês</p>
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
          isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? "+" : ""}{variation}%
        </div>
      </div>

      <div className="mb-4">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {points.toLocaleString("pt-BR")} pts
        </span>
        <p className="mt-1 text-caption text-muted-foreground">vs mês anterior</p>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-secondary/50 p-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <div>
            <p className="text-lg font-semibold text-foreground">{activeClients}</p>
            <p className="text-[11px] text-muted-foreground">pacientes ativos</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-caption text-accent font-medium">
          <span>Ver detalhes</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueCard;
