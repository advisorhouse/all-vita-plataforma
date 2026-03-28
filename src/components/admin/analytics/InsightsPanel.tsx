import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  type: "positive" | "warning" | "negative";
  message: string;
}

interface InsightsPanelProps {
  insights: Insight[];
}

const iconMap = {
  positive: TrendingUp,
  warning: AlertTriangle,
  negative: TrendingDown,
};

const colorMap = {
  positive: "text-emerald-500 bg-emerald-500/10",
  warning: "text-amber-500 bg-amber-500/10",
  negative: "text-destructive bg-destructive/10",
};

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Insights Automáticos</h3>
        </div>
        <div className="space-y-2">
          {insights.map((ins, i) => {
            const Icon = iconMap[ins.type];
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <div className={cn("p-1.5 rounded-md", colorMap[ins.type])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs leading-relaxed">{ins.message}</p>
              </div>
            );
          })}
          {insights.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum insight disponível</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
