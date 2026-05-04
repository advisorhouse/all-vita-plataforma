import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import {
  Gift, Trophy, Star, Target, Calendar, Users, TrendingUp,
  Plus, Pencil, Trash2, Eye, ChevronRight, Award,
  Zap, Crown, Shield, Heart, Gem, Clock, CheckCircle,
  ArrowUpRight, Sparkles, BarChart3, Loader2, Save
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

/* ─── Level Config ──────────────────────────────────────── */
const CLIENT_LEVELS = [
  { key: "inicio", label: "Início", icon: Heart, minMonths: 0, minConsistency: 0, minEngagement: 0, color: "text-muted-foreground", bg: "bg-secondary", clients: 142 },
  { key: "consistencia", label: "Consistência", icon: Zap, minMonths: 2, minConsistency: 40, minEngagement: 30, color: "text-accent", bg: "bg-accent/10", clients: 89 },
  { key: "protecao_ativa", label: "Proteção Ativa", icon: Shield, minMonths: 4, minConsistency: 60, minEngagement: 50, color: "text-success", bg: "bg-success/10", clients: 56 },
  { key: "longevidade", label: "Longevidade", icon: Crown, minMonths: 8, minConsistency: 75, minEngagement: 65, color: "text-warning", bg: "bg-warning/10", clients: 28 },
  { key: "elite_vision", label: "Elite Vision", icon: Gem, minMonths: 12, minConsistency: 85, minEngagement: 80, color: "text-destructive", bg: "bg-destructive/10", clients: 12 },
];

/* ─── Mock Benefits ─────────────────────────────────────── */
const BENEFITS = [
  { id: "b1", title: "Desconto 5% na próxima compra", type: "discount", requiredMonths: 2, active: true, redeemedCount: 67, totalUnlocked: 89 },
  { id: "b2", title: "Acesso a conteúdo exclusivo", type: "content", requiredMonths: 3, active: true, redeemedCount: 45, totalUnlocked: 72 },
  { id: "b3", title: "Brinde surpresa no envio", type: "gift", requiredMonths: 4, active: true, redeemedCount: 38, totalUnlocked: 56 },
  { id: "b4", title: "Desconto 10% + frete grátis", type: "discount", requiredMonths: 6, active: true, redeemedCount: 22, totalUnlocked: 41 },
  { id: "b5", title: "Produto edição limitada", type: "gift", requiredMonths: 8, active: true, redeemedCount: 12, totalUnlocked: 28 },
  { id: "b6", title: "Consulta visual personalizada", type: "service", requiredMonths: 10, active: true, redeemedCount: 5, totalUnlocked: 15 },
  { id: "b7", title: "Kit Elite Vision completo", type: "gift", requiredMonths: 12, active: true, redeemedCount: 3, totalUnlocked: 12 },
  { id: "b8", title: "Acesso VIP ao evento anual", type: "event", requiredMonths: 12, active: false, redeemedCount: 0, totalUnlocked: 0 },
];

const BENEFIT_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  discount: { label: "Desconto", color: "text-success", bg: "bg-success/10" },
  content: { label: "Conteúdo", color: "text-accent", bg: "bg-accent/10" },
  gift: { label: "Brinde", color: "text-warning", bg: "bg-warning/10" },
  service: { label: "Serviço", color: "text-foreground", bg: "bg-secondary" },
  event: { label: "Evento", color: "text-destructive", bg: "bg-destructive/10" },
};

/* ─── Mock Challenges ───────────────────────────────────── */
const CHALLENGES = [
  { id: "c1", title: "Desafio de Março", month: 3, year: 2026, requiredDays: 20, rewardBonus: 5, rewardDesc: "+5% consistência", participants: 245, completed: 89, active: true },
  { id: "c2", title: "Desafio de Fevereiro", month: 2, year: 2026, requiredDays: 18, rewardBonus: 5, rewardDesc: "+5% consistência", participants: 230, completed: 142, active: false },
  { id: "c3", title: "Desafio de Janeiro", month: 1, year: 2026, requiredDays: 22, rewardBonus: 8, rewardDesc: "+8% consistência", participants: 210, completed: 98, active: false },
];

