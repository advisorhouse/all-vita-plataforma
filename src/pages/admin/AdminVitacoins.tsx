import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, eachMonthOfInterval, subMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import VitacoinsKpiCards from "@/components/admin/vitacoins/VitacoinsKpiCards";
import VitacoinsConfigPanel from "@/components/admin/vitacoins/VitacoinsConfigPanel";
import DistributionByTenantChart from "@/components/admin/vitacoins/DistributionByTenantChart";
import VCTransactionsTable from "@/components/admin/vitacoins/VCTransactionsTable";
import RedemptionsTable from "@/components/admin/vitacoins/RedemptionsTable";
import ImpactChart from "@/components/admin/vitacoins/ImpactChart";
import VCAlertsPanel from "@/components/admin/vitacoins/VCAlertsPanel";
import RewardsManager from "@/components/admin/vitacoins/RewardsManager";
import type { VCTransaction } from "@/components/admin/vitacoins/VCTransactionsTable";
import type { RedemptionRow } from "@/components/admin/vitacoins/RedemptionsTable";

const periodDays: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };

const AdminVitacoins: React.FC = () => {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState("30d");
  const [tenantFilter, setTenantFilter] = useState("all");
  const since = useMemo(() => subDays(new Date(), periodDays[period] || 30).toISOString(), [period]);

  // Tenants
  const { data: tenants = [] } = useQuery({
    queryKey: ["vc-tenants"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name").eq("active", true);
      return data || [];
    },
  });
  const tenantMap = useMemo(() => Object.fromEntries(tenants.map((t) => [t.id, t.name])), [tenants]);

  // Wallets
  const { data: wallets = [], refetch: refetchWallets } = useQuery({
    queryKey: ["vc-wallets", tenantFilter],
    queryFn: async () => {
      let q = supabase.from("vitacoins_wallet").select("*");
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Settings
  const { data: vcSettings } = useQuery({
    queryKey: ["vc-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("vitacoin_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  // VC Transactions
  const { data: vcTransactions = [] } = useQuery({
    queryKey: ["vc-transactions", since, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("vitacoin_transactions").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(50);
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Partners count
  const { data: partnersCount = 0 } = useQuery({
    queryKey: ["vc-partners-count", tenantFilter],
    queryFn: async () => {
      let q = supabase.from("partners").select("id", { count: "exact", head: true }).eq("active", true);
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { count } = await q;
      return count || 0;
    },
  });

  // Redemptions
  const { data: redemptions = [] } = useQuery({
    queryKey: ["vc-redemptions", since, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("redemption_requests").select("*").gte("created_at", since).order("created_at", { ascending: false });
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Orders for impact
  const { data: orders = [] } = useQuery({
    queryKey: ["vc-orders", since, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("orders").select("amount, payment_status, created_at, tenant_id").gte("created_at", since);
      if (tenantFilter !== "all") q = q.eq("tenant_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  // Profiles for names
  const { data: profiles = [] } = useQuery({
    queryKey: ["vc-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, first_name, last_name, email");
      return data || [];
    },
  });
  const profileMap = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email])), [profiles]);

  // KPIs
  const totalEarned = useMemo(() => wallets.reduce((s, w) => s + Number(w.total_earned), 0), [wallets]);
  const totalRedeemed = useMemo(() => wallets.reduce((s, w) => s + Number(w.total_redeemed), 0), [wallets]);
  const inCirculation = useMemo(() => wallets.reduce((s, w) => s + Number(w.balance), 0), [wallets]);
  const convRate = vcSettings?.conversion_rate || 0.01;
  const financialValue = inCirculation * convRate;
  const redemptionRate = totalEarned > 0 ? (totalRedeemed / totalEarned) * 100 : 0;
  const costImpact = totalRedeemed * convRate;
  const avgPerPartner = partnersCount > 0 ? Math.round(totalEarned / partnersCount) : 0;
  const totalRevenue = useMemo(() => orders.filter((o) => o.payment_status === "paid" || o.payment_status === "approved").reduce((s, o) => s + Number(o.amount), 0), [orders]);
  const costRatio = totalRevenue > 0 ? (costImpact / totalRevenue) * 100 : 0;

  // Distribution by tenant
  const distByTenant = useMemo(() => {
    const map: Record<string, { earned: number; redeemed: number }> = {};
    wallets.forEach((w) => {
      if (!map[w.tenant_id]) map[w.tenant_id] = { earned: 0, redeemed: 0 };
      map[w.tenant_id].earned += Number(w.total_earned);
      map[w.tenant_id].redeemed += Number(w.total_redeemed);
    });
    return Object.entries(map).map(([tid, v]) => ({ name: tenantMap[tid] || tid.slice(0, 8), ...v })).sort((a, b) => b.earned - a.earned);
  }, [wallets, tenantMap]);

  // Transactions enriched
  const txRows: VCTransaction[] = useMemo(() => {
    return vcTransactions.map((tx) => ({
      id: tx.id,
      user_name: profileMap[tx.user_id] || tx.user_id.slice(0, 8),
      tenant_name: tenantMap[tx.tenant_id] || tx.tenant_id.slice(0, 8),
      type: tx.type,
      source: tx.source || "—",
      amount: Number(tx.amount),
      created_at: tx.created_at,
    }));
  }, [vcTransactions, profileMap, tenantMap]);

  // Redemptions enriched
  const redemptionRows: RedemptionRow[] = useMemo(() => {
    return redemptions.map((r) => ({
      id: r.id,
      user_name: profileMap[r.user_id] || r.user_id.slice(0, 8),
      tenant_name: tenantMap[r.tenant_id] || r.tenant_id.slice(0, 8),
      amount: Number(r.amount),
      type: r.type,
      status: r.status,
      created_at: r.created_at,
    }));
  }, [redemptions, profileMap, tenantMap]);

  const redemptionTotals = useMemo(() => ({
    requested: redemptions.length,
    approved: redemptions.filter((r) => r.status === "approved").length,
    rejected: redemptions.filter((r) => r.status === "rejected").length,
  }), [redemptions]);

  // Impact chart
  const impactData = useMemo(() => {
    const months = eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() });
    return months.map((m) => {
      const mo = m.getMonth();
      const yr = m.getFullYear();
      const rev = orders.filter((o) => { const d = new Date(o.created_at); return d.getMonth() === mo && d.getFullYear() === yr && (o.payment_status === "paid" || o.payment_status === "approved"); }).reduce((s, o) => s + Number(o.amount), 0);
      const vcCred = vcTransactions.filter((t) => { const d = new Date(t.created_at); return d.getMonth() === mo && d.getFullYear() === yr && t.type === "debit"; }).reduce((s, t) => s + Number(t.amount), 0) * convRate;
      return { month: format(m, "MMM"), revenue: rev, vcCost: vcCred };
    });
  }, [orders, vcTransactions, convRate]);

  // Alerts
  const emissionGrowth = 0; // simplified

  // Save config
  const handleSaveConfig = async (data: { conversion_rate: number; min_redemption: number; max_redemption_daily: number | null }) => {
    if (vcSettings?.id) {
      await supabase.from("vitacoin_settings").update(data).eq("id", vcSettings.id);
    }
    queryClient.invalidateQueries({ queryKey: ["vc-settings"] });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Vitacoins</h1>
        <p className="text-muted-foreground">Economia interna da plataforma All Vita</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
            <SelectItem value="365d">12 meses</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tenantFilter} onValueChange={setTenantFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Todas empresas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas empresas</SelectItem>
            {tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchWallets()}><RefreshCw className="h-4 w-4 mr-1" /> Atualizar</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Exportar</Button>
        </div>
      </div>

      {/* Alerts */}
      <VCAlertsPanel redemptionRate={redemptionRate} emissionGrowth={emissionGrowth} costRatio={costRatio} />

      {/* KPIs */}
      <VitacoinsKpiCards
        totalEarned={totalEarned}
        totalRedeemed={totalRedeemed}
        inCirculation={inCirculation}
        financialValue={financialValue}
        redemptionRate={redemptionRate}
        costImpact={costImpact}
        avgPerPartner={avgPerPartner}
        alerts={redemptionRate > 60 || costRatio > 15 ? 1 : 0}
      />

      {/* Config */}
      <VitacoinsConfigPanel
        conversionRate={convRate}
        minRedemption={vcSettings?.min_redemption || 100}
        maxRedemptionDaily={vcSettings?.max_redemption_daily || null}
        onSave={handleSaveConfig}
      />

      {/* Distribution + Impact */}
      <div className="grid lg:grid-cols-2 gap-4">
        <DistributionByTenantChart data={distByTenant} />
        <ImpactChart data={impactData} />
      </div>

      {/* Rewards management */}
      <RewardsManager tenantId={tenantFilter} />

      {/* Transactions */}
      <VCTransactionsTable transactions={txRows} />

      {/* Redemptions */}
      <RedemptionsTable
        redemptions={redemptionRows}
        totals={redemptionTotals}
        onApprove={async (id) => {
          await supabase.from("redemption_requests").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", id);
          toast.success("Resgate aprovado");
          queryClient.invalidateQueries({ queryKey: ["vc-redemptions"] });
        }}
        onReject={async (id) => {
          await supabase.from("redemption_requests").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
          toast.success("Resgate rejeitado");
          queryClient.invalidateQueries({ queryKey: ["vc-redemptions"] });
        }}
      />
    </div>
  );
};

export default AdminVitacoins;
