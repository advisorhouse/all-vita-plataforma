import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Coins } from "lucide-react";

interface Props {
  data: { month: string; revenue: number; vcCost: number }[];
  redemptionRate: number;
  vcVsRetention: number;
}

const VitacoinsImpactChart: React.FC<Props> = ({ data, redemptionRate, vcVsRetention }) => {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Impacto dos Vitacoins</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Taxa de Resgate</p>
            <p className="text-lg font-bold">{redemptionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-[11px] text-muted-foreground">VC vs Retenção</p>
            <p className="text-lg font-bold">{vcVsRetention.toFixed(1)}%</p>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Legend />
              <Bar dataKey="revenue" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vcCost" name="Custo VC" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VitacoinsImpactChart;
