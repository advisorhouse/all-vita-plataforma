import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, DollarSign, TrendingUp, Building2, AlertTriangle, CreditCard, Download, Crown, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminMonetization: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Queries
  const { data: plans = [] } = useQuery({
    queryKey: ["saas-plans"],
    queryFn: async () => {
      const { data } = await supabase.from("saas_plans").select("*").order("sort_order");
      return data || [];
    },
  });

  const { data: tenantSubs = [] } = useQuery({
    queryKey: ["tenant-subscriptions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_subscriptions")
        .select("*, tenants(name, slug), saas_plans(name, price_monthly, price_yearly)");
      return data || [];
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*, tenants(name)")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants-monetization"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name, status");
      return data || [];
    },
  });

  // KPIs
  const kpis = useMemo(() => {
    const activeSubs = tenantSubs.filter((s: any) => s.status === "active");
    const mrr = activeSubs.reduce((sum: number, s: any) => {
      const plan = s.saas_plans;
      if (!plan) return sum;
      const price = s.billing_cycle === "yearly" ? Number(plan.price_yearly) / 12 : Number(plan.price_monthly);
      const discount = Number(s.discount_percent || 0);
      return sum + price * (1 - discount / 100);
    }, 0);
    const churn = tenantSubs.length > 0
      ? (tenantSubs.filter((s: any) => s.status === "cancelled").length / tenantSubs.length) * 100
      : 0;
    const arpu = activeSubs.length > 0 ? mrr / activeSubs.length : 0;

    return {
      mrr,
      arr: mrr * 12,
      paying: activeSubs.length,
      churn: churn.toFixed(1),
      arpu,
      total: tenantSubs.length,
    };
  }, [tenantSubs]);

  // Create plan mutation
  const createPlan = useMutation({
    mutationFn: async (plan: any) => {
      const { error } = await supabase.from("saas_plans").insert(plan);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saas-plans"] });
      setShowCreatePlan(false);
      toast.success("Plano criado com sucesso");
    },
    onError: () => toast.error("Erro ao criar plano"),
  });

  const togglePlan = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("saas_plans").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saas-plans"] });
      toast.success("Status atualizado");
    },
  });

  const updateSubStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const update: any = { status, updated_at: new Date().toISOString() };
      if (status === "cancelled") update.cancelled_at = new Date().toISOString();
      const { error } = await supabase.from("tenant_subscriptions").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-subscriptions"] });
      toast.success("Assinatura atualizada");
    },
  });

  const filteredSubs = filterStatus === "all" ? tenantSubs : tenantSubs.filter((s: any) => s.status === filterStatus);
  const overdueInvoices = invoices.filter((i: any) => i.status === "pending" && new Date(i.due_date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monetização</h1>
          <p className="text-muted-foreground">Planos, cobrança e receita SaaS</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "MRR", value: `R$ ${kpis.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "text-emerald-600" },
          { label: "ARR", value: `R$ ${kpis.arr.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, icon: TrendingUp, color: "text-blue-600" },
          { label: "Pagantes", value: kpis.paying, icon: Building2, color: "text-violet-600" },
          { label: "Churn", value: `${kpis.churn}%`, icon: AlertTriangle, color: Number(kpis.churn) > 5 ? "text-red-600" : "text-emerald-600" },
          { label: "ARPU", value: `R$ ${kpis.arpu.toFixed(0)}`, icon: CreditCard, color: "text-amber-600" },
          { label: "Total Empresas", value: kpis.total, icon: Building2, color: "text-muted-foreground" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="subscriptions">Empresas & Planos</TabsTrigger>
          <TabsTrigger value="invoices">Faturamento</TabsTrigger>
          <TabsTrigger value="overdue">Inadimplência ({overdueInvoices.length})</TabsTrigger>
          <TabsTrigger value="revenue">Receita por Plano</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        {/* PLANS TAB */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Gestão de Planos</h2>
            <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Criar Plano</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Novo Plano</DialogTitle></DialogHeader>
                <CreatePlanForm onSubmit={(data) => createPlan.mutate(data)} loading={createPlan.isPending} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan: any) => (
              <Card key={plan.id} className={`relative ${plan.is_recommended ? "border-primary ring-2 ring-primary/20" : ""}`}>
                {plan.is_recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground"><Star className="h-3 w-3 mr-1" /> Recomendado</Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Switch checked={plan.active} onCheckedChange={(v) => togglePlan.mutate({ id: plan.id, active: v })} />
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-foreground">R$ {Number(plan.price_monthly).toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                    <p className="text-sm text-muted-foreground">R$ {Number(plan.price_yearly).toFixed(0)}/ano</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    {Object.entries(plan.limits as Record<string, any>).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-muted-foreground">
                        <span>{k.replace("max_", "Máx. ").replace("_", " ")}</span>
                        <span className="font-medium text-foreground">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                  <Badge variant={plan.active ? "default" : "secondary"}>{plan.active ? "Ativo" : "Inativo"}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SUBSCRIPTIONS TAB */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Próx. Cobrança</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubs.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma assinatura encontrada</TableCell></TableRow>
                ) : filteredSubs.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.tenants?.name || "—"}</TableCell>
                    <TableCell>{sub.saas_plans?.name || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{sub.billing_cycle === "yearly" ? "Anual" : "Mensal"}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={sub.status === "active" ? "default" : sub.status === "trial" ? "secondary" : "destructive"}>
                        {sub.status === "active" ? "Ativo" : sub.status === "trial" ? "Trial" : sub.status === "suspended" ? "Suspenso" : "Cancelado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{sub.current_period_end ? format(new Date(sub.current_period_end), "dd/MM/yyyy") : "—"}</TableCell>
                    <TableCell>{Number(sub.discount_percent) > 0 ? `${sub.discount_percent}%` : "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {sub.status !== "cancelled" && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateSubStatus.mutate({ id: sub.id, status: "cancelled" })}>
                            Cancelar
                          </Button>
                        )}
                        {sub.status === "suspended" && (
                          <Button size="sm" variant="ghost" onClick={() => updateSubStatus.mutate({ id: sub.id, status: "active" })}>
                            Reativar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pago em</TableHead>
                  <TableHead>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma fatura encontrada</TableCell></TableRow>
                ) : invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.tenants?.name || "—"}</TableCell>
                    <TableCell>R$ {Number(inv.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === "paid" ? "default" : inv.status === "pending" ? "secondary" : "destructive"}>
                        {inv.status === "paid" ? "Pago" : inv.status === "pending" ? "Pendente" : "Falhou"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{format(new Date(inv.due_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-sm">{inv.paid_at ? format(new Date(inv.paid_at), "dd/MM/yyyy") : "—"}</TableCell>
                    <TableCell>{inv.payment_method || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* OVERDUE TAB */}
        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Inadimplência</CardTitle>
              <CardDescription>Faturas vencidas e ações pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma fatura inadimplente 🎉</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Dias em atraso</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueInvoices.map((inv: any) => {
                      const daysOverdue = Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000);
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.tenants?.name || "—"}</TableCell>
                          <TableCell>R$ {Number(inv.amount).toFixed(2)}</TableCell>
                          <TableCell>{format(new Date(inv.due_date), "dd/MM/yyyy")}</TableCell>
                          <TableCell><Badge variant="destructive">{daysOverdue} dias</Badge></TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">Notificar</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVENUE BY PLAN TAB */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.filter((p: any) => p.active).map((plan: any) => {
              const subs = tenantSubs.filter((s: any) => s.plan_id === plan.id && s.status === "active");
              const rev = subs.reduce((sum: number, s: any) => {
                const price = s.billing_cycle === "yearly" ? Number(plan.price_yearly) / 12 : Number(plan.price_monthly);
                return sum + price * (1 - Number(s.discount_percent || 0) / 100);
              }, 0);
              return (
                <Card key={plan.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" /> {plan.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Empresas ativas</span>
                      <span className="font-semibold text-foreground">{subs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">MRR do plano</span>
                      <span className="font-semibold text-foreground">R$ {rev.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">% da receita</span>
                      <span className="font-semibold text-foreground">{kpis.mrr > 0 ? ((rev / kpis.mrr) * 100).toFixed(0) : 0}%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* CONFIG TAB */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações de Cobrança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Moeda padrão</label>
                  <Select defaultValue="BRL">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Dias de trial padrão</label>
                  <Input type="number" defaultValue="14" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Suspensão automática por inadimplência</label>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Dias até suspensão</label>
                  <Input type="number" defaultValue="15" />
                </div>
                <Button className="w-full">Salvar Configurações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gateway de Cobrança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Provedor</label>
                  <Select defaultValue="stripe">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="pagarme">Pagar.me</SelectItem>
                      <SelectItem value="asaas">Asaas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">Conectado</span>
                </div>
                <Button variant="outline" className="w-full">Configurar Gateway</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Create plan form component
const CreatePlanForm: React.FC<{ onSubmit: (data: any) => void; loading: boolean }> = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    name: "", description: "", price_monthly: "", price_yearly: "",
    max_partners: "10", max_clients: "100", max_products: "5",
    is_recommended: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description,
      price_monthly: Number(form.price_monthly),
      price_yearly: Number(form.price_yearly),
      limits: {
        max_partners: Number(form.max_partners),
        max_clients: Number(form.max_clients),
        max_products: Number(form.max_products),
      },
      is_recommended: form.is_recommended,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do plano</label>
        <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Pro" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do plano" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Preço mensal (R$)</label>
          <Input required type="number" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Preço anual (R$)</label>
          <Input required type="number" value={form.price_yearly} onChange={(e) => setForm({ ...form, price_yearly: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Máx. parceiros</label>
          <Input type="number" value={form.max_partners} onChange={(e) => setForm({ ...form, max_partners: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Máx. clientes</label>
          <Input type="number" value={form.max_clients} onChange={(e) => setForm({ ...form, max_clients: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Máx. produtos</label>
          <Input type="number" value={form.max_products} onChange={(e) => setForm({ ...form, max_products: e.target.value })} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.is_recommended} onCheckedChange={(v) => setForm({ ...form, is_recommended: v })} />
        <label className="text-sm font-medium">Plano recomendado</label>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Criando..." : "Criar Plano"}</Button>
    </form>
  );
};

export default AdminMonetization;
