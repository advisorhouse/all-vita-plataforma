import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export interface VCTransaction {
  id: string;
  user_name: string;
  tenant_name: string;
  type: string;
  source: string;
  amount: number;
  created_at: string;
}

interface VCTransactionsTableProps {
  transactions: VCTransaction[];
}

const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  credit: { label: "Ganho", variant: "default" },
  debit: { label: "Resgate", variant: "destructive" },
  adjustment: { label: "Ajuste", variant: "secondary" },
};

const VCTransactionsTable: React.FC<VCTransactionsTableProps> = ({ transactions }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Histórico de Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead className="text-right">Valor (VC)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma transação</TableCell></TableRow>
            )}
            {transactions.map((tx) => {
              const t = typeMap[tx.type] || { label: tx.type, variant: "secondary" as const };
              return (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm">{format(new Date(tx.created_at), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell>{tx.user_name}</TableCell>
                  <TableCell>{tx.tenant_name}</TableCell>
                  <TableCell><Badge variant={t.variant}>{t.label}</Badge></TableCell>
                  <TableCell className="text-sm">{tx.source}</TableCell>
                  <TableCell className="text-right font-semibold">{tx.type === "debit" ? "-" : "+"}{tx.amount.toLocaleString("pt-BR")}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default VCTransactionsTable;
