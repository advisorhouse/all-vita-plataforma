import React, { useState } from "react";
import { 
  Shield, 
  Search, 
  Building2, 
  Info,
  Lock,
  AlertTriangle,
  ChevronRight,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantPermissions, type TenantRole } from "@/hooks/useTenantPermissions";
import { cn } from "@/lib/utils";

const ROLES: { key: TenantRole; label: string }[] = [
  { key: "admin", label: "Admin" },
  { key: "manager", label: "Manager" },
  { key: "staff", label: "Staff" },
  { key: "partner", label: "Parceiro" },
  { key: "client", label: "Cliente" },
];

const ACTIONS = ["read", "create", "update", "delete"] as const;
const RESOURCES = [
  "memberships", 
  "clients", 
  "partners", 
  "content", 
  "commissions", 
  "gamification", 
  "referrals", 
  "permissions"
];

const ACTION_LABELS: Record<string, string> = {
  read: "Ver",
  create: "Criar",
  update: "Editar",
  delete: "Excluir"
};

const TenantPermissionMatrix: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<TenantRole>("admin");

  // Fetch all tenants
  const { data: tenants, isLoading: isLoadingTenants } = useQuery({
    queryKey: ["admin-all-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, trade_name, slug")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { permissions, isLoading: isLoadingPerms, upsertPermission, deleteOverride } = useTenantPermissions(selectedTenantId || undefined);

  const filteredTenants = tenants?.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.trade_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTenant = tenants?.find(t => t.id === selectedTenantId);

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
    if (!selectedTenantId) return;
    
    // Toggle logic:
    // If we're toggling back to default state, delete override
    const status = getPermissionStatus(role, resource, action);
    if (isOverride && !currentAllowed === status.defaultAllowed) {
      if (overrideId) deleteOverride.mutate(overrideId);
    } else {
      upsertPermission.mutate({
        tenant_id: selectedTenantId,
        role,
        resource,
        action,
        allowed: !currentAllowed
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Matriz de Permissões por Tenant</h1>
        <p className="text-muted-foreground text-sm">
          Defina overrides específicos para cada empresa, restringindo ou liberando recursos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar: Tenant Selection */}
        <Card className="md:col-span-4 lg:col-span-3 h-fit">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Empresas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filtrar empresa..."
                className="pl-8 h-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {isLoadingTenants ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)
              ) : filteredTenants?.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">Nenhuma empresa encontrada.</p>
              ) : (
                filteredTenants?.map(tenant => (
                  <button
                    key={tenant.id}
                    onClick={() => setSelectedTenantId(tenant.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-md transition-colors",
                      selectedTenantId === tenant.id 
                        ? "bg-accent text-accent-foreground font-medium" 
                        : "hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    <span className="truncate">{tenant.trade_name || tenant.name}</span>
                    <ChevronRight className={cn("h-3 w-3", selectedTenantId === tenant.id ? "opacity-100" : "opacity-0")} />
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content: Permission Matrix */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {!selectedTenantId ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Filter className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Selecione uma empresa</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Escolha uma empresa na lista lateral para visualizar e gerenciar suas permissões específicas.
              </p>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{selectedTenant?.trade_name || selectedTenant?.name}</CardTitle>
                    <CardDescription className="text-xs font-mono">{selectedTenant?.slug}.visionlift.com.br</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Shield className="h-3 w-3" /> Overrides de Tenant
                  </Badge>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {ROLES.map(role => (
                      <Button
                        key={role.key}
                        variant={activeRole === role.key ? "default" : "outline"}
                        size="sm"
                        className="text-[11px] h-8"
                        onClick={() => setActiveRole(role.key)}
                      >
                        {role.label}
                      </Button>
                    ))}
                  </div>

                  <div className="rounded-md border">
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
                        {isLoadingPerms ? (
                          Array(5).fill(0).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              {ACTIONS.map(a => <TableCell key={a}><Skeleton className="h-6 w-10 mx-auto" /></TableCell>)}
                            </TableRow>
                          ))
                        ) : (
                          RESOURCES.map(resource => (
                            <TableRow key={resource}>
                              <TableCell className="font-medium text-sm capitalize">
                                {resource.replace('_', ' ')}
                              </TableCell>
                              {ACTIONS.map(action => {
                                const status = getPermissionStatus(activeRole, resource, action);
                                return (
                                  <TableCell key={action} className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <Switch 
                                        checked={status.allowed}
                                        onCheckedChange={() => handleToggle(activeRole, resource, action, status.allowed, status.isOverride, status.overrideId)}
                                        className={cn(status.isOverride && "data-[state=checked]:bg-warning data-[state=unchecked]:bg-warning/30")}
                                      />
                                      {status.isOverride && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <AlertTriangle className="h-3 w-3 text-warning mt-1" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="text-[10px]">Permissão alterada via override.</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/40 border-none shadow-none">
                <CardContent className="p-4 flex items-start gap-3">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[12px] font-medium">Sobre a Hierarquia de Permissões</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Overrides aplicados aqui têm precedência sobre as configurações globais. 
                      Os administradores de cada tenant podem restringir permissões permitidas globalmente, 
                      mas não podem habilitar o que foi proibido na matriz global, exceto via override manual de um Super Admin nesta tela.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantPermissionMatrix;
