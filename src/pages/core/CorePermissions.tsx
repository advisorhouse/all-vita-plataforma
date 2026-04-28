import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users, Eye, Pencil, Download, CheckCircle,
  Settings, Lock, History, Plus, Search,
  Key, Activity, AlertTriangle, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import { useTenantPermissions, type TenantRole } from "@/hooks/useTenantPermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

const ROLES: { key: TenantRole; label: string; icon: any; color: string; desc: string }[] = [
  { key: "admin", label: "Admin", icon: Shield, color: "text-accent", desc: "Gestão total do tenant" },
  { key: "manager", label: "Manager", icon: Users, color: "text-success", desc: "Gestão operacional" },
  { key: "staff", label: "Staff", icon: Users, color: "text-info", desc: "Colaborador operacional" },
  { key: "partner", label: "Parceiro", icon: Activity, color: "text-warning", desc: "Acesso ao painel de parceiros" },
  { key: "client", label: "Cliente", icon: Eye, color: "text-primary", desc: "Acesso ao clube de benefícios" },
];

const ACTIONS = ["read", "create", "update", "delete"] as const;
const RESOURCES = ["memberships", "clients", "partners", "content", "commissions", "gamification", "referrals", "permissions"];

const ACTION_LABELS: Record<string, string> = {
  read: "Ver", create: "Criar", update: "Editar", delete: "Excluir"
};

const ACTION_ICONS: Record<string, any> = {
  read: Eye, create: Plus, update: Pencil, delete: Trash2
};

const CorePermissions: React.FC = () => {
  const { currentTenant } = useTenant();
  const [activeRole, setActiveRole] = useState<TenantRole>("admin");
  const [searchTeam, setSearchTeam] = useState("");
  const { permissions, isLoading, upsertPermission, deleteOverride } = useTenantPermissions(currentTenant?.id);

  // Fetch team members
  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['tenant-members', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          id, role, active,
          profiles:user_id (id, full_name, email, avatar_url)
        `)
        .eq('tenant_id', currentTenant.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['tenant-audit-logs', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  const getPermissionStatus = (role: TenantRole, resource: string, action: string) => {
    const defaultPerm = permissions?.find(p => !p.tenant_id && p.role === role && p.resource === resource && p.action === action);
    const override = permissions?.find(p => p.tenant_id && p.role === role && p.resource === resource && p.action === action);
    
    return {
      allowed: override ? override.allowed : (defaultPerm?.allowed ?? false),
      isOverride: !!override,
      defaultAllowed: defaultPerm?.allowed ?? false,
      overrideId: override?.id
    };
  };

  const handleToggle = (role: TenantRole, resource: string, action: string, currentAllowed: boolean, isOverride: boolean, overrideId?: string) => {
    if (!currentTenant?.id) return;
    
    const status = getPermissionStatus(role, resource, action);
    
    // If it's already an override and we're toggling back to default
    if (isOverride && !currentAllowed === status.defaultAllowed) {
      if (overrideId) deleteOverride.mutate(overrideId);
    } else {
      // Create or update override
      // Note: Trigger in DB enforces that we can only RESTRICT (true -> false)
      // unless we are Super Admin.
      upsertPermission.mutate({
        tenant_id: currentTenant.id,
        role,
        resource,
        action,
        allowed: !currentAllowed
      });
    }
  };

  const filteredMembers = teamMembers?.filter((m: any) => 
    m.profiles?.full_name?.toLowerCase().includes(searchTeam.toLowerCase()) ||
    m.profiles?.email?.toLowerCase().includes(searchTeam.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Permissões e Acessos</h1>
        <p className="text-muted-foreground">Gerencie quem pode acessar o quê no seu tenant.</p>
      </div>

      <Tabs defaultValue="matrix" className="w-full">
        <TabsList className="flex h-auto gap-1 mb-6">
          <TabsTrigger value="matrix" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Matriz de Permissões</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Membros da Equipe</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs"><History className="h-3.5 w-3.5" />Log de Auditoria</TabsTrigger>
        </TabsList>

        {/* ===== MATRIZ ===== */}
        <TabsContent value="matrix" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = activeRole === role.key;
              const memberCount = teamMembers?.filter((m: any) => m.role === role.key).length || 0;
              return (
                <button key={role.key} onClick={() => setActiveRole(role.key)}
                  className={cn("flex flex-col items-start rounded-xl border p-4 text-left transition-all",
                    isActive ? "border-accent bg-accent/5 shadow-sm" : "border-border bg-card hover:bg-secondary/30"
                  )}>
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg mb-2",
                    isActive ? "bg-accent/10" : "bg-secondary"
                  )}>
                    <Icon className={cn("h-4 w-4", isActive ? role.color : "text-muted-foreground")} />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{role.label}</p>
                    <Badge variant="secondary" className="text-[9px]">{memberCount}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{role.desc}</p>
                </button>
              );
            })}
          </div>

          <Card className="border-border">
            <CardHeader className="py-4 px-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Configurações para {ROLES.find(r => r.key === activeRole)?.label}</CardTitle>
                  <p className="text-[11px] text-muted-foreground">O administrador só pode restringir permissões padrões do sistema.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Lock className="h-3 w-3" /> Padrão Global
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] gap-1 bg-warning/10 text-warning border-warning/20">
                    <AlertTriangle className="h-3 w-3" /> Restrito (Override)
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] text-xs">Recurso</TableHead>
                    {ACTIONS.map(action => (
                      <TableHead key={action} className="text-center text-xs">{ACTION_LABELS[action]}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RESOURCES.map(resource => (
                    <TableRow key={resource}>
                      <TableCell className="font-medium text-sm capitalize">
                        {resource.replace('_', ' ')}
                      </TableCell>
                      {ACTIONS.map(action => {
                        const status = getPermissionStatus(activeRole, resource, action);
                        const Icon = ACTION_ICONS[action];
                        return (
                          <TableCell key={action} className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Switch 
                                checked={status.allowed}
                                onCheckedChange={() => handleToggle(activeRole, resource, action, status.allowed, status.isOverride, status.overrideId)}
                                disabled={isLoading || (!status.defaultAllowed && !status.isOverride)} // Can't enable if default is false
                                className={cn(status.isOverride && "data-[state=checked]:bg-warning data-[state=unchecked]:bg-warning/30")}
                              />
                              <div className="flex items-center gap-1 mt-1">
                                <Icon className="h-3 w-3 text-muted-foreground/50" />
                                {status.isOverride && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertTriangle className="h-3 w-3 text-warning" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-[10px]">Permissão alterada pelo administrador do tenant.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== EQUIPE ===== */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome ou e-mail..." 
                className="pl-9" 
                value={searchTeam}
                onChange={(e) => setSearchTeam(e.target.value)}
              />
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Convidar Membro
            </Button>
          </div>

          <Card className="border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTeam ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredMembers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      Nenhum membro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers?.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            {member.profiles?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{member.profiles?.full_name || 'Sem nome'}</p>
                            <p className="text-[11px] text-muted-foreground">{member.profiles?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.active ? "default" : "secondary"}>
                          {member.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ===== LOG DE AUDITORIA ===== */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      Nenhum log registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs?.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {log.user_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.resource_name || log.table_name}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CorePermissions;
