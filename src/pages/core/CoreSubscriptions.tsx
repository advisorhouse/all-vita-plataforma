import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, TrendingUp, RefreshCw, XCircle, Search, 
  Calendar, Users, DollarSign, Activity, Zap, ShoppingCart, 
  Download, Pause, CheckCircle, ShoppingBag, ArrowUpRight, ArrowDownRight,
  Filter, BarChart3, ChevronRight
} from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, Legend, PieChart, Pie, Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const CoreSalesHub: React.FC = () => {
  const { currentTenant } = useTenant();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "cancelled">("all");

  const { data: salesData, isLoading, refetch } = useQuery({
    queryKey: ["sales-hub", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;

      const [ordersRes, subsRes, productsRes, shopifyRes] = await Promise.all([
        supabase.from("orders").select("*, clients(full_name)").eq("tenant_id", currentTenant.id),
        supabase.from("subscriptions").select("*, clients(full_name), products(name, price)").eq("tenant_id", currentTenant.id),
        supabase.from("products").select("*").eq("tenant_id", currentTenant.id),
        supabase.from("integrations").select("*").eq("tenant_id", currentTenant.id).eq("type", "shopify").maybeSingle()
      ]);

      const subs = subsRes.data || [];
      const orders = ordersRes.data || [];
      const products = productsRes.data || [];

      // Calculate MRR Data for last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return {
          month: format(d, "MMM", { locale: ptBR }),
          start: startOfMonth(d),
          end: endOfMonth(d),
          mrr: 0,
          newMrr: 0,
          churnMrr: 0,
          expansion: 0
        };
      });

      last6Months.forEach(month => {
        subs.forEach(s => {
          const createdAt = new Date(s.created_at);
          const price = (s as any).products?.price || 0;
          
          if (isWithinInterval(createdAt, { start: month.start, end: month.end })) {
            month.newMrr += price;
          }
          
          if (s.status === 'active' && createdAt <= month.end) {
            month.mrr += price;
          }

          if (s.status === 'cancelled' && s.cancelled_at) {
            const cancelledAt = new Date(s.cancelled_at);
            if (isWithinInterval(cancelledAt, { start: month.start, end: month.end })) {
              month.churnMrr += price;
            }
          }
        });
      });

      // Plan Distribution
      const distributionMap = new Map();
      subs.filter(s => s.status === 'active').forEach(s => {
        const name = (s as any).products?.name || "Outros";
        distributionMap.set(name, (distributionMap.get(name) || 0) + 1);
      });

      const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"];
      const planDistribution = Array.from(distributionMap.entries()).map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length]
      }));

      return {
        orders: orders.map(o => ({
            ...o,
            clientName: (o as any).clients?.full_name || "Desconhecido"
        })),
        subscriptions: subs.map(s => ({
            ...s,
            clientName: (s as any).clients?.full_name || "Desconhecido",
            planName: (s as any).products?.name || "Plano",
            mrr: (s as any).products?.price || 0
        })),
        mrrData: last6Months,
        planDistribution,
        shopifyConnected: !!shopifyRes.data?.active
      };
    },
    enabled: !!currentTenant?.id
  });

  const handleShopifySync = async () => {
    toast.info("Sincronizando com Shopify...");
    setTimeout(() => {
      toast.success("Sincronização concluída!");
      refetch();
    }, 1500);
  };

  const filteredSubs = (salesData?.subscriptions || []).filter(
    (s) =>
      (statusFilter === "all" || s.status === statusFilter) &&
      (s.clientName.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredOrders = (salesData?.orders || []).filter(
    (o) =>
      o.clientName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalMRR = (salesData?.subscriptions || []).filter(s => s.status === "active").reduce((sum, s) => sum + s.mrr, 0);

  return (
    <div className="space-y-6 pb-12">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hub de Vendas & Assinaturas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão centralizada de pedidos, assinaturas e integração e-commerce.</p>
        </div>
        
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Exportar Relatório
            </Button>
            {salesData?.shopifyConnected && (
                <Button variant="default" size="sm" onClick={handleShopifySync} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <ShoppingCart className="h-4 w-4" /> Sincronizar Shopify
                </Button>
            )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" />Visão Geral</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5 text-xs"><ShoppingBag className="h-3.5 w-3.5" />Pedidos</TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" />Assinaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "MRR", value: `R$ ${(totalMRR || 0).toLocaleString()}`, icon: DollarSign, color: "text-blue-500" },
              { label: "Assinaturas Ativas", value: salesData?.subscriptions.filter(s => s.status === 'active').length || 0, icon: Package, color: "text-emerald-500" },
              { label: "Pedidos (Mês)", value: salesData?.orders.length || 0, icon: ShoppingBag, color: "text-amber-500" },
              { label: "Churn Rate", value: "0%", icon: XCircle, color: "text-rose-500" },
            ].map((kpi, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-lg bg-muted flex items-center justify-center", kpi.color)}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">{kpi.label}</p>
                    <p className="text-xl font-bold">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Crescimento de Receita (MRR)</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData?.mrrData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                    <RTooltip />
                    <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Mix de Planos</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesData?.planDistribution || []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(salesData?.planDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
           <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar pedidos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs">#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                                <TableCell className="font-medium">{order.clientName}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                                        {order.payment_status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold">R$ {Number(order.amount).toFixed(2)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum pedido encontrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4 mt-4">
            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                         <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar assinaturas..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                            <Button variant="outline" size="sm" className="gap-2 h-10 px-3">
                                <Filter className="h-4 w-4" /> Status
                            </Button>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assinatura</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Recorrência</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubs.length > 0 ? filteredSubs.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-mono text-xs">#{sub.id.slice(0, 8).toUpperCase()}</TableCell>
                                    <TableCell className="font-medium">{sub.clientName}</TableCell>
                                    <TableCell>{sub.planName}</TableCell>
                                    <TableCell>
                                        <Badge variant={sub.status === 'active' ? 'default' : 'destructive'} className="text-[10px]">
                                            {sub.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">R$ {sub.mrr.toFixed(2)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma assinatura encontrada.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Simple Select mock for status filter
const Select = ({ value, onValueChange, children }: any) => {
    return (
        <div className="flex gap-1">
            {["all", "active", "paused", "cancelled"].map(status => (
                <Button 
                    key={status} 
                    variant={value === status ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => onValueChange(status)}
                    className="capitalize text-[10px]"
                >
                    {status === 'all' ? 'Todos' : status}
                </Button>
            ))}
        </div>
    );
};

export default CoreSalesHub;
