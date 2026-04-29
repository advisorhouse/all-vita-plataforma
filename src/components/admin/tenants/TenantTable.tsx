import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Building2, Eye, Pencil, Ban, BarChart3, MoreVertical, Globe, Settings, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DeleteTenantDialog from "./DeleteTenantDialog";

interface TenantTableProps {
  tenants: any[];
  tenantMetrics: Record<string, { clients: number; partners: number; revenue: number }>;
  onViewTenant: (tenant: any) => void;
  onDeleteTenant?: (tenantId: string) => Promise<void>;
  isDeleting?: string | null;
  onResumeSetup?: (tenant: any) => void;
}

function formatCnpj(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

const TenantTable: React.FC<TenantTableProps> = ({ tenants, tenantMetrics, onViewTenant, onDeleteTenant, isDeleting }) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const isActive = (t: any) => t.status === "active" || t.active !== false;

  if (tenants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">Empresa</TableHead>
            <TableHead>Domínio</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Receita (MRR)</TableHead>
            <TableHead className="text-center">Clientes</TableHead>
            <TableHead className="text-center">Parceiros</TableHead>
            <TableHead>Última atividade</TableHead>
            <TableHead className="text-right w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((t) => {
            const metrics = tenantMetrics[t.id] || { clients: 0, partners: 0, revenue: 0 };
            const active = isActive(t);
            return (
              <TableRow
                key={t.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/admin/tenants/${t.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {t.logo_url ? (
                      <img src={t.logo_url} alt={t.name} className="h-9 w-9 rounded-lg object-contain border" />
                    ) : (
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: t.primary_color || "hsl(var(--primary))" }}
                      >
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{t.trade_name || t.name}</p>
                      {t.cnpj && <p className="text-xs text-muted-foreground">{formatCnpj(t.cnpj)}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>{t.slug}.allvita.com.br</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {t.dns_status === 'pending' ? (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px]">
                      🟡 Aguardando DNS
                    </Badge>
                  ) : (
                    <Badge variant={active ? "default" : "destructive"} className="text-[10px]">
                      {active ? "🟢 Ativa" : "🔴 Suspensa"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-sm">
                  R$ {metrics.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-center tabular-nums text-sm">{metrics.clients}</TableCell>
                <TableCell className="text-center tabular-nums text-sm">{metrics.partners}</TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {new Date(t.updated_at || t.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!isDeleting}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {t.dns_status === 'pending' && onResumeSetup && (
                        <DropdownMenuItem onClick={() => onResumeSetup(t)} className="text-amber-600 font-medium">
                          <Globe className="h-4 w-4 mr-2" /> Concluir Configuração
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navigate(`/admin/tenants/${t.id}`)}>
                        <Eye className="h-4 w-4 mr-2" /> Ver empresa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/tenants/${t.id}?tab=edit`)}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/tenants/${t.id}?tab=config`)}>
                        <Settings className="h-4 w-4 mr-2" /> Configurar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/tenants/${t.id}?tab=analytics`)}>
                        <BarChart3 className="h-4 w-4 mr-2" /> Ver analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => navigate(`/admin/tenants/${t.id}?suspend=true`)}>
                        <Ban className="h-4 w-4 mr-2" /> {active ? "Suspender" : "Reativar"}
                      </DropdownMenuItem>
                      {onDeleteTenant && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive font-medium" 
                            onClick={() => setConfirmDelete(t)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir permanentemente
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {confirmDelete && (
        <DeleteTenantDialog
          open={!!confirmDelete}
          onOpenChange={(open) => !open && setConfirmDelete(null)}
          tenantName={confirmDelete.trade_name || confirmDelete.name}
          isDeleting={isDeleting === confirmDelete.id}
          onConfirm={async () => {
            if (onDeleteTenant) {
              await onDeleteTenant(confirmDelete.id);
              setConfirmDelete(null);
            }
          }}
        />
      )}
    </div>

  );
};

export default TenantTable;
