import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, ArrowUpRight, ArrowDownRight, Wallet, Percent, DollarSign, Users, AlertTriangle } from "lucide-react";

interface VitacoinsKpiCardsProps {
  totalEarned: number;
  totalRedeemed: number;
  inCirculation: number;
  financialValue: number;
  redemptionRate: number;
  costImpact: number;
  avgPerPartner: number;
  alerts: number;
}

const VitacoinsKpiCards: React.FC<VitacoinsKpiCardsProps> = ({
  totalEarned, totalRedeemed, inCirculation, financialValue, redemptionRate, costImpact, avgPerPartner, alerts,
}) => {
  const kpis = [
    { label: "Total Emitidos", value: totalEarned.toLocaleString("pt-BR"), icon: ArrowUpRight, color: "text-emerald-600 bg-emerald-100" },
    { label: "Total Resgatados", value: totalRedeemed.toLocaleString("pt-BR"), icon: ArrowDownRight, color: "text-orange-600 bg-orange-100" },
    { label: "Em Circulação", value: inCirculation.toLocaleString("pt-BR"), icon: Coins, color: "text-purple-600 bg-purple-100" },
    { label: "Valor Financeiro", value: `R$ ${financialValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: Wallet, color: "text-blue-600 bg-blue-100" },
    { label: "Taxa de Resgate", value: `${redemptionRate.toFixed(1)}%`, icon: Percent, color: redemptionRate > 50 ? "text-red-600 bg-red-100" : "text-emerald-600 bg-emerald-100" },
    { label: "Custo Total", value: `R$ ${costImpact.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-amber-600 bg-amber-100" },
    { label: "Média/Parceiro", value: avgPerPartner.toLocaleString("pt-BR"), icon: Users, color: "text-indigo-600 bg-indigo-100" },
    { label: "Alertas", value: String(alerts), icon: AlertTriangle, color: alerts > 0 ? "text-red-600 bg-red-100" : "text-emerald-600 bg-emerald-100" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <Card key={k.label} className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>
              <k.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="text-lg font-bold">{k.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VitacoinsKpiCards;
