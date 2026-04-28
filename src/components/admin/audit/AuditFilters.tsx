import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";

interface Tenant { id: string; name: string }

interface AuditFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  periodFilter: string;
  onPeriodChange: (v: string) => void;
  actionFilter: string;
  onActionChange: (v: string) => void;
  entityFilter: string;
  onEntityChange: (v: string) => void;
  severityFilter: string;
  onSeverityChange: (v: string) => void;
  tenantFilter: string;
  onTenantChange: (v: string) => void;
  tenants: Tenant[];
}

const AuditFilters: React.FC<AuditFiltersProps> = ({
  search, onSearchChange, periodFilter, onPeriodChange,
  actionFilter, onActionChange, entityFilter, onEntityChange,
  severityFilter, onSeverityChange, tenantFilter, onTenantChange, tenants,
}) => (
  <Card>
    <CardContent className="p-4 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ação, usuário, entidade..."
            className="pl-10"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={periodFilter} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col lg:flex-row gap-3">
        <Select value={actionFilter} onValueChange={onActionChange}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Tipo de ação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            <SelectItem value="onboarding_redirect">Redirecionamento Onboarding</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="user_created">Criação de usuário</SelectItem>
            <SelectItem value="tenant_created">Criação de empresa</SelectItem>
            <SelectItem value="permission_changed">Alteração de permissão</SelectItem>
            <SelectItem value="update">Edição</SelectItem>
            <SelectItem value="delete">Exclusão</SelectItem>
            <SelectItem value="lgpd_anonymization">LGPD</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={onEntityChange}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Entidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="tenant">Empresa</SelectItem>
            <SelectItem value="memberships">Memberships</SelectItem>
            <SelectItem value="partner">Parceiro</SelectItem>
            <SelectItem value="commission">Comissão</SelectItem>
            <SelectItem value="order">Pedido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={onSeverityChange}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Severidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">🟢 Baixo</SelectItem>
            <SelectItem value="medium">🟡 Médio</SelectItem>
            <SelectItem value="high">🟠 Alto</SelectItem>
            <SelectItem value="critical">🔴 Crítico</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tenantFilter} onValueChange={onTenantChange}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {tenants.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

export default AuditFilters;
