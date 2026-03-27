import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, DollarSign, Activity } from "lucide-react";

interface TenantKpiCardsProps {
  tenants: any[];
  clientsCount: number;
  partnersCount: number;
  totalRevenue: number;
}

const TenantKpiCards: React.FC<TenantKpiCardsProps> = ({ tenants, clientsCount, partnersCount, totalRevenue }) => {
  const activeTenants = tenants.filter((t) => t.status === "active" || t.active !== false).length;

  const kpis = [
    {
      label: "Total de Empresas",
      value: tenants.length,
      sub: `${activeTenants} ativas`,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Empresas Ativas",
      value: activeTenants,
      sub: `${tenants.length - activeTenants} suspensas`,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Receita Total (MRR)",
      value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      sub: `${clientsCount} clientes · ${partnersCount} parceiros`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: "Crescimento Médio",
      value: tenants.length > 0 ? "—" : "0%",
      sub: "vs. mês anterior",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TenantKpiCards;
