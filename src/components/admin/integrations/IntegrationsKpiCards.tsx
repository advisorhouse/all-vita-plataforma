import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plug, AlertTriangle, Webhook, CheckCircle2, XCircle } from "lucide-react";

interface IntegrationsKpiCardsProps {
  activeIntegrations: number;
  errorIntegrations: number;
  activeWebhooks: number;
  successRate: number;
  failures24h: number;
}

const IntegrationsKpiCards: React.FC<IntegrationsKpiCardsProps> = ({
  activeIntegrations, errorIntegrations, activeWebhooks, successRate, failures24h,
}) => {
  const health = errorIntegrations === 0 ? "healthy" : errorIntegrations <= 2 ? "unstable" : "error";
  const healthConfig = {
    healthy: { label: "🟢 Saudável", color: "text-emerald-600 bg-emerald-100" },
    unstable: { label: "🟡 Instável", color: "text-amber-600 bg-amber-100" },
    error: { label: "🔴 Com Erro", color: "text-red-600 bg-red-100" },
  };

  const kpis = [
    { label: "Integrações Ativas", value: String(activeIntegrations), icon: Plug, color: "text-emerald-600 bg-emerald-100" },
    { label: "Com Erro", value: String(errorIntegrations), icon: XCircle, color: errorIntegrations > 0 ? "text-red-600 bg-red-100" : "text-emerald-600 bg-emerald-100" },
    { label: "Webhooks Ativos", value: String(activeWebhooks), icon: Webhook, color: "text-blue-600 bg-blue-100" },
    { label: "Taxa de Sucesso", value: `${successRate.toFixed(1)}%`, icon: CheckCircle2, color: successRate >= 95 ? "text-emerald-600 bg-emerald-100" : "text-amber-600 bg-amber-100" },
    { label: "Falhas (24h)", value: String(failures24h), icon: AlertTriangle, color: failures24h > 0 ? "text-red-600 bg-red-100" : "text-emerald-600 bg-emerald-100" },
    { label: "Status Geral", value: healthConfig[health].label, icon: Plug, color: healthConfig[health].color },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((k) => (
        <Card key={k.label} className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${k.color}`}>
              <k.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
              <p className="text-sm font-bold">{k.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IntegrationsKpiCards;
