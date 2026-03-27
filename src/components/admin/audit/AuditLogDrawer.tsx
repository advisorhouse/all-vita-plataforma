import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, Building2, Globe, Monitor, ArrowRight } from "lucide-react";
import type { AuditLogRow } from "./AuditLogTable";

interface Props {
  log: AuditLogRow | null;
  open: boolean;
  onClose: () => void;
}

const AuditLogDrawer: React.FC<Props> = ({ log, open, onClose }) => {
  if (!log) return null;

  const oldData = typeof log.old_data === "object" ? log.old_data : {};
  const newData = typeof log.new_data === "object" ? log.new_data : {};
  const details = typeof log.details === "object" ? log.details : {};
  const hasChanges = Object.keys(oldData || {}).length > 0 || Object.keys(newData || {}).length > 0;
  const hasDetails = Object.keys(details || {}).length > 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">Detalhes do Log</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Action summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Usuário:</span>
                <span className="font-medium">{log.user_name || log.user_id?.slice(0, 8) || "Sistema"}</span>
                <Badge variant="outline" className="text-[9px] ml-1">{log.actor_type || "system"}</Badge>
              </div>
              {log.tenant_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Empresa:</span>
                  <span className="font-medium">{log.tenant_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">IP:</span>
                <span className="font-mono text-xs">{log.ip || "—"}</span>
              </div>
              {log.user_agent && (
                <div className="flex items-start gap-2 text-sm">
                  <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">Dispositivo:</span>
                  <span className="text-xs text-muted-foreground break-all">{log.user_agent}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action & Entity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ação Realizada</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">{log.action}</Badge>
              </div>
              {(log.entity_type || log.resource) && (
                <p className="text-sm text-muted-foreground">
                  Entidade: <strong className="text-foreground">{log.entity_type || log.resource}</strong>
                  {(log.entity_id || log.resource_id) && (
                    <span className="font-mono text-xs ml-2">({log.entity_id || log.resource_id})</span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Changes diff */}
          {hasChanges && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  Alterações <ArrowRight className="h-3 w-3" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Antes (old_data)</p>
                    <pre className="text-[10px] bg-destructive/5 border border-destructive/10 rounded-md p-3 overflow-auto max-h-48 text-foreground">
                      {JSON.stringify(oldData, null, 2) || "—"}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Depois (new_data)</p>
                    <pre className="text-[10px] bg-emerald-500/5 border border-emerald-500/10 rounded-md p-3 overflow-auto max-h-48 text-foreground">
                      {JSON.stringify(newData, null, 2) || "—"}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata / Details */}
          {hasDetails && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <pre className="text-[10px] bg-secondary rounded-md p-3 overflow-auto max-h-48 text-foreground">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AuditLogDrawer;
