import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, Lock, XCircle } from "lucide-react";

interface SecurityEvent {
  id: string;
  type: string;
  user_id: string | null;
  ip: string | null;
  severity: string | null;
  metadata: any;
  created_at: string;
  user_name?: string;
}

interface Props {
  events: SecurityEvent[];
  isLoading: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  login_fail: "Login falhou",
  account_locked: "Conta bloqueada",
  access_denied: "Acesso negado",
  suspicious_activity: "Atividade suspeita",
  brute_force: "Força bruta",
  mfa_fail: "2FA falhou",
};

const SEVERITY_STYLE: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-600",
  medium: "bg-amber-500/10 text-amber-600",
  high: "bg-orange-500/10 text-orange-600",
  critical: "bg-destructive/10 text-destructive",
};

const SecurityEventsPanel: React.FC<Props> = ({ events, isLoading }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-destructive" />
        Eventos de Segurança Recentes
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum evento de segurança recente ✅</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="mt-0.5">
                {ev.type === "account_locked" ? <Lock className="h-4 w-4 text-destructive" /> :
                 ev.type === "login_fail" ? <XCircle className="h-4 w-4 text-amber-500" /> :
                 <AlertTriangle className="h-4 w-4 text-orange-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">
                    {TYPE_LABELS[ev.type] || ev.type}
                  </p>
                  <Badge variant="outline" className={`text-[9px] ${SEVERITY_STYLE[ev.severity || "medium"]}`}>
                    {ev.severity || "medium"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ev.user_name || ev.user_id?.slice(0, 8) || "Desconhecido"}
                  {ev.ip && ` • ${ev.ip}`}
                  {" • "}{new Date(ev.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default SecurityEventsPanel;
