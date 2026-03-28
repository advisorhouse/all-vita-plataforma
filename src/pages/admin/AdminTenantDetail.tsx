import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TenantOverviewTab from "@/components/admin/tenants/detail/TenantOverviewTab";
import TenantEditTab from "@/components/admin/tenants/detail/TenantEditTab";
import TenantConfigTab from "@/components/admin/tenants/detail/TenantConfigTab";
import TenantAnalyticsTab from "@/components/admin/tenants/detail/TenantAnalyticsTab";
import SuspendTenantDialog from "@/components/admin/tenants/SuspendTenantDialog";

const AdminTenantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["admin-tenant", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: metrics } = useQuery({
    queryKey: ["admin-tenant-detail-metrics", id],
    queryFn: async () => {
      const [clientsRes, partnersRes, ordersRes] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", id!),
        supabase.from("partners").select("id", { count: "exact", head: true }).eq("tenant_id", id!),
        supabase.from("orders").select("amount").eq("tenant_id", id!).eq("payment_status", "paid"),
      ]);
      return {
        clients: clientsRes.count || 0,
        partners: partnersRes.count || 0,
        revenue: (ordersRes.data || []).reduce((s, o) => s + (Number(o.amount) || 0), 0),
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Empresa não encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/tenants")}>
          Voltar
        </Button>
      </div>
    );
  }

  const isActive = tenant.status === "active" || tenant.active !== false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tenants")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="h-12 w-12 rounded-xl object-contain border" />
          ) : (
            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: tenant.primary_color || "hsl(var(--primary))" }}>
              <Building2 className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{tenant.trade_name || tenant.name}</h1>
              <Badge variant={isActive ? "default" : "destructive"} className="text-[10px]">
                {isActive ? "Ativa" : "Suspensa"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <Globe className="h-3 w-3" /> {tenant.slug}.allvita.com.br
            </p>
          </div>
        </div>
        <Button
          variant={isActive ? "destructive" : "default"}
          size="sm"
          onClick={() => setSuspendOpen(true)}
        >
          {isActive ? "Suspender" : "Reativar"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="edit">Editar</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TenantOverviewTab tenant={tenant} metrics={metrics || { clients: 0, partners: 0, revenue: 0 }} />
        </TabsContent>
        <TabsContent value="edit">
          <TenantEditTab tenant={tenant} />
        </TabsContent>
        <TabsContent value="config">
          <TenantConfigTab tenant={tenant} />
        </TabsContent>
        <TabsContent value="analytics">
          <TenantAnalyticsTab tenantId={tenant.id} tenantName={tenant.trade_name || tenant.name} />
        </TabsContent>
      </Tabs>

      <SuspendTenantDialog
        tenant={tenant}
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
      />
    </div>
  );
};

export default AdminTenantDetail;
