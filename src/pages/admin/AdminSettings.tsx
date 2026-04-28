import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette, Shield, Globe, Sliders, Save, Building2, Image, Type, Clock,
  Users, CreditCard, Bell, FileText, Lock, Coins, Percent, Plug, Mail,
  Scale, Database, Server, Flag, Settings, Upload,
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import AdminPermissions from "@/components/admin/AdminPermissions";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const SwitchRow = ({ 
  title, 
  desc, 
  defaultChecked = false, 
  onCheckedChange 
}: { 
  title: string; 
  desc: string; 
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    <Switch 
      defaultChecked={defaultChecked} 
      onCheckedChange={onCheckedChange}
    />
  </div>
);

const AdminSettings: React.FC = () => {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Configurações salvas com sucesso"); }, 800);
  };

  const roles = [
    { role: "super_admin", label: "Super Admin", perms: "Acesso total à plataforma" },
    { role: "admin", label: "Admin (Tenant)", perms: "Gestão completa da empresa" },
    { role: "manager", label: "Manager", perms: "Operações e relatórios" },
    { role: "partner", label: "Parceiro", perms: "Rede, clientes e comissões" },
    { role: "client", label: "Cliente", perms: "Assinatura e benefícios" },
  ];

  return (
    <div className="space-y-6 p-2 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Configurações Globais</h1>
            <Badge variant="outline" className="text-[10px]">All Vita</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Parâmetros, regras e controles da plataforma</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </motion.div>

      <Tabs defaultValue="platform" className="space-y-6">
        <ScrollArea className="w-full">
          <TabsList className="bg-muted/60 inline-flex w-max">
            <TabsTrigger value="platform" className="gap-1 text-xs"><Building2 className="h-3 w-3" /> Plataforma</TabsTrigger>
            <TabsTrigger value="security" className="gap-1 text-xs"><Shield className="h-3 w-3" /> Segurança</TabsTrigger>
            <TabsTrigger value="roles" className="gap-1 text-xs"><Lock className="h-3 w-3" /> Permissões</TabsTrigger>
            <TabsTrigger value="defaults" className="gap-1 text-xs"><Sliders className="h-3 w-3" /> Defaults</TabsTrigger>
            <TabsTrigger value="vitacoins" className="gap-1 text-xs"><Coins className="h-3 w-3" /> Vitacoins</TabsTrigger>
            <TabsTrigger value="commissions" className="gap-1 text-xs"><Percent className="h-3 w-3" /> Comissões</TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1 text-xs"><Plug className="h-3 w-3" /> Integrações</TabsTrigger>
            <TabsTrigger value="email" className="gap-1 text-xs"><Mail className="h-3 w-3" /> Comunicação</TabsTrigger>
            <TabsTrigger value="lgpd" className="gap-1 text-xs"><Scale className="h-3 w-3" /> LGPD</TabsTrigger>
            <TabsTrigger value="logs" className="gap-1 text-xs"><Database className="h-3 w-3" /> Logs</TabsTrigger>
            <TabsTrigger value="domains" className="gap-1 text-xs"><Globe className="h-3 w-3" /> Domínios</TabsTrigger>
            <TabsTrigger value="advanced" className="gap-1 text-xs"><Flag className="h-3 w-3" /> Avançado</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* ═══════ 1. PLATAFORMA ═══════ */}
        <TabsContent value="platform" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Image className="h-5 w-5 text-muted-foreground" /> Identidade Visual</CardTitle>
                <CardDescription>Dados e branding global da All Vita</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Nome da Plataforma</Label><Input defaultValue="All Vita" /></div>
                  <div className="space-y-2"><Label>URL Principal</Label><Input defaultValue="https://allvita.com.br" /></div>
                  <div className="space-y-2"><Label>Email Institucional</Label><Input defaultValue="contato@allvita.com.br" /></div>
                  <div className="space-y-2"><Label>Telefone</Label><Input defaultValue="+55 11 99999-0000" /></div>
                </div>
                
                <Separator />
                
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold">Logos e Iconografia</h3>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <Label className="flex flex-col gap-1">
                        Logo Principal
                        <span className="text-[10px] font-normal text-muted-foreground">Fundo transparente · PNG ou SVG</span>
                      </Label>
                      <div className="group relative h-24 w-full rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all overflow-hidden">
                        <img src="/logo-allvita.png" alt="Logo" className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button size="sm" variant="secondary" className="h-8 gap-2"><Upload className="h-3.5 w-3.5" /> Alterar</Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Tamanho ideal: <span className="font-medium text-foreground">400x120px</span></p>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex flex-col gap-1">
                        Isotipo (Logotipo compacto)
                        <span className="text-[10px] font-normal text-muted-foreground">Ícone da marca · PNG ou SVG</span>
                      </Label>
                      <div className="group relative h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all overflow-hidden">
                        <img src="/icon-allvita.png" alt="Icon" className="h-12 w-12 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button size="sm" variant="secondary" className="h-7 px-2"><Upload className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Tamanho ideal: <span className="font-medium text-foreground">128x128px</span></p>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex flex-col gap-1">
                        Favicon
                        <span className="text-[10px] font-normal text-muted-foreground">Ícone da aba · ICO ou PNG</span>
                      </Label>
                      <div className="group relative h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all overflow-hidden">
                        <div className="h-8 w-8 rounded bg-white shadow-sm flex items-center justify-center">
                           <img src="/favicon.ico" alt="Favicon" className="h-5 w-5" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button size="sm" variant="secondary" className="h-7 px-2"><Upload className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Tamanho ideal: <span className="font-medium text-foreground">32x32px</span></p>
                    </div>
                  </div>
                </div>

                <Separator />
                
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { label: "Cor Primária", color: "#1A1A1A", desc: "Cor principal da marca, usada em botões e elementos de destaque." },
                    { label: "Cor Secundária", color: "#6B8E23", desc: "Cor complementar usada para equilíbrio visual e diferenciação." },
                    { label: "Cor de Destaque", color: "#3B82F6", desc: "Cor de ação para chamar atenção para elementos específicos." },
                  ].map((c) => (
                    <div key={c.label} className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> {c.label}</Label>
                      <div className="flex gap-2 items-center">
                        <div className="relative">
                          <Input 
                            type="color" 
                            defaultValue={c.color} 
                            className="w-10 h-10 p-1 rounded-lg border cursor-pointer"
                          />
                        </div>
                        <Input defaultValue={c.color} className="font-mono text-sm" />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">{c.desc}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Tipografia</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="dm-sans">DM Sans</SelectItem>
                      <SelectItem value="plus-jakarta">Plus Jakarta Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rodapé Padrão</Label>
                  <Textarea defaultValue="Easymore Labs, uma empresa Advisor Legacy Ltda. Todos os direitos reservados." rows={2} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ 2. SEGURANÇA ═══════ */}
        <TabsContent value="security" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-muted-foreground" /> Segurança Global</CardTitle>
                <CardDescription>Autenticação e controle de acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <SwitchRow title="Obrigar 2FA para Super Admins" desc="Todos os super admins precisam de autenticação de dois fatores" defaultChecked />
                <SwitchRow title="Obrigar 2FA para Admins de Tenant" desc="Administradores de empresas devem ativar 2FA" />
                <SwitchRow title="Permitir múltiplos logins simultâneos" desc="Mesma conta pode estar logada em vários dispositivos" defaultChecked />
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Expiração de Sessão (horas)</Label>
                    <Input type="number" defaultValue="24" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tentativas de Login (antes do bloqueio)</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo de Bloqueio (minutos)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Força Mínima da Senha</Label>
                    <Select defaultValue="strong">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básica (6+ chars)</SelectItem>
                        <SelectItem value="medium">Média (8+ chars + número)</SelectItem>
                        <SelectItem value="strong">Forte (8+ chars + maiúsc. + número + especial)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-3">
                  <Button variant="destructive" size="sm">Forçar Logout Global</Button>
                  <Button variant="outline" size="sm">Revogar Todas as Sessões</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <AdminPermissions />
        </TabsContent>

        {/* ═══════ 4. DEFAULTS PARA EMPRESAS ═══════ */}
        <TabsContent value="defaults" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-muted-foreground" /> Configurações Padrão para Novas Empresas</CardTitle>
                <CardDescription>Aplicado automaticamente ao criar um tenant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Comissão Inicial Padrão (%)</Label><Input type="number" defaultValue="10" /></div>
                  <div className="space-y-2"><Label>Comissão Recorrente Padrão (%)</Label><Input type="number" defaultValue="5" /></div>
                  <div className="space-y-2"><Label>Níveis de Parceiro Padrão</Label><Input type="number" defaultValue="4" /></div>
                  <div className="space-y-2"><Label>Multiplicador Vitacoins Padrão</Label><Input type="number" defaultValue="1.0" step="0.1" /></div>
                </div>
                <Separator />
                <SwitchRow title="Ativar gamificação por padrão" desc="Novas empresas já iniciam com sistema de pontos" defaultChecked />
                <SwitchRow title="Ativar Vitacoins por padrão" desc="Sistema de moedas virtuais habilitado" defaultChecked />
                <SwitchRow title="Permitir branding customizado" desc="Tenants podem personalizar logo e cores" defaultChecked />
                <SwitchRow title='Exibir "Powered by All Vita"' desc="Mostra marca d'água nos portais dos tenants" />
                <SwitchRow title="Domínio personalizado" desc="Tenants podem usar domínio próprio" defaultChecked />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" /> Limites por Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Máx. Usuários Staff</Label><Input type="number" defaultValue="10" /><p className="text-xs text-muted-foreground">Admins/managers por tenant</p></div>
                  <div className="space-y-2"><Label>Máx. Parceiros</Label><Input type="number" defaultValue="500" /></div>
                  <div className="space-y-2"><Label>Máx. Clientes</Label><Input type="number" defaultValue="10000" /></div>
                  <div className="space-y-2"><Label>Máx. Produtos</Label><Input type="number" defaultValue="50" /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ 5. VITACOINS ═══════ */}
        <TabsContent value="vitacoins" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Coins className="h-5 w-5 text-muted-foreground" /> Vitacoins — Configuração Global</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Valor Base (1 VC = R$)</Label><Input type="number" defaultValue="0.01" step="0.001" /></div>
                  <div className="space-y-2"><Label>Mínimo para Resgate</Label><Input type="number" defaultValue="100" /></div>
                  <div className="space-y-2"><Label>Máx. Emissão Diária (por tenant)</Label><Input type="number" defaultValue="50000" /></div>
                  <div className="space-y-2"><Label>Carência para Resgate (dias)</Label><Input type="number" defaultValue="30" /></div>
                </div>
                <Separator />
                <SwitchRow title="Sistema de Vitacoins ativo" desc="Habilita emissão e resgate globalmente" defaultChecked />
                <SwitchRow title="Resgate em dinheiro" desc="Parceiros podem converter VC em dinheiro" defaultChecked />
                <SwitchRow title="Resgate em produtos" desc="Parceiros podem trocar VC por produtos" defaultChecked />
                <SwitchRow title="Expiração de Vitacoins" desc="Vitacoins expiram após período de inatividade" />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ 6. COMISSÕES ═══════ */}
        <TabsContent value="commissions" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Percent className="h-5 w-5 text-muted-foreground" /> Comissões — Configuração Global</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xs text-muted-foreground">Percentuais padrão aplicados a novos tenants. Cada empresa pode sobrescrever.</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nível</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>% Inicial</TableHead>
                      <TableHead>% Recorrente</TableHead>
                      <TableHead>Bônus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { nivel: 1, tipo: "Direto", ini: "10%", rec: "5%", bonus: "R$ 50" },
                      { nivel: 2, tipo: "Rede Nível 2", ini: "3%", rec: "2%", bonus: "—" },
                      { nivel: 3, tipo: "Rede Nível 3", ini: "1%", rec: "0.5%", bonus: "—" },
                    ].map((r) => (
                      <TableRow key={r.nivel}>
                        <TableCell><Badge variant="outline">{r.nivel}</Badge></TableCell>
                        <TableCell className="text-sm">{r.tipo}</TableCell>
                        <TableCell><Input defaultValue={r.ini} className="w-20 h-8 text-xs" /></TableCell>
                        <TableCell><Input defaultValue={r.rec} className="w-20 h-8 text-xs" /></TableCell>
                        <TableCell><Input defaultValue={r.bonus} className="w-20 h-8 text-xs" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Profundidade Máxima da Rede</Label><Input type="number" defaultValue="5" /></div>
                  <div className="space-y-2"><Label>Moeda Padrão</Label>
                    <Select defaultValue="BRL"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL - Real</SelectItem>
                        <SelectItem value="USD">USD - Dólar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SwitchRow title="Processamento automático" desc="Calcula comissões ao confirmar pagamento" defaultChecked />
                <SwitchRow title="Conversão automática para Vitacoins" desc="Comissões geram Vitacoins automaticamente" defaultChecked />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ 7. INTEGRAÇÕES ═══════ */}
        <TabsContent value="integrations" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Plug className="h-5 w-5 text-muted-foreground" /> Integrações Globais Padrão</CardTitle>
                <CardDescription>Herdado automaticamente por novos tenants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { name: "Pagar.me", desc: "Gateway de pagamento padrão", on: true },
                  { name: "Stripe", desc: "Gateway alternativo", on: false },
                  { name: "Resend", desc: "Envio de e-mails transacionais", on: true },
                  { name: "OpenAI", desc: "IA para insights e conteúdo", on: false },
                  { name: "Analytics API", desc: "API de BI para ferramentas externas", on: true },
                ].map((int) => (
                  <SwitchRow key={int.name} title={int.name} desc={int.desc} defaultChecked={int.on} />
                ))}
                <Separator />
                <SwitchRow title="Webhook de pagamento global" desc="Recebe eventos de pagamento via webhook" defaultChecked />
                <SwitchRow title="Motor de retenção" desc="Envia alertas automáticos de churn" />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ 8. COMUNICAÇÃO ═══════ */}
        <TabsContent value="email" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-5 w-5 text-muted-foreground" /> E-mails Transacionais</CardTitle>
                <CardDescription>Integração com Resend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>E-mail Remetente</Label><Input defaultValue="noreply@allvita.com.br" /></div>
                  <div className="space-y-2"><Label>Nome do Remetente</Label><Input defaultValue="All Vita" /></div>
                </div>
                <Separator />
                <p className="text-xs font-medium text-muted-foreground">Templates Ativos</p>
                {[
                  { name: "Boas-vindas (novo tenant)", slug: "welcome-tenant", on: true },
                  { name: "Convite de usuário", slug: "user-invite", on: true },
                  { name: "Recuperação de senha", slug: "password-reset", on: true },
                  { name: "Alerta de segurança", slug: "security-alert", on: true },
                  { name: "Comissão processada", slug: "commission-alert", on: true },
                  { name: "Resgate de Vitacoins aprovado", slug: "withdrawal-approved", on: true },
                  { name: "Relatório mensal (super admins)", slug: "monthly-report", on: false },
                ].map((t) => (
                  <SwitchRow key={t.slug} title={t.name} desc={`Template: ${t.slug}`} defaultChecked={t.on} />
                ))}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-muted-foreground" /> Notificações In-App</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SwitchRow title="Notificações push ativas" desc="Notificações em tempo real no navegador" defaultChecked />
                <SwitchRow title="Agrupar notificações" desc="Agrupa notificações similares" defaultChecked />
                <div className="space-y-2">
                  <Label>Retenção de Notificações (dias)</Label>
                  <Input type="number" defaultValue="90" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ 9. LGPD ═══════ */}
        <TabsContent value="lgpd" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Scale className="h-5 w-5 text-muted-foreground" /> LGPD e Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>URL da Política de Privacidade</Label>
                  <Input defaultValue="https://allvita.com.br/privacidade" />
                </div>
                <div className="space-y-2">
                  <Label>URL dos Termos de Uso</Label>
                  <Input defaultValue="https://allvita.com.br/termos" />
                </div>
                <Separator />
                <SwitchRow title="Consentimento obrigatório no cadastro" desc="Usuários devem aceitar termos ao se registrar" defaultChecked />
                <SwitchRow title="Consentimento granular de comunicação" desc="Opções separadas para email, SMS, WhatsApp" defaultChecked />
                <SwitchRow title="Anonimização automática" desc="Dados anonimizados após exclusão de conta" defaultChecked />
                <Separator />
                <p className="text-xs font-medium text-muted-foreground">Funcionalidades LGPD</p>
                <div className="flex gap-3 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-1"><FileText className="h-3.5 w-3.5" /> Exportar Dados do Usuário</Button>
                  <Button variant="outline" size="sm" className="gap-1"><Users className="h-3.5 w-3.5" /> Anonimizar Usuário</Button>
                  <Button variant="outline" size="sm" className="gap-1"><Database className="h-3.5 w-3.5" /> Relatório de Consentimentos</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ 10. LOGS E RETENÇÃO ═══════ */}
        <TabsContent value="logs" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5 text-muted-foreground" /> Logs e Retenção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Retenção de Audit Logs (meses)</Label>
                    <Input type="number" defaultValue="24" />
                    <p className="text-xs text-muted-foreground">Logs de auditoria não podem ser deletados</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Retenção de Access Logs (meses)</Label>
                    <Input type="number" defaultValue="12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Retenção de Security Events (meses)</Label>
                    <Input type="number" defaultValue="36" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nível de Detalhe</Label>
                    <Select defaultValue="detailed">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básico (ação + usuário)</SelectItem>
                        <SelectItem value="detailed">Detalhado (+ old/new data)</SelectItem>
                        <SelectItem value="verbose">Verbose (+ headers + IP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <SwitchRow title="Log de alterações em configurações" desc="Registra toda mudança nesta tela" defaultChecked />
                <SwitchRow title="Log de operações financeiras" desc="Registra comissões, pagamentos e resgates" defaultChecked />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ 11. DOMÍNIOS ═══════ */}
        <TabsContent value="domains" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-muted-foreground" /> Domínios e Subdomínios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Domínio Base</Label><Input defaultValue="allvita.com.br" /></div>
                  <div className="space-y-2"><Label>Padrão de Subdomínio (Tenants)</Label><Input defaultValue="{slug}.allvita.com.br" className="font-mono text-sm" /></div>
                </div>
                <Separator />
                <SwitchRow title="Geração automática de subdomínio" desc="Cria subdomínio ao criar tenant" defaultChecked />
                <SwitchRow title="Validação de slug único" desc="Garante que slugs não se repitam" defaultChecked />
                <SwitchRow title="SSL automático" desc="Certificado SSL provisionado automaticamente" defaultChecked />
                <Separator />
                <div className="space-y-2">
                  <Label>Slugs Reservados</Label>
                  <Textarea defaultValue="admin, api, app, auth, www, mail, static, cdn, docs, help, support" rows={2} className="font-mono text-sm" />
                  <p className="text-xs text-muted-foreground">Slugs que não podem ser usados por tenants</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════ 12. AVANÇADO ═══════ */}
        <TabsContent value="advanced" className="space-y-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Flag className="h-5 w-5 text-muted-foreground" /> Configurações Avançadas</CardTitle>
                <CardDescription>Feature flags e configurações internas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-xs text-muted-foreground">⚠️ Alterações aqui podem impactar toda a plataforma</p>
                <SwitchRow title="Modo Debug" desc="Ativa logs verbose no console" />
                <SwitchRow title="Feature: Rede Multinível v2" desc="Motor de comissões multinível aprimorado" defaultChecked />
                <SwitchRow title="Feature: BI & Analytics API" desc="Endpoint dedicado para ferramentas de BI" defaultChecked />
                <SwitchRow title="Feature: Motor de Retenção" desc="Detecção automática de risco de churn" />
                <SwitchRow title="Feature: Quiz Público" desc="Formulário público para triagem de clientes" defaultChecked />
                <SwitchRow title="Feature: Catálogo de Recompensas" desc="Marketplace interno de produtos para resgate" defaultChecked />
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Rate Limit API (req/min)</Label>
                    <Input type="number" defaultValue="60" />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout de Edge Functions (s)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Variáveis de Ambiente Customizadas</Label>
                  <Textarea placeholder='{"FEATURE_X": true, "MAX_RETRIES": 3}' rows={3} className="font-mono text-sm" />
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
