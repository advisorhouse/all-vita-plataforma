import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ShieldCheck, Building2, KeyRound, Lock, Mail, Phone, User, Calendar, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRow } from "./UserTable";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin", admin: "Admin", manager: "Gerente",
  partner: "Parceiro", client: "Cliente",
};

interface Props {
  user: UserRow | null;
  open: boolean;
  onClose: () => void;
  onBlockUser: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  auditLogs: any[];
}

const UserDrawer: React.FC<Props> = ({ user, open, onClose, onBlockUser, onResetPassword, auditLogs }) => {
  if (!user) return null;

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Sem nome";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes do Usuário</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {(user.first_name?.[0] || user.email[0]).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{fullName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.is_active ? "default" : "secondary"} className="text-[10px]">
                  {user.is_active ? "🟢 Ativo" : "🔴 Inativo"}
                </Badge>
                {user.has2FA
                  ? <Badge variant="outline" className="text-[10px] text-emerald-600"><ShieldCheck className="h-3 w-3 mr-1" />2FA Ativo</Badge>
                  : <Badge variant="outline" className="text-[10px] text-muted-foreground"><Shield className="h-3 w-3 mr-1" />2FA Inativo</Badge>
                }
              </div>
            </div>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="info">Dados</TabsTrigger>
              <TabsTrigger value="access">Acessos</TabsTrigger>
              <TabsTrigger value="audit">Auditoria</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium text-foreground">{fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium text-foreground">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cadastro:</span>
                    <span className="font-medium text-foreground">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="access" className="space-y-4 mt-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Empresas e Papéis
              </h4>
              {user.roles.length > 0 ? user.roles.map((r, i) => (
                <Card key={i}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {r.tenant_id ? r.tenant_name : "All Vita (Global)"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {ROLE_LABELS[r.role] || r.role}
                    </Badge>
                  </CardContent>
                </Card>
              )) : (
                <p className="text-sm text-muted-foreground">Sem vínculos ativos</p>
              )}
            </TabsContent>

            <TabsContent value="audit" className="space-y-3 mt-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <History className="h-4 w-4" /> Histórico Recente
              </h4>
              {auditLogs.length > 0 ? auditLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 text-sm border-b border-border pb-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                      {log.ip && ` • ${log.ip}`}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Nenhum registro encontrado</p>
              )}
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => onResetPassword(user.id)} className="w-full justify-start">
              <KeyRound className="h-4 w-4 mr-2" /> Resetar Senha
            </Button>
            <Button
              variant="outline"
              onClick={() => onBlockUser(user.id)}
              className={cn("w-full justify-start", user.is_active ? "text-destructive hover:text-destructive" : "text-emerald-600")}
            >
              <Lock className="h-4 w-4 mr-2" /> {user.is_active ? "Bloquear Usuário" : "Desbloquear Usuário"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserDrawer;
