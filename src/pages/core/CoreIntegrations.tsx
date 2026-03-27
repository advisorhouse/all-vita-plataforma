import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import {
  ShoppingCart, CreditCard, Brain, Mic, Settings2,
  CheckCircle2, XCircle, Loader2, ExternalLink, Plug,
  Key, Globe, RefreshCw, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  docsUrl: string;
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
  features: string[];
}

const integrations: IntegrationConfig[] = [
  {
    id: "shopify",
    name: "Shopify",
    description: "E-commerce e gestão de produtos. Sincronize catálogo, pedidos e estoque automaticamente.",
    icon: ShoppingCart,
    color: "bg-emerald-500/10 text-emerald-600",
    docsUrl: "https://shopify.dev/docs/api",
    fields: [
      { key: "store_url", label: "URL da Loja", placeholder: "minha-loja.myshopify.com" },
      { key: "api_key", label: "API Key", placeholder: "shpat_...", secret: true },
      { key: "webhook_secret", label: "Webhook Secret", placeholder: "whsec_...", secret: true },
    ],
    features: ["Sincronização de produtos", "Importação de pedidos", "Webhooks de pagamento", "Gestão de estoque"],
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    description: "Gateway de pagamento brasileiro. Processe transações e gerencie recorrências.",
    icon: CreditCard,
    color: "bg-blue-500/10 text-blue-600",
    docsUrl: "https://docs.pagar.me",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "ak_live_...", secret: true },
      { key: "encryption_key", label: "Encryption Key", placeholder: "ek_live_...", secret: true },
      { key: "webhook_url", label: "Webhook URL", placeholder: "Gerado automaticamente" },
    ],
    features: ["Processamento de pagamentos", "Assinaturas recorrentes", "Split de pagamento", "Webhooks automáticos"],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Inteligência artificial para predição de churn, projeções financeiras e assistentes inteligentes.",
    icon: Brain,
    color: "bg-violet-500/10 text-violet-600",
    docsUrl: "https://platform.openai.com/docs",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "sk-...", secret: true },
      { key: "model", label: "Modelo Padrão", placeholder: "gpt-4o-mini" },
    ],
    features: ["Predição de churn", "Projeções de LTV", "Assistente IA", "Análise de sentimento"],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Geração de voz por IA para agentes de atendimento e conteúdos personalizados.",
    icon: Mic,
    color: "bg-amber-500/10 text-amber-600",
    docsUrl: "https://elevenlabs.io/docs",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "xi-...", secret: true },
      { key: "voice_id", label: "Voice ID Padrão", placeholder: "ID da voz personalizada" },
    ],
    features: ["Text-to-Speech", "Agente de voz", "Clonagem de voz", "Áudio para conteúdo"],
  },
];

const CoreIntegrations: React.FC = () => {
  const { currentTenant } = useTenant();
  const [configDialog, setConfigDialog] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data: dbIntegrations = [], isLoading } = useQuery({
    queryKey: ["integrations", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("tenant_id", currentTenant!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const getStatus = (integrationId: string) => {
    const found = dbIntegrations.find(
      (i) => i.type === integrationId || i.name.toLowerCase() === integrationId
    );
    if (!found) return { connected: false, active: false, record: null };
    return { connected: true, active: found.active, record: found };
  };

  const openConfig = (id: string) => {
    setFormValues({});
    setConfigDialog(id);
  };

  const handleSave = () => {
    toast.success("Configuração salva com sucesso");
    setConfigDialog(null);
  };

  const selectedIntegration = integrations.find((i) => i.id === configDialog);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conecte serviços externos para expandir as funcionalidades da plataforma
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Plug className="h-3 w-3" />
          {dbIntegrations.filter((i) => i.active).length} ativa{dbIntegrations.filter((i) => i.active).length !== 1 ? "s" : ""}
        </Badge>
      </motion.div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration, i) => {
          const status = getStatus(integration.id);
          const Icon = integration.icon;

          return (
            <motion.div key={integration.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <Card className={cn("relative overflow-hidden transition-shadow hover:shadow-md", status.active && "ring-1 ring-primary/20")}>
                {/* Status indicator bar */}
                <div className={cn("absolute top-0 left-0 right-0 h-0.5", status.active ? "bg-emerald-500" : status.connected ? "bg-amber-500" : "bg-muted")} />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", integration.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <div className="flex items-center gap-1.5 mt-1">
                          {status.active ? (
                            <Badge variant="default" className="gap-1 text-[10px] h-5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
                              <CheckCircle2 className="h-3 w-3" /> Conectado
                            </Badge>
                          ) : status.connected ? (
                            <Badge variant="secondary" className="gap-1 text-[10px] h-5">
                              <RefreshCw className="h-3 w-3" /> Inativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-[10px] h-5 text-muted-foreground">
                              <XCircle className="h-3 w-3" /> Desconectado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {integration.description}
                  </p>

                  {/* Features list */}
                  <div className="flex flex-wrap gap-1.5">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-[10px] font-normal h-5">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    {status.connected && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Ativo</span>
                        <Switch checked={status.active} disabled />
                      </div>
                    )}
                    <Button
                      variant={status.connected ? "outline" : "default"}
                      size="sm"
                      className="gap-1.5 ml-auto"
                      onClick={() => openConfig(integration.id)}
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      {status.connected ? "Configurar" : "Conectar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Config Dialog */}
      <Dialog open={!!configDialog} onOpenChange={(open) => !open && setConfigDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedIntegration && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", selectedIntegration.color)}>
                    <selectedIntegration.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <DialogTitle>Configurar {selectedIntegration.name}</DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">
                      Insira as credenciais para conectar a integração
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {selectedIntegration.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-sm">
                      {field.secret && <Key className="h-3 w-3 text-muted-foreground" />}
                      {field.label}
                    </Label>
                    <Input
                      type={field.secret ? "password" : "text"}
                      placeholder={field.placeholder}
                      value={formValues[field.key] || ""}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Ativar integração</p>
                    <p className="text-xs text-muted-foreground">Habilitar após salvar as credenciais</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setConfigDialog(null)}>Cancelar</Button>
                <Button onClick={handleSave} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Salvar e Conectar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoreIntegrations;
