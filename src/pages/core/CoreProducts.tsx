import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import {
  Package, Plus, Eye, Sparkles, Pill, Bone,
  Search, Filter, MoreHorizontal, Link2, Users,
  Pencil, Trash2, ToggleLeft, ToggleRight,
  ArrowUpDown, Tag, ShoppingBag, Coins,
  Upload, X, Box, Barcode, FileText, Truck,
  Settings2, CheckCircle2, AlertCircle, RefreshCw,
  Image as ImageIcon, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    price: 0,
    type: "Geral",
    active: true,
    sku: "",
    brand: "",
    stock_quantity: 0,
    weight: 0,
    height_cm: 0,
    width_cm: 0,
    length_cm: 0,
    billing_type: "prepaid",
    max_installments: 12,
    metadata: { months: 1, points: 0 }
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["core-products", currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("tenant_id", currentTenant.id);
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        ...p,
        price: Number(p.price),
        discountedPrice: Number(p.price),
        category: p.type || "Geral",
        images: p.product_images || []
      }));
    },
    enabled: !!currentTenant?.id
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ productId, file }: { productId: string, file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url: publicUrl,
          is_primary: false
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["core-products"] });
      toast.success("Imagem enviada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao enviar imagem: " + error.message);
    }
  });

  const saveProductMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) throw new Error("Tenant não identificado");

      const payload = {
        ...formData,
        tenant_id: currentTenant.id,
        updated_at: new Date().toISOString()
      };

      let productId = selectedProduct?.id;

      if (productId) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Sincronizar com Pagar.me
      const { data: syncData, error: syncError } = await supabase.functions.invoke("pagarme-sync-product", {
        body: { product_id: productId }
      });

      if (syncError) throw syncError;
      return syncData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["core-products"] });
      toast.success(data?.success ? "Produto salvo e sincronizado com Pagar.me!" : "Produto salvo localmente, mas erro na sincronização.");
      setShowAddProduct(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao salvar produto: " + error.message);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedProduct) {
      setIsUploading(true);
      await uploadImageMutation.mutateAsync({ productId: selectedProduct.id, file });
      setIsUploading(false);
    }
  };

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["core-products"] });
      toast.success("Imagem removida!");
    }
  });

  const { data: storeIntegrations = [] } = useQuery({
    queryKey: ["core-products-integrations", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("integrations")
        .select("type, active")
        .eq("tenant_id", currentTenant!.id);
      return data || [];
    },
  });
  const integrationStatus = (type: string) => {
    const found = storeIntegrations.find((i: any) => i.type === type);
    return { connected: !!found, active: !!found?.active };
  };

  const filteredProducts = products.filter((p: any) => {
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
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => {
            setSelectedProduct(null);
            setFormData({
              name: "",
              description: "",
              price: 0,
              type: "Geral",
              active: true,
              sku: "",
              brand: "",
              stock_quantity: 0,
              weight: 0,
              height_cm: 0,
              width_cm: 0,
              length_cm: 0,
              billing_type: "prepaid",
              max_installments: 12,
              metadata: { months: 1, points: 0 }
            });
            setShowAddProduct(true);
          }}>
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
                    {filteredProducts.map((p: any) => (
                      <TableRow 
                        key={p.id} 
                        className="hover:bg-secondary/20 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(p);
                          setFormData({
                            name: p.name || "",
                            description: p.description || "",
                            price: p.price || 0,
                            type: p.type || "Geral",
                            active: p.active ?? true,
                            sku: p.sku || "",
                            brand: p.brand || "",
                            stock_quantity: p.stock_quantity || 0,
                            weight: p.weight || 0,
                            height_cm: p.height_cm || 0,
                            width_cm: p.width_cm || 0,
                            length_cm: p.length_cm || 0,
                            billing_type: p.billing_type || "prepaid",
                            max_installments: p.max_installments || 12,
                            metadata: p.metadata || { months: 1, points: 0 }
                          });
                          setShowAddProduct(true);
                        }}
                      >
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
                        <TableCell className="text-center text-xs">
                          {(p.metadata as any)?.months || 1} mês{((p.metadata as any)?.months || 1) > 1 ? "es" : ""}
                        </TableCell>
                        <TableCell className="text-center text-xs font-medium text-accent">
                          {((p.metadata as any)?.points || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-xs">0</TableCell>
                        <TableCell className="text-center">
                          {p.active ? (
                            <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
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

      {/* ── Add/Edit Product Modal (Robust Shopify-like) ── */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-[95vw] w-full lg:max-w-6xl h-[95vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <ShoppingBag className="h-5 w-5 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Gerenciar Produto</DialogTitle>
                <DialogDescription className="text-xs">Configure detalhes, imagens e integrações do seu produto.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 pt-4">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column: General Info & Images */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* General Info */}
                <Card className="border-border shadow-none">
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <CardTitle className="text-[13px] font-bold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Informações Gerais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome do Produto</Label>
                      <Input 
                        placeholder="Ex: Vision Lift - Combo 3 Meses" 
                        className="h-9 text-sm" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Descrição Completa</Label>
                      <Textarea 
                        placeholder="Detalhes técnicos, benefícios e composição..." 
                        className="text-sm min-h-[100px] resize-none" 
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Categoria / Tipo</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(v) => setFormData({ ...formData, type: v })}
                        >
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Marca</Label>
                        <Input 
                          placeholder="Ex: All Vita" 
                          className="h-9 text-sm" 
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Media Management */}
                <Card className="border-border shadow-none">
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <CardTitle className="text-[13px] font-bold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      Mídia (Fotos)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*"
                    />
                    <div className="grid grid-cols-4 gap-3">
                      <div 
                        className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploading ? (
                          <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                        ) : (
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {isUploading ? "Enviando..." : "Adicionar"}
                        </span>
                      </div>
                      
                      {selectedProduct?.images?.map((img: any) => (
                        <div key={img.id} className="aspect-square rounded-xl border border-border bg-secondary/20 relative group overflow-hidden">
                          <img 
                            src={img.url} 
                            alt="Produto" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-5 w-5 rounded-md"
                              onClick={() => deleteImageMutation.mutate(img.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          {img.is_primary && (
                            <div className="absolute bottom-1 left-1">
                              <Badge className="text-[8px] h-4 bg-accent/90">Principal</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory & Shipping */}
                <Card className="border-border shadow-none">
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <CardTitle className="text-[13px] font-bold flex items-center gap-2">
                      <Box className="h-4 w-4 text-muted-foreground" />
                      Estoque e Envio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">SKU</Label>
                        <Input placeholder="V-LIFT-03M" className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Código de Barras (EAN)</Label>
                        <Input placeholder="7890000000000" className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Quantidade em Estoque</Label>
                        <Input type="number" placeholder="0" className="h-9 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Peso (kg)</Label>
                        <Input type="number" placeholder="0.250" className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-xs">Dimensões (CxLxA em cm)</Label>
                        <div className="flex gap-2">
                          <Input placeholder="C" className="h-9 text-sm" />
                          <Input placeholder="L" className="h-9 text-sm" />
                          <Input placeholder="A" className="h-9 text-sm" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Pricing & Integrations */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Pricing */}
                <Card className="border-border shadow-none">
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <CardTitle className="text-[13px] font-bold flex items-center gap-2">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      Preços e Recompensas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Preço de Venda (R$)</Label>
                      <Input type="number" placeholder="0.00" className="h-9 text-sm font-bold text-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Preço de Comparação (R$)</Label>
                      <Input type="number" placeholder="0.00" className="h-9 text-sm text-muted-foreground" />
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <Label className="text-xs">Vitacoins p/ Partner</Label>
                      <Input type="number" placeholder="100" className="h-9 text-sm font-semibold" />
                    </div>
                  </CardContent>
                </Card>

                {/* Store Integrations Status (read-only) */}
                <Card className="border-border shadow-none">
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <CardTitle className="text-[13px] font-bold flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-muted-foreground" />
                      Integrações da Loja
                    </CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">
                      Configuração centralizada em Integrações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2.5">
                    {[
                      { type: "bling", label: "Bling ERP", desc: "Estoque", Icon: Box },
                      { type: "enotas", label: "eNotas", desc: "Nota fiscal", Icon: FileText },
                      { type: "melhorenvio", label: "Melhor Envio", desc: "Rastreio", Icon: Truck },
                    ].map(({ type, label, desc, Icon }) => {
                      const s = integrationStatus(type);
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded bg-white border flex items-center justify-center p-1">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold">{label}</p>
                              <p className="text-[9px] text-muted-foreground">{desc}</p>
                            </div>
                          </div>
                          {s.active ? (
                            <Badge variant="outline" className="text-[9px] gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> Conectado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] gap-1 text-muted-foreground">
                              <AlertCircle className="h-3 w-3" /> Desconectado
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    <Separator />
                    <Button asChild variant="outline" size="sm" className="w-full text-[11px] h-8 gap-1.5">
                      <Link to="/core/integrations" onClick={() => setShowAddProduct(false)}>
                        <Settings2 className="h-3 w-3" /> Gerenciar integrações
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-2 border-t bg-muted/20">
            <Button variant="outline" size="sm" onClick={() => setShowAddProduct(false)}>Descartar</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              onClick={() => { toast.success("Produto atualizado e sincronizado!"); setShowAddProduct(false); }}>
              <RefreshCw className="h-3.5 w-3.5" />
              Salvar e Sincronizar
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
