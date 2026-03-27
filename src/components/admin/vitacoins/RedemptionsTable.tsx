import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { format } from "date-fns";

export interface RedemptionRow {
  id: string;
  user_name: string;
  tenant_name: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
}

interface RedemptionsTableProps {
  redemptions: RedemptionRow[];
  totals: { requested: number; approved: number; rejected: number };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  approved: { label: "Aprovado", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
};

const RedemptionsTable: React.FC<RedemptionsTableProps> = ({ redemptions, totals, onApprove, onReject }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Resgates</CardTitle>
          <div className="flex gap-3 text-xs">
            <span>Solicitados: <strong>{totals.requested}</strong></span>
            <span className="text-emerald-600">Aprovados: <strong>{totals.approved}</strong></span>
            <span className="text-red-600">Rejeitados: <strong>{totals.rejected}</strong></span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor (VC)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {redemptions.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum resgate</TableCell></TableRow>
            )}
            {redemptions.map((r) => {
              const st = statusMap[r.status] || { label: r.status, variant: "outline" as const };
              return (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">{format(new Date(r.created_at), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell>{r.user_name}</TableCell>
                  <TableCell>{r.tenant_name}</TableCell>
                  <TableCell>{r.type === "cash" ? "Dinheiro" : "Produto"}</TableCell>
                  <TableCell className="text-right font-semibold">{r.amount.toLocaleString("pt-BR")}</TableCell>
                  <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                  <TableCell>
                    {r.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => onApprove?.(r.id)}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => onReject?.(r.id)}><X className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RedemptionsTable;
