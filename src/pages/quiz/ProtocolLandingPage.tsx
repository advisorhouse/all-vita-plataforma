import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight, Clock, Stethoscope, Eye, Activity, Sparkles, ShieldCheck,
  Check, ShieldCheck as ShieldIcon, BadgeCheck, Lock, LucideIcon, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toTitleCase } from "@/lib/utils";
import defaultHero from "@/assets/protocol-hero-default.jpg";

const ICON_MAP: Record<string, LucideIcon> = {
  Activity, Sparkles, ShieldCheck, Stethoscope, Eye,
};

interface ProtocolConfig {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_label: string;
  hero_meta: string;
  hero_image_url: string | null;
  why_eyebrow: string;
  why_title: string;
  why_paragraph_1: string;
  why_paragraph_2: string;
  reasons: Array<{ title: string; description: string; icon: string }>;
  logic_eyebrow: string;
  logic_title: string;
  logic_description: string;
  logic_benefits: string[];
  cta_title: string;
  cta_description: string;
  cta_button_label: string;
  cta_meta: string;
  trust_badges: string[];
}

const DEFAULT_CONFIG: ProtocolConfig = {
  hero_badge: "Continuação do seu atendimento",
  hero_title: "Seu médico já iniciou o cuidado com a sua saúde",
  hero_subtitle: "Agora é hora de dar continuidade ao cuidado iniciado em consulta. Vamos identificar o protocolo mais adequado para você.",
  hero_cta_label: "Iniciar minha avaliação",
  hero_meta: "Menos de 2 minutos • Recomendado pelo seu médico",
  hero_image_url: null,
  why_eyebrow: "POR QUE VOCÊ ESTÁ VENDO ESTA PÁGINA",
  why_title: "Seu atendimento não termina na consulta",
  why_paragraph_1: "Após o atendimento clínico, muitos pacientes são orientados a manter um cuidado contínuo para preservar os resultados ao longo do tempo.",
  why_paragraph_2: "Esta página foi desenvolvida justamente para facilitar esse próximo passo, conectando o cuidado da consulta com a proteção de longo prazo que você precisa.",
  reasons: [
    { title: "Estresse contínuo", description: "A exposição diária a fatores externos gera danos cumulativos que não param após a consulta", icon: "Activity" },
    { title: "Proteção progressiva", description: "Os benefícios de um protocolo bem estruturado se constroem com consistência ao longo dos meses", icon: "Sparkles" },
    { title: "Cuidado completo", description: "Sem uma abordagem contínua, o cuidado iniciado na consulta pode ficar incompleto", icon: "ShieldCheck" },
  ],
  logic_eyebrow: "A LÓGICA POR TRÁS DO PROTOCOLO",
  logic_title: "Proteção estruturada para resultados de longo prazo",
  logic_description: "O protocolo foi estruturado para atuar de forma progressiva, apoiando sua saúde ao longo do tempo. Seus benefícios estão diretamente ligados à consistência do uso.",
  logic_benefits: [
    "Proteção contínua da saúde",
    "Suporte à integridade do organismo",
    "Redução dos efeitos do estresse oxidativo",
    "Evolução progressiva ao longo dos meses",
  ],
  cta_title: "Identifique o nível ideal de proteção para o seu caso",
  cta_description: "Responda algumas perguntas rápidas sobre seu perfil e descubra o plano mais adequado para dar continuidade ao cuidado iniciado na sua consulta.",
  cta_button_label: "Iniciar minha avaliação",
  cta_meta: "Menos de 2 minutos • Resultado personalizado",
  trust_badges: ["Dados criptografados", "Recomendado por profissionais", "Resultado individualizado"],
};

