import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText } from "lucide-react";

export interface IntegrationLog {
  id: string;
  integration_name: string;
  type: string;
  status: string;
  response: string | null;
  created_at: string;
  tenant_name: string;
}

interface IntegrationLogsTableProps {
  logs: IntegrationLog[];
}

const IntegrationLogsTable: React.FC<IntegrationLogsTableProps> = ({ logs }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><FileText className="h-5 w-5" /> Logs de Integração</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Integração</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Resposta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Nenhum log registrado</TableCell></TableRow>}
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="text-sm">{format(new Date(l.created_at), "dd/MM/yy HH:mm")}</TableCell>
                <TableCell className="font-medium">{l.integration_name}</TableCell>
                <TableCell>{l.tenant_name}</TableCell>
                <TableCell className="text-xs">{l.type}</TableCell>
                <TableCell>
                  <Badge variant={l.status === "success" ? "default" : l.status === "error" ? "destructive" : "secondary"}>
                    {l.status === "success" ? "Sucesso" : l.status === "error" ? "Erro" : l.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{l.response || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default IntegrationLogsTable;
