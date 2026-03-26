import React from "react";
import { motion } from "framer-motion";
import { Package, Truck, ChevronRight, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SubscriptionWidgetProps {
  productName: string;
  nextShipment: string;
  cycle: number;
}

const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = ({
  productName,
  nextShipment,
  cycle,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card className="border border-border shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Package className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{productName}</p>
                <p className="text-[11px] text-muted-foreground">Ciclo #{cycle}</p>
              </div>
            </div>
            <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-medium text-success">
              Ativa
            </span>
          </div>

          {/* Shipment timeline */}
          <div className="rounded-xl bg-secondary/40 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card">
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-medium text-foreground">Próximo envio</p>
                <p className="text-[11px] text-muted-foreground">{nextShipment}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-medium text-foreground">Pagamento</p>
                <p className="text-[11px] text-success">Confirmado</p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl text-[12px]"
            onClick={() => navigate("/club/subscription")}
          >
            Gerenciar assinatura
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubscriptionWidget;
