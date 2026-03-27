import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

interface FinanceFiltersProps {
  period: string;
  onPeriodChange: (v: string) => void;
  tenantFilter: string;
  onTenantChange: (v: string) => void;
  tenants: { id: string; name: string }[];
  onRefresh: () => void;
}

const FinanceFilters: React.FC<FinanceFiltersProps> = ({
  period, onPeriodChange, tenantFilter, onTenantChange, tenants, onRefresh,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">7 dias</SelectItem>
          <SelectItem value="30d">30 dias</SelectItem>
          <SelectItem value="90d">90 dias</SelectItem>
          <SelectItem value="365d">12 meses</SelectItem>
        </SelectContent>
      </Select>

      <Select value={tenantFilter} onValueChange={onTenantChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todas empresas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas empresas</SelectItem>
          {tenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" /> Exportar
        </Button>
      </div>
    </div>
  );
};

export default FinanceFilters;
