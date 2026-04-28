import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Crown, 
  ShieldCheck, 
  Mail, 
  Plus, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface InvitationRow {
  id: string;
  email: string;
  role: StaffRole;
  status: "pending" | "accepted" | "expired";
  created_at: string;
  expires_at: string;
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

const EDITABLE_ROLES: StaffRole[] = ["admin", "manager", "staff", "ops", "finance", "support", "growth"];

const AdminStaff: React.FC = () => {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffRole>("staff");

  const load = async () => {
    setLoading(true);
    
    // Load staff
    const { data: staffData, error: staffError } = await (supabase.from as any)("all_vita_staff")
      .select("id, user_id, role, is_active, created_at")
      .order("created_at", { ascending: false });

    if (staffData) {
      const userIds = (staffData as any[]).map((r) => r.user_id);
      const { data: profiles } = await (supabase.from as any)("profiles")
        .select("id, email, first_name, last_name")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      setRows(
        (staffData as any[]).map((r) => ({
          ...r,
          profile: profileMap.get(r.user_id) || null,
        }))
      );
    }

    // Load invitations
    const { data: inviteData } = await (supabase.from as any)("staff_invitations")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (inviteData) {
      setInvitations(inviteData);
    }

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-staff", {
        body: { email: inviteEmail, role: inviteRole },
      });

      if (error) throw error;

      toast.success(`Convite enviado para ${inviteEmail}`);
      setIsInviteOpen(false);
      setInviteEmail("");
      load(); // Reload both lists
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao enviar convite");
    } finally {
      setInviting(false);
    }
  };

  const deleteInvitation = async (id: string) => {
    const { error } = await (supabase.from as any)("staff_invitations")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Não foi possível remover o convite.");
      return;
    }
    
    toast.success("Convite removido.");
    setInvitations((prev) => prev.filter((i) => i.id !== id));
  };

  const fullName = (r: StaffRow) =>
    [r.profile?.first_name, r.profile?.last_name].filter(Boolean).join(" ") || r.profile?.email || "—";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
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

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Convidar Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleInvite}>
              <DialogHeader>
                <DialogTitle>Convidar novo membro</DialogTitle>
                <DialogDescription>
                  O convidado receberá um e-mail com um link para criar sua conta e acessar o staff.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="exemplo@allvita.com.br" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Papel na plataforma</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as StaffRole)}>
                    <SelectTrigger>
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
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={inviting}>
                  {inviting ? "Enviando..." : "Enviar Convite"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="gap-2">
            Ativos
            <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem]">
              {rows.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Convites Pendentes
            {invitations.filter(i => i.status === 'pending').length > 0 && (
              <Badge variant="outline" className="h-5 px-1.5 min-w-[1.25rem] bg-amber-500/10 text-amber-600 border-amber-500/20">
                {invitations.filter(i => i.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="border-border/60">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Users className="h-8 w-8 text-muted-foreground/30" />
                  Nenhum membro do staff ativo.
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
        </TabsContent>

        <TabsContent value="pending">
          <Card className="border-border/60">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : invitations.length === 0 ? (
                <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Mail className="h-8 w-8 text-muted-foreground/30" />
                  Nenhum convite pendente.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30">
                        <th className="text-left py-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                          E-mail
                        </th>
                        <th className="text-left py-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                          Papel Convidado
                        </th>
                        <th className="text-left py-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                          Expira em
                        </th>
                        <th className="text-right py-3 px-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-20">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map((inv) => {
                        const isExpired = new Date(inv.expires_at) < new Date() || inv.status === 'expired';
                        const isAccepted = inv.status === 'accepted';
                        
                        return (
                          <tr key={inv.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium text-foreground">{inv.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="text-[10px] font-normal">
                                {ROLE_LABELS[inv.role]}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {isAccepted ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Aceito
                                </div>
                              ) : isExpired ? (
                                <div className="flex items-center gap-1.5 text-destructive text-[11px] font-medium">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  Expirado
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-amber-600 text-[11px] font-medium">
                                  <Clock className="h-3.5 w-3.5" />
                                  Pendente
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-[12px]">
                              {new Date(inv.expires_at).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {!isAccepted && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteInvitation(inv.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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
        </TabsContent>
      </Tabs>

      <Card className="border-border/60 bg-secondary/40">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            O <strong>Super Admin</strong> não pode ser editado nem desativado por essa tela. Convites de staff permitem que pessoas acessem o painel administrativo sem precisar de cadastro prévio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStaff;

