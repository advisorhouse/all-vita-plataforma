import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface RevenueDeepDiveProps {
  revenueOverTime: { month: string; recurring: number; oneTime: number }[];
  revenueByTenant: { name: string; revenue: number }[];
  revenueByProduct: { name: string; revenue: number }[];
}

const RevenueDeepDive: React.FC<RevenueDeepDiveProps> = ({ revenueOverTime, revenueByTenant, revenueByProduct }) => {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-4">Análise de Receita (Deep Dive)</h3>
        <Tabs defaultValue="time">
          <TabsList className="mb-4">
            <TabsTrigger value="time">Ao Longo do Tempo</TabsTrigger>
            <TabsTrigger value="tenant">Por Empresa</TabsTrigger>
            <TabsTrigger value="product">Por Produto</TabsTrigger>
          </TabsList>

          <TabsContent value="time">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                  <Legend />
                  <Bar dataKey="recurring" name="Recorrente" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="oneTime" name="Pontual" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="tenant">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByTenant.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                  <Bar dataKey="revenue" name="Receita" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="product">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByProduct.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                  <Bar dataKey="revenue" name="Receita" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RevenueDeepDive;
