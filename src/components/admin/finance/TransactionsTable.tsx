import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export interface TransactionRow {
  id: string;
  tenant_name: string;
  amount: number;
  status: string;
  currency: string;
  created_at: string;
  customer_name: string | null;
}

interface TransactionsTableProps {
  transactions: TransactionRow[];
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  approved: { label: "Aprovado", variant: "default" },
  completed: { label: "Aprovado", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  failed: { label: "Falhou", variant: "destructive" },
};

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma transação</TableCell>
              </TableRow>
            )}
            {transactions.map((tx) => {
              const st = statusMap[tx.status] || { label: tx.status, variant: "outline" as const };
              return (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm">{format(new Date(tx.created_at), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell>{tx.tenant_name}</TableCell>
                  <TableCell>{tx.customer_name || "—"}</TableCell>
                  <TableCell className="text-right font-semibold">
                    R$ {tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionsTable;
