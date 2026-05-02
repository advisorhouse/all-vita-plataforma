import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Filter, X } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import KpiCards from "@/components/admin/dashboard/KpiCards";
import RevenueCharts from "@/components/admin/dashboard/RevenueCharts";
import TenantTable from "@/components/admin/dashboard/TenantTable";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import ConversionFunnel from "@/components/admin/dashboard/ConversionFunnel";
import GamificationMetrics from "@/components/admin/dashboard/GamificationMetrics";
import PendingTenantsWidget from "@/components/admin/dashboard/PendingTenantsWidget";
import CreateTenantDialog from "@/components/admin/tenants/CreateTenantDialog";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("30d");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [resumeTenant, setResumeTenant] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getSinceDate = () => {
    if (period === "custom" && dateRange?.from) {
      return dateRange.from.toISOString();
    }
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    return subDays(new Date(), days).toISOString();
  };

  const getUntilDate = () => {
    if (period === "custom" && dateRange?.to) {
      return endOfDay(dateRange.to).toISOString();
    }
    return new Date().toISOString();
  };

  const sinceDate = getSinceDate();
  const untilDate = getUntilDate();

  // Tenants
  const { data: tenants } = useQuery({
    queryKey: ["admin-dash-tenants"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name, trade_name, slug, active, created_at").order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Profiles count
  const { data: profilesCount } = useQuery({
    queryKey: ["admin-dash-profiles"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Partners count
  const { data: partnersCount } = useQuery({
    queryKey: ["admin-dash-partners"],
    queryFn: async () => {
      const { count } = await supabase.from("partners").select("id", { count: "exact", head: true }).eq("active", true);
      return count || 0;
    },
  });

  // Clients count
  const { data: clientsCount } = useQuery({
    queryKey: ["admin-dash-clients"],
    queryFn: async () => {
      const { count } = await supabase.from("clients").select("id", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Orders
  const { data: orders } = useQuery({
    queryKey: ["admin-dash-orders", sinceDate, untilDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, amount, tenant_id, created_at, status, payment_status")
        .gte("created_at", sinceDate)
        .lte("created_at", untilDate)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Clicks
  const { data: clicksCount } = useQuery({
    queryKey: ["admin-dash-clicks", sinceDate, untilDate],
    queryFn: async () => {
      const { count } = await supabase
        .from("clicks")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sinceDate)
        .lte("created_at", untilDate);
      return count || 0;
    },
  });

  // Referrals (leads)
  const { data: referralsCount } = useQuery({
    queryKey: ["admin-dash-referrals", sinceDate, untilDate],
    queryFn: async () => {
      const { count } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sinceDate)
        .lte("created_at", untilDate);
      return count || 0;
    },
  });

  // Gamification
  const { data: gamificationData } = useQuery({
    queryKey: ["admin-dash-gamification"],
    queryFn: async () => {
      const { data } = await supabase.from("gamification").select("points, user_id");
      return data || [];
    },
  });

  // Redemptions
  const { data: redemptions } = useQuery({
    queryKey: ["admin-dash-redemptions"],
    queryFn: async () => {
      const { data } = await supabase.from("redemption_requests").select("amount, status");
      return data || [];
    },
  });

  // Subscriptions (active)
  const { data: subsCount } = useQuery({
    queryKey: ["admin-dash-subs"],
    queryFn: async () => {
      const { count } = await supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active");
      return count || 0;
    },
  });

  // Memberships per tenant (for tenant table counts)
  const { data: memberships } = useQuery({
    queryKey: ["admin-dash-memberships"],
    queryFn: async () => {
      const { data } = await supabase.from("memberships").select("tenant_id, role").eq("active", true);
      return data || [];
    },
  });

  // Audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ["admin-dash-audit"],
    queryFn: async () => {
      const { data } = await supabase.from("audit_logs").select("id, action, entity_type, created_at").order("created_at", { ascending: false }).limit(8);
      return data || [];
    },
  });

  // Security events
  const { data: securityEvents } = useQuery({
    queryKey: ["admin-dash-security"],
    queryFn: async () => {
      const { data } = await supabase.from("security_events").select("id, type, severity, created_at").order("created_at", { ascending: false }).limit(8);
      return data || [];
    },
  });

  // Profiles details for greeting
  const { data: userProfile } = useQuery({
    queryKey: ["admin-dash-user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  // Compute KPIs
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
  const activeTenants = tenants?.filter((t) => t.active).length || 0;
  const totalOrders = orders?.length || 0;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const churnRate = 0; // Would need historical data

  // Revenue by month
  const revenueByMonth = React.useMemo(() => {
    if (!orders?.length) return [];
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + Number(o.amount));
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, value }));
  }, [orders]);

  // Revenue by tenant
  const revenueByTenant = React.useMemo(() => {
    if (!orders?.length || !tenants?.length) return [];
    const map = new Map<string, number>();
    orders.forEach((o) => {
      map.set(o.tenant_id, (map.get(o.tenant_id) || 0) + Number(o.amount));
    });
    return Array.from(map.entries()).map(([tid, value]) => {
      const t = tenants.find((x) => x.id === tid);
      return { name: t?.trade_name || t?.name || "—", value };
    }).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [orders, tenants]);

  // Tenant table rows
  const tenantRows = React.useMemo(() => {
    if (!tenants) return [];
    return tenants.map((t) => {
      const tMembers = memberships?.filter((m) => m.tenant_id === t.id) || [];
      const clientCount = tMembers.filter((m) => m.role === "client").length;
      const partnerCount = tMembers.filter((m) => m.role === "partner").length;
      const revenue = orders?.filter((o) => o.tenant_id === t.id).reduce((s, o) => s + Number(o.amount), 0) || 0;
      return { ...t, trade_name: t.trade_name, clientCount, partnerCount, revenue };
    });
  }, [tenants, memberships, orders]);

  // Gamification metrics
  const gamificationMetrics = React.useMemo(() => {
    const totalDistributed = gamificationData?.reduce((s, g) => s + g.points, 0) || 0;
    const totalRedeemed = redemptions?.filter((r) => r.status === "approved").reduce((s, r) => s + Number(r.amount), 0) || 0;
    return {
      totalDistributed,
      totalRedeemed,
      totalBalance: totalDistributed - totalRedeemed,
      topPartners: [] as { name: string; points: number }[],
    };
  }, [gamificationData, redemptions]);

  // Funnel
  const paidOrders = orders?.filter((o) => o.payment_status === "paid").length || 0;
  const funnelData = {
    clicks: clicksCount || 0,
    leads: referralsCount || 0,
    purchases: paidOrders,
    retained: subsCount || 0,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header + Filters */}
      <motion.div id="admin-header" variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {(() => {
                const hour = new Date().getHours();
                const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
                const name = userProfile?.first_name || "Admin";
                return `${greeting}, ${name}`;
              })()}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Visão executiva da plataforma All Vita</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden xs:flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-600 font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Plataforma online
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={(val) => {
                setPeriod(val);
                if (val !== "custom") setDateRange(undefined);
              }}>
                <SelectTrigger className="w-[130px] h-8 text-xs bg-card">
                  <CalendarDays className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="365d">Último ano</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>

              {period === "custom" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 text-xs justify-start text-left font-normal bg-card min-w-[160px]",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <Filter className="mr-2 h-3 w-3" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM", { locale: ptBR })} -{" "}
                            {format(dateRange.to, "dd/MM", { locale: ptBR })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM", { locale: ptBR })
                        )
                      ) : (
                        <span>Selecionar datas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pending Registrations Widget */}
      <motion.div id="admin-pending-tenants" variants={fadeUp} initial="hidden" animate="visible" className="w-full">
        <PendingTenantsWidget onResume={(tenant) => {
          setResumeTenant(tenant);
          setIsDialogOpen(true);
        }} />
      </motion.div>

      {/* Hidden Dialog for Resuming */}
      <CreateTenantDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        resumeTenant={resumeTenant} 
      />

      {/* KPIs */}
      <KpiCards data={{
        totalRevenue,
        activeTenants,
        totalUsers: profilesCount || 0,
        totalPartners: partnersCount || 0,
        totalClients: clientsCount || 0,
        totalOrders,
        avgTicket,
        churnRate,
      }} />

      {/* Revenue Charts */}
      <motion.div id="admin-revenue-charts" variants={fadeUp} initial="hidden" animate="visible">
        <RevenueCharts revenueByMonth={revenueByMonth} revenueByTenant={revenueByTenant} />
      </motion.div>

      {/* Tenant Performance */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <TenantTable tenants={tenantRows} />
      </motion.div>

      {/* Gamification + Funnel */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ConversionFunnel data={funnelData} />
          <GamificationMetrics data={gamificationMetrics} />
        </div>
      </motion.div>

      {/* Activity + Security + Quick Actions */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <ActivityFeed auditLogs={auditLogs || []} securityEvents={securityEvents || []} />
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
