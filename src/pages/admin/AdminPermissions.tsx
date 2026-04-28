import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Info } from "lucide-react";
import { usePlatformPermissions, type PlatformRole, type PermissionAction } from "@/hooks/usePlatformPermissions";
import { toast } from "sonner";

const ROLE_LABELS: Record<PlatformRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
};

const ROLE_DESCRIPTIONS: Record<PlatformRole, string> = {
  super_admin: "Acesso total à plataforma. Não editável.",
  admin: "Gestão completa exceto exclusões críticas e permissões.",
  manager: "Leitura ampla e edição moderada.",
  staff: "Acesso somente leitura.",
};

const ACTION_LABELS: Record<PermissionAction, string> = {
  read: "Visualizar",
  create: "Criar",
  update: "Editar",
  delete: "Excluir",
};

const RESOURCE_LABELS: Record<string, string> = {
  tenants: "Empresas",
  users: "Usuários",
  staff: "Staff All Vita",
  financials: "Financeiro",
  integrations: "Integrações",
  audit: "Auditoria",
  vitacoins: "Vitacoins",
  permissions: "Permissões",
};

const ACTION_ORDER: PermissionAction[] = ["read", "create", "update", "delete"];

const AdminPermissions: React.FC = () => {
  const { rows, loading, saving, setAllowed } = usePlatformPermissions();

  // Group rows by role -> resource -> action
  const grouped = useMemo(() => {
    const map = new Map<PlatformRole, Map<string, Partial<Record<PermissionAction, typeof rows[number]>>>>();
    for (const r of rows) {
      if (!map.has(r.role)) map.set(r.role, new Map());
      const byResource = map.get(r.role)!;
      if (!byResource.has(r.resource)) byResource.set(r.resource, {});
      byResource.get(r.resource)![r.action] = r;
    }
    return map;
  }, [rows]);

  const handleToggle = async (id: string, next: boolean) => {
    try {
      await setAllowed(id, next);
      toast.success("Permissão atualizada");
    } catch {
      toast.error("Não foi possível atualizar. Verifique se você é super admin.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Permissões da Plataforma</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Defina o que cada papel do staff All Vita pode fazer. Apenas Super Admins podem alterar.
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-secondary/40">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Estas permissões controlam o acesso ao painel <strong>/admin</strong> da All Vita. Para definir o que cada papel pode fazer
            <em> dentro de um tenant</em>, use a tela de Permissões do Core de cada tenant.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {(["admin", "manager", "staff"] as PlatformRole[]).map((role) => {
            const byResource = grouped.get(role);
            if (!byResource) return null;
            return (
              <Card key={role} className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{ROLE_LABELS[role]}</CardTitle>
                      <p className="text-[12px] text-muted-foreground mt-1">{ROLE_DESCRIPTIONS[role]}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {Array.from(byResource.values()).flatMap((r) => Object.values(r)).filter((p) => p?.allowed).length} ativas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="text-left py-2 px-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            Recurso
                          </th>
                          {ACTION_ORDER.map((a) => (
                            <th
                              key={a}
                              className="text-center py-2 px-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-24"
                            >
                              {ACTION_LABELS[a]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(byResource.entries())
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([resource, actions]) => (
                            <tr key={resource} className="border-b border-border/40 last:border-0">
                              <td className="py-3 px-2 text-foreground font-medium">
                                {RESOURCE_LABELS[resource] || resource}
                              </td>
                              {ACTION_ORDER.map((a) => {
                                const perm = actions[a];
                                return (
                                  <td key={a} className="py-3 px-2 text-center">
                                    {perm ? (
                                      <Switch
                                        checked={perm.allowed}
                                        disabled={saving}
                                        onCheckedChange={(v) => handleToggle(perm.id, v)}
                                      />
                                    ) : (
                                      <span className="text-muted-foreground/40 text-xs">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPermissions;
