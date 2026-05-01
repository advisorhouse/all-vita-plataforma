import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  CreditCard, Wallet, Receipt, Download, Calendar, FileText,
  BarChart3, PieChart as PieChartIcon, Landmark, CircleDollarSign,
  CheckCircle, Clock, XCircle, Users, Banknote, RefreshCw, Truck, ScrollText,
  ShoppingCart, ExternalLink
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InfoTip } from "@/components/ui/info-tip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell,
  ComposedChart, Line,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Mock Data ─── */
const REVENUE_MONTHLY = [
  { month: "Set", receita: 42800, custos: 14980, comissoes: 5350, lucro: 22470 },
  { month: "Out", receita: 51200, custos: 17920, comissoes: 6400, lucro: 26880 },
  { month: "Nov", receita: 58900, custos: 20615, comissoes: 7360, lucro: 30925 },
  { month: "Dez", receita: 64300, custos: 22505, comissoes: 8040, lucro: 33755 },
  { month: "Jan", receita: 71500, custos: 25025, comissoes: 8940, lucro: 37535 },
  { month: "Fev", receita: 78200, custos: 27370, comissoes: 9780, lucro: 41050 },
];

const CASHFLOW_DATA = [
  { month: "Set", entradas: 42800, saidas: 20330, saldo: 22470 },
  { month: "Out", entradas: 51200, saidas: 24320, saldo: 26880 },
  { month: "Nov", entradas: 58900, saidas: 27975, saldo: 30925 },
  { month: "Dez", entradas: 64300, saidas: 30545, saldo: 33755 },
  { month: "Jan", entradas: 71500, saidas: 33965, saldo: 37535 },
  { month: "Fev", entradas: 78200, saidas: 37150, saldo: 41050 },
];

const EXPENSE_BREAKDOWN = [
  { name: "Produto/Envio", value: 27370, color: "hsl(var(--primary))" },
  { name: "Comissões", value: 9780, color: "hsl(var(--accent))" },
  { name: "Marketing", value: 4690, color: "hsl(var(--destructive))" },
  { name: "Operacional", value: 3910, color: "hsl(var(--muted-foreground))" },
  { name: "Plataforma", value: 1560, color: "hsl(var(--warning))" },
];

const PAYOUTS = [
  { id: "PAY-042", partner: "Dra. Marina Costa", amount: 2450.80, status: "paid", date: "28/02/2026", method: "PIX", clients: 12 },
  { id: "PAY-041", partner: "Dr. Ricardo Alves", amount: 1890.50, status: "paid", date: "28/02/2026", method: "PIX", clients: 9 },
  { id: "PAY-040", partner: "Dra. Camila Reis", amount: 1340.20, status: "paid", date: "28/02/2026", method: "PIX", clients: 7 },
  { id: "PAY-039", partner: "Dr. Felipe Santos", amount: 980.00, status: "paid", date: "28/02/2026", method: "PIX", clients: 5 },
  { id: "PAY-038", partner: "Dra. Marina Costa", amount: 2280.40, status: "paid", date: "28/01/2026", method: "PIX", clients: 11 },
  { id: "PAY-037", partner: "Dr. Ricardo Alves", amount: 1750.90, status: "paid", date: "28/01/2026", method: "PIX", clients: 8 },
];

const PENDING_PAYOUTS = [
  { partner: "Dra. Marina Costa", amount: 2680.30, clients: 13, dueDate: "28/03/2026" },
  { partner: "Dr. Ricardo Alves", amount: 2010.70, clients: 10, dueDate: "28/03/2026" },
  { partner: "Dra. Camila Reis", amount: 1520.40, clients: 8, dueDate: "28/03/2026" },
  { partner: "Dr. Felipe Santos", amount: 1180.60, clients: 6, dueDate: "28/03/2026" },
  { partner: "Dra. Juliana Mota", amount: 890.20, clients: 4, dueDate: "28/03/2026" },
];

const INVOICES = [
  { id: "NF-1892", client: "Maria S.", amount: 199.90, status: "paid", date: "15/02/2026", partner: "Dra. Marina Costa" },
  { id: "NF-1891", client: "Ana P.", amount: 149.90, status: "paid", date: "15/02/2026", partner: "Dr. Ricardo Alves" },
  { id: "NF-1890", client: "Juliana M.", amount: 199.90, status: "paid", date: "14/02/2026", partner: "Dra. Marina Costa" },
  { id: "NF-1889", client: "Carla R.", amount: 149.90, status: "pending", date: "14/02/2026", partner: "Dra. Camila Reis" },
  { id: "NF-1888", client: "Fernanda L.", amount: 499.70, status: "paid", date: "13/02/2026", partner: "Dr. Ricardo Alves" },
  { id: "NF-1887", client: "Patrícia D.", amount: 149.90, status: "overdue", date: "10/02/2026", partner: "Dra. Camila Reis" },
  { id: "NF-1886", client: "Beatriz G.", amount: 199.90, status: "paid", date: "08/02/2026", partner: "Dra. Marina Costa" },
  { id: "NF-1885", client: "Camila V.", amount: 199.90, status: "paid", date: "08/02/2026", partner: "Dr. Ricardo Alves" },
];

