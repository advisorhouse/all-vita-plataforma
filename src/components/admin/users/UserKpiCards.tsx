import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Shield } from "lucide-react";

interface UserKpiCardsProps {
  total: number;
  active: number;
  newThisMonth: number;
  byType: { staff: number; tenant: number; partner: number; client: number };
}

const UserKpiCards: React.FC<UserKpiCardsProps> = ({ total, active, newThisMonth, byType }) => {
  const cards = [
    { label: "Total de Usuários", value: total, icon: Users, color: "text-primary" },
    { label: "Ativos", value: active, icon: UserCheck, color: "text-emerald-500" },
    { label: "Novos (30d)", value: newThisMonth, icon: UserPlus, color: "text-blue-500" },
    { label: "Staff All Vita", value: byType.staff, icon: Shield, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserKpiCards;
