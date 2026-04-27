import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, MoreVertical, Eye, Pencil, Lock, KeyRound, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  phone: string | null;
  roles: { role: string; tenant_id: string | null; tenant_name: string }[];
  userType: string;
  has2FA: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin", admin: "Admin", manager: "Gerente",
  partner: "Parceiro", client: "Cliente",
};
const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-destructive/10 text-destructive border-destructive/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  partner: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  client: "bg-secondary text-muted-foreground border-border",
};
const TYPE_LABELS: Record<string, string> = {
  staff: "All Vita",
  tenant: "Gestão Core",
  partner: "Parceiro",
  client: "Paciente",
  unknown: "—",
};

interface Props {
  users: UserRow[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onViewUser: (user: UserRow) => void;
  onBlockUser: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  isLoading: boolean;
}

const UserTable: React.FC<Props> = ({
  users, page, totalPages, onPageChange, onViewUser,
  onBlockUser, onResetPassword, isLoading,
}) => (
  <Card>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Classificação</TableHead>
              <TableHead>Vínculo / Empresa</TableHead>
              <TableHead>Papel(is)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>2FA</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow
                key={u.id}
                className="cursor-pointer hover:bg-secondary/30"
                onClick={() => onViewUser(u)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {(u.first_name?.[0] || u.email[0]).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {TYPE_LABELS[u.userType] || u.userType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[10px] font-normal",
                      u.userType === 'staff' ? "bg-primary/5 text-primary border-primary/10" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {u.userType === 'staff' ? "Global" : "Tenant"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.filter(r => r.tenant_id).map((r, i) => (
                      <Badge key={i} variant="secondary" className="text-[9px]">
                        {r.tenant_name}
                      </Badge>
                    ))}
                    {u.roles.some(r => !r.tenant_id) && (
                      <Badge variant="outline" className="text-[9px] bg-destructive/5 text-destructive">Global</Badge>
                    )}
                    {u.roles.length === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length > 0 ? u.roles.map((r, i) => (
                      <Badge key={i} variant="outline" className={cn("text-[9px]", ROLE_COLORS[r.role])}>
                        {ROLE_LABELS[r.role] || r.role}
                      </Badge>
                    )) : <span className="text-[10px] text-muted-foreground">—</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.is_active ? "default" : "secondary"}
                    className={cn("text-[10px]", u.is_active
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {u.is_active ? "🟢 Ativo" : "🔴 Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.has2FA
                    ? <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    : <Shield className="h-4 w-4 text-muted-foreground/30" />
                  }
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewUser(u)}>
                        <Eye className="h-4 w-4 mr-2" /> Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onResetPassword(u.id)}>
                        <KeyRound className="h-4 w-4 mr-2" /> Resetar senha
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onBlockUser(u.id)}
                        className="text-destructive"
                      >
                        <Lock className="h-4 w-4 mr-2" /> {u.is_active ? "Bloquear" : "Desbloquear"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  {isLoading ? "Carregando..." : "Nenhum usuário encontrado"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</p>
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

export default UserTable;
