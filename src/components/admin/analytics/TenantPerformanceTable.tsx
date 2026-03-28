import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface TenantPerf {
  id: string;
  name: string;
  revenue: number;
  growth: number;
  churn: number;
  ltv: number;
  clients: number;
}

interface Props {
  tenants: TenantPerf[];
}

const TenantPerformanceTable: React.FC<Props> = ({ tenants }) => {
  const sorted = [...tenants].sort((a, b) => b.revenue - a.revenue);

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-4">Performance por Empresa</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Crescimento</TableHead>
                <TableHead className="text-right">Churn</TableHead>
                <TableHead className="text-right">LTV</TableHead>
                <TableHead className="text-right">Clientes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-right">R$ {t.revenue.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-right">
                    <span className={t.growth >= 0 ? "text-emerald-500" : "text-destructive"}>
                      {t.growth >= 0 ? "+" : ""}{t.growth.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{t.churn.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">R$ {t.ltv.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-right">{t.clients}</TableCell>
                  <TableCell>
                    {t.growth > 5 ? (
                      <Badge variant="default" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        <TrendingUp className="h-3 w-3" /> Top
                      </Badge>
                    ) : t.growth < -2 ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingDown className="h-3 w-3" /> Atenção
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Estável</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Sem dados</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantPerformanceTable;
