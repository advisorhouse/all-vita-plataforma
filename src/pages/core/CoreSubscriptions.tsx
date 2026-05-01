import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, TrendingUp, RefreshCw, XCircle, Search, 
  Calendar, Users, DollarSign, Activity, Zap, ShoppingCart, 
  Download, Pause, CheckCircle, ShoppingBag, ArrowRight,
  ExternalLink, Filter
} from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
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

  const { data: salesData, isLoading, refetch } = useQuery({
    queryKey: ["sales-hub", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;

      const [ordersRes, subsRes, shopifyRes] = await Promise.all([
        supabase.from("orders").select("*").eq("tenant_id", currentTenant.id),
        supabase.from("subscriptions").select("*").eq("tenant_id", currentTenant.id),
        supabase.from("integrations").select("*").eq("tenant_id", currentTenant.id).eq("type", "shopify").maybeSingle()
      ]);

      return {
        orders: ordersRes.data || [],
        subscriptions: subsRes.data || [],
        shopifyConnected: !!shopifyRes.data?.active
      };
    },
    enabled: !!currentTenant?.id
  });

  const handleShopifySync = async () => {
    toast.info("Iniciando sincronização com Shopify...");
    // Mocking sync behavior
    setTimeout(() => {
      toast.success("Sincronização concluída com sucesso!");
      refetch();
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Vendas & Assinaturas</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe pedidos, assinaturas e sincronize sua loja.</p>
        </div>
        
        {salesData?.shopifyConnected ? (
          <Button variant="outline" size="sm" onClick={handleShopifySync} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Atualizar Loja
          </Button>
        ) : (
          <Button variant="secondary" size="sm" className="gap-2" onClick={() => toast.error("Integração Shopify não configurada")}>
            <ShoppingCart className="h-4 w-4" /> Shopify Desconectada
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" />Resumo</TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5 text-xs"><ShoppingBag className="h-3.5 w-3.5" />Pedidos / Vendas</TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" />Assinaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{salesData?.orders.length || 0}</div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{salesData?.subscriptions.filter(s => s.status === 'active').length || 0}</div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">MRR Atual</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ 0,00</div>
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Pedido</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesData?.orders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id.slice(0, 8)}</TableCell>
                                    <TableCell>{order.payment_status}</TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>R$ {order.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Assinaturas</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Início</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesData?.subscriptions.map((sub: any) => (
                                <TableRow key={sub.id}>
                                    <TableCell>{sub.id.slice(0, 8)}</TableCell>
                                    <TableCell>{sub.status}</TableCell>
                                    <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoreSalesHub;
