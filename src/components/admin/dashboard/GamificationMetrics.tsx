import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, ArrowUpRight, Gift, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationData {
  totalDistributed: number;
  totalRedeemed: number;
  totalBalance: number;
  topPartners: { name: string; points: number }[];
}

interface GamificationMetricsProps {
  data: GamificationData;
}

const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR").format(v);

const GamificationMetrics: React.FC<GamificationMetricsProps> = ({ data }) => {
  const stats = [
    { label: "Vitacoins Distribuídos", value: formatNumber(data.totalDistributed), icon: Coins, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Vitacoins Resgatados", value: formatNumber(data.totalRedeemed), icon: Gift, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Saldo na Plataforma", value: formatNumber(data.totalBalance), icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Gamificação & Vitacoins</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border p-3 space-y-1">
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", s.bg)}>
                <s.icon className={cn("h-3.5 w-3.5", s.color)} />
              </div>
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        {data.topPartners.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Top Parceiros</p>
            {data.topPartners.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{i + 1}. {p.name}</span>
                <span className="font-medium text-amber-500">{formatNumber(p.points)} pts</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GamificationMetrics;
