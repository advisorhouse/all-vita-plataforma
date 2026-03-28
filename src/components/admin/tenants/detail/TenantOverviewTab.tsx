import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, Users, Handshake, DollarSign, Globe, ExternalLink, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TenantOverviewTabProps {
  tenant: any;
  metrics: { clients: number; partners: number; revenue: number };
}

function formatCnpj(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

const TenantOverviewTab: React.FC<TenantOverviewTabProps> = ({ tenant, metrics }) => {
  const navigate = useNavigate();
  const isActive = tenant.status === "active" || tenant.active !== false;

  const metricCards = [
    { label: "Receita MRR", value: `R$ ${metrics.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-amber-600" },
    { label: "Clientes", value: metrics.clients, icon: Users, color: "text-blue-600" },
    { label: "Parceiros", value: metrics.partners, icon: Handshake, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricCards.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <m.icon className={`h-6 w-6 mx-auto mb-2 ${m.color}`} />
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Razão Social</p>
              <p className="font-medium">{tenant.name}</p>
            </div>
            {tenant.trade_name && (
              <div>
                <p className="text-muted-foreground text-xs">Nome Fantasia</p>
                <p className="font-medium">{tenant.trade_name}</p>
              </div>
            )}
            {tenant.cnpj && (
              <div>
                <p className="text-muted-foreground text-xs">CNPJ</p>
                <p className="font-medium">{formatCnpj(tenant.cnpj)}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs">Slug</p>
              <p className="font-medium">{tenant.slug}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Domínio</p>
              <p className="font-medium flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {tenant.domain || `${tenant.slug}.allvita.com.br`}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <Badge variant={isActive ? "default" : "destructive"} className="text-[10px] mt-0.5">
                {isActive ? "Ativa" : "Suspensa"}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Criado em</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(tenant.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Última atualização</p>
              <p className="font-medium">
                {new Date(tenant.updated_at || tenant.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Branding */}
          <Separator className="my-4" />
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Branding</h4>
          <div className="flex items-center gap-4">
            {tenant.logo_url && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Logo</p>
                <img src={tenant.logo_url} alt="Logo" className="h-16 w-16 rounded-lg object-contain border" />
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Cor Principal</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md border" style={{ background: tenant.primary_color || "#6366f1" }} />
                <span className="text-sm font-mono">{tenant.primary_color || "#6366f1"}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Cor Secundária</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md border" style={{ background: tenant.secondary_color || "#818cf8" }} />
                <span className="text-sm font-mono">{tenant.secondary_color || "#818cf8"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acesso Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start gap-2 h-11">
              <Building2 className="h-4 w-4" /> Acessar Core
              <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-11">
              <Handshake className="h-4 w-4" /> Acessar Partner
              <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-11">
              <Users className="h-4 w-4" /> Acessar Club
              <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantOverviewTab;
