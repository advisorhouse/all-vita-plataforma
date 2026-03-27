import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, MousePointer, UserPlus, ShoppingCart, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelData {
  clicks: number;
  leads: number;
  purchases: number;
  retained: number;
}

interface ConversionFunnelProps {
  data: FunnelData;
}

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
  const stages = [
    { label: "Cliques", value: data.clicks, icon: MousePointer, color: "text-blue-500", bg: "bg-blue-500" },
    { label: "Leads", value: data.leads, icon: UserPlus, color: "text-violet-500", bg: "bg-violet-500" },
    { label: "Compras", value: data.purchases, icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-500" },
    { label: "Retenção", value: data.retained, icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-500" },
  ];

  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-semibold">Funil de Conversão</h3>
        </div>
        <div className="space-y-3">
          {stages.map((stage, i) => {
            const pct = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
            const convRate = i > 0 && stages[i - 1].value > 0
              ? ((stage.value / stages[i - 1].value) * 100).toFixed(1)
              : null;

            return (
              <div key={stage.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <stage.icon className={cn("h-3.5 w-3.5", stage.color)} />
                    <span className="text-xs font-medium">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{stage.value.toLocaleString("pt-BR")}</span>
                    {convRate && (
                      <span className="text-[10px] text-muted-foreground">({convRate}%)</span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", stage.bg)} style={{ width: `${pct}%`, opacity: 0.7 }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnel;
