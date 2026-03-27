import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

interface VitacoinsFinancePanelProps {
  totalEarned: number;
  totalRedeemed: number;
  inCirculation: number;
  conversionRate: number;
}

const VitacoinsFinancePanel: React.FC<VitacoinsFinancePanelProps> = ({
  totalEarned, totalRedeemed, inCirculation, conversionRate,
}) => {
  const financialValue = inCirculation * conversionRate;
  const redemptionRate = totalEarned > 0 ? (totalRedeemed / totalEarned) * 100 : 0;

  const items = [
    { label: "Emitidos", value: totalEarned.toLocaleString("pt-BR"), icon: ArrowUpRight, color: "text-emerald-600 bg-emerald-100" },
    { label: "Resgatados", value: totalRedeemed.toLocaleString("pt-BR"), icon: ArrowDownRight, color: "text-orange-600 bg-orange-100" },
    { label: "Em Circulação", value: inCirculation.toLocaleString("pt-BR"), icon: Coins, color: "text-purple-600 bg-purple-100" },
    { label: "Valor Financeiro", value: `R$ ${financialValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: Wallet, color: "text-blue-600 bg-blue-100" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Coins className="h-5 w-5 text-purple-600" /> Vitacoins — Visão Financeira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((it) => (
            <div key={it.label} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${it.color}`}>
                <it.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{it.label}</p>
                <p className="font-bold">{it.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <span>Taxa de resgate: <strong className="text-foreground">{redemptionRate.toFixed(1)}%</strong></span>
          <span>Taxa de conversão: <strong className="text-foreground">1 VC = R$ {conversionRate.toFixed(2)}</strong></span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VitacoinsFinancePanel;
