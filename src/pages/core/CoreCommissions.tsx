import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import {
  Percent, DollarSign, Shield, AlertTriangle, TrendingUp,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, FileText,
  ChevronRight, ArrowUpRight, ArrowDownRight, Eye, Layers,
  CheckCircle, XCircle, Clock, Search, Filter, Banknote,
  Upload, ExternalLink, Loader2,
} from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ─── Animation ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Type Config ───────────────────────────────────────── */
const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  initial: { label: "Inicial", color: "text-accent", bg: "bg-accent/10" },
  recurring: { label: "Recorrente", color: "text-success", bg: "bg-success/10" },
  bonus_retention: { label: "Bônus Retenção", color: "text-warning", bg: "bg-warning/10" },
  bonus_volume: { label: "Bônus Volume", color: "text-foreground", bg: "bg-secondary" },
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "text-warning", icon: Clock },
  paid: { label: "Pago", color: "text-success", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "text-destructive", icon: XCircle },
};

/* ─── Mock Data ─────────────────────────────────────────── */
const RULES = [
  { id: "1", name: "Comissão Inicial", type: "initial", level: "all", percentage: 15, fixedBonus: 0, minMonths: 0, maxMonths: null, allowStack: false, active: true, priority: 1, description: "Comissão padrão na primeira venda" },
  { id: "2", name: "Comissão Recorrente", type: "recurring", level: "all", percentage: 10, fixedBonus: 0, minMonths: 1, maxMonths: null, allowStack: false, active: true, priority: 2, description: "Comissão mensal por cliente ativo" },
  { id: "3", name: "Bônus 6 Meses", type: "bonus_retention", level: "silver", percentage: 5, fixedBonus: 25, minMonths: 6, maxMonths: null, allowStack: true, active: true, priority: 3, description: "Bônus por cliente que completa 6 meses" },
  { id: "4", name: "Bônus 12 Meses", type: "bonus_retention", level: "gold", percentage: 5, fixedBonus: 50, minMonths: 12, maxMonths: null, allowStack: true, active: true, priority: 4, description: "Bônus por cliente que completa 12 meses" },
  { id: "5", name: "Bônus Volume Elite", type: "bonus_volume", level: "platinum", percentage: 3, fixedBonus: 0, minMonths: 0, maxMonths: null, allowStack: true, active: false, priority: 5, description: "Bônus extra para partners Platinum com +20 clientes" },
];

const AUDIT_LOG = [
  { id: "a1", date: "03/03/2026", partner: "Camila S.", client: "Maria S.", rule: "Comissão Recorrente", orderAmount: 149.90, percentage: 10, commission: 14.99, type: "recurring", marginOk: true, margin: 55 },
  { id: "a2", date: "03/03/2026", partner: "Ana P.", client: "Juliana M.", rule: "Comissão Recorrente", orderAmount: 199.90, percentage: 10, commission: 19.99, type: "recurring", marginOk: true, margin: 52 },
  { id: "a3", date: "02/03/2026", partner: "Camila S.", client: "Beatriz O.", rule: "Bônus 6 Meses", orderAmount: 149.90, percentage: 5, commission: 7.50, type: "bonus_retention", marginOk: true, margin: 48 },
  { id: "a4", date: "02/03/2026", partner: "Julia M.", client: "Carla R.", rule: "Comissão Inicial", orderAmount: 149.90, percentage: 15, commission: 22.49, type: "initial", marginOk: true, margin: 42 },
  { id: "a5", date: "01/03/2026", partner: "Fernanda R.", client: "Larissa A.", rule: "Comissão Recorrente", orderAmount: 99.90, percentage: 10, commission: 9.99, type: "recurring", marginOk: false, margin: 18 },
  { id: "a6", date: "01/03/2026", partner: "Patrícia L.", client: "Roberta F.", rule: "Comissão Inicial", orderAmount: 149.90, percentage: 15, commission: 22.49, type: "initial", marginOk: true, margin: 45 },
  { id: "a7", date: "28/02/2026", partner: "Camila S.", client: "Fernanda L.", rule: "Bônus 12 Meses", orderAmount: 199.90, percentage: 5, commission: 10.00, type: "bonus_retention", marginOk: true, margin: 50 },
  { id: "a8", date: "28/02/2026", partner: "Ana P.", client: "Patrícia D.", rule: "Comissão Recorrente", orderAmount: 149.90, percentage: 10, commission: 14.99, type: "recurring", marginOk: true, margin: 53 },
];

