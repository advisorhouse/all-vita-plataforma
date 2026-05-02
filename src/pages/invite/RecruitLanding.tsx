import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { partnerRefStorage } from "@/hooks/usePartnerTracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShieldCheck, Coins, Network, ArrowRight, UserCircle2 } from "lucide-react";
import { isColorLight } from "@/lib/utils";
import logoAllVita from "@/assets/logo-allvita.png";

interface ResolvedPartner {
  partner_id: string;
  tenant_id: string;
  partner_name: string;
  partner_avatar: string | null;
  partner_level: string | null;
  active: boolean;
}

const RecruitLanding: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { tenantPath } = useTenantNavigation();

  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<ResolvedPartner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      if (!code) return;
      setLoading(true);
      try {
        const { data, error } = await (supabase.rpc as any)("resolve_referral", {
          _code: code,
          _tenant_id: currentTenant?.id ?? null,
        });
        if (error) throw error;
        const row = (data as ResolvedPartner[] | null)?.[0] ?? null;
        if (!row) {
          setError("Código de indicação inválido ou expirado.");
        } else {
          setPartner(row);
          partnerRefStorage.set(code, "recruit");
        }
      } catch (e: any) {
        setError(e.message || "Erro ao validar o link.");
      } finally {
        setLoading(false);
      }
    };
    resolve();
  }, [code, currentTenant?.id]);

  const tenantName = currentTenant?.trade_name || currentTenant?.name || "All Vita";
  const primary = currentTenant?.primary_color || "#1A1A1A";
  const fg = isColorLight(primary) ? "#1A1A1A" : "#ffffff";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-sm">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={() => navigate("/")}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const goSignup = () => {
    // Persist code one more time, then send to tenant signup w/ partner role
    partnerRefStorage.set(code!, "recruit");
    navigate(
      tenantPath(`/auth/signup?role=partner&ref=${encodeURIComponent(code!)}`)
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: primary }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <img
            src={currentTenant?.logo_url || logoAllVita}
            alt={tenantName}
            className="h-14 w-auto mx-auto object-contain"
            style={{ maxHeight: 64 }}
          />
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-7 space-y-6">
            {/* Inviter */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                {partner.partner_avatar ? (
                  <img src={partner.partner_avatar} alt={partner.partner_name} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Você foi convidado por
                </p>
                <p className="text-base font-semibold text-foreground truncate">{partner.partner_name}</p>
                {partner.partner_level && (
                  <p className="text-[11px] text-muted-foreground capitalize">Nível {partner.partner_level}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Faça parte da rede de parceiros {tenantName}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ao se cadastrar, você entra automaticamente na rede de {partner.partner_name.split(" ")[0]} e começa a indicar pacientes/produtos com link rastreável próprio.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { icon: Coins, title: "Comissões em Vitacoins", desc: "Cada venda vira pontos resgatáveis em produtos, cursos ou Pix." },
                { icon: Network, title: "Rede multinível", desc: "Indique outros parceiros e ganhe percentual sobre as vendas deles." },
                { icon: ShieldCheck, title: "Acesso imediato", desc: "Painel próprio com link, materiais e relatórios em tempo real." },
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/40 px-3 py-2.5">
                  <b.icon className="h-4 w-4 text-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{b.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={goSignup} className="w-full h-11 rounded-xl font-semibold">
              Cadastrar como Parceiro
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              Código de indicação: <span className="font-mono font-semibold text-foreground">{code}</span>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] mt-5" style={{ color: fg, opacity: 0.7 }}>
          Powered by <span className="font-medium">All Vita</span>
        </p>
      </motion.div>
    </div>
  );
};

export default RecruitLanding;
