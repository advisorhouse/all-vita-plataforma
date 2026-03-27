import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ShieldAlert, Activity, AlertTriangle } from "lucide-react";

interface AuditKpiCardsProps {
  totalLogs: number;
  todayLogs: number;
  securityEvents: number;
  criticalEvents: number;
}

const AuditKpiCards: React.FC<AuditKpiCardsProps> = ({ totalLogs, todayLogs, securityEvents, criticalEvents }) => {
  const cards = [
    { label: "Total de Registros", value: totalLogs.toLocaleString("pt-BR"), icon: FileText, color: "text-primary" },
    { label: "Ações Hoje", value: todayLogs, icon: Activity, color: "text-blue-500" },
    { label: "Eventos de Segurança", value: securityEvents, icon: ShieldAlert, color: "text-amber-500" },
    { label: "Alertas Críticos", value: criticalEvents, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AuditKpiCards;
