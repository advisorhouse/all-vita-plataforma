import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, UserPlus, UserX, Loader2, Users, Shield, Mail } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  partner: "Parceiro",
  client: "Cliente",
};

const ROLE_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  admin: "default",
  manager: "secondary",
  partner: "outline",
  client: "outline",
};

const CoreUsers: React.FC = () => {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", role: "manager" });

  const { data: users, isLoading } = useQuery({
    queryKey: ["core-users", currentTenant?.id],
    enabled: !!currentTenant,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("manage-users/list", {
        headers: { "X-Tenant-Id": currentTenant!.id },
      });

      if (res.error) throw new Error(res.error.message);
      return res.data?.data || [];
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await supabase.functions.invoke("manage-users/create", {
        headers: { "X-Tenant-Id": currentTenant!.id },
        body: data,
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Usuário criado e convite enviado!");
      queryClient.invalidateQueries({ queryKey: ["core-users"] });
      setOpen(false);
      setForm({ full_name: "", email: "", phone: "", role: "manager" });
    },
    onError: (e: any) => toast.error("Erro ao criar usuário", { description: e.message }),
  });

  const deactivateUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await supabase.functions.invoke("manage-users/deactivate", {
        headers: { "X-Tenant-Id": currentTenant!.id },
        body: { user_id: userId },
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Usuário desativado");
      queryClient.invalidateQueries({ queryKey: ["core-users"] });
    },
    onError: (e: any) => toast.error("Erro", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Colaboradores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerenciar colaboradores e acessos administrativos da empresa
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" /> Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar usuário</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); createUser.mutate(form); }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Papel *</Label>
                <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="partner">Parceiro</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createUser.isPending}>
                {createUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Mail className="h-4 w-4 mr-2" /> Enviar Convite
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : users && users.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.profile
                        ? `${u.profile.first_name || ""} ${u.profile.last_name || ""}`.trim() || "—"
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.profile?.email || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_COLORS[u.role] || "outline"}>
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deactivateUser.mutate(u.user_id)}
                        disabled={deactivateUser.isPending}
                      >
                        <UserX className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhum usuário encontrado.</p>
        </Card>
      )}
    </div>
  );
};

export default CoreUsers;
