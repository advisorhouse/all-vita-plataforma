import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Palette, Shield, Globe, Sliders, Save, Building2, Image, Type, Clock,
  Users, CreditCard, Bell, FileText, Lock, Coins, Percent, Plug, Mail,
  Scale, Database, Server, Flag, Settings, Upload, Loader2,
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
import { supabase } from "@/integrations/supabase/client";

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
  checked = false, 
  onCheckedChange 
}: { 
  title: string; 
  desc: string; 
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    <Switch 
      checked={checked} 
      onCheckedChange={onCheckedChange}
    />
  </div>
);

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [platform, setPlatform] = useState<any>(null);
  const [security, setSecurity] = useState<any>(null);
  const [defaults, setDefaults] = useState<any>(null);
  const [domains, setDomains] = useState<any>(null);
  const [advanced, setAdvanced] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('system_settings').select('*');
      
      if (error) throw error;

      if (data) {
        const settingsMap: any = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });

        if (settingsMap.platform_branding) setPlatform(settingsMap.platform_branding);
        if (settingsMap.security_settings) setSecurity(settingsMap.security_settings);
        if (settingsMap.tenant_defaults) setDefaults(settingsMap.tenant_defaults);
        if (settingsMap.domain_settings) setDomains(settingsMap.domain_settings);
        if (settingsMap.advanced_settings) setAdvanced(settingsMap.advanced_settings);
      }

      const { data: templatesData, error: templatesError } = await supabase
        .from('communication_templates')
        .select('*')
        .order('name');
      
      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: 'platform_branding', value: platform },
        { key: 'security_settings', value: security },
        { key: 'tenant_defaults', value: defaults },
        { key: 'domain_settings', value: domains },
        { key: 'advanced_settings', value: advanced },
      ];

      for (const update of updates) {
        if (!update.value) continue;
        const { error } = await supabase
          .from('system_settings')
          .upsert(update);
        
        if (error) throw error;
      }

      toast.success("Configurações salvas com sucesso");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'icon' | 'favicon') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Math.random()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('platform_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('platform_assets')
        .getPublicUrl(filePath);

      const updatedPlatform = { ...platform };
      if (type === 'logo') updatedPlatform.logo_url = publicUrl;
      if (type === 'icon') updatedPlatform.icon_url = publicUrl;
      if (type === 'favicon') updatedPlatform.favicon_url = publicUrl;
      
      setPlatform(updatedPlatform);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      const errorMessage = error.message || error.error_description || "Erro desconhecido";
      toast.error(`Erro ao fazer upload: ${errorMessage}`);
    }
  };

  const toggleTemplate = async (slug: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('communication_templates')
        .update({ active })
        .eq('slug', slug);
      
      if (error) throw error;
      setTemplates(prev => prev.map(t => t.slug === slug ? { ...t, active } : t));
      toast.success(`Template ${active ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error("Error toggling template:", error);
      toast.error("Erro ao atualizar template");
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const { error } = await supabase
        .from('communication_templates')
        .update({
          name: selectedTemplate.name,
          subject: selectedTemplate.subject,
          content: selectedTemplate.content
        })
        .eq('slug', selectedTemplate.slug);

      if (error) throw error;
      
      setTemplates(prev => prev.map(t => t.slug === selectedTemplate.slug ? selectedTemplate : t));
      setIsEditingTemplate(false);
      toast.success("Template salvo com sucesso");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Erro ao salvar template");
    }
  };

  const roles = [
    { role: "super_admin", label: "Super Admin", perms: "Acesso total à plataforma" },
    { role: "admin", label: "Admin (Tenant)", perms: "Gestão completa da empresa" },
    { role: "manager", label: "Manager", perms: "Operações e relatórios" },
    { role: "partner", label: "Parceiro", perms: "Rede, clientes e comissões" },
    { role: "client", label: "Cliente", perms: "Assinatura e benefícios" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Configurações Globais</h1>
            <Badge variant="outline" className="text-[10px]">{platform?.name || 'All Vita'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Parâmetros, regras e controles da plataforma</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
                  <div className="space-y-2">
                    <Label>Nome da Plataforma</Label>
                    <Input 
                      value={platform?.name || ""} 
                      onChange={(e) => setPlatform({ ...platform, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Principal</Label>
                    <Input 
                      value={platform?.url || ""} 
                      onChange={(e) => setPlatform({ ...platform, url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Institucional</Label>
                    <Input 
                      value={platform?.email || ""} 
                      onChange={(e) => setPlatform({ ...platform, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input 
                      value={platform?.phone || ""} 
                      onChange={(e) => setPlatform({ ...platform, phone: e.target.value })}
                    />
                  </div>
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
                      <div 
                        className="group relative h-24 w-full rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all overflow-hidden"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <img src={platform?.logo_url || "/logo-allvita.png"} alt="Logo" className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button size="sm" variant="secondary" className="h-8 gap-2 pointer-events-none"><Upload className="h-3.5 w-3.5" /> Alterar</Button>
                        </div>
                        <input 
                          id="logo-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, 'logo')} 
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Tamanho ideal: <span className="font-medium text-foreground">400x120px</span></p>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex flex-col gap-1">
                        Isotipo (Logotipo compacto)
                        <span className="text-[10px] font-normal text-muted-foreground">Ícone da marca · PNG ou SVG</span>
                      </Label>
                      <div 
                        className="group relative h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all overflow-hidden"
                        onClick={() => document.getElementById('icon-upload')?.click()}
                      >
                        <img src={platform?.icon_url || "/icon-allvita.png"} alt="Icon" className="h-12 w-12 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button size="sm" variant="secondary" className="h-7 px-2 pointer-events-none"><Upload className="h-3 w-3" /></Button>
                        </div>
                        <input 
                          id="icon-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, 'icon')} 
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Tamanho ideal: <span className="font-medium text-foreground">128x128px</span></p>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex flex-col gap-1">
                        Favicon
                        <span className="text-[10px] font-normal text-muted-foreground">Ícone da aba · ICO ou PNG</span>
                      </Label>
                      <div 
                        className="group relative h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all overflow-hidden"
                        onClick={() => document.getElementById('favicon-upload')?.click()}
                      >
                        <div className="h-8 w-8 rounded bg-white shadow-sm flex items-center justify-center">
                           <img src={platform?.favicon_url || "/favicon.ico"} alt="Favicon" className="h-5 w-5" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button size="sm" variant="secondary" className="h-7 px-2 pointer-events-none"><Upload className="h-3 w-3" /></Button>
                        </div>
                        <input 
                          id="favicon-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, 'favicon')} 
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Tamanho ideal: <span className="font-medium text-foreground">32x32px</span></p>
                    </div>
                  </div>
                </div>

                <Separator />
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Cor Primária</Label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="color" 
                        value={platform?.primary_color || "#1A1A1A"} 
                        onChange={(e) => setPlatform({ ...platform, primary_color: e.target.value })}
                        className="w-10 h-10 p-1 rounded-lg border cursor-pointer"
                      />
                      <Input 
                        value={platform?.primary_color || "#1A1A1A"} 
                        onChange={(e) => setPlatform({ ...platform, primary_color: e.target.value })}
                        className="font-mono text-sm" 
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">Cor principal da marca, usada em botões e elementos de destaque.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Cor Secundária</Label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="color" 
                        value={platform?.secondary_color || "#6B8E23"} 
                        onChange={(e) => setPlatform({ ...platform, secondary_color: e.target.value })}
                        className="w-10 h-10 p-1 rounded-lg border cursor-pointer"
                      />
                      <Input 
                        value={platform?.secondary_color || "#6B8E23"} 
                        onChange={(e) => setPlatform({ ...platform, secondary_color: e.target.value })}
                        className="font-mono text-sm" 
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">Cor complementar usada para equilíbrio visual e diferenciação.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Type className="h-3.5 w-3.5" /> Cor de Destaque</Label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="color" 
                        value={platform?.highlight_color || "#3B82F6"} 
                        onChange={(e) => setPlatform({ ...platform, highlight_color: e.target.value })}
                        className="w-10 h-10 p-1 rounded-lg border cursor-pointer"
                      />
                      <Input 
                        value={platform?.highlight_color || "#3B82F6"} 
                        onChange={(e) => setPlatform({ ...platform, highlight_color: e.target.value })}
                        className="font-mono text-sm" 
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">Cor de ação para chamar atenção para elementos específicos.</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Tipografia</Label>
                  <Select 
                    value={platform?.typography || "inter"} 
                    onValueChange={(v) => setPlatform({ ...platform, typography: v })}
                  >
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
                  <Textarea 
                    value={platform?.footer_text || ""} 
                    onChange={(e) => setPlatform({ ...platform, footer_text: e.target.value })}
                    rows={2} 
                  />
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
                <SwitchRow 
                  title="Obrigar 2FA para Super Admins" 
                  desc="Todos os super admins precisam de autenticação de dois fatores" 
                  checked={security?.require_2fa_super_admin}
                  onCheckedChange={(checked) => setSecurity({ ...security, require_2fa_super_admin: checked })}
                />
                <SwitchRow 
                  title="Obrigar 2FA para Admins de Tenant" 
                  desc="Administradores de empresas devem ativar 2FA" 
                  checked={security?.require_2fa_tenant_admin}
                  onCheckedChange={(checked) => setSecurity({ ...security, require_2fa_tenant_admin: checked })}
                />
                <SwitchRow 
                  title="Permitir múltiplos logins simultâneos" 
                  desc="Mesma conta pode estar logada em vários dispositivos" 
                  checked={security?.allow_multiple_logins}
                  onCheckedChange={(checked) => setSecurity({ ...security, allow_multiple_logins: checked })}
                />
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Expiração de Sessão (horas)</Label>
                    <Input 
                      type="number" 
                      value={security?.session_expiration_hours || ""} 
                      onChange={(e) => setSecurity({ ...security, session_expiration_hours: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tentativas de Login (antes do bloqueio)</Label>
                    <Input 
                      type="number" 
                      value={security?.login_attempts_before_lock || ""} 
                      onChange={(e) => setSecurity({ ...security, login_attempts_before_lock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo de Bloqueio (minutos)</Label>
                    <Input 
                      type="number" 
                      value={security?.lockout_duration_minutes || ""} 
                      onChange={(e) => setSecurity({ ...security, lockout_duration_minutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Força Mínima da Senha</Label>
                    <Select 
                      value={security?.password_strength || "strong"}
                      onValueChange={(v) => setSecurity({ ...security, password_strength: v })}
                    >
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
                  <div className="space-y-2">
                    <Label>Comissão Inicial Padrão (%)</Label>
                    <Input 
                      type="number" 
                      value={defaults?.initial_commission_percent || ""} 
                      onChange={(e) => setDefaults({ ...defaults, initial_commission_percent: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Comissão Recorrente Padrão (%)</Label>
                    <Input 
                      type="number" 
                      value={defaults?.recurring_commission_percent || ""} 
                      onChange={(e) => setDefaults({ ...defaults, recurring_commission_percent: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Níveis de Parceiro Padrão</Label>
                    <Input 
                      type="number" 
                      value={defaults?.default_partner_levels || ""} 
                      onChange={(e) => setDefaults({ ...defaults, default_partner_levels: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Multiplicador Vitacoins Padrão</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={defaults?.vitacoin_multiplier || ""} 
                      onChange={(e) => setDefaults({ ...defaults, vitacoin_multiplier: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Separator />
                <SwitchRow 
                  title="Ativar gamificação por padrão" 
                  desc="Novas empresas já iniciam com sistema de pontos" 
                  checked={defaults?.enable_gamification_by_default}
                  onCheckedChange={(checked) => setDefaults({ ...defaults, enable_gamification_by_default: checked })}
                />
                <SwitchRow 
                  title="Ativar Vitacoins por padrão" 
                  desc="Sistema de moedas virtuais habilitado" 
                  checked={defaults?.enable_vitacoins_by_default}
                  onCheckedChange={(checked) => setDefaults({ ...defaults, enable_vitacoins_by_default: checked })}
                />
                <SwitchRow 
                  title="Permitir branding customizado" 
                  desc="Tenants podem personalizar logo e cores" 
                  checked={defaults?.allow_custom_branding}
                  onCheckedChange={(checked) => setDefaults({ ...defaults, allow_custom_branding: checked })}
                />
                <SwitchRow 
                  title='Exibir "Powered by All Vita"' 
                  desc="Mostra marca d'água nos portais dos tenants" 
                  checked={defaults?.show_powered_by}
                  onCheckedChange={(checked) => setDefaults({ ...defaults, show_powered_by: checked })}
                />
                <SwitchRow 
                  title="Domínio personalizado" 
                  desc="Tenants podem usar domínio próprio" 
                  checked={defaults?.allow_custom_domain}
                  onCheckedChange={(checked) => setDefaults({ ...defaults, allow_custom_domain: checked })}
                />
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
                <SwitchRow title="Sistema de Vitacoins ativo" desc="Habilita emissão e resgate globalmente" checked />
                <SwitchRow title="Resgate em dinheiro" desc="Parceiros podem converter VC em dinheiro" checked />
                <SwitchRow title="Resgate em produtos" desc="Parceiros podem trocar VC por produtos" checked />
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
                <SwitchRow title="Processamento automático" desc="Calcula comissões ao confirmar pagamento" checked />
                <SwitchRow title="Conversão automática para Vitacoins" desc="Comissões geram Vitacoins automaticamente" checked />
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
                  <SwitchRow key={int.name} title={int.name} desc={int.desc} checked={int.on} />
                ))}
                <Separator />
                <SwitchRow title="Webhook de pagamento global" desc="Recebe eventos de pagamento via webhook" checked />
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
                
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Templates Disponíveis</p>
                  <Badge variant="outline" className="text-[10px]">{templates.length} templates</Badge>
                </div>

                <div className="space-y-4">
                  {templates.map((t) => (
                    <div key={t.slug} className="p-4 rounded-lg border bg-card/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">Slug: {t.slug}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={t.active} 
                            onCheckedChange={(checked) => toggleTemplate(t.slug, checked)}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] gap-1"
                            onClick={() => {
                              setSelectedTemplate(t);
                              setIsEditingTemplate(true);
                            }}
                          >
                            <FileText className="h-3 w-3" /> Editar
                          </Button>
                        </div>
                      </div>
                      
                      {isEditingTemplate && selectedTemplate?.slug === t.slug ? (
                        <div className="space-y-3 mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-2">
                            <Label className="text-[10px]">Nome do Template</Label>
                            <Input 
                              value={selectedTemplate.name} 
                              onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px]">Assunto</Label>
                            <Input 
                              value={selectedTemplate.subject} 
                              onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px]">Conteúdo</Label>
                            <Textarea 
                              value={selectedTemplate.content} 
                              onChange={(e) => setSelectedTemplate({...selectedTemplate, content: e.target.value})}
                              rows={6}
                              className="text-xs font-mono"
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setIsEditingTemplate(false)}>Cancelar</Button>
                            <Button size="sm" className="h-7 text-[10px]" onClick={handleSaveTemplate}>Salvar Alterações</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted/30 p-2 rounded text-[10px] text-muted-foreground truncate italic">
                          Assunto: {t.subject}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {templates.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                      <Mail className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground">Nenhum template encontrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-muted-foreground" /> Notificações In-App</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SwitchRow 
                  title="Notificações push ativas" 
                  desc="Notificações em tempo real no navegador" 
                  checked 
                  onCheckedChange={(checked) => toast.info(`Push notifications ${checked ? 'ativadas' : 'desativadas'}`)}
                />
                <SwitchRow 
                  title="Agrupar notificações" 
                  desc="Agrupa notificações similares" 
                  checked 
                  onCheckedChange={(checked) => toast.info(`Agrupamento ${checked ? 'ativado' : 'desativado'}`)}
                />
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
                <SwitchRow title="Consentimento obrigatório no cadastro" desc="Usuários devem aceitar termos ao se registrar" checked />
                <SwitchRow title="Consentimento granular de comunicação" desc="Opções separadas para email, SMS, WhatsApp" checked />
                <SwitchRow title="Anonimização automática" desc="Dados anonimizados após exclusão de conta" checked />
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
                <SwitchRow title="Log de alterações em configurações" desc="Registra toda mudança nesta tela" checked />
                <SwitchRow title="Log de operações financeiras" desc="Registra comissões, pagamentos e resgates" checked />
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
                  <div className="space-y-2">
                    <Label>Domínio Base</Label>
                    <Input 
                      value={domains?.base_domain || ""} 
                      onChange={(e) => setDomains({ ...domains, base_domain: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Padrão de Subdomínio (Tenants)</Label>
                    <Input 
                      value={domains?.tenant_subdomain_pattern || ""} 
                      onChange={(e) => setDomains({ ...domains, tenant_subdomain_pattern: e.target.value })}
                      className="font-mono text-sm" 
                    />
                  </div>
                </div>
                <Separator />
                <SwitchRow 
                  title="Geração automática de subdomínio" 
                  desc="Cria subdomínio ao criar tenant" 
                  checked={domains?.auto_generate_subdomain}
                  onCheckedChange={(checked) => setDomains({ ...domains, auto_generate_subdomain: checked })}
                />
                <SwitchRow 
                  title="Validação de slug único" 
                  desc="Garante que slugs não se repitam" 
                  checked={domains?.validate_unique_slug}
                  onCheckedChange={(checked) => setDomains({ ...domains, validate_unique_slug: checked })}
                />
                <SwitchRow 
                  title="SSL automático" 
                  desc="Certificado SSL provisionado automaticamente" 
                  checked={domains?.auto_ssl}
                  onCheckedChange={(checked) => setDomains({ ...domains, auto_ssl: checked })}
                />
                <Separator />
                <div className="space-y-2">
                  <Label>Slugs Reservados</Label>
                  <Textarea 
                    value={domains?.reserved_slugs?.join(", ") || ""} 
                    onChange={(e) => setDomains({ ...domains, reserved_slugs: e.target.value.split(",").map((s: string) => s.trim()) })}
                    rows={2} 
                    className="font-mono text-sm" 
                  />
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
                <SwitchRow 
                  title="Modo Debug" 
                  desc="Ativa logs verbose no console" 
                  checked={advanced?.debug_mode}
                  onCheckedChange={(checked) => setAdvanced({ ...advanced, debug_mode: checked })}
                />
                <SwitchRow 
                  title="Feature: Rede Multinível v2" 
                  desc="Motor de comissões multinível aprimorado" 
                  checked={advanced?.feature_multilevel_v2}
                  onCheckedChange={(checked) => setAdvanced({ ...advanced, feature_multilevel_v2: checked })}
                />
                <SwitchRow 
                  title="Feature: BI & Analytics API" 
                  desc="Endpoint dedicado para ferramentas de BI" 
                  checked={advanced?.feature_bi_analytics_api}
                  onCheckedChange={(checked) => setAdvanced({ ...advanced, feature_bi_analytics_api: checked })}
                />
                <SwitchRow 
                  title="Feature: Motor de Retenção" 
                  desc="Detecção automática de risco de churn" 
                  checked={advanced?.feature_retention_engine}
                  onCheckedChange={(checked) => setAdvanced({ ...advanced, feature_retention_engine: checked })}
                />
                <SwitchRow 
                  title="Feature: Quiz Público" 
                  desc="Formulário público para triagem de clientes" 
                  checked={advanced?.feature_public_quiz}
                  onCheckedChange={(checked) => setAdvanced({ ...advanced, feature_public_quiz: checked })}
                />
                <SwitchRow 
                  title="Feature: Catálogo de Recompensas" 
                  desc="Marketplace interno de produtos para resgate" 
                  checked={advanced?.feature_reward_catalog}
                  onCheckedChange={(checked) => setAdvanced({ ...advanced, feature_reward_catalog: checked })}
                />
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Rate Limit API (req/min)</Label>
                    <Input 
                      type="number" 
                      value={advanced?.api_rate_limit || ""} 
                      onChange={(e) => setAdvanced({ ...advanced, api_rate_limit: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout de Edge Functions (s)</Label>
                    <Input 
                      type="number" 
                      value={advanced?.edge_function_timeout || ""} 
                      onChange={(e) => setAdvanced({ ...advanced, edge_function_timeout: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Variáveis de Ambiente Customizadas</Label>
                  <Textarea 
                    value={advanced?.custom_env_vars ? JSON.stringify(advanced.custom_env_vars, null, 2) : ""} 
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setAdvanced({ ...advanced, custom_env_vars: parsed });
                      } catch (err) {
                        // Just keep as is if invalid JSON while typing
                      }
                    }}
                    placeholder='{"FEATURE_X": true, "MAX_RETRIES": 3}' 
                    rows={3} 
                    className="font-mono text-sm" 
                  />
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
