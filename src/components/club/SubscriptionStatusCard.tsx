import React from "react";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";

interface SubscriptionStatusCardProps {
  plan: string;
  nextShipment: string;
  status: "active" | "paused";
  onManage?: () => void;
}

const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  plan,
  nextShipment,
  status,
  onManage,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-6 vision-shadow"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Package className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Minha Assinatura</h3>
            <p className="text-caption text-muted-foreground">{plan}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            status === "active"
              ? "bg-success/10 text-success"
              : "bg-warning/10 text-warning"
          }`}
        >
          {status === "active" ? "Ativa" : "Pausada"}
        </span>
      </div>

      <div className="mb-5 rounded-xl bg-secondary/50 p-4">
        <p className="text-caption text-muted-foreground">Próximo envio</p>
        <p className="text-lg font-semibold text-foreground">{nextShipment}</p>
      </div>

      <button
        onClick={onManage}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
      >
        Gerenciar
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default SubscriptionStatusCard;
