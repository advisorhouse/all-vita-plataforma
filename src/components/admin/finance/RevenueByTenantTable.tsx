import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface TenantRevenue {
  id: string;
  name: string;
  revenue: number;
  growth: number;
  share: number;
  orders: number;
}

interface RevenueByTenantTableProps {
  tenants: TenantRevenue[];
}

const RevenueByTenantTable: React.FC<RevenueByTenantTableProps> = ({ tenants }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Receita por Empresa</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">Crescimento</TableHead>
              <TableHead className="text-right">Participação</TableHead>
              <TableHead className="text-right">Pedidos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum dado disponível
                </TableCell>
              </TableRow>
            )}
            {tenants.map((t, i) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-right font-semibold">
                  R$ {t.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={t.growth >= 0 ? "default" : "destructive"} className="gap-1">
                    {t.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {t.growth.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{t.share.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{t.orders}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RevenueByTenantTable;
