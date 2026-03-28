import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Download, BarChart3 } from "lucide-react";
import AnalyticsKpiCards from "@/components/admin/analytics/AnalyticsKpiCards";
import RevenueDeepDive from "@/components/admin/analytics/RevenueDeepDive";
import TenantPerformanceTable from "@/components/admin/analytics/TenantPerformanceTable";
import ClientCohortChart from "@/components/admin/analytics/ClientCohortChart";
import PartnerAnalytics from "@/components/admin/analytics/PartnerAnalytics";
import ConversionFunnelAnalytics from "@/components/admin/analytics/ConversionFunnelAnalytics";
import VitacoinsImpactChart from "@/components/admin/analytics/VitacoinsImpactChart";
import GrowthTrendsChart from "@/components/admin/analytics/GrowthTrendsChart";
import InsightsPanel from "@/components/admin/analytics/InsightsPanel";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState("30d");
  const [tenantFilter, setTenantFilter] = useState("all");

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
  const sinceDate = new Date(Date.now() - periodDays * 86400000).toISOString();
  const prevSinceDate = new Date(Date.now() - periodDays * 2 * 86400000).toISOString();

  const { data: tenants } = useQuery({
    queryKey: ["analytics-tenants"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name, active").eq("active", true);
      return data || [];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["analytics-orders", period],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("amount, payment_status, created_at, tenant_id, product_id, subscription_cycle").gte("created_at", prevSinceDate);
      return data || [];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["analytics-clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, tenant_id, created_at");
      return data || [];
    },
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["analytics-subs"],
    queryFn: async () => {
      const { data } = await supabase.from("subscriptions").select("id, status, tenant_id, client_id, created_at");
      return data || [];
    },
  });

  const { data: partners } = useQuery({
    queryKey: ["analytics-partners"],
    queryFn: async () => {
      const { data } = await supabase.from("partners").select("id, user_id, tenant_id, active, level, referral_code, created_at");
      return data || [];
    },
  });

  const { data: clicks } = useQuery({
    queryKey: ["analytics-clicks", period],
    queryFn: async () => {
      const { data } = await supabase.from("clicks").select("id, created_at").gte("created_at", sinceDate);
      return data || [];
    },
  });

  const { data: referrals } = useQuery({
    queryKey: ["analytics-referrals", period],
    queryFn: async () => {
      const { data } = await supabase.from("referrals").select("id, partner_id, status, created_at, tenant_id").gte("created_at", sinceDate);
      return data || [];
    },
  });

  const { data: commissions } = useQuery({
    queryKey: ["analytics-commissions", period],
    queryFn: async () => {
      const { data } = await supabase.from("commissions").select("amount, affiliate_id, tenant_id, created_at").gte("created_at", sinceDate);
      return data || [];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["analytics-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, first_name, last_name, created_at");
      return data || [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["analytics-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, tenant_id");
      return data || [];
    },
  });

  // Computed metrics
  const computed = useMemo(() => {
    const allOrders = orders || [];
    const currentOrders = allOrders.filter((o) => o.created_at >= sinceDate);
    const prevOrders = allOrders.filter((o) => o.created_at >= prevSinceDate && o.created_at < sinceDate);
    const paidCurrent = currentOrders.filter((o) => o.payment_status === "paid");
    const paidPrev = prevOrders.filter((o) => o.payment_status === "paid");

    const filteredPaid = tenantFilter === "all" ? paidCurrent : paidCurrent.filter((o) => o.tenant_id === tenantFilter);

    const totalRevenue = filteredPaid.reduce((s, o) => s + Number(o.amount), 0);
    const prevRevenue = paidPrev.reduce((s, o) => s + Number(o.amount), 0);

    const recurringOrders = filteredPaid.filter((o) => (o.subscription_cycle || 1) > 1);
    const mrr = recurringOrders.reduce((s, o) => s + Number(o.amount), 0);
    const arr = mrr * 12;
    const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const allSubs = subscriptions || [];
    const activeSubs = allSubs.filter((s) => s.status === "active");
    const cancelledSubs = allSubs.filter((s) => s.status === "cancelled");
    const churn = allSubs.length > 0 ? (cancelledSubs.length / allSubs.length) * 100 : 0;

    const allClients = clients || [];
    const activeClients = tenantFilter === "all" ? allClients : allClients.filter((c) => c.tenant_id === tenantFilter);
    const ltv = activeClients.length > 0 ? totalRevenue / activeClients.length : 0;
    const cac = activeClients.length > 0 ? totalRevenue * 0.15 / activeClients.length : 0;
    const payback = cac > 0 && ltv > 0 ? cac / (ltv / 12) : 0;

    // Revenue over time (group by month)
    const monthMap: Record<string, { recurring: number; oneTime: number }> = {};
    for (const o of filteredPaid) {
      const m = o.created_at.slice(0, 7);
      if (!monthMap[m]) monthMap[m] = { recurring: 0, oneTime: 0 };
      if ((o.subscription_cycle || 1) > 1) monthMap[m].recurring += Number(o.amount);
      else monthMap[m].oneTime += Number(o.amount);
    }
    const revenueOverTime = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month: month.slice(5), ...v }));

    // Revenue by tenant
    const tenantRevMap: Record<string, number> = {};
    for (const o of paidCurrent) {
      tenantRevMap[o.tenant_id] = (tenantRevMap[o.tenant_id] || 0) + Number(o.amount);
    }
    const revenueByTenant = (tenants || []).map((t) => ({ name: t.name, revenue: Math.round(tenantRevMap[t.id] || 0) })).sort((a, b) => b.revenue - a.revenue);

    // Revenue by product
    const prodRevMap: Record<string, number> = {};
    for (const o of filteredPaid) {
      if (o.product_id) prodRevMap[o.product_id] = (prodRevMap[o.product_id] || 0) + Number(o.amount);
    }
    const prodMap = new Map((products || []).map((p) => [p.id, p.name]));
    const revenueByProduct = Object.entries(prodRevMap).map(([id, revenue]) => ({ name: prodMap.get(id) || "Produto", revenue: Math.round(revenue) })).sort((a, b) => b.revenue - a.revenue);

    // Tenant performance
    const tenantPerf = (tenants || []).map((t) => {
      const tOrders = paidCurrent.filter((o) => o.tenant_id === t.id);
      const tPrevOrders = paidPrev.filter((o) => o.tenant_id === t.id);
      const tRev = tOrders.reduce((s, o) => s + Number(o.amount), 0);
      const tPrevRev = tPrevOrders.reduce((s, o) => s + Number(o.amount), 0);
      const tClients = allClients.filter((c) => c.tenant_id === t.id);
      const tSubs = allSubs.filter((s) => s.tenant_id === t.id);
      const tCancelled = tSubs.filter((s) => s.status === "cancelled");
      return {
        id: t.id,
        name: t.name,
        revenue: Math.round(tRev),
        growth: tPrevRev > 0 ? ((tRev - tPrevRev) / tPrevRev) * 100 : 0,
        churn: tSubs.length > 0 ? (tCancelled.length / tSubs.length) * 100 : 0,
        ltv: tClients.length > 0 ? Math.round(tRev / tClients.length) : 0,
        clients: tClients.length,
      };
    });

    // Client cohort
    const clientMonthMap: Record<string, number> = {};
    for (const c of activeClients) {
      const m = c.created_at.slice(0, 7);
      clientMonthMap[m] = (clientMonthMap[m] || 0) + 1;
    }
    const acquisitionData = Object.entries(clientMonthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, newClients]) => ({ month: month.slice(5), newClients, retained: Math.round(newClients * 0.7) }));

    const retentionRate = activeSubs.length > 0 && allSubs.length > 0 ? (activeSubs.length / allSubs.length) * 100 : 85;

    // Partners
    const allPartners = partners || [];
    const activePartners = allPartners.filter((p) => p.active);
    const partnerCommMap: Record<string, number> = {};
    const partnerClientMap: Record<string, number> = {};
    for (const c of commissions || []) {
      partnerCommMap[c.affiliate_id] = (partnerCommMap[c.affiliate_id] || 0) + Number(c.amount);
    }
    for (const r of referrals || []) {
      partnerClientMap[r.partner_id] = (partnerClientMap[r.partner_id] || 0) + 1;
    }
    const profileMap = new Map((profiles || []).map((p) => [p.id, `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Parceiro"]));
    const partnerUserMap = new Map(allPartners.map((p) => [p.id, p.user_id]));

    const topPartners = activePartners
      .map((p) => ({
        name: profileMap.get(p.user_id) || "Parceiro",
        revenue: Math.round(partnerCommMap[p.id] || 0),
        clients: partnerClientMap[p.id] || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const levelMap: Record<string, number> = {};
    for (const p of activePartners) {
      const l = p.level || "bronze";
      levelMap[l] = (levelMap[l] || 0) + 1;
    }
    const byLevel = Object.entries(levelMap).map(([level, count]) => ({ level, count }));

    const conversionRate = (clicks || []).length > 0 ? ((paidCurrent.length / (clicks || []).length) * 100) : 0;
    const revenuePerPartner = activePartners.length > 0 ? totalRevenue / activePartners.length : 0;

    // Funnel
    const totalClicks = (clicks || []).length;
    const totalLeads = (referrals || []).length;
    const totalPurchases = paidCurrent.length;
    const totalRetained = activeSubs.length;

    // Growth trends
    const growthMonths: Record<string, { users: number; revenue: number; partners: number }> = {};
    for (const p of profiles || []) {
      const m = p.created_at.slice(0, 7);
      if (!growthMonths[m]) growthMonths[m] = { users: 0, revenue: 0, partners: 0 };
      growthMonths[m].users++;
    }
    for (const o of paidCurrent) {
      const m = o.created_at.slice(0, 7);
      if (!growthMonths[m]) growthMonths[m] = { users: 0, revenue: 0, partners: 0 };
      growthMonths[m].revenue += Number(o.amount);
    }
    for (const p of allPartners) {
      const m = p.created_at.slice(0, 7);
      if (!growthMonths[m]) growthMonths[m] = { users: 0, revenue: 0, partners: 0 };
      growthMonths[m].partners++;
    }
    const growthData = Object.entries(growthMonths)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, v]) => ({ month: month.slice(5), ...v, revenue: Math.round(v.revenue) }));

    // VC impact (simplified)
    const vcImpactData = revenueOverTime.map((r) => ({
      month: r.month,
      revenue: r.recurring + r.oneTime,
      vcCost: Math.round((r.recurring + r.oneTime) * 0.03),
    }));

    // Insights
    const insights: { type: "positive" | "warning" | "negative"; message: string }[] = [];
    if (growth > 10) insights.push({ type: "positive", message: `Crescimento acelerado de ${growth.toFixed(1)}% no período.` });
    if (growth < -5) insights.push({ type: "negative", message: `Queda de receita de ${Math.abs(growth).toFixed(1)}%. Investigar causas.` });
    if (churn > 10) insights.push({ type: "warning", message: `Churn de ${churn.toFixed(1)}% acima do ideal. Atenção na retenção.` });
    const topTenant = tenantPerf.sort((a, b) => b.growth - a.growth)[0];
    if (topTenant && topTenant.growth > 0) insights.push({ type: "positive", message: `${topTenant.name} lidera crescimento com +${topTenant.growth.toFixed(1)}%.` });
    const underPerf = tenantPerf.filter((t) => t.growth < -5);
    if (underPerf.length > 0) insights.push({ type: "warning", message: `${underPerf.length} empresa(s) com queda de receita no período.` });
    if (conversionRate > 0 && conversionRate < 2) insights.push({ type: "warning", message: `Taxa de conversão baixa (${conversionRate.toFixed(1)}%). Otimizar funil.` });

    return {
      mrr: Math.round(mrr), arr: Math.round(arr), growth, churn, ltv: Math.round(ltv), cac: Math.round(cac), payback, activeClients: activeClients.length,
      revenueOverTime, revenueByTenant, revenueByProduct, tenantPerf,
      acquisitionData, retentionRate, avgLifetime: payback > 0 ? 12 / payback : 6,
      totalPartners: allPartners.length, activePartnerCount: activePartners.length, conversionRate, revenuePerPartner,
      topPartners, byLevel,
      totalClicks, totalLeads, totalPurchases, totalRetained,
      vcImpactData, redemptionRate: 15, vcVsRetention: retentionRate * 0.3,
      growthData, insights,
    };
  }, [orders, clients, subscriptions, partners, clicks, referrals, commissions, profiles, tenants, products, sinceDate, prevSinceDate, tenantFilter]);

  return (
    <div className="space-y-6 p-2 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">BI & Analytics</h1>
            <Badge variant="outline" className="ml-2 text-[10px]">Avançado</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Análise profunda de comportamento, oportunidades e performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={tenantFilter} onValueChange={setTenantFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Todas empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas empresas</SelectItem>
              {(tenants || []).map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="365d">12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1">
            <Download className="h-3.5 w-3.5" /> Exportar
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <AnalyticsKpiCards
          mrr={computed.mrr} arr={computed.arr} growth={computed.growth} churn={computed.churn}
          ltv={computed.ltv} cac={computed.cac} payback={computed.payback} activeClients={computed.activeClients}
        />
      </motion.div>

      {/* Insights */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <InsightsPanel insights={computed.insights} />
      </motion.div>

      {/* Revenue Deep Dive */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <RevenueDeepDive
          revenueOverTime={computed.revenueOverTime}
          revenueByTenant={computed.revenueByTenant}
          revenueByProduct={computed.revenueByProduct}
        />
      </motion.div>

      {/* Tenant Performance */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <TenantPerformanceTable tenants={computed.tenantPerf} />
      </motion.div>

      {/* Client + Partners */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <ClientCohortChart
            acquisitionData={computed.acquisitionData}
            totalClients={computed.activeClients}
            retentionRate={computed.retentionRate}
            avgLifetime={computed.avgLifetime}
          />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <ConversionFunnelAnalytics
            clicks={computed.totalClicks}
            leads={computed.totalLeads}
            purchases={computed.totalPurchases}
            retained={computed.totalRetained}
          />
        </motion.div>
      </div>

      {/* Partners */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <PartnerAnalytics
          totalPartners={computed.totalPartners}
          activePartners={computed.activePartnerCount}
          conversionRate={computed.conversionRate}
          revenuePerPartner={computed.revenuePerPartner}
          topPartners={computed.topPartners}
          byLevel={computed.byLevel}
        />
      </motion.div>

      {/* Vitacoins + Growth */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <VitacoinsImpactChart data={computed.vcImpactData} redemptionRate={computed.redemptionRate} vcVsRetention={computed.vcVsRetention} />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <GrowthTrendsChart data={computed.growthData} />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
