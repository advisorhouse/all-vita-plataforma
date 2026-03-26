import React from "react";
import { motion } from "framer-motion";
import { Truck, CreditCard, ChevronRight } from "lucide-react";

interface NextShipmentWidgetProps {
  date: string;
  paymentStatus: "paid" | "pending";
  onAnticipate?: () => void;
}

const NextShipmentWidget: React.FC<NextShipmentWidgetProps> = ({ date, paymentStatus, onAnticipate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-border bg-card p-6 vision-shadow"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <Truck className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Próximo Envio</h3>
        </div>
      </div>

      <div className="mb-2 text-2xl font-semibold text-foreground">{date}</div>

      <div className="mb-5 flex items-center gap-2">
        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
        <span
          className={`text-caption font-medium ${
            paymentStatus === "paid" ? "text-success" : "text-warning"
          }`}
        >
          {paymentStatus === "paid" ? "Pagamento confirmado" : "Pagamento pendente"}
        </span>
      </div>

      <button
        onClick={onAnticipate}
        className="flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
      >
        Antecipar envio
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </motion.div>
  );
};

export default NextShipmentWidget;
