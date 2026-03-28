import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ClientCohortChartProps {
  acquisitionData: { month: string; newClients: number; retained: number }[];
  totalClients: number;
  retentionRate: number;
  avgLifetime: number;
}

const ClientCohortChart: React.FC<ClientCohortChartProps> = ({ acquisitionData, totalClients, retentionRate, avgLifetime }) => {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold">Análise de Clientes</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{totalClients.toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Retenção</p>
            <p className="text-lg font-bold">{retentionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Vida Média</p>
            <p className="text-lg font-bold">{avgLifetime.toFixed(1)} m</p>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={acquisitionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="newClients" name="Novos" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" />
              <Area type="monotone" dataKey="retained" name="Retidos" fill="hsl(var(--chart-2))" fillOpacity={0.2} stroke="hsl(var(--chart-2))" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCohortChart;
