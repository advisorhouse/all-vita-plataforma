import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MousePointer, UserPlus, ShoppingCart, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  clicks: number;
  leads: number;
  purchases: number;
  retained: number;
}

const ConversionFunnelAnalytics: React.FC<Props> = ({ clicks, leads, purchases, retained }) => {
  const stages = [
    { label: "Cliques", value: clicks, icon: MousePointer, color: "text-blue-500", bg: "bg-blue-500" },
    { label: "Leads", value: leads, icon: UserPlus, color: "text-violet-500", bg: "bg-violet-500" },
    { label: "Compras", value: purchases, icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-500" },
    { label: "Retenção", value: retained, icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-500" },
  ];
  const maxVal = Math.max(...stages.map((s) => s.value), 1);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold">Funil de Conversão</h3>
        <div className="space-y-3">
          {stages.map((s, i) => {
            const pct = (s.value / maxVal) * 100;
            const rate = i > 0 && stages[i - 1].value > 0 ? ((s.value / stages[i - 1].value) * 100).toFixed(1) : null;
            return (
              <div key={s.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className={cn("h-3.5 w-3.5", s.color)} />
                    <span className="text-xs font-medium">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{s.value.toLocaleString("pt-BR")}</span>
                    {rate && <span className="text-[10px] text-muted-foreground">({rate}%)</span>}
                  </div>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", s.bg)} style={{ width: `${pct}%`, opacity: 0.7 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[
            { label: "Clique→Lead", val: leads > 0 && clicks > 0 ? ((leads / clicks) * 100).toFixed(1) + "%" : "—" },
            { label: "Lead→Compra", val: purchases > 0 && leads > 0 ? ((purchases / leads) * 100).toFixed(1) + "%" : "—" },
            { label: "Compra→Retenção", val: retained > 0 && purchases > 0 ? ((retained / purchases) * 100).toFixed(1) + "%" : "—" },
          ].map((m) => (
            <div key={m.label} className="bg-muted/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-sm font-bold">{m.val}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelAnalytics;
