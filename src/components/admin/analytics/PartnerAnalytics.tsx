import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Zap } from "lucide-react";

interface PartnerAnalyticsProps {
  totalPartners: number;
  activePartners: number;
  conversionRate: number;
  revenuePerPartner: number;
  topPartners: { name: string; revenue: number; clients: number }[];
  byLevel: { level: string; count: number }[];
}

const PartnerAnalytics: React.FC<PartnerAnalyticsProps> = ({ totalPartners, activePartners, conversionRate, revenuePerPartner, topPartners, byLevel }) => {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold">Análise de Parceiros</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: totalPartners, icon: Users },
            { label: "Ativos", value: activePartners, icon: Zap },
            { label: "Conversão", value: `${conversionRate.toFixed(1)}%`, icon: TrendingUp },
            { label: "Receita/Parceiro", value: `R$ ${revenuePerPartner.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`, icon: TrendingUp },
          ].map((m) => (
            <div key={m.label} className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
              <p className="text-base font-bold">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">Top Parceiros por Receita</p>
            <div className="space-y-2">
              {topPartners.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{p.clients} clientes</Badge>
                    <span className="text-xs font-bold">R$ {p.revenue.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              ))}
              {topPartners.length === 0 && <p className="text-xs text-muted-foreground">Sem dados</p>}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">Distribuição por Nível</p>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byLevel}>
                  <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Parceiros" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerAnalytics;
