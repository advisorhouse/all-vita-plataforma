import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, Crown, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type StaffRole = "super_admin" | "admin" | "manager" | "staff" | "ops" | "finance" | "support" | "growth";

interface StaffRow {
  id: string;
  user_id: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  profile?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  ops: "Operações",
  finance: "Financeiro",
  support: "Suporte",
  growth: "Growth",
};

const EDITABLE_ROLES: StaffRole[] = ["admin", "manager", "staff"];

const AdminStaff: React.FC = () => {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from as any)("all_vita_staff")
      .select("id, user_id, role, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    // Fetch profile data separately (no FK relation declared)
    const userIds = (data as any[]).map((r) => r.user_id);
    const { data: profiles } = await (supabase.from as any)("profiles")
      .select("id, email, first_name, last_name")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    setRows(
      (data as any[]).map((r) => ({
        ...r,
        profile: profileMap.get(r.user_id) || null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id: string, role: StaffRole) => {
    const { error } = await (supabase.from as any)("all_vita_staff")
      .update({ role })
      .eq("id", id);
    if (error) {
      toast.error("Não foi possível alterar o papel.");
      return;
    }
    toast.success("Papel atualizado.");
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role } : r)));
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    const { error } = await (supabase.from as any)("all_vita_staff")
      .update({ is_active })
      .eq("id", id);
    if (error) {
      toast.error("Não foi possível alterar o status.");
      return;
    }
    toast.success(is_active ? "Membro ativado." : "Membro desativado.");
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_active } : r)));
  };

  const fullName = (r: StaffRow) =>
    [r.profile?.first_name, r.profile?.last_name].filter(Boolean).join(" ") || r.profile?.email || "—";

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Staff All Vita</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie quem tem acesso ao painel global da plataforma e seus papéis.
          </p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Nenhum membro do staff cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-left py-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Membro
                    </th>
                    <th className="text-left py-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Papel
                    </th>
                    <th className="text-left py-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Desde
                    </th>
                    <th className="text-center py-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-24">
                      Ativo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isSuper = r.role === "super_admin";
                    return (
                      <tr key={r.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {isSuper && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                            <div>
                              <p className="font-medium text-foreground">{fullName(r)}</p>
                              <p className="text-[11px] text-muted-foreground">{r.profile?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {isSuper ? (
                            <Badge variant="secondary" className="text-[10px]">
                              {ROLE_LABELS[r.role]}
                            </Badge>
                          ) : (
                            <Select value={r.role} onValueChange={(v) => updateRole(r.id, v as StaffRole)}>
                              <SelectTrigger className="h-8 w-36 text-[12px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {EDITABLE_ROLES.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {ROLE_LABELS[role]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-[12px]">
                          {new Date(r.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Switch
                            checked={r.is_active}
                            disabled={isSuper}
                            onCheckedChange={(v) => toggleActive(r.id, v)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-secondary/40">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            O <strong>Super Admin</strong> não pode ser editado nem desativado por essa tela. Para definir o que cada papel pode acessar, vá em <strong>Configurações → Permissões</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStaff;