const ProtocolLandingPage: React.FC = () => {
  const { doctorCode } = useParams<{ doctorCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [config, setConfig] = useState<ProtocolConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("");

  // Fetch tenant config
  useEffect(() => {
    const load = async () => {
      if (!currentTenant?.id) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await (supabase as any)
          .from("tenant_protocol_landing")
          .select("*")
          .eq("tenant_id", currentTenant.id)
          .maybeSingle();
        if (data) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data,
            reasons: Array.isArray(data.reasons) ? data.reasons : DEFAULT_CONFIG.reasons,
            logic_benefits: Array.isArray(data.logic_benefits) ? data.logic_benefits : DEFAULT_CONFIG.logic_benefits,
            trust_badges: Array.isArray(data.trust_badges) ? data.trust_badges : DEFAULT_CONFIG.trust_badges,
          });
        }
      } catch (e) {
        console.warn("[Protocol] Failed to load config", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentTenant?.id]);

  // Resolve referral / doctor
  useEffect(() => {
    const ref = searchParams.get("ref") || doctorCode;
    if (ref) {
      const loadPartnerName = async () => {
        try {
          const { data, error } = await supabase
            .from("partners")
            .select(`
              profiles (
                first_name,
                last_name
              )
            `)
            .eq("referral_code", ref.toString().toUpperCase())
            .maybeSingle();

          if (data?.profiles) {
            const profile = data.profiles as any;
            const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
            setDoctorName(toTitleCase(fullName));
          } else {
            setDoctorName(toTitleCase(ref.toString()));
          }
        } catch (e) {
          console.error("Error loading partner name:", e);
          setDoctorName(toTitleCase(ref.toString()));
        }
      };
      
      loadPartnerName();
      // Persist for tracking inside subsequent quiz/AI conversation
      try { localStorage.setItem("allvita_partner_ref", ref.toString().toUpperCase()); } catch {}
    }
  }, [doctorCode, searchParams]);

  const startQuiz = () => {
    const ref = searchParams.get("ref") || doctorCode || "";
    const params = new URLSearchParams();
    if (ref) params.set("ref", ref.toString());
    const qs = params.toString();
    if (doctorCode) {
      navigate(`/quiz/${doctorCode}/consent${qs ? `?${qs}` : ""}`);
    } else {
      navigate(`/quiz/consent${qs ? `?${qs}` : ""}`);
    }
  };

  const tenantLogo = currentTenant?.logo_url;
  const tenantName = currentTenant?.trade_name || currentTenant?.name || "";
  const heroImage = config.hero_image_url || defaultHero;

  // Build hero title with doctor reference
  const heroTitle = config.hero_title;
  const heroSubtitle = doctorName
    ? config.hero_subtitle.replace(/Dr\.\s*[\w]+/gi, "").replace("seu médico", doctorName)
    : config.hero_subtitle;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar with tenant logo */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenantLogo ? (
              <img src={tenantLogo} alt={tenantName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-base font-semibold tracking-tight">{tenantName}</span>
            )}
          </div>
          <Button
            onClick={startQuiz}
            size="sm"
            className="rounded-xl px-5 text-primary-foreground transition-all"
            style={{ backgroundColor: currentTenant?.secondary_color || "var(--primary)" }}
          >
            Fazer avaliação
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative h-[480px] sm:h-[560px] lg:h-[620px]">
          <img
            src={heroImage}
            alt="Protocolo pós-consulta"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl text-white"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3.5 py-1.5 text-xs font-medium">
                <Stethoscope className="h-3.5 w-3.5" />
                {config.hero_badge}
              </div>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                {heroTitle}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-white/85 max-w-lg leading-relaxed">
                {heroSubtitle}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                <Button
                  onClick={startQuiz}
                  size="lg"
                  className="rounded-xl text-primary-foreground px-7 h-12 text-sm font-semibold gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: currentTenant?.secondary_color || "var(--primary)" }}
                >
                  {config.hero_cta_label}
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 text-xs text-white/75">
                  <Clock className="h-3.5 w-3.5" />
                  {config.hero_meta}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-primary/5 border border-primary/10 p-8 sm:p-12"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-primary">
              <Stethoscope className="h-3.5 w-3.5" />
              {config.why_eyebrow}
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {config.why_title}
            </h2>
            <div className="mt-5 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
              <p>{config.why_paragraph_1}</p>
              <p>{config.why_paragraph_2}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* REASONS GRID */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight max-w-2xl">
            A proteção acontece nos dias e meses seguintes
          </h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            Grande parte da evolução está ligada ao que acontece após a consulta. Fatores externos continuam atuando silenciosamente sobre o organismo.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {config.reasons.map((reason, i) => {
              const Icon = ICON_MAP[reason.icon] || Activity;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-2xl bg-card border border-border p-6"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <p className="mt-4 text-sm font-bold text-foreground">{reason.title}</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{reason.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LOGIC */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-muted/40 border border-border p-8 sm:p-12"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-primary">
              <Eye className="h-3.5 w-3.5" />
              {config.logic_eyebrow}
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground tracking-tight max-w-3xl">
              {config.logic_title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
              {config.logic_description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {config.logic_benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-card border border-border shadow-sm p-10 sm:p-14 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight max-w-2xl mx-auto">
              {config.cta_title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {config.cta_description}
            </p>

            <Button
              onClick={startQuiz}
              size="lg"
              className="mt-8 rounded-xl text-primary-foreground px-8 h-12 text-sm font-semibold gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: currentTenant?.secondary_color || "var(--primary)" }}
            >
              {config.cta_button_label}
              <ChevronRight className="h-4 w-4" />
            </Button>

            <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Clock className="h-3 w-3" />
              {config.cta_meta}
            </p>
          </motion.div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            {config.trust_badges.map((badge, i) => {
              const icons = [Lock, ShieldIcon, BadgeCheck];
              const Icon = icons[i % icons.length];
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {badge}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {tenantLogo && <img src={tenantLogo} alt="" className="h-5 w-auto object-contain opacity-70" />}
            <span>© {new Date().getFullYear()} {tenantName}. Todos os direitos reservados.</span>
          </div>
          <span>Este produto não é um medicamento. Consulte seu médico.</span>
        </div>
      </footer>
    </div>
  );
};

export default ProtocolLandingPage;
