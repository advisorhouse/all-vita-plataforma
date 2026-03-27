import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ChevronRight, Globe, Users, Handshake, UserCheck } from "lucide-react";

interface TenantRow {
  id: string;
  name: string;
  trade_name: string | null;
  slug: string;
  active: boolean;
  clientCount: number;
  partnerCount: number;
  revenue: number;
}

interface TenantTableProps {
  tenants: TenantRow[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const TenantTable: React.FC<TenantTableProps> = ({ tenants }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Performance por Empresa</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/tenants")}>
            Ver todas <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 text-xs font-medium text-muted-foreground">Empresa</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground text-center">Clientes</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground text-center">Parceiros</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Receita</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tenants.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => navigate("/admin/tenants")}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10">
                        <Globe className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-xs">{t.trade_name || t.name}</p>
                        <p className="text-[10px] text-muted-foreground">{t.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-xs font-medium">{t.clientCount}</span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-xs font-medium">{t.partnerCount}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-xs font-medium">{formatCurrency(t.revenue)}</span>
                  </td>
                  <td className="py-3 text-center">
                    <Badge variant={t.active ? "default" : "secondary"} className="text-[9px]">
                      {t.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                    Nenhuma empresa cadastrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantTable;
