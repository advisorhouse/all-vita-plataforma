import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Coins, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  severity: "high" | "medium" | "low";
  message: string;
  icon: React.ElementType;
}

interface VCAlertsPanelProps {
  redemptionRate: number;
  emissionGrowth: number;
  costRatio: number;
}

const VCAlertsPanel: React.FC<VCAlertsPanelProps> = ({ redemptionRate, emissionGrowth, costRatio }) => {
  const alerts: Alert[] = [];

  if (redemptionRate > 60) alerts.push({ id: "rr", severity: "high", message: `Taxa de resgate alta: ${redemptionRate.toFixed(1)}%`, icon: Coins });
  if (emissionGrowth > 50) alerts.push({ id: "eg", severity: "medium", message: `Emissão cresceu ${emissionGrowth.toFixed(0)}% no período`, icon: TrendingUp });
  if (costRatio > 15) alerts.push({ id: "cr", severity: "high", message: `Custo VC representa ${costRatio.toFixed(1)}% da receita`, icon: DollarSign });

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          ✅ Nenhum alerta no momento — economia saudável
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Alertas
          <Badge variant="destructive">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((a) => (
          <div key={a.id} className={`flex items-center gap-3 p-3 rounded-lg ${a.severity === "high" ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
            <a.icon className={`h-4 w-4 ${a.severity === "high" ? "text-red-600" : "text-amber-600"}`} />
            <span className="text-sm">{a.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default VCAlertsPanel;
