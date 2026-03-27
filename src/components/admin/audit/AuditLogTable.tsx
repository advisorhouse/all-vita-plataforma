import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuditLogRow {
  id: string;
  created_at: string;
  action: string;
  entity_type: string | null;
  resource: string | null;
  actor_type: string | null;
  user_id: string | null;
  tenant_id: string | null;
  ip: string | null;
  user_agent: string | null;
  old_data: any;
  new_data: any;
  details: any;
  entity_id: string | null;
  resource_id: string | null;
  // Enriched
  user_name?: string;
  tenant_name?: string;
}

const ACTION_LABELS: Record<string, string> = {
  user_created: "Usuário criado",
  tenant_created: "Empresa criada",
  login: "Login",
  login_fail: "Login falhou",
  permission_changed: "Permissão alterada",
  lgpd_anonymization: "LGPD Anonimização",
  account_locked: "Conta bloqueada",
};

const getActionStyle = (action: string) => {
  if (action.includes("create") || action === "login") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (action.includes("delete") || action.includes("deactivat") || action === "account_locked") return "bg-destructive/10 text-destructive border-destructive/20";
  if (action.includes("fail") || action.includes("error")) return "bg-destructive/10 text-destructive border-destructive/20";
  if (action.includes("update") || action.includes("change")) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  if (action.includes("lgpd")) return "bg-purple-500/10 text-purple-600 border-purple-500/20";
  return "bg-primary/10 text-primary border-primary/20";
};

const getStatusIcon = (action: string) => {
  if (action.includes("fail") || action.includes("error") || action === "account_locked") return "❌";
  if (action.includes("lgpd") || action.includes("security")) return "⚠️";
  return "✅";
};

interface Props {
  logs: AuditLogRow[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  onViewLog: (log: AuditLogRow) => void;
  isLoading: boolean;
}

const AuditLogTable: React.FC<Props> = ({ logs, page, totalPages, total, onPageChange, onViewLog, isLoading }) => (
  <Card>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Data / Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>IP</TableHead>
              <TableHead className="text-right">Detalhe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className="cursor-pointer hover:bg-secondary/30"
                onClick={() => onViewLog(log)}
              >
                <TableCell className="text-center">{getStatusIcon(log.action)}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </TableCell>
                <TableCell className="text-sm">
                  <div>
                    <p className="font-medium text-foreground text-xs">{log.user_name || "Sistema"}</p>
                    <p className="text-[10px] text-muted-foreground">{log.actor_type || "system"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {log.tenant_name
                    ? <Badge variant="secondary" className="text-[9px]">{log.tenant_name}</Badge>
                    : <span className="text-[10px] text-muted-foreground">Global</span>
                  }
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-[10px]", getActionStyle(log.action))}>
                    {ACTION_LABELS[log.action] || log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-foreground">
                  {log.entity_type || log.resource || "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {log.ip || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onViewLog(log); }}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  {isLoading ? "Carregando..." : "Nenhum registro encontrado"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Mostrando página {page + 1} de {totalPages} ({total.toLocaleString("pt-BR")} registros)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default AuditLogTable;
