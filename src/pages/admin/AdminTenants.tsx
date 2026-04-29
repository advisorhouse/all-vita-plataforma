import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TenantKpiCards from "@/components/admin/tenants/TenantKpiCards";
import TenantFilters from "@/components/admin/tenants/TenantFilters";
import TenantTable from "@/components/admin/tenants/TenantTable";
import TenantDrawer from "@/components/admin/tenants/TenantDrawer";
import CreateTenantDialog from "@/components/admin/tenants/CreateTenantDialog";


const AdminTenants: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [tenantToResume, setTenantToResume] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const { data, error } = await supabase.functions.invoke("manage-users/delete-tenant", {
        body: { tenantId },
      });
      if (error) throw error;
      return data;
    },

    onSuccess: () => {
      toast.success("Empresa excluída com sucesso");
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
    },
    onError: (error: any) => {
      console.error("Error deleting tenant:", error);
      toast.error("Erro ao excluir empresa: " + (error.message || "Tente novamente mais tarde"));
    },
  });


  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch metrics per tenant
  const { data: clientsCounts = [] } = useQuery({
    queryKey: ["admin-tenant-metrics", "clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("tenant_id");
      return data || [];
    },
  });

  const { data: partnersCounts = [] } = useQuery({
    queryKey: ["admin-tenant-metrics", "partners"],
    queryFn: async () => {
      const { data } = await supabase.from("partners").select("tenant_id");
      return data || [];
    },
  });

  const { data: ordersData = [] } = useQuery({
    queryKey: ["admin-tenant-metrics", "orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("tenant_id, amount").eq("payment_status", "paid");
      return data || [];
    },
  });

  const tenantMetrics = useMemo(() => {
    const map: Record<string, { clients: number; partners: number; revenue: number }> = {};
    tenants.forEach((t: any) => {
      map[t.id] = { clients: 0, partners: 0, revenue: 0 };
    });
    clientsCounts.forEach((c: any) => {
      if (map[c.tenant_id]) map[c.tenant_id].clients++;
    });
    partnersCounts.forEach((p: any) => {
      if (map[p.tenant_id]) map[p.tenant_id].partners++;
    });
    ordersData.forEach((o: any) => {
      if (map[o.tenant_id]) map[o.tenant_id].revenue += Number(o.amount) || 0;
    });
    return map;
  }, [tenants, clientsCounts, partnersCounts, ordersData]);

  const totalClients = clientsCounts.length;
  const totalPartners = partnersCounts.length;
  const totalRevenue = ordersData.reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = [...tenants];

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t: any) =>
        (t.name || "").toLowerCase().includes(q) ||
        (t.trade_name || "").toLowerCase().includes(q) ||
        (t.slug || "").toLowerCase().includes(q) ||
        (t.cnpj || "").includes(q)
      );
    }

    // Status
    if (statusFilter === "active") {
      list = list.filter((t: any) => t.status === "active" || t.active !== false);
    } else if (statusFilter === "suspended") {
      list = list.filter((t: any) => t.status !== "active" && t.active === false);
    }

    // Sort
    if (sortBy === "name") {
      list.sort((a: any, b: any) => (a.trade_name || a.name).localeCompare(b.trade_name || b.name));
    } else if (sortBy === "clients") {
      list.sort((a: any, b: any) => (tenantMetrics[b.id]?.clients || 0) - (tenantMetrics[a.id]?.clients || 0));
    } else if (sortBy === "partners") {
      list.sort((a: any, b: any) => (tenantMetrics[b.id]?.partners || 0) - (tenantMetrics[a.id]?.partners || 0));
    }
    // "recent" is default order from query

    return list;
  }, [tenants, search, statusFilter, sortBy, tenantMetrics]);

  if (isLoading && tenants.length === 0) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de todas as empresas da plataforma All Vita
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/settings")}>
            <Settings className="h-4 w-4 mr-2" /> Configurações
          </Button>
          <CreateTenantDialog 
            open={isCreateDialogOpen} 
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) setTenantToResume(null);
            }}
            resumeTenant={tenantToResume}
          />
        </div>
      </div>

      {/* KPIs */}
      <TenantKpiCards
        tenants={tenants}
        clientsCount={totalClients}
        partnersCount={totalPartners}
        totalRevenue={totalRevenue}
      />

      {/* Filters */}
      <TenantFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Table */}
      <TenantTable
        tenants={filtered}
        tenantMetrics={tenantMetrics}
        onViewTenant={setSelectedTenant}
        onDeleteTenant={async (id) => {
          await deleteTenantMutation.mutateAsync(id);
        }}
        isDeleting={deleteTenantMutation.isPending ? deleteTenantMutation.variables : null}
        onResumeSetup={(tenant) => {
          setTenantToResume(tenant);
          setIsCreateDialogOpen(true);
        }}
      />


      {/* Drawer */}
      <TenantDrawer
        tenant={selectedTenant}
        open={!!selectedTenant}
        onClose={() => setSelectedTenant(null)}
        metrics={selectedTenant ? (tenantMetrics[selectedTenant.id] || { clients: 0, partners: 0, revenue: 0 }) : { clients: 0, partners: 0, revenue: 0 }}
      />
    </div>
  );
};

export default AdminTenants;
