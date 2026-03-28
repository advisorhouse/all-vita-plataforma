import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, DollarSign, ShoppingCart, Handshake, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface TenantAnalyticsTabProps {
  tenantId: string;
  tenantName: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const TenantAnalyticsTab: React.FC<TenantAnalyticsTabProps> = ({ tenantId, tenantName }) => {
  // Orders over time
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["tenant-analytics-orders", tenantId],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("amount, created_at, payment_status")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: true });
      return data || [];
    },
  });

  // Clients over time
  const { data: clients = [] } = useQuery({
    queryKey: ["tenant-analytics-clients", tenantId],
    queryFn: async () => {
      const { data } = await supabase
        .from("clients")
        .select("created_at")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: true });
      return data || [];
    },
  });

  // Partners
  const { data: partners = [] } = useQuery({
    queryKey: ["tenant-analytics-partners", tenantId],
    queryFn: async () => {
      const { data } = await supabase
        .from("partners")
        .select("created_at, level")
        .eq("tenant_id", tenantId);
      return data || [];
    },
  });

  // Commissions
  const { data: commissions = [] } = useQuery({
    queryKey: ["tenant-analytics-commissions", tenantId],
    queryFn: async () => {
      const { data } = await supabase
        .from("commissions")
        .select("amount, paid_status, created_at")
        .eq("tenant_id", tenantId);
      return data || [];
    },
  });

  // Build monthly revenue chart
  const monthlyRevenue = React.useMemo(() => {
    const map: Record<string, number> = {};
    orders
      .filter((o: any) => o.payment_status === "paid")
      .forEach((o: any) => {
        const month = new Date(o.created_at).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
        map[month] = (map[month] || 0) + Number(o.amount);
      });
    return Object.entries(map).map(([month, value]) => ({ month, value }));
  }, [orders]);

  // Build client growth
  const clientGrowth = React.useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c: any) => {
      const month = new Date(c.created_at).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      map[month] = (map[month] || 0) + 1;
    });
    let cumulative = 0;
    return Object.entries(map).map(([month, count]) => {
      cumulative += count;
      return { month, total: cumulative };
    });
  }, [clients]);

  // Partner level distribution
  const partnerLevels = React.useMemo(() => {
    const map: Record<string, number> = {};
    partners.forEach((p: any) => {
      const lvl = p.level || "bronze";
      map[lvl] = (map[lvl] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [partners]);

  // KPIs
  const totalRevenue = orders.filter((o: any) => o.payment_status === "paid").reduce((s: number, o: any) => s + Number(o.amount), 0);
  const totalCommissions = commissions.reduce((s: number, c: any) => s + Number(c.amount), 0);
  const pendingCommissions = commissions.filter((c: any) => c.paid_status === "pending").reduce((s: number, c: any) => s + Number(c.amount), 0);

  const kpis = [
    { label: "Receita Total", value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-amber-600" },
    { label: "Pedidos", value: orders.length, icon: ShoppingCart, color: "text-blue-600" },
    { label: "Clientes", value: clients.length, icon: Users, color: "text-emerald-600" },
    { label: "Parceiros", value: partners.length, icon: Handshake, color: "text-purple-600" },
    { label: "Comissões Totais", value: `R$ ${totalCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-orange-600" },
    { label: "Comissões Pendentes", value: `R$ ${pendingCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: BarChart3, color: "text-red-500" },
  ];

  if (loadingOrders) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <k.icon className={`h-4 w-4 mx-auto mb-1 ${k.color}`} />
              <p className="text-lg font-bold">{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados de receita</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Client Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Crescimento de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {clientGrowth.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados de clientes</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={clientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Partner Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribuição de Parceiros por Nível</CardTitle>
          </CardHeader>
          <CardContent>
            {partnerLevels.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem parceiros</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={partnerLevels} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {partnerLevels.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Commission Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo de Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total pago</span>
                <span className="font-bold text-sm">
                  R$ {commissions.filter((c: any) => c.paid_status === "paid").reduce((s: number, c: any) => s + Number(c.amount), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pendente</span>
                <span className="font-bold text-sm text-orange-600">
                  R$ {pendingCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total de comissões</span>
                <span className="font-bold text-sm">{commissions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Margem (receita - comissões)</span>
                <span className="font-bold text-sm text-emerald-600">
                  R$ {(totalRevenue - totalCommissions).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantAnalyticsTab;
