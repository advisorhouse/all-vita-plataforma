import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, Globe, Users, Handshake, DollarSign, ExternalLink, Shield, FileText } from "lucide-react";

interface TenantDrawerProps {
  tenant: any | null;
  open: boolean;
  onClose: () => void;
  metrics: { clients: number; partners: number; revenue: number };
}

function formatCnpj(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

const TenantDrawer: React.FC<TenantDrawerProps> = ({ tenant, open, onClose, metrics }) => {
  if (!tenant) return null;

  const isActive = tenant.status === "active" || tenant.active !== false;

  const metricCards = [
    { label: "Receita MRR", value: `R$ ${metrics.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-amber-600" },
    { label: "Clientes", value: metrics.clients, icon: Users, color: "text-blue-600" },
    { label: "Parceiros", value: metrics.partners, icon: Handshake, color: "text-emerald-600" },
  ];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-12 w-12 rounded-xl object-contain border" />
            ) : (
              <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: tenant.primary_color || "hsl(var(--primary))" }}>
                <Building2 className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <SheetTitle className="text-lg">{tenant.trade_name || tenant.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={isActive ? "default" : "destructive"} className="text-[10px]">
                  {isActive ? "Ativa" : "Suspensa"}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {tenant.slug}.allvita.com.br
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {metricCards.map((m) => (
            <div key={m.label} className="rounded-lg border p-3 text-center">
              <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <p className="text-lg font-bold">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        <Separator className="mb-4" />

        {/* Company Info */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dados da Empresa</h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">Razão Social</span>
            <span className="font-medium">{tenant.name}</span>
            {tenant.trade_name && (
              <>
                <span className="text-muted-foreground">Fantasia</span>
                <span className="font-medium">{tenant.trade_name}</span>
              </>
            )}
            {tenant.cnpj && (
              <>
                <span className="text-muted-foreground">CNPJ</span>
                <span className="font-medium">{formatCnpj(tenant.cnpj)}</span>
              </>
            )}
            <span className="text-muted-foreground">Criado em</span>
            <span className="font-medium">{new Date(tenant.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Acesso Rápido</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="justify-start gap-2 h-10">
              <Building2 className="h-4 w-4" /> Acessar Core
              <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-10">
              <Handshake className="h-4 w-4" /> Acessar Partner
              <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-10">
              <Users className="h-4 w-4" /> Acessar Club
              <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Segurança
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Auditoria
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TenantDrawer;
