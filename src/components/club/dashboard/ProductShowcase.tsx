import React from "react";
import { motion } from "framer-motion";
import {
  Calendar, ChevronRight, Eye, Shield, Zap, Sun, Brain,
  Lightbulb, FlaskConical, ShieldCheck, Activity, BadgeCheck, ScanEye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import productImage from "@/assets/product-vision-lift-1month.png";

interface ProductShowcaseProps {
  productName: string;
  acquisitionDate: string;
  nextShipment: string;
  cycle: number;
}

const BIOATIVOS = [
  { name: "Luteína", dose: "20mg", icon: Eye, color: "text-amber-500" },
  { name: "Zeaxantina", dose: "3mg", icon: ScanEye, color: "text-yellow-500" },
  { name: "Astaxantina", dose: "5mg", icon: Shield, color: "text-red-400" },
  { name: "Zinco", dose: "11mg", icon: Zap, color: "text-zinc-400" },
  { name: "Vit. A", dose: "800mcg", icon: Lightbulb, color: "text-orange-400" },
  { name: "Vit. D3", dose: "50mcg", icon: Sun, color: "text-yellow-400" },
  { name: "Vit. B12", dose: "2,4mcg", icon: Brain, color: "text-pink-400" },
];

const CAPABILITIES = [
  { title: "Proteção contra DMRI", desc: "Degeneração macular", icon: ShieldCheck },
  { title: "Acuidade visual", desc: "Nitidez e visão noturna", icon: Eye },
  { title: "Fadiga digital", desc: "Proteção anti-tela", icon: Activity },
  { title: "Nervo óptico", desc: "Fortalecimento profundo", icon: Brain },
];

const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  productName,
  acquisitionDate,
  nextShipment,
  cycle,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Product header */}
          <div className="bg-secondary/50 p-5 flex items-center gap-4">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              src={productImage}
              alt={productName}
              className="h-20 w-20 object-contain"
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Seu produto</p>
              <h3 className="text-base font-semibold text-foreground leading-tight">{productName}</h3>
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Desde {acquisitionDate}
                </span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                  Ciclo #{cycle}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">📦 Próximo envio: {nextShipment}</p>
            </div>
          </div>

          {/* Formula — 7 Bioativos strip */}
          <div className="px-5 pt-5 pb-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5 text-accent" />
              <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Fórmula Premium · 7 Bioativos</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Ação organotrópica: cada nutriente atua diretamente sobre retina, mácula, nervo óptico e estruturas oculares.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {BIOATIVOS.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.name}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5 hover:bg-secondary transition-colors"
                  >
                    <Icon className={`h-3 w-3 ${b.color}`} />
                    <span className="text-[10px] font-medium text-foreground">{b.name}</span>
                    <span className="text-[9px] font-bold text-accent">{b.dose}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Capabilities grid */}
          <div className="px-5 pb-3 space-y-2.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">O que ele faz por você</p>
            <div className="grid grid-cols-2 gap-2">
              {CAPABILITIES.map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="rounded-xl bg-secondary/50 p-3 space-y-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10">
                        <Icon className="h-3 w-3 text-accent" />
                      </div>
                      <p className="text-[11px] font-medium text-foreground leading-tight">{c.title}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground pl-[30px]">{c.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Trust badges */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 rounded-xl bg-accent/5 border border-accent/15 px-3 py-2.5">
              <BadgeCheck className="h-4 w-4 text-accent shrink-0" />
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {["Aprovado ANVISA", "Indicado por oftalmologistas", "Garantia 30 dias"].map((t) => (
                  <span key={t} className="text-[9px] font-medium text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-[12px] hover:bg-accent hover:text-accent-foreground hover:border-accent"
              onClick={() => navigate("/club/subscription")}
            >
              Gerenciar assinatura
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductShowcase;
