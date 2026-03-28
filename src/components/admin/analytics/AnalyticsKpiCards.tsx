import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Timer, Target, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsKpiCardsProps {
  mrr: number;
  arr: number;
  growth: number;
  churn: number;
  ltv: number;
  cac: number;
  payback: number;
  activeClients: number;
}

const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({ mrr, arr, growth, churn, ltv, cac, payback, activeClients }) => {
  const kpis = [
    { label: "MRR", value: `R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "text-emerald-500", trend: growth > 0 },
    { label: "ARR", value: `R$ ${arr.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, icon: BarChart3, color: "text-blue-500", trend: growth > 0 },
    { label: "Crescimento", value: `${growth.toFixed(1)}%`, icon: growth >= 0 ? TrendingUp : TrendingDown, color: growth >= 0 ? "text-emerald-500" : "text-destructive", trend: growth >= 0 },
    { label: "Churn", value: `${churn.toFixed(1)}%`, icon: RefreshCw, color: churn < 5 ? "text-emerald-500" : "text-destructive", trend: churn < 5 },
    { label: "LTV Médio", value: `R$ ${ltv.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, icon: Target, color: "text-violet-500", trend: true },
    { label: "CAC", value: `R$ ${cac.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, icon: Users, color: "text-amber-500", trend: cac < ltv },
    { label: "Payback", value: `${payback.toFixed(1)} meses`, icon: Timer, color: "text-blue-500", trend: payback < 6 },
    { label: "Clientes Ativos", value: activeClients.toLocaleString("pt-BR"), icon: Users, color: "text-emerald-500", trend: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((k) => (
        <Card key={k.label} className="border-border/50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className={cn("p-2 rounded-lg bg-muted/60", k.color)}>
              <k.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">{k.label}</p>
              <p className="text-lg font-bold truncate">{k.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsKpiCards;