const MARGIN_RULES = [
  { id: "m1", name: "Proteção Padrão", maxPct: 30, alertThreshold: 20, blockThreshold: 10, maxPerClient: 500, active: true },
];

const TEMPLATES = [
  { id: "t1", name: "Modelo Padrão", description: "Comissão inicial 15% + recorrente 10% + bônus retenção", rulesCount: 4, active: true },
  { id: "t2", name: "Modelo Agressivo", description: "Comissão inicial 20% + recorrente 12% para campanhas especiais", rulesCount: 3, active: false },
  { id: "t3", name: "Modelo Conservador", description: "Comissão inicial 10% + recorrente 8% para proteção de margem", rulesCount: 2, active: false },
];

/* ─── Component ─────────────────────────────────────────── */
const CoreCommissions: React.FC = () => {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [auditSearch, setAuditSearch] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch real commissions
  const { data: commissions = [], isLoading: loadingCommissions } = useQuery({
    queryKey: ["commissions", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from("commissions")
        .select(`
          *,
          partners (
            id,
            pix_key,
            pix_key_type,
            profiles:user_id (first_name, last_name, email)
          ),
          orders (amount)
        `)
        .eq("tenant_id", currentTenant.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id
  });

  const payMutation = useMutation({
    mutationFn: async ({ partnerId, proof }: { partnerId: string; proof: string }) => {
      const { error } = await supabase
        .from("commissions")
        .update({
          paid_status: "paid",
          paid_at: new Date().toISOString(),
          payment_proof_url: proof
        })
        .eq("partner_id", partnerId)
        .eq("paid_status", "pending")
        .eq("tenant_id", currentTenant?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Pagamentos marcados como concluídos!");
      setPaymentModalOpen(false);
      setSelectedPartner(null);
      setProofUrl("");
    },
    onError: (error) => {
      toast.error("Erro ao processar pagamento: " + error.message);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTenant?.id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${currentTenant.id}/proofs/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setProofUrl(publicUrl);
      toast.success("Comprovante enviado!");
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const totalCommission = commissions.reduce((s, a) => s + (a.amount || 0), 0);
  const avgMargin = 45; // Placeholder for now
  const marginAlerts = 0;
  const activeRulesCount = commissions.length; // Placeholder or we fetch rules below
  
  // Fetch rules
  const { data: rules = [] } = useQuery({
    queryKey: ["commission-rules", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from("commission_rules")
        .select("*")
        .eq("tenant_id", currentTenant.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id
  });

  const activeRules = rules.filter((r) => r.active).length;

  const filteredAudit = commissions.filter((a: any) => {
    const partnerName = `${a.partners?.profiles?.first_name || ""} ${a.partners?.profiles?.last_name || ""}`.toLowerCase();
    const search = auditSearch.toLowerCase();
    return !auditSearch || partnerName.includes(search) || a.commission_type.includes(search);
  });

  // Group pending payments by partner
  const pendingByPartner = commissions.reduce((acc: any, curr: any) => {
    if (curr.paid_status !== "pending") return acc;
    const pId = curr.partner_id;
    if (!acc[pId]) {
      const p = curr.partners;
      acc[pId] = {
        partnerId: pId,
        name: `${p?.profiles?.first_name || ""} ${p?.profiles?.last_name || ""}`.trim() || "Partner",
        email: p?.profiles?.email,
        pixKey: p?.pix_key,
        pixType: p?.pix_key_type,
        total: 0,
        count: 0
      };
    }
    acc[pId].total += curr.amount;
    acc[pId].count += 1;
    return acc;
  }, {});

  const pendingList = Object.values(pendingByPartner);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">
        {/* ═══ HEADER ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-xl font-bold text-foreground">Comissões</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Regras, auditoria de pagamentos e proteção de margem.</p>
        </motion.div>

        {/* ═══ KPIs ═══ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Regras Ativas", value: `${activeRules}/${RULES.length}`, icon: Layers, accent: false, tip: "Quantidade de regras de comissão ativas sobre o total configurado." },
              { label: "Comissão (30d)", value: `R$ ${(totalCommission).toFixed(0)}`, icon: DollarSign, accent: true, tip: "Total de comissões processadas nos últimos 30 dias." },
              { label: "Margem Média", value: `${avgMargin}%`, icon: Shield, accent: false, tip: "Margem líquida média após comissões. Abaixo de 20% aciona alerta de proteção." },
              { label: "Alertas Margem", value: marginAlerts.toString(), icon: AlertTriangle, accent: false, warn: marginAlerts > 0, tip: "Transações onde a margem ficou abaixo do limite seguro de proteção." },
            ].map(({ label, value, icon: Icon, accent, warn, tip }) => (
              <Card key={label} className={cn("border-border", accent && "border-accent/20 bg-accent/[0.03]", warn && "border-destructive/20 bg-destructive/[0.03]")}>
                <CardContent className="p-3.5 space-y-1.5">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", accent ? "bg-accent/10" : warn ? "bg-destructive/10" : "bg-secondary")}>
                    <Icon className={cn("h-3.5 w-3.5", accent ? "text-accent" : warn ? "text-destructive" : "text-muted-foreground")} strokeWidth={1.8} />
                  </div>
                  <p className={cn("text-lg font-bold tracking-tight", accent ? "text-accent" : warn ? "text-destructive" : "text-foreground")}>{value}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-muted-foreground truncate">{label}</p>
                    <InfoTip text={tip} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ TABS ═══ */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 w-full max-w-2xl">
              <TabsTrigger value="rules" className="gap-1.5 text-xs"><Percent className="h-3.5 w-3.5" />Regras</TabsTrigger>
              <TabsTrigger value="payments" className="gap-1.5 text-xs"><Banknote className="h-3.5 w-3.5" />Pagamentos</TabsTrigger>
              <TabsTrigger value="audit" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Auditoria</TabsTrigger>
              <TabsTrigger value="margin" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Proteção</TabsTrigger>
              <TabsTrigger value="templates" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" />Templates</TabsTrigger>
            </TabsList>

            {/* ─── RULES TAB ─── */}
            <TabsContent value="rules" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Regras de Comissão</p>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Nova Regra
                </Button>
              </div>

              <Card className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold">P</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Regra</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Tipo</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Nível</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">%</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Bônus Fixo</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Meses</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Stack</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Status</TableHead>
                        <TableHead className="w-[80px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((r: any) => {
                        const tp = TYPE_LABELS[r.type] || TYPE_LABELS.initial;
                        return (
                          <TableRow key={r.id} className="group">
                            <TableCell className="text-[11px] font-mono text-muted-foreground">#1</TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium text-foreground">{r.name || "Regra de Comissão"}</p>
                                <p className="text-[10px] text-muted-foreground">Nível {r.level}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", tp.bg, tp.color)}>{tp.label}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="text-[10px]">{r.level}</Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold text-foreground">{r.percentage}%</TableCell>
                            <TableCell className="text-right text-sm text-foreground">—</TableCell>
                            <TableCell className="text-center text-[11px] text-muted-foreground">
                              {(r.min_months || 0) > 0 ? `≥ ${r.min_months}m` : "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-[10px] text-muted-foreground">Não</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                r.active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                              )}>
                                {r.active ? "Ativa" : "Inativa"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground"><Pencil className="h-3 w-3" /></button>
                                <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── PAYMENTS TAB ─── */}
            <TabsContent value="payments" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Pagamentos Pendentes (PIX Manual)</p>
              </div>

              <Card className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Partner</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Chave PIX</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Qtde</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Total a Pagar</TableHead>
                        <TableHead className="w-[120px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingList.map((p: any) => (
                        <TableRow key={p.partnerId}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="text-[9px] uppercase">{p.pixType}</Badge>
                              <span className="text-[12px] font-mono">{p.pixKey || "Não cadastrada"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">{p.count}</TableCell>
                          <TableCell className="text-right text-sm font-bold text-foreground">R$ {p.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              className="h-8 text-[11px] gap-1.5" 
                              onClick={() => {
                                setSelectedPartner(p);
                                setPaymentModalOpen(true);
                              }}
                            >
                              Pagar Agora
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {pendingList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                            Nenhum pagamento pendente no momento.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── AUDIT TAB ─── */}
            <TabsContent value="audit" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} placeholder="Buscar no log..." className="pl-9 h-9 text-sm" />
                </div>
                <p className="text-[11px] text-muted-foreground">{filteredAudit.length} registros</p>
              </div>

              <Card className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Data</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Partner</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Tipo</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Pedido</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Comissão</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAudit.map((a: any) => {
                        const tp = TYPE_LABELS[a.commission_type] || TYPE_LABELS.initial;
                        const status = STATUS_LABELS[a.paid_status] || STATUS_LABELS.pending;
                        const StatusIcon = status.icon;
                        const partnerName = `${a.partners?.profiles?.first_name || ""} ${a.partners?.profiles?.last_name || ""}`.trim() || "Partner";
                        
                        return (
                          <TableRow key={a.id}>
                            <TableCell className="text-[11px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-sm font-medium text-foreground">{partnerName}</TableCell>
                            <TableCell>
                              <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium", tp.bg, tp.color)}>{tp.label}</span>
                            </TableCell>
                            <TableCell className="text-right text-sm text-foreground">R$ {(a.orders?.amount || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-right text-sm font-semibold text-foreground">R$ {a.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <div className={cn("flex items-center justify-center gap-1 text-[10px] font-medium", status.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                                {a.payment_proof_url && (
                                  <a href={a.payment_proof_url} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── MARGIN PROTECTION TAB ─── */}
            <TabsContent value="margin" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Regras de Proteção de Margem</p>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Nova Regra
                </Button>
              </div>

              {MARGIN_RULES.map((mr) => (
                <Card key={mr.id} className="border-border">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                          <Shield className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{mr.name}</p>
                          <p className="text-[11px] text-muted-foreground">Limite máximo de comissão: {mr.maxPct}%</p>
                        </div>
                      </div>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        mr.active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                      )}>
                        {mr.active ? "Ativa" : "Inativa"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Comissão Máx.</p>
                        <p className="text-lg font-bold text-foreground">{mr.maxPct}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Alerta em</p>
                        <p className="text-lg font-bold text-warning">{mr.alertThreshold}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bloqueio em</p>
                        <p className="text-lg font-bold text-destructive">{mr.blockThreshold}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Máx/Cliente</p>
                        <p className="text-lg font-bold text-foreground">R$ {mr.maxPerClient}</p>
                      </div>
                    </div>

                    {/* Visual margin gauge */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Margem Atual do Ecossistema</p>
                      <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-success rounded-full" style={{ width: `${avgMargin}%` }} />
                        <div className="absolute inset-y-0 bg-warning/30 rounded-full" style={{ left: `${mr.alertThreshold}%`, width: `${mr.blockThreshold}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                        <span>0%</span>
                        <span className="text-warning">Alerta ({mr.alertThreshold}%)</span>
                        <span className="text-destructive">Bloqueio ({mr.blockThreshold}%)</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* ─── TEMPLATES TAB ─── */}
            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Templates de Comissão</p>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Novo Template
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TEMPLATES.map((t) => (
                  <Card key={t.id} className={cn("border-border transition-all hover:shadow-md", t.active && "border-accent/20 bg-accent/[0.02]")}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        </div>
                        {t.active && (
                          <Badge className="text-[9px] bg-accent/10 text-accent border-0">Ativo</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-muted-foreground">{t.rulesCount} regras</span>
                        <div className="flex items-center gap-1">
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground">
                            <Eye className="h-3 w-3" />
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground">
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
        <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Pagamento</DialogTitle>
              <DialogDescription>
                Você está marcando as comissões de <strong>{selectedPartner?.name}</strong> como pagas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-secondary/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total a transferir:</span>
                  <span className="font-bold text-foreground">R$ {selectedPartner?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo PIX:</span>
                  <span className="font-medium text-foreground uppercase">{selectedPartner?.pixType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chave PIX:</span>
                  <span className="font-mono text-foreground">{selectedPartner?.pixKey}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Comprovante de Pagamento (Opcional)</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 border-dashed"
                    onClick={() => document.getElementById('proof-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {proofUrl ? "Trocar arquivo" : "Fazer upload do comprovante"}
                  </Button>
                  <input
                    id="proof-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                  />
                </div>
                {proofUrl && (
                  <p className="text-[10px] text-success flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Arquivo anexado com sucesso
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPaymentModalOpen(false)}>Cancelar</Button>
              <Button 
                onClick={() => payMutation.mutate({ partnerId: selectedPartner.partnerId, proof: proofUrl })}
                disabled={payMutation.isPending}
              >
                {payMutation.isPending ? "Processando..." : "Confirmar Pagamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default CoreCommissions;