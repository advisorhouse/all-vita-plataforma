import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import {
  ShoppingCart, CreditCard, Brain, Mic, Settings2,
  CheckCircle2, XCircle, Loader2, ExternalLink, Plug,
  Key, Globe, RefreshCw, ChevronRight, Truck, ScrollText
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
    id: "bling",
    name: "Bling ERP",
    description: "Gestão de estoque, pedidos e integração com marketplaces. Centralize sua operação.",
    icon: Box,
    color: "bg-orange-500/10 text-orange-600",
    docsUrl: "https://ajuda.bling.com.br/hc/pt-br/articles/360046425313-API-do-Bling",
    fields: [
      { key: "api_key", label: "API Key (V2 ou V3)", placeholder: "apikey_...", secret: true },
    ],
    features: ["Sincronização de estoque", "Importação de pedidos", "Gestão de produtos"],
  },
  {
    id: "enotas",
    name: "eNotas",
    description: "Emissão automatizada de notas fiscais de serviço (NFS-e) e produto (NF-e).",
    icon: ScrollText,
    color: "bg-blue-500/10 text-blue-600",
    docsUrl: "https://docs.enotas.com.br",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "...", secret: true },
      { key: "company_id", label: "ID da Empresa", placeholder: "..." },
    ],
    features: ["Emissão de NFS-e", "Emissão de NF-e", "Cancelamento automático"],
  },
  {
    id: "melhorenvio",
    name: "Melhor Envio",
    description: "Gestão de fretes e logística. Calcule fretes, gere etiquetas e rastreie envios.",
    icon: Truck,
    color: "bg-yellow-500/10 text-yellow-700",
    docsUrl: "https://docs.melhorenvio.com.br",
    fields: [
      { key: "api_token", label: "API Token", placeholder: "Bearer ...", secret: true },
    ],
    features: ["Cálculo de frete", "Geração de etiquetas", "Rastreamento"],
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    description: "Gateway de pagamento brasileiro. Processe transações e gerencie recorrências.",
    icon: CreditCard,
    color: "bg-emerald-500/10 text-emerald-600",
    docsUrl: "https://docs.pagar.me",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "ak_live_...", secret: true },
      { key: "encryption_key", label: "Encryption Key", placeholder: "ek_live_...", secret: true },
    ],
    features: ["Pagamentos", "Assinaturas", "Split de pagamento"],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "IA para predição de churn, projeções financeiras e assistentes inteligentes.",
    icon: Brain,
    color: "bg-violet-500/10 text-violet-600",
    docsUrl: "https://platform.openai.com/docs",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "sk-...", secret: true },
    ],
    features: ["Predição de churn", "Projeções de LTV", "Análise de dados"],
  },
];


const CoreIntegrations: React.FC = () => {
  const { currentTenant } = useTenant();
  const [configDialog, setConfigDialog] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isIntegrationActive, setIsIntegrationActive] = useState(true);

  const { data: dbIntegrations = [], isLoading, refetch } = useQuery({
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
    const status = getStatus(id);
    if (status.connected && status.record?.config) {
      setFormValues(status.record.config as Record<string, string>);
      setIsIntegrationActive(status.active);
    } else {
      setFormValues({});
      setIsIntegrationActive(true);
    }
    setConfigDialog(id);
  };

  const handleSave = async () => {
    if (!currentTenant?.id || !configDialog) return;
    
    setIsSaving(true);
    try {
      const selected = integrations.find(i => i.id === configDialog);
      const status = getStatus(configDialog);
      
      const integrationData = {
        tenant_id: currentTenant.id,
        type: configDialog,
        name: selected?.name || configDialog,
        config: formValues,
        active: isIntegrationActive,
      };

      let error;
      if (status.connected && status.record) {
        ({ error } = await supabase
          .from("integrations")
          .update(integrationData)
          .eq("id", status.record.id));
      } else {
        ({ error } = await supabase
          .from("integrations")
          .insert([integrationData]));
      }

      if (error) throw error;

      toast.success(`${selected?.name || "Integração"} configurada com sucesso`);
      await refetch();
      setConfigDialog(null);
    } catch (error: any) {
      console.error("Error saving integration:", error);
      toast.error("Erro ao salvar configuração: " + error.message);
    } finally {
      setIsSaving(false);
    }
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
                  <Switch 
                    checked={isIntegrationActive} 
                    onCheckedChange={setIsIntegrationActive} 
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setConfigDialog(null)} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="gap-1.5" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {isSaving ? "Salvando..." : "Salvar e Conectar"}
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
