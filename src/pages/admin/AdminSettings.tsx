import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette, Shield, Globe, Sliders, Save, Building2,
  Image, Type, Hash, Clock, Users, CreditCard, Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const AdminSettings: React.FC = () => {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Configurações salvas com sucesso");
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações Globais</h1>
          <p className="text-muted-foreground text-sm mt-1">Parâmetros gerais da plataforma All Vita</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </motion.div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="branding" className="gap-1.5"><Palette className="h-3.5 w-3.5" /> Branding</TabsTrigger>
          <TabsTrigger value="limits" className="gap-1.5"><Sliders className="h-3.5 w-3.5" /> Limites</TabsTrigger>
          <TabsTrigger value="params" className="gap-1.5"><Globe className="h-3.5 w-3.5" /> Parâmetros</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notificações</TabsTrigger>
        </TabsList>

        {/* ── Branding ── */}
        <TabsContent value="branding" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Image className="h-5 w-5 text-muted-foreground" /> Identidade Visual</CardTitle>
                <CardDescription>Configurações de marca da plataforma All Vita</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Nome da Plataforma</Label>
                    <Input defaultValue="All Vita" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input defaultValue="Plataforma de Gestão White-Label" />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Cor Primária</Label>
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: "#1A1A1A" }} />
                      <Input defaultValue="#1A1A1A" className="font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Cor Secundária</Label>
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: "#6B8E23" }} />
                      <Input defaultValue="#6B8E23" className="font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Cor de Destaque</Label>
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: "#3B82F6" }} />
                      <Input defaultValue="#3B82F6" className="font-mono text-sm" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Rodapé Padrão (E-mails e Documentos)</Label>
                  <Textarea defaultValue="Easymore Labs, uma empresa Advisor Legacy Ltda. Todos os direitos reservados." rows={2} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-muted-foreground" /> Branding dos Tenants</CardTitle>
                <CardDescription>Padrões aplicados a novos tenants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Permitir branding customizado</p>
                    <p className="text-xs text-muted-foreground">Tenants podem personalizar logo, cores e nome</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Exibir "Powered by All Vita"</p>
                    <p className="text-xs text-muted-foreground">Mostra marca d'água nos portais dos tenants</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Domínio personalizado</p>
                    <p className="text-xs text-muted-foreground">Tenants podem usar domínio próprio</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Limites ── */}
        <TabsContent value="limits" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" /> Limites por Tenant</CardTitle>
                <CardDescription>Limites padrão aplicados a cada empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Máx. Usuários Staff</Label>
                    <Input type="number" defaultValue="10" />
                    <p className="text-xs text-muted-foreground">Quantidade máxima de admins/managers por tenant</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Parceiros</Label>
                    <Input type="number" defaultValue="500" />
                    <p className="text-xs text-muted-foreground">Quantidade máxima de parceiros ativos</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Clientes</Label>
                    <Input type="number" defaultValue="10000" />
                    <p className="text-xs text-muted-foreground">Quantidade máxima de clientes ativos</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Produtos</Label>
                    <Input type="number" defaultValue="50" />
                    <p className="text-xs text-muted-foreground">Quantidade máxima de produtos cadastrados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-muted-foreground" /> Limites de Segurança</CardTitle>
                <CardDescription>Rate limiting e controles de acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tentativas de Login</Label>
                    <Input type="number" defaultValue="5" />
                    <p className="text-xs text-muted-foreground">Bloqueio após N tentativas em 15 minutos</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo de Bloqueio (min)</Label>
                    <Input type="number" defaultValue="30" />
                    <p className="text-xs text-muted-foreground">Duração do bloqueio por tentativas falhas</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Sessão Máxima (horas)</Label>
                    <Input type="number" defaultValue="24" />
                    <p className="text-xs text-muted-foreground">Tempo máximo de sessão ativa</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Requisições por Minuto (API)</Label>
                    <Input type="number" defaultValue="60" />
                    <p className="text-xs text-muted-foreground">Rate limit para chamadas de API</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Parâmetros ── */}
        <TabsContent value="params" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-muted-foreground" /> Comissões & Vitacoins</CardTitle>
                <CardDescription>Parâmetros globais do motor de comissões</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Níveis Multinível (max)</Label>
                    <Input type="number" defaultValue="5" />
                    <p className="text-xs text-muted-foreground">Profundidade máxima da rede de parceiros</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Moeda Padrão</Label>
                    <Select defaultValue="BRL">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
                        <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Multiplicador Vitacoins</Label>
                    <Input type="number" defaultValue="1.0" step="0.1" />
                    <p className="text-xs text-muted-foreground">Fator de conversão padrão R$ → Vitacoins</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Carência para Resgate (dias)</Label>
                    <Input type="number" defaultValue="30" />
                    <p className="text-xs text-muted-foreground">Dias mínimos para resgate de comissões</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-muted-foreground" /> Automação & Integrações</CardTitle>
                <CardDescription>Parâmetros de execução automática</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Processamento automático de comissões</p>
                    <p className="text-xs text-muted-foreground">Calcula comissões após confirmação de pagamento</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Atribuição automática de Vitacoins</p>
                    <p className="text-xs text-muted-foreground">Converte comissões em Vitacoins automaticamente</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Webhook de pagamento ativo</p>
                    <p className="text-xs text-muted-foreground">Recebe eventos de pagamento via webhook</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Motor de retenção</p>
                    <p className="text-xs text-muted-foreground">Envia alertas automáticos de churn</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Notificações ── */}
        <TabsContent value="notifications" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-muted-foreground" /> E-mails Transacionais</CardTitle>
                <CardDescription>Configurações de envio de e-mail da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>E-mail Remetente</Label>
                    <Input defaultValue="noreply@allvita.com.br" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Remetente</Label>
                    <Input defaultValue="All Vita" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Boas-vindas ao novo tenant</p>
                      <p className="text-xs text-muted-foreground">Enviado ao criar uma nova empresa</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Alerta de segurança</p>
                      <p className="text-xs text-muted-foreground">Login suspeito ou bloqueio de conta</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Relatório mensal</p>
                      <p className="text-xs text-muted-foreground">Resumo mensal enviado aos super admins</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
