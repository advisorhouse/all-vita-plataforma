import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Save, Shield, CreditCard, Coins, Bell, Settings } from "lucide-react";

interface TenantConfigTabProps {
  tenant: any;
}

const TenantConfigTab: React.FC<TenantConfigTabProps> = ({ tenant }) => {
  const queryClient = useQueryClient();
  const settings = tenant.settings || {};

  const [config, setConfig] = useState({
    enable_vitacoins: settings.enable_vitacoins ?? true,
    enable_partner_program: settings.enable_partner_program ?? true,
    enable_gamification: settings.enable_gamification ?? true,
    enable_quiz: settings.enable_quiz ?? true,
    enable_club: settings.enable_club ?? true,
    max_partners: settings.max_partners || "",
    max_clients: settings.max_clients || "",
    commission_initial_pct: settings.commission_initial_pct || "10",
    commission_recurrence_pct: settings.commission_recurrence_pct || "5",
  });

  const handleToggle = (field: string) => {
    setConfig((prev: any) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Payment integrations
  const { data: paymentIntegrations = [] } = useQuery({
    queryKey: ["tenant-payment-integrations", tenant.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_integrations")
        .select("*")
        .eq("tenant_id", tenant.id);
      return data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tenants")
        .update({
          settings: {
            ...settings,
            ...config,
          },
        })
        .eq("id", tenant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenant", tenant.id] });
      toast.success("Configurações salvas!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleItems = [
    { key: "enable_vitacoins", label: "Vitacoins", desc: "Sistema de moeda virtual para parceiros", icon: Coins },
    { key: "enable_partner_program", label: "Programa de Parceiros", desc: "Rede de afiliados e comissões", icon: Shield },
    { key: "enable_gamification", label: "Gamificação", desc: "Pontos, níveis e rankings", icon: Settings },
    { key: "enable_quiz", label: "Quiz de Triagem", desc: "Formulário de pré-consulta para clientes", icon: Bell },
    { key: "enable_club", label: "Club de Clientes", desc: "Portal do cliente com assinatura", icon: Bell },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Módulos e Funcionalidades</CardTitle>
          <CardDescription>Ative ou desative módulos para esta empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {toggleItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Switch
                checked={(config as any)[item.key]}
                onCheckedChange={() => handleToggle(item.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Limites</CardTitle>
          <CardDescription>Defina limites operacionais para a empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Máx. de Parceiros</Label>
              <Input type="number" value={config.max_partners} onChange={(e) => handleChange("max_partners", e.target.value)} placeholder="Ilimitado" />
            </div>
            <div className="space-y-1.5">
              <Label>Máx. de Clientes</Label>
              <Input type="number" value={config.max_clients} onChange={(e) => handleChange("max_clients", e.target.value)} placeholder="Ilimitado" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comissões Padrão</CardTitle>
          <CardDescription>Percentuais base de comissão para esta empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Comissão Inicial (%)</Label>
              <Input type="number" value={config.commission_initial_pct} onChange={(e) => handleChange("commission_initial_pct", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Comissão Recorrência (%)</Label>
              <Input type="number" value={config.commission_recurrence_pct} onChange={(e) => handleChange("commission_recurrence_pct", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Integrações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentIntegrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma integração de pagamento configurada.</p>
          ) : (
            <div className="space-y-3">
              {paymentIntegrations.map((pi: any) => (
                <div key={pi.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium capitalize">{pi.provider}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(pi.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge variant={pi.active ? "default" : "secondary"}>
                    {pi.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default TenantConfigTab;
