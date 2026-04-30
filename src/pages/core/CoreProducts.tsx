import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import {
  Package, Plus, Eye, Sparkles, Pill, Bone,
  Search, Filter, MoreHorizontal, Link2, Users,
  Pencil, Trash2, ToggleLeft, ToggleRight,
  ArrowUpDown, Tag, ShoppingBag, Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// ─── Data ────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  eye: <Eye className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
  pill: <Pill className="h-4 w-4" />,
  bone: <Bone className="h-4 w-4" />,
  package: <Package className="h-4 w-4" />,
};

const CATEGORIES = [
  { id: "cat-default", name: "Geral", slug: "geral", icon: "package", productCount: 0, active: true },
];

const PRODUCTS: any[] = [];
const PARTNER_BINDINGS: any[] = [];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" as const },
  }),
};

// ─── Component ───────────────────────────────────────────────
const CoreProducts: React.FC = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showBindPartner, setShowBindPartner] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const { currentTenant } = useTenant();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["core-products", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("tenant_id", currentTenant.id);
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.type || "Geral",
        price: Number(p.price),
        discountedPrice: Number(p.price), // Fallback if no discount logic
        months: (p.metadata as any)?.months || 1,
        points: (p.metadata as any)?.points || 0,
        active: p.active,
        partners: 0,
        exclusivePartners: 0
      }));
    },
    enabled: !!currentTenant?.id
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Catálogo de Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie produtos, categorias e vínculos com parceiros de todas as especialidades.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddCategory(true)}>
            <Tag className="h-3.5 w-3.5 mr-1.5" />
            Nova Categoria
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setShowAddProduct(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Novo Produto
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Categorias Ativas", value: CATEGORIES.filter(c => c.active).length, icon: Tag, color: "text-accent" },
          { label: "Produtos Ativos", value: PRODUCTS.filter(p => p.active).length, icon: Package, color: "text-accent" },
          { label: "Vínculos Partner", value: PARTNER_BINDINGS.filter(b => b.active).length, icon: Link2, color: "text-accent" },
          { label: "Vínculos Exclusivos", value: PARTNER_BINDINGS.filter(b => b.exclusive).length, icon: Users, color: "text-warning" },
        ].map((kpi, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Categories Row */}
      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Especialidades / Categorias</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    {CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS.package}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{cat.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {cat.productCount} produto{cat.productCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {cat.active ? (
                    <Badge variant="outline" className="text-[9px] border-success/30 text-success bg-success/5">Ativa</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px]">Inativa</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <TabsList className="h-9">
              <TabsTrigger value="products" className="text-xs gap-1.5">
                <Package className="h-3.5 w-3.5" /> Produtos
              </TabsTrigger>
              <TabsTrigger value="bindings" className="text-xs gap-1.5">
                <Link2 className="h-3.5 w-3.5" /> Vínculos Partner
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              {activeTab === "products" && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 h-9 text-xs">
                    <Filter className="h-3 w-3 mr-1.5" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[11px]">Produto</TableHead>
                      <TableHead className="text-[11px]">Categoria</TableHead>
                      <TableHead className="text-[11px] text-right">Preço Base</TableHead>
                      <TableHead className="text-[11px] text-right">Com Desconto</TableHead>
                      <TableHead className="text-[11px] text-center">Duração</TableHead>
                      <TableHead className="text-[11px] text-center">
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-1 mx-auto">
                            <Coins className="h-3 w-3" /> Pontos
                          </TooltipTrigger>
                          <TooltipContent><p className="text-[10px]">Pontos gerados por venda para o parceiro</p></TooltipContent>
                        </Tooltip>
                      </TableHead>
                      <TableHead className="text-[11px] text-center">Partners</TableHead>
                      <TableHead className="text-[11px] text-center">Status</TableHead>
                      <TableHead className="text-[11px] w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id} className="hover:bg-secondary/20">
                        <TableCell className="font-medium text-xs">{p.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            {CATEGORY_ICONS[CATEGORIES.find(c => c.name === p.category)?.icon || "package"]}
                            {p.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          R$ {p.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-medium text-foreground">
                          R$ {p.discountedPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center text-xs">{p.months} mês{p.months > 1 ? "es" : ""}</TableCell>
                        <TableCell className="text-center text-xs font-medium text-accent">{p.points.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs">{p.partners}</span>
                            {p.exclusivePartners > 0 && (
                              <Badge variant="outline" className="text-[9px] border-warning/30 text-warning bg-warning/5">
                                {p.exclusivePartners} excl.
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {p.active ? (
                            <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bindings Tab */}
          <TabsContent value="bindings">
            <div className="flex justify-end mb-3">
              <Button size="sm" variant="outline" onClick={() => setShowBindPartner(true)}>
                <Link2 className="h-3.5 w-3.5 mr-1.5" />
                Vincular Partner a Produto
              </Button>
            </div>
            <Card className="border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[11px]">Partner</TableHead>
                      <TableHead className="text-[11px]">Especialidade</TableHead>
                      <TableHead className="text-[11px]">CRM</TableHead>
                      <TableHead className="text-[11px]">Produto</TableHead>
                      <TableHead className="text-[11px] text-center">Tipo</TableHead>
                      <TableHead className="text-[11px] text-center">Pontos Custom.</TableHead>
                      <TableHead className="text-[11px] text-center">Status</TableHead>
                      <TableHead className="text-[11px] w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PARTNER_BINDINGS.filter(b =>
                      b.partnerName.toLowerCase().includes(search.toLowerCase()) ||
                      b.productName.toLowerCase().includes(search.toLowerCase())
                    ).map((b) => (
                      <TableRow key={b.id} className="hover:bg-secondary/20">
                        <TableCell className="font-medium text-xs">{b.partnerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{b.specialty}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{b.crm}</TableCell>
                        <TableCell className="text-xs">{b.productName}</TableCell>
                        <TableCell className="text-center">
                          {b.exclusive ? (
                            <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">Exclusivo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Compartilhado</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {b.customPoints ? (
                            <span className="font-medium text-accent">{b.customPoints.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {b.active ? (
                            <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Info box */}
            <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Modelo híbrido:</strong> Produtos podem ser <strong className="text-foreground">compartilhados</strong> (qualquer parceiro da especialidade compatível indica) ou <strong className="text-foreground">exclusivos</strong> (somente o parceiro vinculado gera pontos). Um mesmo paciente pode consumir produtos de diferentes médicos — cada compra gera pontos para o parceiro responsável pelo produto.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ── Add Product Modal ── */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Novo Produto</DialogTitle>
            <DialogDescription className="text-xs">Cadastre um produto que poderá ser vinculado a parceiros de qualquer especialidade.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome do Produto</Label>
              <Input placeholder="Ex: DermaCare Pro - 3 Meses" className="text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Categoria / Especialidade</Label>
                <Select>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duração (meses)</Label>
                <Input type="number" placeholder="1" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Preço Base (R$)</Label>
                <Input type="number" placeholder="196.00" className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Desconto (%)</Label>
                <Input type="number" placeholder="25" className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pontos por venda</Label>
                <Input type="number" placeholder="100" className="text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição</Label>
              <Textarea placeholder="Descrição do produto para exibição no quiz e loja..." className="text-sm h-20 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddProduct(false)}>Cancelar</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => { toast.success("Produto cadastrado!"); setShowAddProduct(false); }}>
              Cadastrar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Category Modal ── */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Nova Categoria</DialogTitle>
            <DialogDescription className="text-xs">Adicione uma nova especialidade médica ao catálogo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome da Categoria</Label>
              <Input placeholder="Ex: Cardiologia" className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Slug (URL)</Label>
              <Input placeholder="cardiologia" className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição</Label>
              <Textarea placeholder="Produtos relacionados à saúde cardiovascular..." className="text-sm h-16 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddCategory(false)}>Cancelar</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => { toast.success("Categoria criada!"); setShowAddCategory(false); }}>
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bind Partner Modal ── */}
      <Dialog open={showBindPartner} onOpenChange={setShowBindPartner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Vincular Partner a Produto</DialogTitle>
            <DialogDescription className="text-xs">Defina o vínculo e o tipo (compartilhado ou exclusivo).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Partner</Label>
              <Select>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione o partner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="p1">Dra. Camila Santos — Oftalmologia</SelectItem>
                  <SelectItem value="p2">Dr. Rafael Lima — Oftalmologia</SelectItem>
                  <SelectItem value="p3">Dra. Marina Costa — Dermatologia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Produto</Label>
              <Select>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
              <div>
                <p className="text-xs font-medium text-foreground">Vínculo Exclusivo</p>
                <p className="text-[10px] text-muted-foreground">Apenas este partner gera pontos com este produto</p>
              </div>
              <Switch />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pontos customizados (opcional)</Label>
              <Input type="number" placeholder="Deixe vazio para usar o padrão do produto" className="text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowBindPartner(false)}>Cancelar</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => { toast.success("Vínculo criado!"); setShowBindPartner(false); }}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoreProducts;
