import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Copy, CheckCircle2, Network, ShoppingBag, QrCode,
  Share2, MessageCircle, Loader2, AlertCircle, Coins, Users, TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useCurrentPartner } from "@/hooks/useCurrentPartner";
import { useTenant } from "@/contexts/TenantContext";
import { buildTenantUrl } from "@/lib/tenant-routing";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="h-9 gap-2">
      {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {label ?? (copied ? "Copiado" : "Copiar")}
    </Button>
  );
}

function ShareButtons({ url, message }: { url: string; message: string }) {
  const text = encodeURIComponent(`${message}\n\n${url}`);
  const wa = `https://wa.me/?text=${text}`;
  return (
    <div className="flex gap-2">
      <a href={wa} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </Button>
      </a>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ url, text: message });
            } catch {/* user cancelled */}
          } else {
            await navigator.clipboard.writeText(`${message} ${url}`);
            toast.success("Mensagem copiada!");
          }
        }}
      >
        <Share2 className="h-3.5 w-3.5" /> Compartilhar
      </Button>
    </div>
  );
}

function QRPreview({ url }: { url: string }) {
  // Free public QR API — renders client-side, no extra deps
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(url)}`;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3">
      <img src={src} alt="QR Code" className="h-20 w-20 rounded-md bg-white p-1" />
      <div className="text-[11px] text-muted-foreground leading-relaxed">
        Escaneie ou imprima<br />para divulgar offline.
      </div>
    </div>
  );
}

const PartnerLinksPage: React.FC = () => {
  const { currentTenant } = useTenant();
  const { data: partner, isLoading } = useCurrentPartner();

  // Aggregated stats
  const { data: stats } = useQuery({
    queryKey: ["partner-link-stats", partner?.id],
    enabled: !!partner?.id,
    queryFn: async () => {
      const [referralsRes, conversionsRes, networkRes, commissionsRes] = await Promise.all([
        supabase.from("referrals").select("id", { count: "exact", head: true }).eq("partner_id", partner!.id),
        supabase.from("conversions").select("id", { count: "exact", head: true }).eq("partner_id", partner!.id),
        supabase.from("partners").select("id", { count: "exact", head: true }).eq("parent_partner_id", partner!.id).eq("active", true),
        supabase.from("mt_commissions").select("amount").eq("partner_id", partner!.id),
      ]);
      const totalCommissions = (commissionsRes.data ?? []).reduce(
        (s: number, r: any) => s + Number(r.amount || 0), 0
      );
      return {
        clientsReferred: referralsRes.count ?? 0,
        conversions: conversionsRes.count ?? 0,
        networkSize: networkRes.count ?? 0,
        totalCommissions,
      };
    },
  });

  const code = partner?.referral_code;
  const slug = currentTenant?.slug;

  const links = useMemo(() => {
    if (!code || !slug) return null;
    return {
      recruit: buildTenantUrl(slug, `/r/${code}`),
      sale: buildTenantUrl(slug, `/q/${code}`),
    };
  }, [code, slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!partner || !links) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="p-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Seu cadastro de parceiro ainda não está ativo.</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Assim que o administrador ativar seu vínculo, seus links únicos serão gerados automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tenantName = currentTenant?.trade_name || currentTenant?.name || "a plataforma";
  const recruitMessage = `Quero te convidar para fazer parte da rede de parceiros ${tenantName}. Cadastre-se pelo meu link:`;
  const saleMessage = `Conheça o programa de saúde visual ${tenantName}. Faça o questionário gratuito pelo meu link:`;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-foreground">Meus Links</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Use seus links rastreáveis para indicar parceiros para a sua rede e gerar vendas atribuídas. Cada conversão credita comissão e Vitacoins automaticamente.
          </p>
        </motion.div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pacientes indicados", value: String(stats?.clientsReferred ?? 0), icon: Users },
            { label: "Vendas atribuídas", value: String(stats?.conversions ?? 0), icon: TrendingUp },
            { label: "Parceiros na rede", value: String(stats?.networkSize ?? 0), icon: Network },
            { label: "Comissão acumulada", value: `R$ ${(stats?.totalCommissions ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: Coins },
          ].map((m, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <m.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="text-[11px] font-medium">{m.label}</span>
                </div>
                <p className="text-lg font-bold tracking-tight text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two main link cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* RECRUIT */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-border h-full">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Network className="h-4 w-4 text-accent" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-[14px] font-semibold text-foreground">Link de Recrutamento</h2>
                      <p className="text-[11px] text-muted-foreground">Para convidar novos parceiros para a sua rede</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Multinível</Badge>
                </div>

                <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">URL única</p>
                  <p className="text-[12px] font-mono text-foreground break-all leading-relaxed">{links.recruit}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <CopyButton value={links.recruit} />
                  <ShareButtons url={links.recruit} message={recruitMessage} />
                </div>

                <QRPreview url={links.recruit} />

                <div className="rounded-lg bg-secondary/30 p-3 text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Como funciona:</strong> Quem se cadastrar por este link entra na sua rede como parceiro descendente. Você passa a receber comissão de todas as vendas geradas por ele, conforme as regras de níveis configuradas pelo administrador.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SALE */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border h-full">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-accent" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-[14px] font-semibold text-foreground">Link de Vendas</h2>
                      <p className="text-[11px] text-muted-foreground">Para indicar o produto a pacientes</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Comissão direta</Badge>
                </div>

                <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">URL única</p>
                  <p className="text-[12px] font-mono text-foreground break-all leading-relaxed">{links.sale}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <CopyButton value={links.sale} />
                  <ShareButtons url={links.sale} message={saleMessage} />
                </div>

                <QRPreview url={links.sale} />

                <div className="rounded-lg bg-secondary/30 p-3 text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Como funciona:</strong> Quem clicar e completar uma compra é vinculado a você automaticamente. A venda gera comissão para você (e níveis acima, se houver), e os Vitacoins são creditados conforme as regras do tenant.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Code card */}
        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Seu código</p>
              <p className="text-2xl font-mono font-bold text-foreground tracking-wider">{code}</p>
            </div>
            <CopyButton value={code!} label="Copiar código" />
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default PartnerLinksPage;
