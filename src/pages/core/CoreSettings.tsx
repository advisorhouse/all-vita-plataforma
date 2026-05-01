import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, Globe, Bell, Shield, Palette, Mail, Database,
  Save, ToggleLeft, ChevronRight, Clock, Webhook, Key,
  FileText, Users, Zap, AlertTriangle, CheckCircle,
  DollarSign, BarChart3, CreditCard, ExternalLink, Copy, Webhook as WebhookIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CorePermissions from "./CorePermissions";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Settings Section Component ─── */
const SettingsSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}> = ({ title, description, children, delay = 0 }) => (
  <motion.div custom={delay} variants={fadeUp} initial="hidden" animate="visible">
    <Card className="border border-border shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

/* ─── Toggle Row ─── */
const ToggleRow: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ElementType;
}> = ({ label, description, checked, onChange, icon: Icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const CoreSettings: React.FC = () => {
  const { currentTenant, setCurrentTenant } = useTenant();
  
  // General
  const [platformName, setPlatformName] = useState("Vision Lift");
  const [tradeName, setTradeName] = useState("");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [currency, setCurrency] = useState("BRL");
  const [locale, setLocale] = useState("pt-BR");

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [churnAlerts, setChurnAlerts] = useState(true);
  const [commissionAlerts, setCommissionAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState(false);
  const [alertEmails, setAlertEmails] = useState("admin@visionlift.com.br");

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [auditLog, setAuditLog] = useState(true);

  // Integrations
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookActive, setWebhookActive] = useState(false);

  // Pagar.me
  const [pagarmeEnv, setPagarmeEnv] = useState<"sandbox" | "production">("sandbox");
  const [pagarmeApiKey, setPagarmeApiKey] = useState("");
  const [pagarmeEncKey, setPagarmeEncKey] = useState("");
  const [pagarmeOrderPaid, setPagarmeOrderPaid] = useState(true);
  const [pagarmeOrderRefunded, setPagarmeOrderRefunded] = useState(true);
  const [pagarmeSubscriptionCreated, setPagarmeSubscriptionCreated] = useState(true);
  const [pagarmeSubscriptionCanceled, setPagarmeSubscriptionCanceled] = useState(true);
  const [pagarmeChargebackCreated, setPagarmeChargebackCreated] = useState(true);

  // Appearance
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings
  useEffect(() => {
    if (currentTenant) {
      setPlatformName(currentTenant.name || "Vision Lift");
      setTradeName(currentTenant.trade_name || "");
      
      const s = currentTenant.settings as any || {};
      setTimezone(s.timezone || "America/Sao_Paulo");
      setCurrency(s.currency || "BRL");
      setLocale(s.locale || "pt-BR");
      
      const n = s.notifications || {};
      setEmailAlerts(n.emailAlerts ?? true);
      setChurnAlerts(n.churnAlerts ?? true);
      setCommissionAlerts(n.commissionAlerts ?? true);
      setWeeklyDigest(n.weeklyDigest ?? true);
      setRealtimeAlerts(n.realtimeAlerts ?? false);
      setAlertEmails(n.alertEmails || "admin@visionlift.com.br");
      
      const sec = s.security || {};
      setTwoFactor(sec.twoFactor ?? false);
      setSessionTimeout(sec.sessionTimeout || "60");
      setIpWhitelist(sec.ipWhitelist ?? false);
      setAuditLog(sec.auditLog ?? true);
      
      const integ = s.integrations || {};
      setWebhookUrl(integ.webhookUrl || "");
      setWebhookActive(integ.webhookActive ?? false);
      
      const p = s.pagarme || {};
      setPagarmeEnv(p.env || "sandbox");
      setPagarmeApiKey(p.apiKey || "");
      setPagarmeEncKey(p.encKey || "");
      setPagarmeOrderPaid(p.orderPaid ?? true);
      setPagarmeOrderRefunded(p.orderRefunded ?? true);
      setPagarmeSubscriptionCreated(p.subscriptionCreated ?? true);
      setPagarmeSubscriptionCanceled(p.subscriptionCanceled ?? true);
      setPagarmeChargebackCreated(p.chargebackCreated ?? true);
      
      const a = s.appearance || {};
      setDarkMode(a.darkMode ?? false);
      setCompactMode(a.compactMode ?? false);
      setAnimationsEnabled(a.animationsEnabled ?? true);
    }
  }, [currentTenant?.id]);

  const handleSave = async () => {
    if (!currentTenant?.id) return;
    
    setSaving(true);
    try {
      const settings = {
        timezone, currency, locale,
        notifications: {
          emailAlerts, churnAlerts, commissionAlerts, weeklyDigest, realtimeAlerts, alertEmails
        },
        security: {
          twoFactor, sessionTimeout, ipWhitelist, auditLog
        },
        integrations: {
          webhookUrl, webhookActive
        },
        pagarme: {
          env: pagarmeEnv, apiKey: pagarmeApiKey, encKey: pagarmeEncKey,
          orderPaid: pagarmeOrderPaid, orderRefunded: pagarmeOrderRefunded,
          subscriptionCreated: pagarmeSubscriptionCreated,
          subscriptionCanceled: pagarmeSubscriptionCanceled,
          chargebackCreated: pagarmeChargebackCreated
        },
        appearance: {
          darkMode, compactMode, animationsEnabled
        }
      };

      const { data: updatedTenant, error } = await supabase
        .from('tenants')
        .update({ 
          name: platformName,
          trade_name: tradeName,
          settings 
        })
        .eq('id', currentTenant.id)
        .select()
        .single();

      if (error) throw error;

      setSaved(true);
      toast.success("Configurações salvas com sucesso!");
      if (updatedTenant) {
        setCurrentTenant(updatedTenant as any);
      }
      setTimeout(() => setSaved(false), 2000);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Configurações</h2>
          <p className="text-sm text-muted-foreground">Configurações gerais da plataforma {platformName}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[140px]">
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Alterações"}
        </Button>
      </motion.div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-1.5 text-xs"><Globe className="h-3.5 w-3.5" />Geral</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs"><Bell className="h-3.5 w-3.5" />Notificações</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Segurança</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5 text-xs"><WebhookIcon className="h-3.5 w-3.5" />Integrações</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs"><Palette className="h-3.5 w-3.5" />Aparência</TabsTrigger>
          <TabsTrigger value="permissions" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Permissões</TabsTrigger>
        </TabsList>

        {/* ===== GERAL ===== */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <SettingsSection title="Informações da Plataforma" description="Dados básicos de configuração" delay={1}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Nome da Plataforma</Label>
                <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Nome Fantasia</Label>
                <Input value={tradeName} onChange={(e) => setTradeName(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Fuso Horário</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                    <SelectItem value="America/Bahia">Bahia (UTC-3)</SelectItem>
                    <SelectItem value="America/Recife">Recife (UTC-3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Moeda Padrão</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar (US$)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Idioma</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (BR)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Dados & Retenção" description="Políticas de armazenamento e processamento" delay={2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Retenção de Logs (dias)</Label>
                <Input type="number" defaultValue={90} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Retenção de Webhooks (dias)</Label>
                <Input type="number" defaultValue={30} className="h-9" />
              </div>
            </div>
            <ToggleRow
              label="Processamento automático de comissões"
              description="Executar engine de comissões automaticamente a cada ordem"
              checked={true}
              onChange={() => {}}
              icon={Zap}
            />
            <ToggleRow
              label="Gamificação automática"
              description="Atualizar níveis e benefícios automaticamente via cron"
              checked={true}
              onChange={() => {}}
              icon={Settings}
            />
          </SettingsSection>
        </TabsContent>

        {/* ===== NOTIFICAÇÕES ===== */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <SettingsSection title="Alertas por E-mail" description="Configurações de notificações administrativas" delay={1}>
            <ToggleRow label="Alertas por e-mail" description="Receber notificações gerais por e-mail"
              checked={emailAlerts} onChange={setEmailAlerts} icon={Mail} />
            <ToggleRow label="Alertas de churn" description="Notificação quando cliente entra em risco de cancelamento"
              checked={churnAlerts} onChange={setChurnAlerts} icon={AlertTriangle} />
            <ToggleRow label="Alertas de comissão" description="Notificação sobre margem crítica ou limites atingidos"
              checked={commissionAlerts} onChange={setCommissionAlerts} icon={Key} />
            <ToggleRow label="Digest semanal" description="Resumo consolidado semanal com métricas-chave"
              checked={weeklyDigest} onChange={setWeeklyDigest} icon={FileText} />
            <ToggleRow label="Alertas em tempo real" description="Push notifications no painel para eventos críticos"
              checked={realtimeAlerts} onChange={setRealtimeAlerts} icon={Zap} />
          </SettingsSection>

          <SettingsSection title="Destinatários" description="E-mails que receberão os alertas" delay={2}>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">E-mails (separados por vírgula)</Label>
              <Textarea
                value={alertEmails}
                onChange={(e) => setAlertEmails(e.target.value)}
                placeholder="admin@visionlift.com.br, operacao@visionlift.com.br"
                className="min-h-[60px] text-sm"
              />
            </div>
          </SettingsSection>
        </TabsContent>

        {/* ===== SEGURANÇA ===== */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <SettingsSection title="Autenticação" description="Configurações de segurança e acesso" delay={1}>
            <ToggleRow label="Autenticação em dois fatores (2FA)" description="Exigir 2FA para todos os administradores"
              checked={twoFactor} onChange={setTwoFactor} icon={Shield} />
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Timeout de sessão</p>
                  <p className="text-[11px] text-muted-foreground">Tempo de inatividade antes de exigir novo login</p>
                </div>
              </div>
              <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="480">8 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ToggleRow label="Whitelist de IPs" description="Restringir acesso admin a IPs específicos"
              checked={ipWhitelist} onChange={setIpWhitelist} icon={Globe} />
            <ToggleRow label="Log de auditoria" description="Registrar todas as ações administrativas"
              checked={auditLog} onChange={setAuditLog} icon={Database} />
          </SettingsSection>
        </TabsContent>

        {/* ===== INTEGRAÇÕES ===== */}
        <TabsContent value="integrations" className="space-y-4 mt-4">
          {/* Pagar.me Gateway */}
          <SettingsSection title="Gateway de Pagamento — Pagar.me" description="Configurações de conexão com o gateway Pagar.me (Pagarme V5)" delay={1}>
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Pagar.me</p>
                  <p className="text-[11px] text-muted-foreground">Gateway de pagamentos — cobranças, assinaturas e PIX</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-[9px] border-0", pagarmeEnv === "production" ? "bg-primary/10 text-primary" : "bg-accent/80 text-accent-foreground")}>
                  {pagarmeEnv === "production" ? "Produção" : "Sandbox"}
                </Badge>
                <Badge className="text-[9px] bg-primary/10 text-primary border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />Conectado
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Ambiente</Label>
                <Select value={pagarmeEnv} onValueChange={(v) => setPagarmeEnv(v as "sandbox" | "production")}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                    <SelectItem value="production">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">
                  <a href="https://docs.pagar.me/docs/overview-principal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                    Documentação Pagar.me <ExternalLink className="h-3 w-3" />
                  </a>
                </Label>
                <p className="text-[10px] text-muted-foreground">Obtenha as chaves em dash.pagar.me → Configurações → Chaves de API</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Secret Key (sk_)</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={pagarmeApiKey}
                    onChange={(e) => setPagarmeApiKey(e.target.value)}
                    placeholder="sk_test_***************************"
                    className="h-9 font-mono text-xs pr-8"
                  />
                  <Key className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Encryption Key (ek_)</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={pagarmeEncKey}
                    onChange={(e) => setPagarmeEncKey(e.target.value)}
                    placeholder="ek_test_***************************"
                    className="h-9 font-mono text-xs pr-8"
                  />
                  <Shield className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Webhook Pagar.me */}
          <SettingsSection title="Webhook Pagar.me" description="URL para receber notificações de eventos do gateway" delay={2}>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">URL do Webhook (registre no painel Pagar.me)</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`https://gzcuuxqjblyyucgwlfmw.supabase.co/functions/v1/payment-webhook`}
                  className="h-9 font-mono text-xs flex-1 bg-muted/50"
                />
                <Button variant="outline" size="sm" className="h-9 gap-1.5 shrink-0" onClick={() => {
                  navigator.clipboard.writeText(`https://gzcuuxqjblyyucgwlfmw.supabase.co/functions/v1/payment-webhook`);
                  toast.info("Copiado!");
                }}>
                  <Copy className="h-3.5 w-3.5" />Copiar
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-medium text-foreground mb-2">Eventos Monitorados</p>
              <ToggleRow label="order.paid" description="Pagamento confirmado de uma cobrança"
                checked={pagarmeOrderPaid} onChange={setPagarmeOrderPaid} icon={DollarSign} />
              <ToggleRow label="order.refunded" description="Reembolso processado"
                checked={pagarmeOrderRefunded} onChange={setPagarmeOrderRefunded} icon={AlertTriangle} />
              <ToggleRow label="subscription.created" description="Nova assinatura criada"
                checked={pagarmeSubscriptionCreated} onChange={setPagarmeSubscriptionCreated} icon={CreditCard} />
              <ToggleRow label="subscription.canceled" description="Assinatura cancelada pelo cliente ou gateway"
                checked={pagarmeSubscriptionCanceled} onChange={setPagarmeSubscriptionCanceled} icon={AlertTriangle} />
              <ToggleRow label="charge.chargeback_created" description="Contestação de cobrança (chargeback)"
                checked={pagarmeChargebackCreated} onChange={setPagarmeChargebackCreated} icon={Shield} />
            </div>
          </SettingsSection>

          {/* Outros Webhooks */}
          <SettingsSection title="Webhook Customizado" description="Endpoint adicional para integrações externas" delay={3}>
            <ToggleRow label="Webhook ativo" description="Processar eventos de pagamento automaticamente"
              checked={webhookActive} onChange={setWebhookActive} icon={WebhookIcon} />
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">URL do Webhook</Label>
              <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.visionlift.com.br/webhooks/custom"
                className="h-9 font-mono text-xs" />
            </div>
          </SettingsSection>
        </TabsContent>

        {/* ===== APARÊNCIA ===== */}
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <SettingsSection title="Tema & Layout" description="Personalizar a aparência do painel" delay={1}>
            <ToggleRow label="Modo escuro" description="Ativar tema escuro para a interface"
              checked={darkMode} onChange={setDarkMode} icon={Palette} />
            <ToggleRow label="Modo compacto" description="Reduzir espaçamento para visualizar mais dados"
              checked={compactMode} onChange={setCompactMode} icon={ToggleLeft} />
            <ToggleRow label="Animações" description="Ativar animações e transições na interface"
              checked={animationsEnabled} onChange={setAnimationsEnabled} icon={Zap} />
          </SettingsSection>
        </TabsContent>

        {/* ===== PERMISSÕES ===== */}
        <TabsContent value="permissions" className="mt-4">
          <CorePermissions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoreSettings;