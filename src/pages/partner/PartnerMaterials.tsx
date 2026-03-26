import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Image, FileText, Video, Download, ChevronRight,
  ShoppingBag, Eye, Copy, ExternalLink, Star, Heart,
  Sparkles, BarChart3, TrendingUp, Zap, Search,
  FolderOpen, Package, BookOpen, Camera, Palette,
  MessageSquare, Share2, Award, Clock, Filter,
  CheckCircle2, Gift, Sun, Moon, CloudSun, Smartphone,
  Instagram, Facebook, Linkedin, Mail, QrCode, ArrowRight,
  Info,
} from "lucide-react";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import productOriginal from "@/assets/product-vision-lift-1month.png";
import product3Month from "@/assets/product-vision-lift-3month.png";
import product5Month from "@/assets/product-vision-lift-5month.png";
import product10Month from "@/assets/product-vision-lift-10month.png";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const } }),
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipUI>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <Info className="h-3.5 w-3.5 text-muted-foreground/40" />
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </TooltipUI>
);

// ─── Data ────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "Todos", icon: FolderOpen },
  { id: "social", label: "Redes Sociais", icon: Instagram },
  { id: "whatsapp", label: "WhatsApp", icon: Smartphone },
  { id: "pdf", label: "PDFs & Guias", icon: FileText },
  { id: "video", label: "Vídeos", icon: Video },
  { id: "email", label: "E-mail", icon: Mail },
];

const PRODUCT_CATALOG = [
  {
    id: "original", name: "Vision Lift Original", subtitle: "1 mês de tratamento",
    price: "R$ 196,00", img: productOriginal, tag: "Mais vendido",
    benefits: ["Luteína + Zeaxantina", "Proteção contra luz azul", "Suporte à visão noturna"],
    conversion: 28, avgRating: 4.8, reviews: 342,
  },
  {
    id: "3month", name: "Vision Lift 3 Meses", subtitle: "3 meses de tratamento",
    price: "R$ 396,00", img: product3Month, tag: "Melhor custo-benefício",
    benefits: ["3 frascos (R$ 132/frasco)", "Economia de 33%", "Tratamento contínuo"],
    conversion: 24, avgRating: 4.9, reviews: 215,
  },
  {
    id: "5month", name: "Vision Lift 5 Meses", subtitle: "5 meses de tratamento",
    price: "R$ 528,00", img: product5Month, tag: "Mais vendido",
    benefits: ["5 frascos (R$ 105/frasco)", "Economia de 46%", "Resultado completo"],
    conversion: 26, avgRating: 4.9, reviews: 178,
  },
  {
    id: "10month", name: "Vision Lift 10 Meses", subtitle: "10 meses de tratamento",
    price: "R$ 796,00", img: product10Month, tag: "Tratamento completo",
    benefits: ["10 frascos (R$ 79,60/frasco)", "Economia de 59%", "Máxima longevidade ocular"],
    conversion: 20, avgRating: 4.9, reviews: 126,
  },
];

const MATERIAL_KITS = [
  {
    title: "Kit Stories — Depoimentos Reais", type: "Imagens", icon: Camera, count: 12, format: "PNG",
    desc: "Cards prontos com relatos de clientes para Stories do Instagram", downloads: 834, isNew: true, isFeatured: true,
  },
  {
    title: "Carrossel Educativo — Saúde Ocular", type: "Imagens", icon: Image, count: 5, format: "PNG",
    desc: "Carrossel pronto explicando cuidados essenciais com a visão", downloads: 612, isNew: true, isFeatured: false,
  },
  {
    title: "Scripts de Conversa — WhatsApp", type: "Texto", icon: MessageSquare, count: 8, format: "TXT",
    desc: "Mensagens naturais e humanizadas para iniciar conversas", downloads: 1247, isNew: false, isFeatured: true,
  },
  {
    title: "Guia de Abordagem Consultiva", type: "PDF", icon: FileText, count: 1, format: "PDF",
    desc: "Manual com técnicas de escuta ativa e venda empática", downloads: 956, isNew: false, isFeatured: false,
  },
  {
    title: "Vídeo de Apresentação da Marca", type: "Vídeo", icon: Video, count: 1, format: "MP4",
    desc: "Apresentação profissional Vision Lift em 2 minutos", downloads: 423, isNew: false, isFeatured: false,
  },
  {
    title: "Templates Feed — Antes & Depois", type: "Imagens", icon: Palette, count: 6, format: "PSD/PNG",
    desc: "Comparativos visuais para feed do Instagram", downloads: 567, isNew: false, isFeatured: false,
  },
  {
    title: "E-mail Sequences — Nutrição de Leads", type: "E-mail", icon: Mail, count: 5, format: "HTML",
    desc: "Sequência de 5 e-mails com tom acolhedor para nutrir leads", downloads: 189, isNew: true, isFeatured: false,
  },
  {
    title: "Apresentação Institucional", type: "PDF", icon: BookOpen, count: 1, format: "PDF",
    desc: "Slide deck completo sobre a marca e filosofia Vision Lift", downloads: 312, isNew: false, isFeatured: false,
  },
];




const QUICK_COPY = [
  { label: "Bio Instagram", text: "Cuido da sua visão para você ver o melhor da vida. ✨ Parceira @visionlift", icon: Instagram },
  { label: "Mensagem WhatsApp", text: "Oi! Quero te contar sobre um cuidado que mudou minha rotina visual. Posso te enviar mais info?", icon: Smartphone },
  { label: "Legenda para Feed", text: "Você sabia que 80% dos problemas de visão podem ser prevenidos? 👀 Conheça o Vision Lift.", icon: FileText },
  { label: "E-mail de Apresentação", text: "Olá! Gostaria de compartilhar algo que fez diferença na minha saúde ocular. Posso enviar detalhes?", icon: Mail },
];

const TOP_PERFORMING = [
  { material: "Scripts WhatsApp", conversions: 47, rate: "12.4%" },
  { material: "Kit Stories Depoimentos", conversions: 34, rate: "9.8%" },
  { material: "Carrossel Educativo", conversions: 28, rate: "8.2%" },
  { material: "Guia de Abordagem", conversions: 22, rate: "7.1%" },
];

// ─── Component ───────────────────────────────────────────────
const PartnerMaterials: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const filteredMaterials = MATERIAL_KITS.filter((m) => {
    const matchCategory = activeCategory === "all" ||
      (activeCategory === "social" && m.type === "Imagens") ||
      (activeCategory === "whatsapp" && m.type === "Texto") ||
      (activeCategory === "pdf" && m.type === "PDF") ||
      (activeCategory === "video" && m.type === "Vídeo") ||
      (activeCategory === "email" && m.type === "E-mail");
    const matchSearch = !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-5 pb-12">

      {/* ═══ ROW 0 — Header ═══ */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground">Catálogo & Materiais</h1>
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent flex items-center gap-1">
                <Package className="h-3 w-3" />
                42 materiais
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Produtos, kits de divulgação e scripts prontos para compartilhar.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
            <Zap className="h-3 w-3 text-warning" />
            <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
            <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
          </div>
        </div>
      </motion.div>

      {/* ═══ ROW 1 — Hero + Quick Stats ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* Hero */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
          <Card className="relative overflow-hidden border-accent/30 shadow-sm bg-gradient-to-br from-accent via-accent/90 to-accent/70 h-full">
            <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
            <CardContent className="relative z-10 p-7 flex flex-col justify-center h-full text-accent-foreground min-h-[200px]">
              <div className="absolute top-4 right-4 flex gap-1.5">
                <span className="text-[9px] font-medium bg-white/20 text-accent-foreground px-2 py-0.5 rounded-full">
                  +3 novos
                </span>
                <span className="text-[9px] font-medium bg-white/15 text-accent-foreground px-2 py-0.5 rounded-full">
                  42 materiais
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center">
                  <Gift className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-medium text-accent-foreground/60 uppercase tracking-wider">Seu Arsenal de Divulgação</p>
              </div>
              <h2 className="text-[22px] font-bold leading-tight">
                Materiais prontos para você<br />brilhar sem esforço
              </h2>
              <p className="text-[13px] text-accent-foreground/70 mt-2 max-w-md">
                Scripts validados e kits visuais — tudo criado para que você se sinta segura ao compartilhar.
              </p>
              <div className="flex gap-2 mt-5">
                <Button className="w-fit rounded-xl h-10 px-5 text-[13px] font-semibold bg-white text-accent hover:bg-white/90 gap-2">
                  <Download className="h-4 w-4" /> Baixar Kit Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right stats */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
            <Card className="border-border shadow-sm h-full bg-foreground">
              <CardContent className="p-4 flex flex-col justify-center h-full gap-3 text-background">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <h3 className="text-[13px] font-semibold">Seu Desempenho</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Taxa de conversão média", value: "9.4%" },
                    { label: "Materiais usados este mês", value: "18/42" },
                    { label: "Downloads totais", value: "5.140" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <p className="text-[11px] text-background/60">{label}</p>
                      <p className="text-[13px] font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
            <Card className="border-border shadow-sm bg-accent/5 h-full">
              <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="text-[13px] font-semibold text-foreground">Novidades da Semana</h3>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Kit Stories com depoimentos reais e nova sequência de e-mails prontos para usar.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] text-foreground font-medium">3 materiais adicionados</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ═══ ROW 2 — Product Catalog ═══ */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Catálogo de Produtos</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Conheça cada versão para indicar com confiança.</p>
          </div>
          <Button variant="outline" size="sm" className="text-[12px] rounded-xl h-8 gap-1">
            Ver página de vendas <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRODUCT_CATALOG.map((product) => (
            <Card key={product.id} className="border-border shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
              {product.tag && (
                <div className="absolute top-2 right-2 z-10 bg-accent text-accent-foreground text-[9px] font-semibold px-2 py-0.5 rounded-full">
                  {product.tag}
                </div>
              )}
              <CardContent className="p-0">
                <div className="h-36 bg-secondary/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 space-y-2.5">
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.subtitle}</p>
                  </div>
                  <ul className="space-y-1">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                        <div className="h-1 w-1 rounded-full bg-accent shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-end justify-between pt-1">
                    <p className="text-lg font-bold text-foreground">{product.price}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      <span className="text-[11px] font-medium text-foreground">{product.avgRating}</span>
                      <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" className="flex-1 text-[11px] h-8 rounded-lg gap-1">
                      <Share2 className="h-3 w-3" /> Compartilhar
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>


      {/* ═══ ROW 4 — Materials Library + Sidebar ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* Materials */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center">
                <FolderOpen className="h-3.5 w-3.5 text-foreground" />
              </div>
              <h2 className="text-[15px] font-semibold text-foreground">Biblioteca de Materiais</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">{filteredMaterials.length} itens</span>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materiais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-[13px] rounded-xl"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5",
                      activeCategory === cat.id
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CatIcon className="h-3 w-3" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material cards */}
          <div className="space-y-2">
            {filteredMaterials.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className={cn(
                    "border-border shadow-sm hover:shadow-md transition-all group cursor-pointer",
                    m.isFeatured && "ring-1 ring-accent/20"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-colors",
                          m.isFeatured ? "bg-accent/10 group-hover:bg-accent/15" : "bg-secondary group-hover:bg-foreground/5"
                        )}>
                          <Icon className={cn("h-5 w-5", m.isFeatured ? "text-accent" : "text-foreground")} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold text-foreground truncate">{m.title}</p>
                            {m.isNew && (
                              <span className="shrink-0 text-[9px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                                Novo
                              </span>
                            )}
                            {m.isFeatured && (
                              <span className="shrink-0 text-[9px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
                                ⭐ Destaque
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{m.desc}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                              {m.count} {m.count === 1 ? "arquivo" : "arquivos"}
                            </span>
                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                              {m.format}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {m.downloads.toLocaleString("pt-BR")} downloads
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0 text-[11px] h-8 rounded-lg gap-1.5 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors">
                          <Download className="h-3.5 w-3.5" /> Baixar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Top performing */}
          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border-border shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <h3 className="text-[13px] font-semibold text-foreground">O Que Mais Converte</h3>
                  </div>
                  <Award className="h-4 w-4 text-warning" />
                </div>
                <p className="text-[11px] text-muted-foreground -mt-1">Materiais com maior taxa de conversão entre parceiras.</p>
                <div className="space-y-2.5">
                  {TOP_PERFORMING.map((item, i) => (
                    <div key={item.material} className="flex items-center gap-3">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                        i === 0 ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                      )}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground truncate">{item.material}</p>
                        <p className="text-[10px] text-muted-foreground">{item.conversions} jornadas iniciadas</p>
                      </div>
                      <span className="text-[11px] font-semibold text-accent">{item.rate}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick copy */}
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border-border shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-accent" />
                  <h3 className="text-[13px] font-semibold text-foreground">Textos Prontos — Copiar e Usar</h3>
                </div>
                <p className="text-[11px] text-muted-foreground -mt-1">Toque em qualquer texto para copiar instantaneamente.</p>
                <div className="space-y-2">
                  {QUICK_COPY.map(({ label, text, icon: QIcon }, idx) => (
                    <button
                      key={label}
                      onClick={() => handleCopyText(text, idx)}
                      className="w-full text-left p-3 rounded-xl border border-border/50 hover:bg-accent/5 hover:border-accent/20 transition-all space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                          <p className="text-[12px] font-medium text-foreground">{label}</p>
                        </div>
                        {copiedIdx === idx && (
                          <span className="text-[10px] text-accent font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Copiado!
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{text}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Insight */}
          <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border-border shadow-sm bg-accent/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <h3 className="text-[12px] font-semibold text-foreground">Dica de Quem Já Passou Por Isso</h3>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  "Parceiras que combinam os <strong className="text-foreground">scripts de WhatsApp</strong> com o <strong className="text-foreground">carrossel educativo</strong> no mesmo dia convertem <strong className="text-accent">3.2x mais</strong>. Comece por esses dois materiais."
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ═══ ROW 5 — Humanized Footer ═══ */}
      <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border-border shadow-sm bg-secondary/30">
          <CardContent className="p-5 text-center space-y-2">
            <Heart className="h-5 w-5 text-accent mx-auto" />
            <p className="text-[13px] text-foreground font-medium">
              Cada material foi pensado para que você se sinta segura ao compartilhar.
            </p>
            <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
              Se precisar de algo personalizado ou tiver ideias de conteúdo, fale com a gente.
              Sua voz ajuda a construir materiais melhores para todas.
            </p>
            <Button variant="outline" size="sm" className="text-[12px] rounded-xl h-8 mt-2 gap-1.5 hover:bg-accent hover:text-accent-foreground hover:border-accent">
              <MessageSquare className="h-3 w-3" /> Sugerir Material
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </TooltipProvider>
  );
};

export default PartnerMaterials;