const CoreFinance: React.FC = () => {
  const { currentTenant } = useTenant();

  const { data: financeData, isLoading } = useQuery({
    queryKey: ["core-finance", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;

      const [ordersRes, commissionsRes, partnersRes, integrationsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*, clients(full_name)")
          .eq("tenant_id", currentTenant.id),
        supabase
          .from("commissions")
          .select("*, partners(full_name)")
          .eq("tenant_id", currentTenant.id),
        supabase
          .from("partners")
          .select("id, full_name")
          .eq("tenant_id", currentTenant.id),
        supabase
          .from("integrations")
          .select("*")
          .eq("tenant_id", currentTenant.id)
          .eq("active", true)
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (commissionsRes.error) throw commissionsRes.error;
      if (partnersRes.error) throw partnersRes.error;
      if (integrationsRes.error) throw integrationsRes.error;

      const orders = ordersRes.data || [];
      const commissions = commissionsRes.data || [];
      const activeIntegrations = integrationsRes.data || [];
      
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return {
          month: format(d, "MMM", { locale: ptBR }),
          start: startOfMonth(d),
          end: endOfMonth(d),
          receita: 0,
          custos: 0,
          comissoes: 0,
          lucro: 0,
          entradas: 0,
          saidas: 0,
          saldo: 0
        };
      });

      last6Months.forEach(m => {
        orders.forEach(o => {
          const createdAt = new Date(o.created_at);
          if (isWithinInterval(createdAt, { start: m.start, end: m.end })) {
            if (o.payment_status === 'paid') {
              m.receita += Number(o.amount) || 0;
              m.entradas += Number(o.amount) || 0;
            }
          }
        });

        commissions.forEach(c => {
          const createdAt = new Date(c.created_at);
          if (isWithinInterval(createdAt, { start: m.start, end: m.end })) {
            m.comissoes += Number(c.amount) || 0;
            if (c.paid_status === 'paid') {
              m.saidas += Number(c.amount) || 0;
            }
          }
        });

        m.custos = m.receita * 0.35 + m.comissoes; // Estimate 35% base cost + commissions
        m.lucro = m.receita - m.custos;
        m.saldo = m.entradas - m.saidas;
      });

      const currentMonth = last6Months[5];
      const paidCommissionsThisMonth = commissions
        .filter(c => c.paid_status === 'paid')
        .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
      
      const pendingCommissions = commissions
        .filter(c => c.paid_status === 'pending')
        .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

      const expenseBreakdown = [
        { name: "Comissões", value: currentMonth.comissoes, color: "hsl(var(--accent))" },
        { name: "Operacional (Est.)", value: currentMonth.receita * 0.35, color: "hsl(var(--primary))" },
      ];

      return {
        revenueMonthly: last6Months,
        cashflowData: last6Months,
        expenseBreakdown,
        totalRevenue: currentMonth.receita,
        totalExpenses: currentMonth.custos,
        netProfit: currentMonth.lucro,
        paidThisMonth: paidCommissionsThisMonth,
        pendingTotal: pendingCommissions,
        activeIntegrations,
        invoices: orders.map(o => ({
          id: o.id.slice(0, 8).toUpperCase(),
          client: (o as any).clients?.full_name || "Cliente",
          amount: Number(o.amount) || 0,
          status: o.payment_status === 'paid' ? 'paid' : (o.payment_status === 'pending' ? 'pending' : 'overdue'),
          date: format(new Date(o.created_at), "dd/MM/yyyy"),
          partner: "—",
          external_id: o.external_id
        })),
        payouts: commissions.filter(c => c.paid_status === 'paid').map(c => ({
          id: c.id.slice(0, 8).toUpperCase(),
          partner: (c as any).partners?.full_name || "Partner",
          amount: Number(c.amount) || 0,
          status: "paid",
          date: format(new Date(c.created_at), "dd/MM/yyyy"),
          method: "PIX",
          clients: 1
        })),
        pendingPayouts: commissions.filter(c => c.paid_status === 'pending').slice(0, 5).map(c => ({
          partner: (c as any).partners?.full_name || "Partner",
          amount: Number(c.amount) || 0,
          clients: 1,
          dueDate: "—"
        })),
        freights: activeIntegrations.some(i => i.type === 'melhorenvio') ? [
          { id: "ME-1029", orderId: "ORD-991", carrier: "Jadlog", cost: 24.90, status: "posted", date: "28/02/2026" },
          { id: "ME-1028", orderId: "ORD-990", carrier: "Correios", cost: 18.50, status: "delivered", date: "27/02/2026" },
        ] : [],
        fiscalInvoices: activeIntegrations.some(i => i.type === 'enotas') ? [
          { id: "NFS-882", orderId: "ORD-991", status: "issued", date: "28/02/2026" },
          { id: "NFS-881", orderId: "ORD-990", status: "issued", date: "27/02/2026" },
        ] : []
      };
    },
    enabled: !!currentTenant?.id
  });

  const data = financeData || {
    revenueMonthly: REVENUE_MONTHLY,
    cashflowData: CASHFLOW_DATA,
    expenseBreakdown: EXPENSE_BREAKDOWN,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    paidThisMonth: 0,
    pendingTotal: 0,
    activeIntegrations: [],
    invoices: INVOICES,
    payouts: PAYOUTS,
    pendingPayouts: PENDING_PAYOUTS,
    freights: [],
    fiscalInvoices: []
  };

  const totalRevenue = data.totalRevenue;
  const netProfit = data.netProfit;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";
  const pendingTotal = data.pendingTotal;
  const paidThisMonth = data.paidThisMonth;

  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-6 pb-12">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}
      {/* KPIs */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Receita Mensal", value: `R$ ${(totalRevenue / 1000).toFixed(1)}k`, change: "+9.4%", up: true, icon: DollarSign, tip: "Receita bruta total do mês corrente, somando todas as assinaturas e vendas avulsas." },
          { label: "Lucro Líquido", value: `R$ ${(netProfit / 1000).toFixed(1)}k`, change: "+9.3%", up: true, icon: TrendingUp, tip: "Receita menos todos os custos (produto, envio, comissões, marketing, plataforma)." },
          { label: "Margem Líquida", value: `${profitMargin}%`, change: "+0.2pp", up: true, icon: BarChart3, tip: "Percentual de lucro sobre a receita. Acima de 50% é considerado excelente para o segmento." },
          { label: "Comissões Pagas", value: `R$ ${(paidThisMonth / 1000).toFixed(1)}k`, change: "+8.1%", up: true, icon: Banknote, tip: "Total de comissões já pagas aos partners neste mês." },
          { label: "A Pagar (Próx.)", value: `R$ ${(pendingTotal / 1000).toFixed(1)}k`, change: `${PENDING_PAYOUTS.length} partners`, up: false, icon: Clock, tip: "Comissões pendentes de pagamento para o próximo ciclo." },
        ].map(({ label, value, change, up, icon: Icon, tip }) => (
          <Card key={label} className="border border-border shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  <InfoTip text={tip} />
                </div>
              </div>
              <p className="text-xl font-semibold text-foreground">{value}</p>
              <p className={cn("text-[10px] font-medium flex items-center gap-0.5",
                up ? "text-primary" : "text-muted-foreground"
              )}>
                {up && <ArrowUpRight className="h-3 w-3" />}
                {change}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Active Integrations */}
      <div className="flex flex-wrap gap-2">
        {['shopify', 'pagarme', 'melhorenvio', 'enotas'].map(type => {
          const integration = data.activeIntegrations.find(i => i.type === type);
          const labels: Record<string, string> = { 
            shopify: 'Shopify', 
            pagarme: 'Pagar.me', 
            melhorenvio: 'Melhor Envio', 
            enotas: 'eNotas' 
          };
          const Icons: Record<string, any> = { 
            shopify: ShoppingCart, 
            pagarme: CreditCard, 
            melhorenvio: Truck, 
            enotas: ScrollText 
          };
          const Icon = Icons[type];
          
          return (
            <Badge 
              key={type} 
              variant={integration ? "default" : "outline"}
              className={cn(
                "gap-1.5 py-1 px-3 text-[10px] font-medium transition-all",
                integration 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" 
                  : "text-muted-foreground/60 opacity-60"
              )}
            >
              <Icon className="h-3 w-3" />
              {labels[type]}
              {integration ? (
                <CheckCircle className="h-2.5 w-2.5 ml-0.5" />
              ) : (
                <XCircle className="h-2.5 w-2.5 ml-0.5" />
              )}
            </Badge>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Visão Geral</TabsTrigger>
          <TabsTrigger value="payouts" className="gap-1.5 text-xs"><Banknote className="h-3.5 w-3.5" />Repasses</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5 text-xs"><Receipt className="h-3.5 w-3.5" />Faturamento</TabsTrigger>
          <TabsTrigger value="freights" className="gap-1.5 text-xs"><Truck className="h-3.5 w-3.5" />Logística</TabsTrigger>
          <TabsTrigger value="tax" className="gap-1.5 text-xs"><ScrollText className="h-3.5 w-3.5" />Fiscal</TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-1.5 text-xs"><Wallet className="h-3.5 w-3.5" />Fluxo de Caixa</TabsTrigger>
        </TabsList>

        {/* ===== VISÃO GERAL ===== */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-4 lg:grid-cols-5">
            {/* Revenue vs Expenses Chart */}
            <Card className="border border-border shadow-sm lg:col-span-3">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Receita vs. Custos vs. Lucro</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />CSV</Button>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.revenueMonthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
                        formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="custos" name="Custos" fill="hsl(var(--muted-foreground)/0.4)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="comissoes" name="Comissões" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
                      <Line type="monotone" dataKey="lucro" name="Lucro" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card className="border border-border shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Composição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.expenseBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                        {data.expenseBreakdown.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
                        formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {data.expenseBreakdown.map((e: any) => (
                    <div key={e.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                        <span className="text-[10px] text-muted-foreground">{e.name}</span>
                      </div>
                      <span className="text-[10px] font-medium text-foreground">R$ {(e.value / 1000).toFixed(1)}k</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Margin Health */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Saúde Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Margem Bruta", value: "65.0%", bar: 65, status: "Saudável" },
                    { label: "Margem Líquida", value: `${profitMargin}%`, bar: parseFloat(profitMargin), status: "Saudável" },
                    { label: "Comissão/Receita", value: "12.5%", bar: 12.5, status: "Dentro da meta" },
                    { label: "CAC Payback", value: "2.8 meses", bar: 72, status: "Eficiente" },
                  ].map((m) => (
                    <div key={m.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
                        <Badge variant="secondary" className="text-[9px]">{m.status}</Badge>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{m.value}</p>
                      <Progress value={m.bar} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== REPASSES ===== */}
        <TabsContent value="payouts" className="space-y-4 mt-4">
          {/* Pending Payouts */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Repasses Pendentes — Março/2026
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">R$ {pendingTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.pendingPayouts.map((p: any) => (
                    <div key={p.partner} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                          {p.partner.split(" ").slice(-1)[0][0]}{p.partner.split(" ").slice(-2)[0][0]}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{p.partner}</p>
                          <p className="text-[10px] text-muted-foreground">{p.clients} clientes · Venc. {p.dueDate}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground">R$ {p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payout History */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Histórico de Repasses</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />Exportar</Button>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">ID</TableHead>
                    <TableHead className="text-[10px]">Partner</TableHead>
                    <TableHead className="text-[10px]">Clientes</TableHead>
                    <TableHead className="text-[10px]">Método</TableHead>
                    <TableHead className="text-[10px]">Data</TableHead>
                    <TableHead className="text-[10px] text-right">Valor</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payouts.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-[11px] font-mono text-muted-foreground">{p.id}</TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{p.partner}</TableCell>
                      <TableCell className="text-xs text-foreground">{p.clients}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[9px]">{p.method}</Badge></TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{p.date}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-foreground">R$ {p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="text-[9px] gap-1">
                          <CheckCircle className="h-3 w-3" /> Pago
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== FATURAMENTO ===== */}
        <TabsContent value="invoices" className="space-y-4 mt-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Pagas", count: data.invoices.filter((i: any) => i.status === "paid").length, total: data.invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + i.amount, 0), icon: CheckCircle, color: "text-primary" },
              { label: "Pendentes", count: data.invoices.filter((i: any) => i.status === "pending").length, total: data.invoices.filter((i: any) => i.status === "pending").reduce((s: number, i: any) => s + i.amount, 0), icon: Clock, color: "text-accent-foreground" },
              { label: "Vencidas", count: data.invoices.filter((i: any) => i.status === "overdue").length, total: data.invoices.filter((i: any) => i.status === "overdue").reduce((s: number, i: any) => s + i.amount, 0), icon: XCircle, color: "text-destructive" },
            ].map((g) => (
              <Card key={g.label} className="border border-border shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <g.icon className={cn("h-5 w-5", g.color)} />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">{g.label} ({g.count})</p>
                    <p className="text-lg font-semibold text-foreground">R$ {g.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Notas Fiscais</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />Exportar</Button>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">NF</TableHead>
                    <TableHead className="text-[10px]">Cliente</TableHead>
                    <TableHead className="text-[10px]">Partner</TableHead>
                    <TableHead className="text-[10px]">Data</TableHead>
                    <TableHead className="text-[10px] text-right">Valor</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.invoices.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-[11px] font-mono text-muted-foreground">{inv.id}</TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{inv.client}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{inv.partner}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{inv.date}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-foreground">R$ {inv.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={inv.status === "paid" ? "default" : inv.status === "pending" ? "secondary" : "destructive"} className="text-[9px] gap-1">
                          {inv.status === "paid" ? <><CheckCircle className="h-3 w-3" /> Paga</> :
                           inv.status === "pending" ? <><Clock className="h-3 w-3" /> Pendente</> :
                           <><XCircle className="h-3 w-3" /> Vencida</>}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== LOGÍSTICA ===== */}
        <TabsContent value="freights" className="space-y-4 mt-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Gestão de Envios (Melhor Envio)</CardTitle>
                  {!data.activeIntegrations.some(i => i.type === 'melhorenvio') && (
                    <p className="text-[10px] text-muted-foreground mt-1">Integração com Melhor Envio desativada.</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />Exportar</Button>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Etiqueta</TableHead>
                    <TableHead className="text-[10px]">Pedido</TableHead>
                    <TableHead className="text-[10px]">Transportadora</TableHead>
                    <TableHead className="text-[10px]">Custo</TableHead>
                    <TableHead className="text-[10px]">Data</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                    <TableHead className="text-[10px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.freights.length > 0 ? (
                    data.freights.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell className="text-[11px] font-mono text-muted-foreground">{f.id}</TableCell>
                        <TableCell className="text-xs font-medium text-foreground">{f.orderId}</TableCell>
                        <TableCell className="text-xs text-foreground">{f.carrier}</TableCell>
                        <TableCell className="text-xs text-foreground">R$ {f.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">{f.date}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[9px] gap-1">
                            {f.status === 'delivered' ? 'Entregue' : 'Postado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3 w-3" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                        Nenhum envio registrado. Conecte o Melhor Envio para começar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== FISCAL ===== */}
        <TabsContent value="tax" className="space-y-4 mt-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Emissão de Notas Fiscais (eNotas)</CardTitle>
                  {!data.activeIntegrations.some(i => i.type === 'enotas') && (
                    <p className="text-[10px] text-muted-foreground mt-1">Integração com eNotas desativada.</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />Sincronizar</Button>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">NF-e / NFS-e</TableHead>
                    <TableHead className="text-[10px]">Pedido</TableHead>
                    <TableHead className="text-[10px]">Data de Emissão</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                    <TableHead className="text-[10px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.fiscalInvoices.length > 0 ? (
                    data.fiscalInvoices.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell className="text-[11px] font-mono text-muted-foreground">{f.id}</TableCell>
                        <TableCell className="text-xs font-medium text-foreground">{f.orderId}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">{f.date}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-0">
                            Emitida
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px]"><Download className="h-3 w-3" /> PDF</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                        Nenhuma nota fiscal emitida. Conecte o eNotas para automação fiscal.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== FLUXO DE CAIXA ===== */}
        <TabsContent value="cashflow" className="space-y-4 mt-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Fluxo de Caixa — Últimos 6 Meses</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />CSV</Button>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.cashflowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
                        formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="entradas" name="Entradas" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="saidas" name="Saídas" fill="hsl(var(--destructive)/0.5)" radius={[3, 3, 0, 0]} />
                      <Line type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cash flow table */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Detalhamento Mensal</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Mês</TableHead>
                    <TableHead className="text-[10px] text-right">Entradas</TableHead>
                    <TableHead className="text-[10px] text-right">Saídas</TableHead>
                    <TableHead className="text-[10px] text-right">Saldo</TableHead>
                    <TableHead className="text-[10px] text-right">Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.cashflowData.map((row: any) => {
                    const margin = ((row.saldo / row.entradas) * 100).toFixed(1);
                    return (
                      <TableRow key={row.month}>
                        <TableCell className="text-xs font-medium text-foreground">{row.month}/2026</TableCell>
                        <TableCell className="text-right text-xs text-primary font-medium">R$ {row.entradas.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right text-xs text-destructive font-medium">R$ {row.saidas.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right text-xs font-semibold text-foreground">R$ {row.saldo.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="text-[9px]">{margin}%</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
};

export default CoreFinance;
