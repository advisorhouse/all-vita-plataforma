import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity, ChevronRight, AlertTriangle, Lock, ShieldCheck,
  Building2, Users, FileText, Plug, UserPlus, ShoppingCart,
  Coins, TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string | null;
  created_at: string;
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: string | null;
  created_at: string;
}

interface ActivityFeedProps {
  auditLogs: AuditLog[];
  securityEvents: SecurityEvent[];
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const actions = [
    { label: "Nova Empresa", icon: Building2, href: "/admin/tenants", color: "bg-accent/10 text-accent" },
    { label: "Gerenciar Usuários", icon: Users, href: "/admin/users", color: "bg-primary/10 text-primary" },
    { label: "Auditoria", icon: FileText, href: "/admin/audit", color: "bg-amber-500/10 text-amber-500" },
    { label: "Segurança", icon: ShieldCheck, href: "/admin/security", color: "bg-destructive/10 text-destructive" },
    { label: "Integrações", icon: Plug, href: "/admin/settings", color: "bg-violet-500/10 text-violet-500" },
    { label: "Configurações", icon: TrendingUp, href: "/admin/settings", color: "bg-blue-500/10 text-blue-500" },
  ];

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {actions.map(({ label, icon: Icon, href, color }) => (
            <button
              key={label}
              onClick={() => navigate(href)}
              className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 hover:bg-secondary/30 transition-colors text-left"
            >
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ auditLogs, securityEvents }) => {
  const navigate = useNavigate();

  const timeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return "";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Timeline */}
      <Card className="lg:col-span-1">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Atividade Recente</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/audit")}>
              Ver tudo <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 mt-0.5 shrink-0">
                  <FileText className="h-3 w-3 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{log.action}</p>
                  <p className="text-[10px] text-muted-foreground">{log.entity_type || "sistema"} · {timeAgo(log.created_at)}</p>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <p className="text-center py-6 text-xs text-muted-foreground">Nenhum log registrado</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="lg:col-span-1">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">Segurança</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/security")}>
              Ver tudo <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-1">
            {securityEvents.map((evt) => (
              <div key={evt.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full mt-0.5 shrink-0",
                  evt.severity === "high" || evt.severity === "critical" ? "bg-destructive/10" : "bg-amber-500/10"
                )}>
                  <AlertTriangle className={cn(
                    "h-3 w-3",
                    evt.severity === "high" || evt.severity === "critical" ? "text-destructive" : "text-amber-500"
                  )} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{evt.type}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[8px] px-1 py-0">{evt.severity || "medium"}</Badge>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(evt.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
            {securityEvents.length === 0 && (
              <p className="text-center py-6 text-xs text-muted-foreground">Nenhum evento registrado</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default ActivityFeed;
