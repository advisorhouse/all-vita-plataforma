import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

interface VitacoinsConfigPanelProps {
  conversionRate: number;
  minRedemption: number;
  maxRedemptionDaily: number | null;
  onSave: (data: { conversion_rate: number; min_redemption: number; max_redemption_daily: number | null }) => void;
}

const VitacoinsConfigPanel: React.FC<VitacoinsConfigPanelProps> = ({
  conversionRate, minRedemption, maxRedemptionDaily, onSave,
}) => {
  const [rate, setRate] = useState(String(conversionRate));
  const [minRed, setMinRed] = useState(String(minRedemption));
  const [maxDaily, setMaxDaily] = useState(maxRedemptionDaily ? String(maxRedemptionDaily) : "");
  const [rules, setRules] = useState({
    sale: true, recurrence: true, referral: true, bonus: true, milestone: false,
  });

  const handleSave = () => {
    onSave({
      conversion_rate: parseFloat(rate) || 0.01,
      min_redemption: parseInt(minRed) || 100,
      max_redemption_daily: maxDaily ? parseInt(maxDaily) : null,
    });
    toast.success("Configurações salvas!");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-5 w-5" /> Configuração de Vitacoins
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Conversion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>1 Vitacoin = R$</Label>
            <Input value={rate} onChange={(e) => setRate(e.target.value)} type="number" step="0.01" />
          </div>
          <div className="space-y-1.5">
            <Label>Resgate Mínimo (VC)</Label>
            <Input value={minRed} onChange={(e) => setMinRed(e.target.value)} type="number" />
          </div>
          <div className="space-y-1.5">
            <Label>Máximo Diário (VC)</Label>
            <Input value={maxDaily} onChange={(e) => setMaxDaily(e.target.value)} type="number" placeholder="Sem limite" />
          </div>
        </div>

        {/* Rules toggles */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Regras de Geração</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(rules).map(([key, val]) => {
              const labels: Record<string, string> = {
                sale: "Venda Direta", recurrence: "Recorrência", referral: "Indicação", bonus: "Bônus", milestone: "Metas",
              };
              return (
                <div key={key} className="flex items-center gap-2">
                  <Switch checked={val} onCheckedChange={(v) => setRules((p) => ({ ...p, [key]: v }))} />
                  <span className="text-sm">{labels[key]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
};

export default VitacoinsConfigPanel;
