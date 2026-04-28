import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, Phone, Shield, Lock, CreditCard, 
  Eye, EyeOff, Smartphone, Key, Upload, Camera, 
  MapPin, CheckCircle2, Save, LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const fadeUp: any = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ 
    opacity: 1, y: 0, 
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } 
  }),
};

const UserProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { userRole, memberships } = useTenant();
  const [saving, setSaving] = useState(false);
  const [showCPF, setShowCPF] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSave = async () => {
    setSaving(true);
    // Em uma implementação real, salvaríamos os campos editados aqui
    setTimeout(() => {
      setSaving(false);
      toast.success("Perfil atualizado com sucesso!");
    }, 1000);
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'super_admin': return <Badge className="bg-primary/10 text-primary border-0">Super Admin</Badge>;
      case 'admin': return <Badge className="bg-blue-500/10 text-blue-600 border-0">Administrador</Badge>;
      case 'manager': return <Badge className="bg-indigo-500/10 text-indigo-600 border-0">Gerente</Badge>;
      case 'partner': return <Badge className="bg-amber-500/10 text-amber-600 border-0">Parceiro</Badge>;
      case 'client': return <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Cliente</Badge>;
      default: return <Badge variant="secondary">Usuário</Badge>;
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie suas informações pessoais e segurança da conta</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => signOut()} className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/5">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    profile.first_name?.[0] || user?.email?.[0]?.toUpperCase()
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h2 className="text-xl font-bold text-foreground">
                    {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Usuário"}
                  </h2>
                  {getRoleBadge(userRole)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                  <div className="text-[11px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                    Membro desde: {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-[11px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                    ID: {profile.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados Pessoais */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Dados Pessoais
              </CardTitle>
              <CardDescription className="text-xs">Informações de contato e identificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome</Label>
                  <Input defaultValue={profile.first_name || ""} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sobrenome</Label>
                  <Input defaultValue={profile.last_name || ""} className="h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">E-mail</Label>
                <Input defaultValue={user?.email || ""} readOnly className="h-9 text-sm bg-secondary/30 cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Telefone</Label>
                <Input defaultValue={profile.phone || ""} placeholder="(00) 00000-0000" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  CPF
                  <button onClick={() => setShowCPF(!showCPF)} className="text-muted-foreground hover:text-foreground">
                    {showCPF ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </Label>
                <Input 
                  value={showCPF ? "123.456.789-00" : "•••.•••.•••-00"} 
                  readOnly 
                  className="h-9 text-sm bg-secondary/30" 
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Segurança */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Segurança
              </CardTitle>
              <CardDescription className="text-xs">Proteção da conta e acessos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border">
                    <Lock className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Senha</p>
                    <p className="text-[10px] text-muted-foreground">Alterada há 3 meses</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-[11px]">Alterar</Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${twoFA ? "bg-primary/10" : "bg-background border"}`}>
                    <Smartphone className={`h-4 w-4 ${twoFA ? "text-primary" : "text-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Autenticação 2FA</p>
                    <p className="text-[10px] text-muted-foreground">{twoFA ? "Ativado por SMS" : "Desativado"}</p>
                  </div>
                </div>
                <Switch checked={twoFA} onCheckedChange={setTwoFA} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border">
                    <Key className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Sessões</p>
                    <p className="text-[10px] text-muted-foreground">2 dispositivos ativos</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-[11px] text-destructive hover:bg-destructive/5">Revogar</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Empresa & Vínculos (Para usuários Tenant/Partner) */}
      {(userRole !== 'super_admin') && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Vinculação
              </CardTitle>
              <CardDescription className="text-xs">Empresa ou Parceiro vinculado ao seu acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberships.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border bg-secondary/10">
                    <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{m.tenant?.trade_name || m.tenant?.name || "Global"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                    </div>
                    {m.active && (
                      <div className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Ativo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default UserProfilePage;