/* ─── Mock Affiliate Levels ─────────────────────────────── */
const AFFILIATE_LEVELS = [
  { key: "basic", label: "Basic", minClients: 0, minRetention: 0, minMonths: 0, count: 45, color: "text-muted-foreground", bg: "bg-secondary" },
  { key: "advanced", label: "Advanced", minClients: 10, minRetention: 50, minMonths: 3, count: 28, color: "text-accent", bg: "bg-accent/10" },
  { key: "premium", label: "Premium", minClients: 25, minRetention: 70, minMonths: 6, count: 14, color: "text-warning", bg: "bg-warning/10" },
  { key: "elite", label: "Elite", minClients: 50, minRetention: 85, minMonths: 12, count: 5, color: "text-destructive", bg: "bg-destructive/10" },
];

/* ─── Component ─────────────────────────────────────────── */
const CoreGamification: React.FC = () => {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [benefitSearch, setBenefitSearch] = useState("");
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);

  // Fetch real rewards for this tenant
  const { data: rewards = [], isLoading: loadingRewards } = useQuery({
    queryKey: ["rewards-catalog", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from("rewards_catalog")
        .select("*")
        .eq("tenant_id", currentTenant.id)
        .order("cost_vitacoins", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id
  });

  const upsertRewardMutation = useMutation({
    mutationFn: async (reward: any) => {
      const payload = { ...reward, tenant_id: currentTenant?.id };
      if (reward.id) {
        const { error } = await supabase.from("rewards_catalog").update(payload).eq("id", reward.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rewards_catalog").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards-catalog"] });
      toast.success(editingReward?.id ? "Recompensa atualizada!" : "Recompensa criada!");
      setRewardModalOpen(false);
      setEditingReward(null);
    },
    onError: (err: any) => toast.error("Erro ao salvar: " + err.message)
  });

  const deleteRewardMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rewards_catalog").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards-catalog"] });
      toast.success("Removido com sucesso!");
    }
  });

  const totalClients = CLIENT_LEVELS.reduce((s, l) => s + l.clients, 0);
  const totalBenefitsUnlocked = rewards.length; // Usando recompensas reais agora
  const totalRedeemed = 0; // Seria buscado de redemption_requests
  const redemptionRate = 0;

  const filteredBenefits = rewards.filter((b: any) =>
    !benefitSearch || b.title.toLowerCase().includes(benefitSearch.toLowerCase())
  );


  const currentChallenge = CHALLENGES.find((c) => c.active);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">
        {/* ═══ HEADER ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-xl font-bold text-foreground">Gamificação</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Níveis de cliente, benefícios por permanência, desafios mensais e níveis de partner.</p>
        </motion.div>

        {/* ═══ KPIs ═══ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Clientes Gamificados", value: totalClients.toString(), icon: Users, accent: false, tip: "Total de clientes participando do sistema de níveis e recompensas." },
              { label: "Benefícios Desbloqueados", value: totalBenefitsUnlocked.toString(), icon: Gift, accent: true, tip: "Quantidade de benefícios desbloqueados pelos clientes ao atingirem os requisitos de cada nível." },
              { label: "Taxa de Resgate", value: `${redemptionRate}%`, icon: Trophy, accent: false, tip: "Percentual de benefícios desbloqueados que foram efetivamente resgatados pelos clientes." },
              { label: "Desafio Ativo", value: currentChallenge ? `${currentChallenge.participants}` : "—", icon: Target, accent: false, sub: "participantes", tip: "Número de clientes participando do desafio mensal atual." },
            ].map(({ label, value, icon: Icon, accent, sub, tip }) => (
              <Card key={label} className={cn("border-border", accent && "border-accent/20 bg-accent/[0.03]")}>
                <CardContent className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", accent ? "bg-accent/10" : "bg-secondary")}>
                      <Icon className={cn("h-3.5 w-3.5", accent ? "text-accent" : "text-muted-foreground")} strokeWidth={1.8} />
                    </div>
                    <InfoTip text={tip} />
                  </div>
                  <p className={cn("text-lg font-bold tracking-tight", accent ? "text-accent" : "text-foreground")}>{value}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{sub || label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ TABS ═══ */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Tabs defaultValue="levels" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 w-full max-w-xl">
              <TabsTrigger value="levels" className="gap-1.5 text-xs"><Star className="h-3.5 w-3.5" />Níveis Cliente</TabsTrigger>
              <TabsTrigger value="benefits" className="gap-1.5 text-xs"><Gift className="h-3.5 w-3.5" />Benefícios</TabsTrigger>
              <TabsTrigger value="challenges" className="gap-1.5 text-xs"><Target className="h-3.5 w-3.5" />Desafios</TabsTrigger>
              <TabsTrigger value="affiliate" className="gap-1.5 text-xs"><Award className="h-3.5 w-3.5" />Níveis Partner</TabsTrigger>
            </TabsList>

            {/* ─── CLIENT LEVELS TAB ─── */}
            <TabsContent value="levels" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Pirâmide de Níveis do Cliente</p>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Pencil className="h-3.5 w-3.5" />Editar Critérios
                </Button>
              </div>

              {/* Pyramid visualization */}
              <div className="grid gap-3">
                {[...CLIENT_LEVELS].reverse().map((level, idx) => {
                  const Icon = level.icon;
                  const pct = totalClients > 0 ? Math.round((level.clients / totalClients) * 100) : 0;
                  return (
                    <Card key={level.key} className="border-border group hover:border-accent/20 transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", level.bg)}>
                          <Icon className={cn("h-5 w-5", level.color)} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{level.label}</p>
                              <Badge variant="secondary" className="text-[10px]">{level.clients} clientes</Badge>
                            </div>
                            <span className="text-sm font-bold text-foreground">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] text-muted-foreground">≥ {level.minMonths}m</span>
                            <span className="text-[10px] text-muted-foreground">Consistência ≥ {level.minConsistency}%</span>
                            <span className="text-[10px] text-muted-foreground">Engajamento ≥ {level.minEngagement}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Level Distribution Summary */}
              <Card className="border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-foreground mb-3">Distribuição por Nível</p>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    {CLIENT_LEVELS.map((level) => {
                      const pct = totalClients > 0 ? (level.clients / totalClients) * 100 : 0;
                      const bgMap: Record<string, string> = {
                        inicio: "bg-muted-foreground/30",
                        consistencia: "bg-accent",
                        protecao_ativa: "bg-success",
                        longevidade: "bg-warning",
                        elite_vision: "bg-destructive",
                      };
                      return (
                        <Tooltip key={level.key}>
                          <TooltipTrigger asChild>
                            <div className={cn(bgMap[level.key], "h-full transition-all")} style={{ width: `${pct}%` }} />
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">{level.label}: {level.clients} ({Math.round(pct)}%)</p></TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {CLIENT_LEVELS.map((level) => (
                      <div key={level.key} className="flex items-center gap-1.5">
                        <div className={cn("h-2 w-2 rounded-full", {
                          "bg-muted-foreground/30": level.key === "inicio",
                          "bg-accent": level.key === "consistencia",
                          "bg-success": level.key === "protecao_ativa",
                          "bg-warning": level.key === "longevidade",
                          "bg-destructive": level.key === "elite_vision",
                        })} />
                        <span className="text-[10px] text-muted-foreground">{level.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── BENEFITS TAB ─── */}
            <TabsContent value="benefits" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={benefitSearch} onChange={(e) => setBenefitSearch(e.target.value)} placeholder="Buscar benefício..." className="pl-9 h-9 text-sm" />
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    setEditingReward({
                      name: "",
                      description: "",
                      type: "discount",
                      cost_vitacoins: 100,
                      stock: 10,
                      active: true
                    });
                    setRewardModalOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />Nova Recompensa
                </Button>

              </div>

              <Card className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Benefício</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Tipo</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Meses</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Desbloqueados</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Resgatados</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Taxa</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Status</TableHead>
                        <TableHead className="w-[80px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBenefits.map((b) => {
                        const tp = BENEFIT_TYPES[b.type] || BENEFIT_TYPES.discount;
                        const rate = b.totalUnlocked > 0 ? Math.round((b.redeemedCount / b.totalUnlocked) * 100) : 0;
                        return (
                          <TableRow key={b.id} className="group">
                            <TableCell>
                              <p className="text-sm font-medium text-foreground">{b.title}</p>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", tp.bg, tp.color)}>{tp.label}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="text-[10px]">≥ {b.requiredMonths}m</Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium text-foreground">{b.totalUnlocked}</TableCell>
                            <TableCell className="text-right text-sm text-foreground">{b.redeemedCount}</TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                "text-[11px] font-semibold",
                                rate >= 70 ? "text-success" : rate >= 40 ? "text-warning" : "text-destructive"
                              )}>{rate}%</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                b.active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                              )}>
                                {b.active ? "Ativo" : "Inativo"}
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

            {/* ─── CHALLENGES TAB ─── */}
            <TabsContent value="challenges" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Desafios Mensais</p>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />Novo Desafio
                </Button>
              </div>

              <div className="grid gap-3">
                {CHALLENGES.map((ch) => {
                  const completionRate = ch.participants > 0 ? Math.round((ch.completed / ch.participants) * 100) : 0;
                  const monthNames = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                  return (
                    <Card key={ch.id} className={cn("border-border", ch.active && "border-accent/20 bg-accent/[0.02]")}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", ch.active ? "bg-accent/10" : "bg-secondary")}>
                              <Target className={cn("h-5 w-5", ch.active ? "text-accent" : "text-muted-foreground")} strokeWidth={1.8} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                                {ch.active && <Badge className="bg-accent/10 text-accent border-0 text-[10px]">Ativo</Badge>}
                              </div>
                              <p className="text-[11px] text-muted-foreground">{monthNames[ch.month]} {ch.year} · {ch.requiredDays} dias de uso necessários</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground"><Pencil className="h-3 w-3" /></button>
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Participantes</p>
                            <p className="text-sm font-bold text-foreground">{ch.participants}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Completaram</p>
                            <p className="text-sm font-bold text-success">{ch.completed}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Recompensa</p>
                            <p className="text-sm font-semibold text-accent">{ch.rewardDesc}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">Taxa de conclusão</span>
                            <span className="text-[10px] font-semibold text-foreground">{completionRate}%</span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ─── AFFILIATE LEVELS TAB ─── */}
            <TabsContent value="affiliate" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Níveis de Partner</p>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Pencil className="h-3.5 w-3.5" />Editar Critérios
                </Button>
              </div>

              <Card className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Nível</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Clientes Mín.</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Retenção Mín.</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Meses Mín.</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Partners Neste Nível</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {AFFILIATE_LEVELS.map((al) => (
                        <TableRow key={al.key}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn("h-2.5 w-2.5 rounded-full", {
                                "bg-muted-foreground/30": al.key === "basic",
                                "bg-accent": al.key === "advanced",
                                "bg-warning": al.key === "premium",
                                "bg-destructive": al.key === "elite",
                              })} />
                              <span className="text-sm font-semibold text-foreground">{al.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm text-foreground">{al.minClients > 0 ? `≥ ${al.minClients}` : "—"}</TableCell>
                          <TableCell className="text-center text-sm text-foreground">{al.minRetention > 0 ? `≥ ${al.minRetention}%` : "—"}</TableCell>
                          <TableCell className="text-center text-sm text-foreground">{al.minMonths > 0 ? `≥ ${al.minMonths}m` : "—"}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-bold text-foreground">{al.count}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Affiliate Distribution */}
              <Card className="border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-foreground mb-3">Distribuição de Partners</p>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    {AFFILIATE_LEVELS.map((al) => {
                      const total = AFFILIATE_LEVELS.reduce((s, l) => s + l.count, 0);
                      const pct = total > 0 ? (al.count / total) * 100 : 0;
                      const bgMap: Record<string, string> = {
                        basic: "bg-muted-foreground/30",
                        advanced: "bg-accent",
                        premium: "bg-warning",
                        elite: "bg-destructive",
                      };
                      return (
                        <Tooltip key={al.key}>
                          <TooltipTrigger asChild>
                            <div className={cn(bgMap[al.key], "h-full transition-all")} style={{ width: `${pct}%` }} />
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">{al.label}: {al.count} ({Math.round(pct)}%)</p></TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {AFFILIATE_LEVELS.map((al) => (
                      <div key={al.key} className="flex items-center gap-1.5">
                        <div className={cn("h-2 w-2 rounded-full", {
                          "bg-muted-foreground/30": al.key === "basic",
                          "bg-accent": al.key === "advanced",
                          "bg-warning": al.key === "premium",
                          "bg-destructive": al.key === "elite",
                        })} />
                        <span className="text-[10px] text-muted-foreground">{al.label} ({al.count})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default CoreGamification;
