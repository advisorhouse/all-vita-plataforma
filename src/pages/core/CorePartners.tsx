import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import RegisterPartnerModal from "@/components/core/RegisterPartnerModal";
import { toast } from "sonner";
import {
  Handshake, Search, Users, DollarSign, TrendingUp, ShieldCheck,
  ArrowUpRight, ArrowDownRight, ChevronRight, Eye, MoreHorizontal,
  Crown, Award, Star, AlertTriangle, Filter, UserPlus, Mail, Loader2
} from "lucide-react";

import { InfoTip } from "@/components/ui/info-tip";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  basic: { label: "Basic", color: "text-muted-foreground", bg: "bg-secondary", icon: Star },
  silver: { label: "Silver", color: "text-foreground", bg: "bg-secondary", icon: Award },
  gold: { label: "Gold", color: "text-warning", bg: "bg-warning/10", icon: Award },
  platinum: { label: "Platinum", color: "text-accent", bg: "bg-accent/10", icon: Crown },
  diamond: { label: "Diamond", color: "text-accent", bg: "bg-accent/10", icon: Crown },
};

type FilterStatus = "all" | "active" | "inactive";
type FilterLevel = "all" | "basic" | "silver" | "gold" | "platinum" | "diamond";

/* ─── Component ─────────────────────────────────────────── */
const CorePartners: React.FC = () => {
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [registerOpen, setRegisterOpen] = useState(searchParams.get("register") === "true");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [levelFilter, setLevelFilter] = useState<FilterLevel>("all");
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading } = useQuery({

    queryKey: ["core-partners", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from("partners")
        .select(`
          id,
          user_id,
          level,
          active,
          metadata,
          pix_key,
          pix_key_type,
          profiles:user_id (email, first_name, last_name)
        `)
        .eq("tenant_id", currentTenant.id);
      
      if (error) throw error;
      
      return (data || []).map(p => {
        const profile = p.profiles as any;
        return {
          id: p.id,
          userId: p.user_id,
          name: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Sem nome",
          email: profile?.email || "Sem email",
          level: p.level || "basic",
          status: p.active ? "active" : "inactive",
          pixKey: p.pix_key,
          pixType: p.pix_key_type,
          clients: (p.metadata as any)?.clients || 0,
          activeClients: (p.metadata as any)?.activeClients || 0,
          retention: (p.metadata as any)?.retention || 0,
          mrr: (p.metadata as any)?.mrr || 0,
          ltv: (p.metadata as any)?.ltv || 0,
          commission: (p.metadata as any)?.commission || 0,
          progress: (p.metadata as any)?.progress || 0,
          trend: (p.metadata as any)?.trend || "up",
          riskClients: (p.metadata as any)?.riskClients || 0
        };
      });
    },

    enabled: !!currentTenant?.id
  });

  const resendInviteMutation = useMutation({
    mutationFn: async ({ email, name, userId }: { email: string; name: string, userId: string }) => {
      const { data: res, error } = await supabase.functions.invoke("manage-users/resend-invite", {
        headers: { "X-Tenant-Id": currentTenant?.id || "" },
        body: { email, full_name: name, userId },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Convite reenviado com sucesso!");
      refetchAuthStatus();
    },
    onError: (err: any) => {
      toast.error("Erro ao reenviar convite", { description: err.message });
    }
  });

  const { data: authStatus = {}, refetch: refetchAuthStatus } = useQuery({

    queryKey: ["partners-auth-status", currentTenant?.id, partners.map(p => p.userId).filter(Boolean)],
    queryFn: async () => {
      const userIds = partners.map(p => p.userId).filter(Boolean);
      if (!userIds.length) return {};
      const { data, error } = await supabase.functions.invoke("manage-users/auth-status", {
        body: { userIds }
      });
      if (error) throw error;
      const statusMap: Record<string, any> = {};
      data.data.forEach((s: any) => {
        statusMap[s.id] = s;
      });
      return statusMap;
    },
    enabled: partners.length > 0,
    refetchInterval: 30000 // A cada 30s
  });


  const filtered = partners.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (levelFilter !== "all" && p.level !== levelFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });



  const pendingInvitations = partners.filter(p => authStatus[p.userId] && !authStatus[p.userId].email_confirmed_at).length;
  const totalPartners = partners.length;
  const activePartners = partners.filter((p) => p.status === "active").length;

  const totalMRR = partners.reduce((sum, p) => sum + p.mrr, 0);
  const avgRetention = activePartners > 0 ? Math.round(partners.filter(p => p.status === "active").reduce((s, p) => s + p.retention, 0) / activePartners) : 0;
  const totalClients = partners.reduce((sum, p) => sum + p.activeClients, 0);

  const totalCommission = partners.reduce((sum, p) => sum + p.commission, 0);
  return (
    <TooltipProvider delayDuration={200}>

      <div className="space-y-5 pb-12">
        {/* ═══ HEADER ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Gestão de Partners</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">Monitore performance, níveis e receita gerada por cada parceiro.</p>
            </div>
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => setRegisterOpen(true)}>
              <UserPlus className="h-3.5 w-3.5" />
              Cadastrar Partner
            </Button>
          </div>
        </motion.div>

        {/* ═══ KPIs ═══ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Partners", value: totalPartners.toString(), icon: Handshake, accent: false, tip: "Número total de parceiros cadastrados no programa de afiliados." },
              { label: "Ativos", value: activePartners.toString(), icon: Users, accent: false, tip: "Partners com pelo menos 1 cliente ativo e status operacional." },
              { label: "Clientes Atribuídos", value: totalClients.toString(), icon: Users, accent: false, tip: "Total de clientes ativos vinculados a algum partner." },
              { label: "MRR Gerado", value: `R$ ${(totalMRR / 1000).toFixed(1)}k`, icon: DollarSign, accent: true, tip: "Receita mensal recorrente gerada pela base de clientes dos partners." },
              { label: "Retenção Média", value: `${avgRetention}%`, icon: ShieldCheck, accent: false, tip: "Média de retenção dos clientes dos partners ativos. Acima de 80% é considerado saudável." },
              { label: "Comissão Total", value: `R$ ${(totalCommission / 1000).toFixed(1)}k`, icon: TrendingUp, accent: false, tip: "Total de comissões geradas por todos os partners no período." },
            ].map(({ label, value, icon: Icon, accent, tip }) => (
              <Card key={label} className={cn("border-border", accent && "border-accent/20 bg-accent/[0.03]")}>
                <CardContent className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", accent ? "bg-accent/10" : "bg-secondary")}>
                      <Icon className={cn("h-3.5 w-3.5", accent ? "text-accent" : "text-muted-foreground")} strokeWidth={1.8} />
                    </div>
                    <InfoTip text={tip} />
                  </div>
                  <p className={cn("text-lg font-bold tracking-tight", accent ? "text-accent" : "text-foreground")}>{value}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ FILTERS ═══ */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar partner..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {(["all", "active", "inactive"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
                    statusFilter === f ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Inativos"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {(["all", "basic", "silver", "gold", "platinum"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setLevelFilter(f)}
                  className={cn(
                    "rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-colors",
                    levelFilter === f ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === "all" ? "Todos Níveis" : LEVEL_CONFIG[f]?.label || f}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ TABLE ═══ */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                     <TableHead className="text-[10px] uppercase tracking-wider font-semibold w-[220px]">Partner</TableHead>
                     <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Nível</TableHead>
                     <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center"><span className="flex items-center justify-center gap-1">Clientes <InfoTip text="Clientes ativos / total de clientes atribuídos ao partner." /></span></TableHead>
                     <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center"><span className="flex items-center justify-center gap-1">Retenção <InfoTip text="% de clientes que permanecem ativos após 90 dias." /></span></TableHead>
                     <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right"><span className="flex items-center justify-end gap-1">MRR <InfoTip text="Receita mensal recorrente gerada pelos clientes deste partner." /></span></TableHead>
                     <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right"><span className="flex items-center justify-end gap-1">Comissão <InfoTip text="Total de comissões acumuladas pelo partner no período." /></span></TableHead>
                     <TableHead className="text-[10px] uppercase tracking-wider font-semibold"><span className="flex items-center gap-1">Progressão <InfoTip text="Progresso em direção ao próximo nível do programa de partners." /></span></TableHead>
                     <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center w-[60px]"><span className="flex items-center justify-center gap-1">Risco <InfoTip text="Clientes em risco de churn neste partner." /></span></TableHead>
                     <TableHead className="w-[40px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const lvl = LEVEL_CONFIG[p.level] || LEVEL_CONFIG.basic;
                    const LvlIcon = lvl.icon;
                    return (
                      <TableRow key={p.id} className="group cursor-pointer">
                        {/* Partner info */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                              {p.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{p.email}</p>
                              {p.pixKey && (
                                <Badge variant="secondary" className="mt-1 h-4 text-[8px] px-1 py-0 uppercase">
                                  PIX: {p.pixType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Level */}
                        <TableCell className="text-center">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", lvl.bg, lvl.color)}>
                            <LvlIcon className="h-3 w-3" />
                            {lvl.label}
                          </span>
                        </TableCell>

                        {/* Clients */}
                        <TableCell className="text-center">
                          <div className="text-sm font-semibold text-foreground">{p.activeClients}</div>
                          <div className="text-[9px] text-muted-foreground">de {p.clients}</div>
                        </TableCell>

                        {/* Retention */}
                        <TableCell className="text-center">
                          <span className={cn(
                            "text-sm font-semibold",
                            p.retention >= 85 ? "text-success" : p.retention >= 70 ? "text-warning" : "text-destructive"
                          )}>
                            {p.retention}%
                          </span>
                        </TableCell>

                        {/* MRR */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm font-semibold text-foreground">R$ {p.mrr.toLocaleString("pt-BR")}</span>
                            {p.trend === "up" ? (
                              <ArrowUpRight className="h-3 w-3 text-success" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        </TableCell>

                        {/* Commission */}
                        <TableCell className="text-right">
                          <span className="text-sm text-foreground">R$ {p.commission.toLocaleString("pt-BR")}</span>
                        </TableCell>

                        {/* Progress */}
                        <TableCell>
                          <div className="space-y-1 min-w-[100px]">
                            <Progress value={p.progress} className="h-1.5" />
                            <p className="text-[9px] text-muted-foreground">{p.progress}% para próximo nível</p>
                          </div>
                        </TableCell>

                        {/* Risk */}
                        <TableCell className="text-center">
                          {p.riskClients > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-destructive">
                                  <AlertTriangle className="h-3 w-3" />
                                  {p.riskClients}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-[11px]">
                                {p.riskClients} cliente{p.riskClients > 1 ? "s" : ""} em risco de churn
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-[10px] text-success">OK</span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {authStatus[p.userId] && !authStatus[p.userId].email_confirmed_at && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7 text-warning hover:text-warning hover:bg-warning/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      resendInviteMutation.mutate({ 
                                        email: p.email, 
                                        name: p.name, 
                                        userId: p.userId 
                                      });
                                    }}
                                    disabled={resendInviteMutation.isPending}
                                  >
                                    {resendInviteMutation.isPending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Mail className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-[11px]">
                                  Reenviar convite (Ainda não ativou a conta)
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-sm text-muted-foreground">
                        Nenhum partner encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ BOTTOM STATS ═══ */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distribuição por Nível */}
            <Card className="border-border">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Distribuição por Nível</h3>
                {(["platinum", "gold", "silver", "basic"] as const).map((level) => {
                  const count = partners.filter((p) => p.level === level).length;
                  const pct = totalPartners > 0 ? Math.round((count / totalPartners) * 100) : 0;
                  const cfg = LEVEL_CONFIG[level];
                  return (
                    <div key={level} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={cn("font-medium flex items-center gap-1.5", cfg.color)}>
                          <cfg.icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                        <span className="text-muted-foreground">{count} partners ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Top Performers</h3>
                  <span className="text-[10px] text-muted-foreground">Por MRR gerado</span>
                </div>
                {partners.filter((p) => p.status === "active")
                  .sort((a, b) => b.mrr - a.mrr)
                  .slice(0, 5)
                  .map((p, i) => {
                    const lvl = LEVEL_CONFIG[p.level] || LEVEL_CONFIG.basic;
                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                          i === 0 ? "bg-warning/10 text-warning" : i === 1 ? "bg-secondary text-foreground" : "bg-secondary text-muted-foreground"
                        )}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.activeClients} clientes · {p.retention}% retenção</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">R$ {p.mrr.toLocaleString("pt-BR")}</p>
                          <p className="text-[9px] text-muted-foreground">MRR/mês</p>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
      <RegisterPartnerModal open={registerOpen} onOpenChange={setRegisterOpen} />
    </TooltipProvider>
  );
};

export default CorePartners;