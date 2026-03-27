import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Repeat, Coins, BarChart3, Percent } from "lucide-react";

interface FinanceKpiCardsProps {
  totalRevenue: number;
  mrr: number;
  arr: number;
  growth: number;
  avgTicket: number;
  totalCommissions: number;
  totalVitacoins: number;
  margin: number;
}

const fmt = (v: number) =>
  v >= 1000
    ? `R$ ${(v / 1000).toFixed(1)}k`
    : `R$ ${v.toFixed(2)}`;

const FinanceKpiCards: React.FC<FinanceKpiCardsProps> = ({
  totalRevenue, mrr, arr, growth, avgTicket, totalCommissions, totalVitacoins, margin,
}) => {
  const kpis = [
    { label: "Receita Total", value: fmt(totalRevenue), icon: DollarSign, color: "text-emerald-600" },
    { label: "MRR", value: fmt(mrr), icon: Repeat, color: "text-blue-600" },
    { label: "ARR", value: fmt(arr), icon: BarChart3, color: "text-indigo-600" },
    { label: "Crescimento", value: `${growth.toFixed(1)}%`, icon: TrendingUp, color: growth >= 0 ? "text-emerald-600" : "text-red-600" },
    { label: "Ticket Médio", value: fmt(avgTicket), icon: DollarSign, color: "text-amber-600" },
    { label: "Comissões Pagas", value: fmt(totalCommissions), icon: DollarSign, color: "text-orange-600" },
    { label: "Vitacoins Emitidos", value: totalVitacoins.toLocaleString("pt-BR"), icon: Coins, color: "text-purple-600" },
    { label: "Margem", value: `${margin.toFixed(1)}%`, icon: Percent, color: margin >= 30 ? "text-emerald-600" : "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <Card key={k.label} className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${k.color}`}>
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

export default FinanceKpiCards;
