import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Props {
  data: { month: string; users: number; revenue: number; partners: number }[];
}

const GrowthTrendsChart: React.FC<Props> = ({ data }) => {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold">Tendências de Crescimento</h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" name="Usuários" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="revenue" name="Receita (R$)" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="partners" name="Parceiros" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthTrendsChart;
