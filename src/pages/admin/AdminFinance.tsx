import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import FinanceKpiCards from "@/components/admin/finance/FinanceKpiCards";
import FinanceFilters from "@/components/admin/finance/FinanceFilters";
import RevenueOverTimeChart from "@/components/admin/finance/RevenueOverTimeChart";
import RevenueByTenantTable from "@/components/admin/finance/RevenueByTenantTable";
import CommissionsDistributionChart from "@/components/admin/finance/CommissionsDistributionChart";
import VitacoinsFinancePanel from "@/components/admin/finance/VitacoinsFinancePanel";
import TransactionsTable from "@/components/admin/finance/TransactionsTable";
import PendingActionsPanel from "@/components/admin/finance/PendingActionsPanel";
import MarginChart from "@/components/admin/finance/MarginChart";
import TenantDrillDownDrawer from "@/components/admin/finance/TenantDrillDownDrawer";
import type { TenantRevenue } from "@/components/admin/finance/RevenueByTenantTable";
import type { TransactionRow } from "@/components/admin/finance/TransactionsTable";
import type { PendingItem } from "@/components/admin/finance/PendingActionsPanel";

const periodDays: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };

const AdminFinance: React.FC = () => {
  const [period, setPeriod] = useState("30d");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [drillDownTenantId, setDrillDownTenantId] = useState<string | null>(null);

  const since = useMemo(() => subDays(new Date(), periodDays[period] || 30).toISOString(), [period]);

  // Tenants
  const { data: tenants = [] } = useQuery({
    queryKey: ["admin-finance-tenants"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name, slug").eq("active", true);
      return data || [];
    },
  });

  // Orders
  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["admin-finance-orders", since, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*").gte("created_at", since);
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Commissions
  const { data: commissions = [] } = useQuery({
    queryKey: ["admin-finance-commissions", since, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("commissions").select("*").gte("created_at", since);
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Vitacoins wallets
  const { data: wallets = [] } = useQuery({
    queryKey: ["admin-finance-wallets"],
    queryFn: async () => {
      const { data } = await supabase.from("vitacoins_wallet").select("*");
      return data || [];
    },
  });

  // Vitacoin settings
  const { data: vcSettings } = useQuery({
    queryKey: ["admin-finance-vc-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("vitacoin_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  // Transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["admin-finance-transactions", since, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("transactions").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(20);
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Redemption requests pending
  const { data: pendingRedemptions = [] } = useQuery({
    queryKey: ["admin-finance-redemptions"],
    queryFn: async () => {
      const { data } = await supabase.from("redemption_requests").select("*").eq("status", "pending").limit(10);
      return data || [];
    },
  });

  // KPIs
  const totalRevenue = useMemo(() => orders.filter((o) => o.payment_status === "paid" || o.payment_status === "approved").reduce((s, o) => s + Number(o.amount), 0), [orders]);
  const totalCommissions = useMemo(() => commissions.reduce((s, c) => s + Number(c.amount), 0), [commissions]);
  const avgTicket = useMemo(() => (orders.length > 0 ? totalRevenue / orders.length : 0), [totalRevenue, orders]);
  const mrr = useMemo(() => {
    const recurring = orders.filter((o) => o.subscription_cycle > 1 && (o.payment_status === "paid" || o.payment_status === "approved"));
    return recurring.reduce((s, o) => s + Number(o.amount), 0);
  }, [orders]);
  const arr = mrr * 12;
  const margin = totalRevenue > 0 ? ((totalRevenue - totalCommissions) / totalRevenue) * 100 : 0;
  const growth = 0; // would need previous period comparison

  const totalVCEarned = useMemo(() => wallets.reduce((s, w) => s + Number(w.total_earned), 0), [wallets]);
  const totalVCRedeemed = useMemo(() => wallets.reduce((s, w) => s + Number(w.total_redeemed), 0), [wallets]);
  const totalVCBalance = useMemo(() => wallets.reduce((s, w) => s + Number(w.balance), 0), [wallets]);

  // Revenue over time chart
  const revenueChartData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.filter((o) => o.payment_status === "paid" || o.payment_status === "approved").forEach((o) => {
      const day = format(new Date(o.created_at), "dd/MM");
      map[day] = (map[day] || 0) + Number(o.amount);
    });
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
  }, [orders]);

  // Revenue by tenant
  const tenantRevenue: TenantRevenue[] = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    orders.filter((o) => o.payment_status === "paid" || o.payment_status === "approved").forEach((o) => {
      if (!map[o.tenant_id]) map[o.tenant_id] = { revenue: 0, orders: 0 };
      map[o.tenant_id].revenue += Number(o.amount);
      map[o.tenant_id].orders += 1;
    });
    const total = Object.values(map).reduce((s, v) => s + v.revenue, 0);
    return Object.entries(map)
      .map(([tid, v]) => ({
        id: tid,
        name: tenants.find((t) => t.id === tid)?.name || tid.slice(0, 8),
        revenue: v.revenue,
        growth: 0,
        share: total > 0 ? (v.revenue / total) * 100 : 0,
        orders: v.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders, tenants]);

  // Commissions by level
  const commByLevel = useMemo(() => {
    const map: Record<string, number> = {};
    commissions.forEach((c) => {
      const lv = c.commission_type || "Nível 1";
      map[lv] = (map[lv] || 0) + Number(c.amount);
    });
    return Object.entries(map).map(([level, amount]) => ({ level, amount }));
  }, [commissions]);

  const commByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    commissions.forEach((c) => {
      const st = c.paid_status === "paid" ? "Pago" : c.paid_status === "pending" ? "Pendente" : c.paid_status;
      map[st] = (map[st] || 0) + Number(c.amount);
    });
    return Object.entries(map).map(([status, amount]) => ({ status, amount }));
  }, [commissions]);

  // Transactions enriched
  const txRows: TransactionRow[] = useMemo(() => {
    const tMap = Object.fromEntries(tenants.map((t) => [t.id, t.name]));
    return transactions.map((tx) => ({
      id: tx.id,
      tenant_name: tMap[tx.tenant_id] || tx.tenant_id.slice(0, 8),
      amount: Number(tx.amount),
      status: tx.status,
      currency: tx.currency,
      created_at: tx.created_at,
      customer_name: tx.customer_name,
    }));
  }, [transactions, tenants]);

  // Pending items
  const pendingItems: PendingItem[] = useMemo(() => {
    return pendingRedemptions.map((r) => ({
      id: r.id,
      type: "redemption" as const,
      description: `Resgate de ${r.type === "cash" ? "dinheiro" : "produto"}`,
      amount: Number(r.amount),
      user_name: r.user_id.slice(0, 8),
      created_at: r.created_at,
    }));
  }, [pendingRedemptions]);

  // Margin chart data (last 6 months)
  const marginData = useMemo(() => {
    const months = eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() });
    return months.map((m) => {
      const monthStr = format(m, "MMM");
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.created_at);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() && (o.payment_status === "paid" || o.payment_status === "approved");
      });
      const rev = monthOrders.reduce((s, o) => s + Number(o.amount), 0);
      const comm = commissions.filter((c) => {
        const d = new Date(c.created_at);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).reduce((s, c) => s + Number(c.amount), 0);
      return { month: monthStr, revenue: rev, commissions: comm, margin: rev - comm };
    });
  }, [orders, commissions]);

  const handleRefresh = () => { refetchOrders(); };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Financeiro Global</h1>
        <p className="text-muted-foreground">Visão financeira completa da plataforma All Vita</p>
      </div>

      {/* Filters */}
      <FinanceFilters
        period={period}
        onPeriodChange={setPeriod}
        tenantFilter={tenantFilter}
        onTenantChange={setTenantFilter}
        tenants={tenants}
        onRefresh={handleRefresh}
      />

      {/* KPIs */}
      <FinanceKpiCards
        totalRevenue={totalRevenue}
        mrr={mrr}
        arr={arr}
        growth={growth}
        avgTicket={avgTicket}
        totalCommissions={totalCommissions}
        totalVitacoins={totalVCEarned}
        margin={margin}
      />

      {/* Revenue over time */}
      <RevenueOverTimeChart data={revenueChartData} />

      {/* Revenue by tenant + Margin */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RevenueByTenantTable tenants={tenantRevenue} onTenantClick={setDrillDownTenantId} />
        <MarginChart data={marginData} />
      </div>

      {/* Commissions */}
      <CommissionsDistributionChart byLevel={commByLevel} byStatus={commByStatus} />

      {/* Vitacoins */}
      <VitacoinsFinancePanel
        totalEarned={totalVCEarned}
        totalRedeemed={totalVCRedeemed}
        inCirculation={totalVCBalance}
        conversionRate={vcSettings?.conversion_rate || 0.01}
      />

      {/* Transactions + Pending */}
      <div className="grid lg:grid-cols-2 gap-4">
        <TransactionsTable transactions={txRows} />
        <PendingActionsPanel items={pendingItems} />
      </div>
    </div>
  );
};

export default AdminFinance;
