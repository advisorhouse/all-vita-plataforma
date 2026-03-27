import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Building2, Users, Handshake, DollarSign, ShoppingCart, Coins, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface TenantDrillDownDrawerProps {
  tenantId: string | null;
  onClose: () => void;
  since: string;
}

const Stat = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
    <div className={`p-2 rounded-lg ${color}`}><Icon className="h-4 w-4" /></div>
    <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-bold text-sm">{value}</p></div>
  </div>
);

const TenantDrillDownDrawer: React.FC<TenantDrillDownDrawerProps> = ({ tenantId, onClose, since }) => {
  const navigate = useNavigate();

  const { data: tenant } = useQuery({
    queryKey: ["drilldown-tenant", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data } = await supabase.from("tenants").select("*").eq("id", tenantId).single();
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: stats } = useQuery({
    queryKey: ["drilldown-stats", tenantId, since],
    queryFn: async () => {
      if (!tenantId) return null;
      const [clients, partners, orders, commissions, wallets] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("partners").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("active", true),
        supabase.from("orders").select("amount, payment_status, created_at").eq("tenant_id", tenantId).gte("created_at", since),
        supabase.from("commissions").select("amount").eq("tenant_id", tenantId).gte("created_at", since),
        supabase.from("vitacoins_wallet").select("balance, total_earned").eq("tenant_id", tenantId),
      ]);
      const paidOrders = (orders.data || []).filter((o) => o.payment_status === "paid" || o.payment_status === "approved");
      const revenue = paidOrders.reduce((s, o) => s + Number(o.amount), 0);
      const totalComm = (commissions.data || []).reduce((s, c) => s + Number(c.amount), 0);
      const vcBalance = (wallets.data || []).reduce((s, w) => s + Number(w.balance), 0);
      const vcEarned = (wallets.data || []).reduce((s, w) => s + Number(w.total_earned), 0);
      return {
        clients: clients.count || 0,
        partners: partners.count || 0,
        totalOrders: (orders.data || []).length,
        revenue,
        commissions: totalComm,
        margin: revenue > 0 ? ((revenue - totalComm) / revenue) * 100 : 0,
        vcBalance,
        vcEarned,
      };
    },
    enabled: !!tenantId,
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["drilldown-recent-orders", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from("orders").select("id, amount, status, payment_status, created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <Sheet open={!!tenantId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {tenant?.name || "Carregando..."}
          </SheetTitle>
          {tenant && (
            <p className="text-sm text-muted-foreground">{tenant.slug}.allvita.com.br • {tenant.status === "active" ? "🟢 Ativa" : "🔴 Inativa"}</p>
          )}
        </SheetHeader>

        {stats && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Métricas do Período</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={DollarSign} label="Receita" value={fmt(stats.revenue)} color="text-emerald-600 bg-emerald-100" />
              <Stat icon={DollarSign} label="Comissões" value={fmt(stats.commissions)} color="text-orange-600 bg-orange-100" />
              <Stat icon={Users} label="Clientes" value={String(stats.clients)} color="text-blue-600 bg-blue-100" />
              <Stat icon={Handshake} label="Parceiros" value={String(stats.partners)} color="text-indigo-600 bg-indigo-100" />
              <Stat icon={ShoppingCart} label="Pedidos" value={String(stats.totalOrders)} color="text-amber-600 bg-amber-100" />
              <Stat icon={DollarSign} label="Margem" value={`${stats.margin.toFixed(1)}%`} color={stats.margin >= 30 ? "text-emerald-600 bg-emerald-100" : "text-red-600 bg-red-100"} />
              <Stat icon={Coins} label="Vitacoins Emitidos" value={stats.vcEarned.toLocaleString("pt-BR")} color="text-purple-600 bg-purple-100" />
              <Stat icon={Coins} label="Saldo VC" value={stats.vcBalance.toLocaleString("pt-BR")} color="text-purple-600 bg-purple-100" />
            </div>

            <Separator />

            <h3 className="text-sm font-semibold text-muted-foreground">Últimos Pedidos</h3>
            <div className="space-y-2">
              {recentOrders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum pedido</p>}
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-2 rounded bg-muted/40 text-sm">
                  <span className="text-muted-foreground">{format(new Date(o.created_at), "dd/MM HH:mm")}</span>
                  <span className="font-semibold">{fmt(Number(o.amount))}</span>
                  <Badge variant={o.payment_status === "paid" || o.payment_status === "approved" ? "default" : "secondary"}>
                    {o.payment_status === "paid" || o.payment_status === "approved" ? "Pago" : "Pendente"}
                  </Badge>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate("/admin/tenants")}>
                <ExternalLink className="h-4 w-4 mr-1" /> Ver Empresa
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TenantDrillDownDrawer;
