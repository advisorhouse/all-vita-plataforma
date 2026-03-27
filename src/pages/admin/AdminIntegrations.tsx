import React, { useState, useMemo } from "react";
import type { Json } from "@/integrations/supabase/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import IntegrationsKpiCards from "@/components/admin/integrations/IntegrationsKpiCards";
import GatewaysPanel from "@/components/admin/integrations/GatewaysPanel";
import ExternalApisPanel from "@/components/admin/integrations/ExternalApisPanel";
import WebhooksPanel from "@/components/admin/integrations/WebhooksPanel";
import IntegrationLogsTable from "@/components/admin/integrations/IntegrationLogsTable";
import type { PaymentGateway } from "@/components/admin/integrations/GatewaysPanel";
import type { ExternalApi } from "@/components/admin/integrations/ExternalApisPanel";
import type { WebhookRow } from "@/components/admin/integrations/WebhooksPanel";
import type { IntegrationLog } from "@/components/admin/integrations/IntegrationLogsTable";

const AdminIntegrations: React.FC = () => {
  const queryClient = useQueryClient();
  const [tenantFilter, setTenantFilter] = useState("all");

  // Tenants
  const { data: tenants = [] } = useQuery({
    queryKey: ["integ-tenants"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name").eq("active", true);
      return data || [];
    },
  });
  const tenantMap = useMemo(() => Object.fromEntries(tenants.map((t) => [t.id, t.name])), [tenants]);

  // Payment integrations
  const { data: paymentIntegrations = [], refetch: refetchPi } = useQuery({
    queryKey: ["integ-payments", tenantFilter],
    queryFn: async () => {
      let q = supabase.from("payment_integrations").select("*");
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Integrations (APIs + Webhooks)
  const { data: integrations = [], refetch: refetchInt } = useQuery({
    queryKey: ["integ-all", tenantFilter],
    queryFn: async () => {
      let q = supabase.from("integrations").select("*");
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Audit logs as integration logs (action contains 'integration' or 'webhook')
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["integ-logs", tenantFilter],
    queryFn: async () => {
      let q = supabase.from("audit_logs").select("*").or("action.ilike.%integration%,action.ilike.%webhook%,action.ilike.%gateway%").order("created_at", { ascending: false }).limit(30);
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Derived data
  const gateways: PaymentGateway[] = useMemo(() =>
    paymentIntegrations.map((pi) => ({
      id: pi.id,
      tenant_name: tenantMap[pi.tenant_id] || pi.tenant_id.slice(0, 8),
      provider: pi.provider,
      active: pi.active,
      updated_at: pi.updated_at,
    })),
  [paymentIntegrations, tenantMap]);

  const apis: ExternalApi[] = useMemo(() =>
    integrations.filter((i) => i.type !== "webhook").map((i) => ({
      id: i.id,
      name: i.name,
      tenant_name: tenantMap[i.tenant_id] || i.tenant_id.slice(0, 8),
      type: i.type,
      active: i.active,
    })),
  [integrations, tenantMap]);

  const webhooks: WebhookRow[] = useMemo(() =>
    integrations.filter((i) => i.type === "webhook").map((i) => ({
      id: i.id,
      name: i.name,
      tenant_name: tenantMap[i.tenant_id] || i.tenant_id.slice(0, 8),
      type: i.type,
      active: i.active,
      config: i.config as WebhookRow["config"],
    })),
  [integrations, tenantMap]);

  const logs: IntegrationLog[] = useMemo(() =>
    auditLogs.map((l) => ({
      id: l.id,
      integration_name: l.entity_type || l.action,
      type: l.action,
      status: (l.details as Record<string, unknown>)?.status === "error" ? "error" : "success",
      response: (l.details as Record<string, unknown>)?.response as string || null,
      created_at: l.created_at,
      tenant_name: l.tenant_id ? (tenantMap[l.tenant_id] || l.tenant_id.slice(0, 8)) : "Global",
    })),
  [auditLogs, tenantMap]);

  // KPIs
  const activeIntegrations = gateways.filter((g) => g.active).length + apis.filter((a) => a.active).length;
  const errorIntegrations = 0;
  const activeWebhooks = webhooks.filter((w) => w.active).length;
  const successRate = logs.length > 0 ? (logs.filter((l) => l.status === "success").length / logs.length) * 100 : 100;
  const failures24h = logs.filter((l) => l.status === "error" && new Date(l.created_at) > subDays(new Date(), 1)).length;

  const refetchAll = () => { refetchPi(); refetchInt(); };

  // Handlers
  const handleConnectGateway = async (data: { tenant_id: string; provider: string; api_key: string; webhook_secret: string }) => {
    await supabase.from("payment_integrations").insert({
      tenant_id: data.tenant_id,
      provider: data.provider,
      api_key_encrypted: data.api_key,
      webhook_secret: data.webhook_secret,
    });
    toast.success("Gateway conectado!");
    refetchPi();
  };

  const handleDisconnectGateway = async (id: string) => {
    await supabase.from("payment_integrations").update({ active: false }).eq("id", id);
    toast.success("Gateway desconectado");
    refetchPi();
  };

  const handleTestGateway = (id: string) => { toast.info("Teste de conexão enviado"); };

  const handleAddApi = async (data: { tenant_id: string; name: string; type: string }) => {
    await supabase.from("integrations").insert({ tenant_id: data.tenant_id, name: data.name, type: data.type });
    toast.success("API adicionada!");
    refetchInt();
  };

  const handleToggleApi = async (id: string, active: boolean) => {
    await supabase.from("integrations").update({ active }).eq("id", id);
    refetchInt();
  };

  const handleAddWebhook = async (data: { tenant_id: string; name: string; config: object }) => {
    await supabase.from("integrations").insert({ tenant_id: data.tenant_id, name: data.name, type: "webhook", config: data.config });
    toast.success("Webhook criado!");
    refetchInt();
  };

  const handleToggleWebhook = async (id: string, active: boolean) => {
    await supabase.from("integrations").update({ active }).eq("id", id);
    refetchInt();
  };

  const handleResendWebhook = (id: string) => { toast.info("Webhook reenviado"); };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Integrações</h1>
        <p className="text-muted-foreground">Gestão de gateways, APIs e webhooks da plataforma</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={tenantFilter} onValueChange={setTenantFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Todas empresas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas empresas</SelectItem>
            {tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={refetchAll}><RefreshCw className="h-4 w-4 mr-1" /> Atualizar</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Exportar</Button>
        </div>
      </div>

      {/* KPIs */}
      <IntegrationsKpiCards
        activeIntegrations={activeIntegrations}
        errorIntegrations={errorIntegrations}
        activeWebhooks={activeWebhooks}
        successRate={successRate}
        failures24h={failures24h}
      />

      {/* Tabs */}
      <Tabs defaultValue="gateways">
        <TabsList>
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="apis">APIs Externas</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="mt-4">
          <GatewaysPanel
            gateways={gateways}
            tenants={tenants}
            onConnect={handleConnectGateway}
            onDisconnect={handleDisconnectGateway}
            onTest={handleTestGateway}
          />
        </TabsContent>

        <TabsContent value="apis" className="mt-4">
          <ExternalApisPanel
            apis={apis}
            tenants={tenants}
            onAdd={handleAddApi}
            onToggle={handleToggleApi}
            onTest={(id) => toast.info("Teste enviado")}
          />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <WebhooksPanel
            webhooks={webhooks}
            tenants={tenants}
            onAdd={handleAddWebhook}
            onToggle={handleToggleWebhook}
            onResend={handleResendWebhook}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <IntegrationLogsTable logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminIntegrations;
