import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DollarSign, TrendingUp, TrendingDown, Building2, Users, UserCheck,
  Handshake, Percent, BarChart3, Target, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

interface KpiData {
  totalRevenue: number;
  activeTenants: number;
  totalUsers: number;
  totalPartners: number;
  totalClients: number;
  totalOrders: number;
  avgTicket: number;
  churnRate: number;
}

interface KpiCardsProps {
  data: KpiData;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const formatNumber = (v: number) =>
  new Intl.NumberFormat("pt-BR").format(v);

const KpiCards: React.FC<KpiCardsProps> = ({ data }) => {
  const cards = [
    { label: "Receita Total (MRR)", value: formatCurrency(data.totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+12%", trendUp: true },
    { label: "Empresas Ativas", value: formatNumber(data.activeTenants), icon: Building2, color: "text-accent", bg: "bg-accent/10", trend: "+2", trendUp: true },
    { label: "Usuários Totais", value: formatNumber(data.totalUsers), icon: Users, color: "text-primary", bg: "bg-primary/10", trend: "+8%", trendUp: true },
    { label: "Parceiros Ativos", value: formatNumber(data.totalPartners), icon: Handshake, color: "text-amber-500", bg: "bg-amber-500/10", trend: "+5", trendUp: true },
    { label: "Clientes Totais", value: formatNumber(data.totalClients), icon: UserCheck, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+15%", trendUp: true },
    { label: "Pedidos", value: formatNumber(data.totalOrders), icon: BarChart3, color: "text-violet-500", bg: "bg-violet-500/10", trend: "+22%", trendUp: true },
    { label: "Ticket Médio", value: formatCurrency(data.avgTicket), icon: Target, color: "text-orange-500", bg: "bg-orange-500/10", trend: "+3%", trendUp: true },
    { label: "Churn Rate", value: `${data.churnRate.toFixed(1)}%`, icon: Percent, color: "text-destructive", bg: "bg-destructive/10", trend: "-0.5%", trendUp: false },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div key={card.label} custom={i} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="hover:border-accent/30 hover:shadow-md transition-all">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", card.bg)}>
                  <card.icon className={cn("h-4 w-4", card.color)} />
                </div>
                <div className={cn("flex items-center gap-0.5 text-[10px] font-medium rounded-full px-1.5 py-0.5",
                  card.trendUp ? "text-emerald-600 bg-emerald-500/10" : "text-red-600 bg-red-500/10"
                )}>
                  {card.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {card.trend}
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
                <p className="text-[11px] text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default KpiCards;
