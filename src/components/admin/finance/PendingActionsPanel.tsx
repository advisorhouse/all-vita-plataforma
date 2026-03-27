import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PendingItem {
  id: string;
  type: "redemption" | "payment" | "review";
  description: string;
  amount: number;
  user_name: string;
  created_at: string;
}

interface PendingActionsPanelProps {
  items: PendingItem[];
}

const PendingActionsPanel: React.FC<PendingActionsPanelProps> = ({ items }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Pendências Financeiras
          {items.length > 0 && <Badge variant="destructive">{items.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>Nenhuma pendência no momento</span>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.user_name} — R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Analisar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingActionsPanel;
