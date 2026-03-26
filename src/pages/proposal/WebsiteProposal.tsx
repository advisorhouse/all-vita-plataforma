import React, { useState, useCallback, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Home, Eye, ArrowRight, Layers, ShoppingCart,
  Globe, Compass, CheckCircle2, Monitor, Zap, Heart, Download, Loader2,
  Layout, Target, Users, BookOpen, Stethoscope, Package, FileText, Award,
  PenTool, BadgeCheck, Brain, Shield, Newspaper, CreditCard, Truck,
  MessageSquare, Database, UserCheck, BarChart3, ExternalLink, Mail, Bell,
  Search, ShieldCheck, BarChart2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoVisionLift from "@/assets/logo-vision-lift.png";
import refBluue from "@/assets/ref-bluue.png";
import refRootine from "@/assets/ref-rootine.png";

import refNoom from "@/assets/ref-noom.png";
import refHimss from "@/assets/ref-himss.png";
import diagnosticChatPreview from "@/assets/diagnostic-chat-preview.png";
import wireframePreview from "@/assets/wireframe-relume-preview.png";
import logoShopify from "@/assets/logo-shopify.png";
import logoWordpress from "@/assets/logo-wordpress.png";
import logoPagarme from "@/assets/logo-pagarme.png";
import logoB4you from "@/assets/logo-b4you.png";
import logoMelhorEnvio from "@/assets/logo-melhor-envio.png";
import logoAnalytics from "@/assets/logo-analytics.png";
import productVisionLiftCombo from "@/assets/product-vision-lift-combo.png";

/* ─── PDF static context ─── */
const PdfStaticContext = createContext(false);
const usePdfStatic = () => useContext(PdfStaticContext);

const StaticSlideWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PdfStaticContext.Provider value={true}>
    <MotionConfig reducedMotion="always">{children}</MotionConfig>
  </PdfStaticContext.Provider>
);

/* ─── animation variants ─── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };
const fadeScale = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: "easeOut" as const } } };
const popIn = { hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 400, damping: 18 } } };

const MStagger = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const s = usePdfStatic();
  if (s) return <div className={className}>{children}</div>;
  return <motion.div variants={stagger} initial="hidden" animate="visible" className={className}>{children}</motion.div>;
};
const MItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const s = usePdfStatic();
  if (s) return <div className={className}>{children}</div>;
  return <motion.div variants={fadeUp} className={className}>{children}</motion.div>;
};
const MScaleItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const s = usePdfStatic();
  if (s) return <div className={className}>{children}</div>;
  return <motion.div variants={fadeScale} className={className}>{children}</motion.div>;
};
const MPopItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const s = usePdfStatic();
  if (s) return <div className={className}>{children}</div>;
  return <motion.div variants={popIn} className={className}>{children}</motion.div>;
};

/* ─── reusable ─── */
const SlideHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <MItem className="flex items-center gap-3">
    <MPopItem>
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </MPopItem>
    <h2 className="text-3xl font-bold text-foreground tracking-tight">{title}</h2>
  </MItem>
);

const FlowArrow = () => (
  <div className="flex items-center justify-center shrink-0">
    <ArrowRight className="h-4 w-4 text-primary/25" />
  </div>
);

const FlowIcon = ({ icon: Icon, label, desc }: { icon: React.ElementType; label: string; desc?: string }) => (
  <div className="flex flex-col items-center text-center gap-2 w-[130px]">
    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h4 className="text-xs font-bold text-foreground leading-tight">{label}</h4>
    {desc && <p className="text-[10px] text-muted-foreground leading-snug">{desc}</p>}
  </div>
);

/* ═══════════════════ SLIDES ═══════════════════ */
const slides = [
  /* ── 1. COVER ── */
  {
    id: "cover",
    title: "Capa",
    content: () => (
      <MStagger className="flex flex-col items-center justify-center h-full gap-8 text-center px-12">
        <MPopItem><img src={logoVisionLift} alt="Vision Lift" className="h-14 w-auto" /></MPopItem>
        <MItem>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Nova Experiência Digital<br />
            <span className="text-primary">Vision Lift</span>
          </h1>
        </MItem>
        <MItem>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Estrutura digital para educar, diagnosticar e converter.
          </p>
        </MItem>
        <MItem>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Esta apresentação foca exclusivamente no <strong className="text-foreground">novo site</strong> e na experiência de venda da Vision Lift.
          </p>
        </MItem>
        <MItem className="flex items-center gap-6 mt-4">
          {[
            { icon: Eye, label: "Saúde Visual" },
            { icon: Compass, label: "Jornada Guiada" },
            { icon: Target, label: "Conversão" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <b.icon className="h-4 w-4 text-primary" />
              <span>{b.label}</span>
            </div>
          ))}
        </MItem>
      </MStagger>
    ),
  },

  /* ── 2. DUAS JORNADAS ── */
  {
    id: "duas-jornadas",
    title: "Duas Jornadas",
    content: () => (
      <MStagger className="flex flex-col h-full px-16 py-10 gap-8">
        <MItem className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/70 mb-3">Arquitetura de Experiência</p>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">Duas Jornadas Principais</h2>
        </MItem>
        <MItem>
          <p className="text-base text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
            O novo site será estruturado em torno de <strong className="text-foreground">duas jornadas distintas</strong>, cada uma desenhada para um público específico.
          </p>
        </MItem>
        <div className="grid grid-cols-2 gap-8 flex-1 items-center mt-4">
          <MScaleItem className="rounded-2xl border border-primary/20 bg-primary/5 p-8 flex flex-col gap-5 h-full">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Jornada do Paciente</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
               Experiência focada em <strong className="text-foreground">elevar o nível de consciência</strong> sobre saúde ocular, <strong className="text-foreground">diagnóstico visual</strong>, <strong className="text-foreground">recomendação personalizada</strong> e <strong className="text-foreground">conversão em vendas</strong>.
             </p>
          </MScaleItem>
          <MScaleItem className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-5 h-full">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Jornada do Profissional de Saúde</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
               Experiência dedicada a <strong className="text-foreground">médicos e profissionais</strong> que desejam integrar Vision Lift à sua prática, <strong className="text-foreground">tornando-se parceiros</strong> na promoção da saúde ocular dos seus pacientes.
             </p>
          </MScaleItem>
        </div>
      </MStagger>
    ),
  },

  /* ── 3. JORNADA DO PACIENTE ── */
  {
    id: "jornada-paciente",
    title: "Jornada do Paciente",
    content: () => {
      const steps = [
        { icon: Globe, label: "Landing Page", desc: "Educação visual." },
        { icon: Stethoscope, label: "Diagnóstico Visual", desc: "Avaliação interativa." },
        { icon: Eye, label: "Resultado", desc: "Relatório personalizado." },
        { icon: Heart, label: "Recomendação", desc: "Solução ideal." },
        { icon: ShoppingCart, label: "Compra", desc: "Checkout integrado." },
        { icon: Layers, label: "Plataforma VL", desc: "Acesso pós-compra." },
      ];

      const JourneyFlow = () => {
        const isStatic = usePdfStatic();
        const [activeIndex, setActiveIndex] = React.useState(0);

        React.useEffect(() => {
          if (isStatic) return;
          const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % steps.length);
          }, 2000);
          return () => clearInterval(interval);
        }, [isStatic]);

        return (
          <div className="flex items-center gap-3 justify-center">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeIndex;
              const isPast = i < activeIndex;
              return (
                <React.Fragment key={step.label}>
                  <motion.div
                    className="flex flex-col items-center text-center gap-3 w-[150px]"
                    animate={isStatic ? {} : {
                      scale: isActive ? 1.15 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className="h-[72px] w-[72px] rounded-2xl flex items-center justify-center border-2 transition-colors duration-500"
                      style={{
                        background: isActive
                          ? "hsl(210 100% 50% / 0.15)"
                          : isPast
                          ? "hsl(210 100% 50% / 0.08)"
                          : "hsl(var(--primary) / 0.05)",
                        borderColor: isActive
                          ? "hsl(210 100% 50%)"
                          : isPast
                          ? "hsl(210 100% 50% / 0.4)"
                          : "hsl(var(--primary) / 0.15)",
                      }}
                      animate={isStatic ? {} : {
                        scale: isActive ? [1, 1.08, 1] : 1,
                      }}
                      transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatType: "reverse" }}
                    >
                      <Icon
                        className="h-8 w-8 transition-colors duration-500"
                        style={{
                          color: isActive || isPast ? "hsl(210 100% 50%)" : "hsl(var(--primary))",
                        }}
                      />
                    </motion.div>
                    <h4 className="text-sm font-bold leading-tight transition-colors duration-500"
                      style={{ color: isActive ? "hsl(210 100% 50%)" : "hsl(var(--foreground))" }}
                    >
                      {step.label}
                    </h4>
                    {step.desc && (
                      <p className="text-[11px] text-muted-foreground leading-snug">{step.desc}</p>
                    )}
                  </motion.div>
                  {i < steps.length - 1 && (
                    <div className="flex items-center -mt-8">
                      <div className="w-8 h-1 rounded-full overflow-hidden bg-muted">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "hsl(210 100% 50%)" }}
                          animate={isStatic ? { width: "100%" } : {
                            width: isPast || isActive ? "100%" : "0%",
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <ChevronRight className="h-4 w-4 transition-colors duration-500"
                        style={{ color: isPast ? "hsl(210 100% 50%)" : "hsl(var(--muted-foreground))" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      };

      return (
        <MStagger className="flex flex-col h-full px-16 py-10 gap-6">
          <SlideHeader icon={Users} title="Jornada do Paciente" />
          <MItem>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              O paciente percorre uma jornada que aumenta a <strong className="text-foreground">consciência sobre sua saúde visual</strong> antes de apresentar o produto. A plataforma Vision Lift é acessada <strong className="text-foreground">somente após a compra</strong>.
            </p>
          </MItem>
          <MScaleItem className="flex-1 flex items-center justify-center">
            <JourneyFlow />
          </MScaleItem>
          <MItem className="text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              A experiência gera <strong className="text-foreground">confiança progressiva</strong> — o produto é a consequência natural da descoberta.
            </p>
          </MItem>
        </MStagger>
      );
    },
  },

  /* ── 4. JORNADA DO PROFISSIONAL ── */
  {
    id: "jornada-profissional",
    title: "Jornada do Profissional",
    content: () => {
      const steps = [
        { icon: Globe, label: "Landing Profissionais", desc: "Página exclusiva." },
        { icon: FileText, label: "Conteúdo Científico", desc: "Formulação e estudos." },
        { icon: Award, label: "Vision Partners", desc: "Modelo de parceria." },
        { icon: PenTool, label: "Cadastro Profissional", desc: "Registro e validação." },
        { icon: BadgeCheck, label: "Aprovação", desc: "Verificação." },
      ];

      const ProfJourneyFlow = () => {
        const isStatic = usePdfStatic();
        const [activeIndex, setActiveIndex] = React.useState(0);

        React.useEffect(() => {
          if (isStatic) return;
          const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % steps.length);
          }, 2000);
          return () => clearInterval(interval);
        }, [isStatic]);

        return (
          <div className="flex items-center gap-3 justify-center">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeIndex;
              const isPast = i < activeIndex;
              return (
                <React.Fragment key={step.label}>
                  <motion.div
                    className="flex flex-col items-center text-center gap-3 w-[150px]"
                    animate={isStatic ? {} : { scale: isActive ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className="h-[72px] w-[72px] rounded-2xl flex items-center justify-center border-2 transition-colors duration-500"
                      style={{
                        background: isActive ? "hsl(210 100% 50% / 0.15)" : isPast ? "hsl(210 100% 50% / 0.08)" : "hsl(var(--primary) / 0.05)",
                        borderColor: isActive ? "hsl(210 100% 50%)" : isPast ? "hsl(210 100% 50% / 0.4)" : "hsl(var(--primary) / 0.15)",
                      }}
                      animate={isStatic ? {} : { scale: isActive ? [1, 1.08, 1] : 1 }}
                      transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatType: "reverse" }}
                    >
                      <Icon className="h-8 w-8 transition-colors duration-500" style={{ color: isActive || isPast ? "hsl(210 100% 50%)" : "hsl(var(--primary))" }} />
                    </motion.div>
                    <h4 className="text-sm font-bold leading-tight transition-colors duration-500" style={{ color: isActive ? "hsl(210 100% 50%)" : "hsl(var(--foreground))" }}>
                      {step.label}
                    </h4>
                    {step.desc && <p className="text-[11px] text-muted-foreground leading-snug">{step.desc}</p>}
                  </motion.div>
                  {i < steps.length - 1 && (
                    <div className="flex items-center -mt-8">
                      <div className="w-8 h-1 rounded-full overflow-hidden bg-muted">
                        <motion.div className="h-full rounded-full" style={{ background: "hsl(210 100% 50%)" }} animate={isStatic ? { width: "100%" } : { width: isPast || isActive ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
                      </div>
                      <ChevronRight className="h-4 w-4 transition-colors duration-500" style={{ color: isPast ? "hsl(210 100% 50%)" : "hsl(var(--muted-foreground))" }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      };

      return (
        <MStagger className="flex flex-col h-full px-16 py-10 gap-6">
          <SlideHeader icon={Stethoscope} title="Jornada do Profissional de Saúde" />
          <MItem>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              Profissionais de saúde podem <strong className="text-foreground">recomendar o produto</strong> aos seus pacientes e participar do programa <strong className="text-foreground">Vision Partners</strong>.
            </p>
          </MItem>
          <MScaleItem className="flex-1 flex items-center justify-center">
            <ProfJourneyFlow />
          </MScaleItem>
          <MItem className="text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              O profissional recebe acesso a <strong className="text-foreground">conteúdo científico</strong> e pode acompanhar seus pacientes indicados.
            </p>
          </MItem>
        </MStagger>
      );
    },
  },

  /* ── 5. ESTRUTURA DO SITE ── */
  {
    id: "estrutura",
    title: "Estrutura do Site",
    content: () => {
      const sections = [
        { icon: Globe, title: "Landing Page Vision Lift", desc: "Página principal com educação sobre saúde visual e direcionamento ao diagnóstico." },
        { icon: Stethoscope, title: "Diagnóstico Visual Interativo", desc: "Ferramenta que avalia hábitos e sintomas do usuário de forma personalizada." },
        { icon: Heart, title: "Página de Recomendação", desc: "Resultado personalizado com o produto ideal baseado no diagnóstico." },
        { icon: Package, title: "Página de Planos", desc: "Opções de tratamento com diferentes durações e benefícios." },
        { icon: ShoppingCart, title: "Checkout", desc: "Fluxo de compra otimizado para máxima conversão." },
        { icon: BookOpen, title: "Conteúdo Educacional", desc: "Blog com artigos sobre saúde visual que direcionam ao diagnóstico." },
      ];
      return (
        <MStagger className="flex flex-col h-full px-16 py-10 gap-6">
          <SlideHeader icon={Layout} title="Estrutura do Novo Site" />
          <MItem>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              O site é composto por seções estratégicas que formam uma jornada completa de descoberta, educação e conversão.
            </p>
          </MItem>
          <div className="grid grid-cols-3 gap-5 flex-1 items-start mt-2">
            {sections.map((s) => (
              <MScaleItem key={s.title} className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 h-full">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
              </MScaleItem>
            ))}
          </div>
        </MStagger>
      );
    },
  },

  /* ── 6. WIREFRAME INTRO ── */
  {
    id: "wireframe-intro",
    title: "Wireframe — Introdução",
    content: () => (
      <MStagger className="flex flex-col items-center justify-center h-full gap-8 text-center px-16">
        <MPopItem>
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Monitor className="h-8 w-8 text-primary" />
          </div>
        </MPopItem>
        <MItem>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Preview do Wireframe</h2>
        </MItem>
        <MItem>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            O que será apresentado a seguir é um <strong className="text-foreground">esboço estrutural</strong> da experiência digital.
          </p>
        </MItem>
        <MScaleItem className="rounded-2xl border border-primary/20 bg-primary/5 px-8 py-5 max-w-2xl">
          <p className="text-sm text-muted-foreground leading-relaxed">
            O wireframe foi criado apenas para demonstrar a <strong className="text-foreground">arquitetura UX</strong> e a <strong className="text-foreground">qualidade técnica</strong> do projeto. Ele serve como base para validação antes do design visual e desenvolvimento.
          </p>
        </MScaleItem>
        <MItem>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">
            ⚠ Este NÃO é o design final
          </p>
        </MItem>
      </MStagger>
    ),
  },

  /* ── 7. WIREFRAME RELUME ── */
  {
    id: "wireframe-relume",
    title: "Wireframe — Relume",
    content: () => {
      const [modalOpen, setModalOpen] = React.useState(false);
      const relumeUrl = "https://www.relume.io/app/project/P3147833_CnRcEaiBnUh2CN4i6nzXCwHDMLLoisQKSH_IdRILckM#mode=wireframe";

      const WireframeBlock = ({ label, height = "h-8", accent = false }: { label: string; height?: string; accent?: boolean }) => (
        <div className={`${height} rounded border ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-muted/40"} flex items-center justify-center`}>
          <span className={`text-[9px] font-medium ${accent ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
        </div>
      );

      return (
        <>
          <MStagger className="flex flex-col h-full px-12 py-8 gap-4">
            <SlideHeader icon={Layout} title="Wireframe criado no Relume" />
            <MItem>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                Estrutura UX validada no <strong className="text-foreground">Relume</strong> antes do design visual. Clique para abrir o wireframe interativo.
              </p>
            </MItem>

            {/* Wireframe esquemático em código */}
            <MScaleItem className="flex-1 flex items-center justify-center">
              <button
                onClick={() => setModalOpen(true)}
                className="relative rounded-2xl border border-border bg-background p-6 max-w-4xl w-full group cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Esqueleto de wireframe */}
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/20" />
                      <span className="text-[9px] font-bold text-foreground">VISION LIFT</span>
                    </div>
                    <div className="flex gap-3">
                      {["Início", "Produto", "Diagnóstico", "Profissionais", "Blog"].map(l => (
                        <span key={l} className="text-[8px] text-muted-foreground">{l}</span>
                      ))}
                      <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded">Comprar</span>
                    </div>
                  </div>

                  {/* Hero */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 py-3">
                      <div className="h-3 w-3/4 rounded bg-foreground/10" />
                      <div className="h-2 w-full rounded bg-muted" />
                      <div className="h-2 w-5/6 rounded bg-muted" />
                      <div className="flex gap-2 mt-2">
                        <WireframeBlock label="Iniciar Diagnóstico" accent height="h-6" />
                        <WireframeBlock label="Ver Planos" height="h-6" />
                      </div>
                    </div>
                    <div className="h-24 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center">
                      <span className="text-[9px] text-muted-foreground">Imagem / Vídeo Hero</span>
                    </div>
                  </div>

                  {/* Seção Benefícios */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-40 rounded bg-foreground/10 mx-auto" />
                    <div className="grid grid-cols-3 gap-2">
                      {["Proteção UV & Luz Azul", "Lubrificação Avançada", "Suporte à Retina"].map(b => (
                        <div key={b} className="rounded border border-border bg-muted/20 p-2 text-center space-y-1">
                          <div className="w-5 h-5 rounded-full bg-primary/10 mx-auto" />
                          <span className="text-[8px] text-muted-foreground block">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diagnóstico + Planos lado a lado */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border border-primary/30 bg-primary/5 p-2.5 space-y-1.5">
                      <span className="text-[9px] font-semibold text-primary">Diagnóstico Visual IA</span>
                      <div className="space-y-1">
                        <div className="h-4 rounded bg-background border border-border flex items-center px-1.5">
                          <span className="text-[7px] text-muted-foreground">Qual seu principal incômodo?</span>
                        </div>
                        <div className="h-4 rounded bg-primary/10 flex items-center justify-center">
                          <span className="text-[7px] text-primary">Responder →</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded border border-border bg-muted/20 p-2.5 space-y-1.5">
                      <span className="text-[9px] font-semibold text-foreground">Planos de Assinatura</span>
                      <div className="flex gap-1.5">
                        {["1 mês", "3 meses", "5 meses"].map(p => (
                          <div key={p} className="flex-1 rounded border border-border bg-background p-1 text-center">
                            <span className="text-[7px] text-muted-foreground block">{p}</span>
                            <div className="h-2 w-full rounded bg-muted mt-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
                    <span className="text-[8px] text-muted-foreground">© Vision Lift — Todos os direitos reservados</span>
                    <div className="flex gap-3">
                      {["Termos", "Privacidade", "Contato"].map(f => (
                        <span key={f} className="text-[7px] text-muted-foreground">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Abrir wireframe interativo
                  </span>
                </div>
              </button>
            </MScaleItem>
          </MStagger>

          <AnimatePresence>
            {modalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">Wireframe — Relume</h3>
                  <div className="flex items-center gap-3">
                    <a href={relumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3.5 w-3.5" /> Abrir no Relume
                    </a>
                    <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                      ✕
                    </button>
                  </div>
                </div>
                <iframe
                  src={relumeUrl}
                  className="flex-1 w-full border-0"
                  title="Wireframe Relume"
                  allow="fullscreen"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      );
    },
  },

  /* ── REFERÊNCIAS DE LAYOUT ── */
  {
    id: "referencias",
    title: "Referências de Layout",
    content: () => {
      const refs = [
        { name: "Bluue", url: "https://bluue.com.br", img: refBluue, desc: "Diagnóstico guiado e recomendação inteligente de produtos para saúde visual." },
        { name: "Rootine", url: "https://rootine.co", img: refRootine, desc: "Micronutrientes personalizados baseados em DNA e dados biológicos individuais." },
        { name: "Noom", url: "https://noom.com", img: refNoom, desc: "Jornada de saúde com personalização comportamental e engajamento contínuo." },
        { name: "HIMSS", url: "https://himss.org", img: refHimss, desc: "Referência global em tecnologia de saúde digital e inovação no setor." },
      ];


      return (
          <MStagger className="flex flex-col h-full px-12 py-8 gap-5">
            <SlideHeader icon={Globe} title="Referências & Inspirações" />
            <MItem>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                Marcas que utilizam experiências diagnósticas ou guiadas para converter usuários — inspiração para a Vision Lift.
              </p>
            </MItem>
            <div className="grid grid-cols-4 gap-5 flex-1 items-start mt-1">
              {refs.map((r) => (
                <MScaleItem key={r.name}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-border bg-card flex flex-col overflow-hidden h-full hover:border-primary/40 hover:shadow-md transition-all group text-left w-full"
                  >
                    <div className="w-full aspect-[16/10] overflow-hidden bg-muted">
                      <img src={r.img} alt={r.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <h3 className="text-base font-semibold text-foreground">{r.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                      <span className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
                        <ExternalLink className="h-3.5 w-3.5" /> Abrir site
                      </span>
                    </div>
                  </a>
                </MScaleItem>
              ))}
            </div>
          </MStagger>
      );
    },
  },

  {
    id: "ecommerce",
    title: "Infraestrutura de Ecommerce",
    content: () => (
      <MStagger className="flex flex-col h-full px-16 py-10 gap-6">
        <SlideHeader icon={ShoppingCart} title="Infraestrutura de Ecommerce" />
        <MItem>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
            O site será integrado com uma plataforma profissional de ecommerce para gerenciar toda a operação comercial.
          </p>
        </MItem>
        <div className="grid grid-cols-2 gap-6 mt-2">
          {[
            { name: "Shopify", logo: logoShopify, desc: "Plataforma líder global em ecommerce. Ideal para operações que buscam agilidade, apps nativos e ecossistema robusto." },
            { name: "WordPress + WooCommerce", logo: logoWordpress, desc: "Solução open-source com máxima customização e controle total sobre a infraestrutura." },
          ].map((p) => (
            <MScaleItem key={p.name} className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-4">
              <img src={p.logo} alt={p.name} className="h-12 w-12 object-contain" />
              <h3 className="text-2xl font-bold text-foreground">{p.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </MScaleItem>
          ))}
        </div>
        <MItem className="mt-4">
          <p className="text-sm text-muted-foreground mb-3">Esses sistemas irão gerenciar:</p>
          <div className="flex flex-wrap gap-4">
            {[
              "Catálogo de produtos", "Planos e preços", "Checkout",
              "Pedidos", "Gestão de clientes", "Histórico de compras",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </MItem>
      </MStagger>
    ),
  },

  /* ── 9. PAGAMENTOS & SEGURANÇA ── */
  {
    id: "pagamentos",
    title: "Pagamentos & Segurança",
    content: () => (
      <MStagger className="flex flex-col h-full px-16 py-10 gap-6">
        <SlideHeader icon={CreditCard} title="Pagamentos & Segurança" />
        <MItem>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
            Gateways de pagamento e camadas de segurança para garantir <strong className="text-foreground">transações seguras</strong> e <strong className="text-foreground">proteção contra fraudes</strong>.
          </p>
        </MItem>
        <div className="grid grid-cols-2 gap-5 flex-1 items-start mt-2">
          {[
            { logo: logoB4you, name: "B4You", desc: "Gateway brasileiro com suporte a recorrência, boleto, cartão e PIX. Ideal para assinaturas." },
            { logo: logoPagarme, name: "Pagar.me", desc: "APIs flexíveis, split de pagamento e gestão avançada de recorrências." },
          ].map((g) => (
            <MScaleItem key={g.name} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 h-full">
              <img src={g.logo} alt={g.name} className="h-12 w-auto object-contain self-start" />
              <h3 className="text-xl font-bold text-foreground">{g.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{g.desc}</p>
            </MScaleItem>
          ))}
        </div>
      </MStagger>
    ),
  },

  /* ── 10. LOGÍSTICA & OPERAÇÕES ── */
  {
    id: "logistica",
    title: "Logística & Operações",
    content: () => (
      <MStagger className="flex flex-col h-full px-16 py-10 gap-6">
        <SlideHeader icon={Truck} title="Logística & Operações" />
        <MItem>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
            Integrações essenciais para <strong className="text-foreground">logística</strong>, <strong className="text-foreground">comunicação</strong> e <strong className="text-foreground">análise de dados</strong> da operação.
          </p>
        </MItem>
        <div className="grid grid-cols-2 gap-5 flex-1 items-start mt-2">
          {[
            { logo: logoMelhorEnvio, name: "Melhor Envio", desc: "Cotação automática, geração de etiquetas e rastreamento em tempo real com múltiplas transportadoras." },
            { logo: logoAnalytics, name: "Analytics & SEO", desc: "Google Analytics 4, Google Search Console e Meta Pixel para rastreamento de conversões e otimização de campanhas." },
          ].map((f) => (
            <MScaleItem key={f.name} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 h-full">
              <img src={f.logo} alt={f.name} className="h-12 w-auto object-contain self-start" />
              <h3 className="text-xl font-bold text-foreground">{f.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
            </MScaleItem>
          ))}
        </div>
      </MStagger>
    ),
  },
  {
    id: "diagnostico",
    title: "Diagnóstico Visual Interativo",
    content: () => {
      const messages: { from: string; text: string; audio?: boolean; result?: boolean; product?: boolean }[] = [
        { from: "bot", text: "Olá! Sou o assistente Vision Lift. Vou te ajudar a entender melhor sua saúde ocular. Pode me dizer sua idade?" },
        { from: "user", text: "Tenho 42 anos." },
        { from: "bot", text: "Obrigado! Quantas horas por dia você fica em frente a telas (computador, celular, TV)?" },
        { from: "user", text: "Umas 8 a 10 horas, entre trabalho e celular." },
        { from: "bot", text: "Entendi. Você costuma sentir seus olhos secos ou cansados no final do dia?" },
        { from: "user", text: "Sim, quase sempre à noite. Às vezes fica embaçado." },
        { from: "bot", text: "Você usa ou já usou colírios com frequência?" },
        { from: "user", text: "Uso de vez em quando, mas não resolve muito." },
        { from: "bot", audio: true, text: "Reproduzindo explicação sobre ressecamento ocular e fadiga digital..." },
        { from: "bot", text: "Já realizou alguma cirurgia nos olhos, como LASIK ou catarata?" },
        { from: "user", text: "Não, nunca fiz cirurgia." },
        { from: "bot", text: "Ótimo. Estou analisando suas respostas para gerar uma recomendação personalizada..." },
        { from: "bot", result: true, text: "✅ Com base no seu perfil, recomendo o Vision Lift Original — 3 meses, com foco em proteção contra luz azul e lubrificação avançada." },
        { from: "bot", product: true, text: "Vision Lift Original · Tratamento 3 meses" },
      ];

      const [visibleCount, setVisibleCount] = React.useState(0);
      const chatRef = React.useRef<HTMLDivElement>(null);

      React.useEffect(() => {
        if (visibleCount >= messages.length) return;
        const msg = messages[visibleCount];
        const delay = msg?.audio ? 2800 : msg?.result ? 2000 : msg?.product ? 1200 : msg?.from === "bot" ? 1400 : 900;
        const timer = setTimeout(() => setVisibleCount((c) => c + 1), delay);
        return () => clearTimeout(timer);
      }, [visibleCount]);

      React.useEffect(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, [visibleCount]);

      return (
        <MStagger className="flex flex-col h-full px-16 py-10 gap-5">
          <SlideHeader icon={MessageSquare} title="Diagnóstico Visual Interativo" />
          <MItem>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Interface conversacional com <strong className="text-foreground">IA + voz</strong> que guia o usuário por perguntas dinâmicas sobre sua saúde visual.
            </p>
          </MItem>
          <div className="grid grid-cols-5 gap-5 flex-1 items-stretch mt-1">
            {/* Chat Widget — LIGHT — fixed height */}
            <MScaleItem className="col-span-3 rounded-2xl border border-border bg-card overflow-hidden flex flex-col shadow-sm h-[440px]">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30 shrink-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Vision Lift Assistant</p>
                  <p className="text-[10px] text-muted-foreground">Online agora</p>
                </div>
                <div className="ml-auto flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
              </div>
              {/* Messages — scrollable fixed area */}
              <div ref={chatRef} className="flex-1 px-4 py-3 space-y-2.5 overflow-y-auto">
                {messages.slice(0, visibleCount).map((msg, i) => {
                  if (msg.from === "user") {
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex gap-2 items-end justify-end">
                        <div className="bg-primary rounded-2xl rounded-br-md px-3.5 py-2 max-w-[72%]">
                          <p className="text-[11px] text-primary-foreground leading-relaxed">{msg.text}</p>
                        </div>
                      </motion.div>
                    );
                  }
                  // Product card at end
                  if (msg.product) {
                    return (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex gap-2 items-end">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Eye className="h-3 w-3 text-primary" />
                        </div>
                        <div className="rounded-2xl rounded-bl-md border border-primary/25 bg-primary/5 p-3 max-w-[80%] flex items-center gap-3 cursor-pointer hover:bg-primary/10 transition-colors">
                          <img src={productVisionLiftCombo} alt="Vision Lift" className="h-14 w-14 object-contain rounded-lg" />
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-semibold text-foreground">{msg.text}</p>
                            <p className="text-[9px] text-primary font-medium flex items-center gap-1">
                              Ver recomendação completa <ArrowRight className="h-2.5 w-2.5" />
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex gap-2 items-end">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Eye className="h-3 w-3 text-primary" />
                      </div>
                      <div className={`rounded-2xl rounded-bl-md px-3.5 py-2 max-w-[75%] ${msg.result ? "bg-primary/10 border border-primary/20" : msg.audio ? "bg-amber-50 border border-amber-200" : "bg-muted/60 border border-border"}`}>
                        {msg.audio && (
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="h-6 w-6 rounded-full bg-amber-500/15 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-600" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            </div>
                            {/* Equalizer bars */}
                            <div className="flex gap-[2px] items-end h-4">
                              {[4, 8, 5, 10, 6, 12, 7, 9, 4, 11, 5, 8, 6, 10, 3, 7, 5, 9, 4, 8].map((h, j) => (
                                <motion.div
                                  key={j}
                                  className="w-[2px] bg-amber-500 rounded-full"
                                  initial={{ height: 2 }}
                                  animate={{ height: [2, h, 3, h * 0.7, 2] }}
                                  transition={{ duration: 0.8 + Math.random() * 0.4, repeat: Infinity, delay: j * 0.06, ease: "easeInOut" }}
                                />
                              ))}
                            </div>
                            <span className="text-[9px] text-amber-600 font-semibold tracking-wide">0:18</span>
                            <span className="text-[8px] text-amber-500 font-medium ml-auto">ElevenLabs</span>
                          </div>
                        )}
                        <p className={`text-[11px] leading-relaxed ${msg.result ? "text-primary font-medium" : "text-foreground"}`}>{msg.text}</p>
                      </div>
                    </motion.div>
                  );
                })}
                {/* Typing indicator */}
                {visibleCount < messages.length && visibleCount > 0 && messages[visibleCount]?.from === "bot" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-end">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Eye className="h-3 w-3 text-primary" />
                    </div>
                    <div className="bg-muted/60 border border-border rounded-2xl rounded-bl-md px-4 py-2.5 flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
              {/* Input */}
              <div className="px-4 py-2.5 border-t border-border flex items-center gap-3 bg-muted/20 shrink-0">
                <div className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </div>
                <div className="flex-1 rounded-full bg-background border border-border px-4 py-1.5">
                  <p className="text-[10px] text-muted-foreground">Digite ou use o microfone...</p>
                </div>
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center cursor-pointer">
                  <ArrowRight className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </div>
            </MScaleItem>

            {/* Como funciona */}
            <MScaleItem className="col-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 h-full justify-center">
              <h3 className="text-base font-semibold text-foreground">Como funciona</h3>
              <ul className="space-y-3">
                {[
                  "Interação por texto ou voz com IA",
                  "Perguntas dinâmicas baseadas nas respostas",
                  "Explicações em áudio geradas por ElevenLabs",
                  "Coleta automática de dados clínicos",
                  "Score de saúde ocular personalizado",
                  "Recomendação do produto ideal ao final",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs">{t}</span>
                  </li>
                ))}
              </ul>
            </MScaleItem>
          </div>
        </MStagger>
      );
    },
  },

  /* ── 12. FLUXO DE DADOS ── */
  {
    id: "fluxo-dados",
    title: "Fluxo de Dados",
    content: () => {
      const steps = [
        { icon: Stethoscope, label: "Diagnóstico Visual", desc: "Coleta de informações." },
        { icon: Database, label: "Coleta de Informações", desc: "Dados estruturados." },
        { icon: ShoppingCart, label: "Compra do Produto", desc: "Checkout integrado." },
        { icon: UserCheck, label: "Perfil do Cliente", desc: "Criação automática." },
      ];
      return (
        <MStagger className="flex flex-col h-full px-16 py-10 gap-6">
          <SlideHeader icon={Database} title="Fluxo de Dados do Paciente" />
          <MItem>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              As informações coletadas durante o diagnóstico ajudam a <strong className="text-foreground">popular o perfil do cliente</strong>. Após a compra, o usuário pode acessar a Plataforma Vision Lift e completar o onboarding.
            </p>
          </MItem>
          <MScaleItem className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-4">
              {steps.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center text-center gap-3 w-[160px]">
                    <div className="h-[72px] w-[72px] rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">{step.label}</h4>
                    {step.desc && <p className="text-xs text-muted-foreground leading-snug">{step.desc}</p>}
                  </div>
                  {i < steps.length - 1 && <FlowArrow />}
                </React.Fragment>
              ))}
            </div>
          </MScaleItem>
          <MItem>
            <div className="rounded-2xl border border-primary/15 bg-primary/5 px-8 py-4 text-center max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dados do diagnóstico e da compra são conectados, criando um <strong className="text-foreground">perfil rico</strong> que melhora a experiência na plataforma.
              </p>
            </div>
          </MItem>
        </MStagger>
      );
    },
  },

  /* ── FLUXO DE DADOS DO PROFISSIONAL ── */
  {
    id: "fluxo-dados-profissional",
    title: "Fluxo de Dados do Profissional",
    content: () => {
      const steps = [
        { icon: Globe, label: "Landing Profissionais", desc: "Acesso à página exclusiva." },
        { icon: FileText, label: "Cadastro Dinâmico", desc: "Coleta intuitiva estilo Ver.ai." },
        { icon: BadgeCheck, label: "Validação", desc: "Aprovação do profissional." },
        { icon: Layers, label: "Acesso à Plataforma", desc: "Gestão de indicações." },
      ];
      return (
        <MStagger className="flex flex-col h-full px-16 py-10 gap-6">
          <SlideHeader icon={Stethoscope} title="Fluxo de Dados do Profissional de Saúde" />
          <MItem>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              O cadastro do profissional segue um <strong className="text-foreground">modelo dinâmico e intuitivo</strong>, similar à experiência da Ver.ai — coletando informações de forma conversacional e progressiva.
            </p>
          </MItem>
          <MScaleItem className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-4">
              {steps.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center text-center gap-3 w-[160px]">
                    <div className="h-[72px] w-[72px] rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">{step.label}</h4>
                    {step.desc && <p className="text-xs text-muted-foreground leading-snug">{step.desc}</p>}
                  </div>
                  {i < steps.length - 1 && <FlowArrow />}
                </React.Fragment>
              ))}
            </div>
          </MScaleItem>
          <MItem>
            <div className="rounded-2xl border border-primary/15 bg-primary/5 px-8 py-4 text-center max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Os dados coletados criam o <strong className="text-foreground">perfil do profissional</strong> dentro do ecossistema, permitindo gestão de indicações e acompanhamento de pacientes.
              </p>
            </div>
          </MItem>
        </MStagger>
      );
    },
  },

  {
    id: "gestao-vendas",
    title: "Gestão de Vendas",
    content: () => (
      <MStagger className="flex flex-col h-full px-16 py-10 gap-6">
        <SlideHeader icon={BarChart3} title="Gestão de Vendas" />
        <MItem>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
            Todos os dados de compra, informações de clientes e gestão de pedidos serão gerenciados <strong className="text-foreground">dentro do sistema de ecommerce</strong> e complementados pelo <strong className="text-foreground">gateway de pagamento</strong> (B4You ou Pagar.me).
          </p>
        </MItem>
        <div className="grid grid-cols-2 gap-6 mt-2">
          {[
            { name: "Shopify", desc: "Painel completo de gestão com apps, relatórios e automações." },
            { name: "WooCommerce", desc: "Dashboard WordPress com controle total e extensibilidade." },
          ].map((p) => (
            <MScaleItem key={p.name} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3">
              <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </MScaleItem>
          ))}
        </div>
        <MItem>
          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-6 py-4 max-w-3xl">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Importante:</strong> A gestão financeira detalhada (recorrências, split, chargebacks) pode e deve ser acompanhada diretamente pelo painel do <strong className="text-foreground">B4You</strong> ou <strong className="text-foreground">Pagar.me</strong>, que oferecem visão completa das transações.
            </p>
          </div>
        </MItem>
        <MItem className="mt-2">
          <p className="text-sm text-muted-foreground mb-3">O ecommerce centraliza:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Package, label: "Gestão de pedidos" },
              { icon: Users, label: "Dados dos compradores" },
              { icon: BarChart3, label: "Histórico de vendas" },
              { icon: FileText, label: "Relatórios comerciais" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-3">
                <f.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </MItem>
      </MStagger>
    ),
  },

  /* ── ESTRATÉGIA DE CONTEÚDO ── */
  {
    id: "estrategia-conteudo",
    title: "Estratégia de Conteúdo",
    content: () => (
      <MStagger className="flex flex-col h-full px-14 py-8 gap-5">
        <MItem className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/70 mb-2">Marketing de Conteúdo</p>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Blog & Estratégia de Conteúdo</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto leading-relaxed">
            O blog é o <strong className="text-foreground">principal motor de aquisição orgânica</strong> — cada artigo educa, gera autoridade e direciona o leitor para o diagnóstico visual.
          </p>
        </MItem>

        <div className="grid grid-cols-3 gap-4 flex-1 items-start">
          {/* Coluna 1: Por que ter um blog */}
          <MScaleItem className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col gap-4 h-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Newspaper className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">Por que ter um Blog?</h3>
            </div>
            <ul className="space-y-2.5">
              {[
                "Posiciona a marca como autoridade em saúde ocular",
                "Gera tráfego orgânico qualificado via SEO",
                "Reduz custo de aquisição de clientes (CAC)",
                "Funciona como ponto de entrada para o diagnóstico",
                "Aumenta o tempo de permanência e confiança no site",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </MScaleItem>

          {/* Coluna 2: Benefícios por público */}
          <MScaleItem className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 h-full">
            <h3 className="text-base font-bold text-foreground">Benefícios por Público</h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Para o Paciente</span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Aprende sobre cuidados preventivos da visão",
                    "Entende sintomas e quando buscar ajuda",
                    "Recebe recomendações baseadas em evidência",
                  ].map((t) => (
                    <li key={t} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Para o Profissional</span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Conteúdo científico para compartilhar com pacientes",
                    "Fortalece a relação de confiança profissional",
                    "Gera indicações qualificadas para o consultório",
                  ].map((t) => (
                    <li key={t} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </MScaleItem>

          {/* Coluna 3: Estratégias de marketing */}
          <MScaleItem className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 h-full">
            <h3 className="text-base font-bold text-foreground">Estratégias de Marketing</h3>
            <div className="space-y-3">
              {[
                { icon: Search, title: "SEO & Palavras-chave", desc: "Artigos otimizados para ranquear no Google em buscas como 'cansaço nos olhos' e 'suplemento para visão'." },
                { icon: Mail, title: "E-mail Nurturing", desc: "Sequências automáticas que enviam conteúdo relevante e conduzem ao diagnóstico." },
                { icon: Globe, title: "Redes Sociais", desc: "Reaproveitamento dos artigos em carrosséis, reels e posts educativos para Instagram e LinkedIn." },
                { icon: Target, title: "Remarketing", desc: "Quem leu um artigo recebe anúncios direcionados para iniciar o diagnóstico visual." },
              ].map((s) => (
                <div key={s.title} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{s.title}</h4>
                    <p className="text-[10px] text-muted-foreground leading-snug">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </MScaleItem>
        </div>

        <MItem>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            {[
              { icon: Eye, label: "Fadiga Ocular" },
              { icon: Brain, label: "Envelhecimento da Visão" },
              { icon: Shield, label: "Proteção da Retina" },
              { icon: Heart, label: "Nutrição Ocular" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2 rounded-full bg-muted/40 px-4 py-1.5">
                <t.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-medium text-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </MItem>
      </MStagger>
    ),
  },


  {
    id: "planos-implementacao",
    title: "Planos de Implementação",
    content: () => {
      const plans = [
        {
          name: "Essencial",
          price: "R$ 3.500",
          highlight: false,
          items: [
            "Landing Page do paciente (educação + produto)",
            "Landing Page do profissional de saúde",
            "Página de planos e vendas",
            "Checkout integrado (Shopify ou WooCommerce)",
            "Integração com gateway de pagamento",
            "Integração com Melhor Envio (frete)",
            "SEO básico e Analytics",
          ],
        },
        {
          name: "Profissional",
          price: "R$ 4.800",
          highlight: false,
          items: [
            "Tudo do Essencial +",
            "Diagnóstico visual baseado em perguntas fixas",
            "Página de resultado personalizado",
            "Página de recomendação do produto ideal",
            "Estratégia de conteúdo para aquisição orgânica",
          ],
        },
        {
          name: "Avançado",
          price: "R$ 5.900",
          highlight: true,
          items: [
            "Tudo do Profissional +",
            "Agente de IA com voz (OpenAI + ElevenLabs)",
            "Resultado dinâmico com score de saúde ocular",
            "Blog estruturado com SEO avançado",
            "Cadastro e painel exclusivo para médicos",
            "Integração completa com a Vision Lift Platform",
            "Fluxo de dados unificado entre site e plataforma",
          ],
        },
      ];
      return (
        <MStagger className="flex flex-col h-full px-12 py-8 gap-5">
          <MItem className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/70 mb-2">Investimento</p>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Planos de Implementação do Site</h2>
          </MItem>
          <div className="grid grid-cols-3 gap-5 flex-1 items-stretch mt-1">
            {plans.map((p) => (
              <MScaleItem key={p.name} className={`rounded-2xl border p-5 flex flex-col gap-4 ${p.highlight ? "border-primary bg-primary/5 shadow-lg relative" : "border-border bg-card"}`}>
                {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-primary-foreground bg-primary px-3 py-1 rounded-full">Recomendado</span>}
                <h3 className={`text-xl font-bold ${p.highlight ? "text-primary" : "text-foreground"}`}>Plano {p.name}</h3>
                <p className="text-3xl font-bold text-foreground">{p.price}</p>
                <div className="border-t border-border pt-3 flex-1">
                  <ul className="space-y-2">
                    {p.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </MScaleItem>
            ))}
          </div>
        </MStagger>
      );
    },
  },

  /* ── CUSTOS, SUPORTE E MANUTENÇÃO ── */
  {
    id: "custos-manutencao",
    title: "Custos e Manutenção",
    content: () => (
      <MStagger className="flex flex-col h-full px-12 py-8 gap-5">
        <MItem className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70 mb-2">Pós-lançamento</p>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Custos Operacionais e Manutenção</h2>
          <p className="text-base text-muted-foreground mt-2 max-w-2xl mx-auto leading-relaxed">
            Serviços terceiros com custos variáveis e plano de manutenção para gestão técnica e estabilidade.
          </p>
        </MItem>
        <div className="grid grid-cols-12 gap-5 flex-1 items-stretch">
          {/* Custos + Notas */}
          <div className="col-span-7 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShoppingCart, label: "Ecommerce (Shopify)", value: "R$ 150/mês" },
                { icon: Brain, label: "IA (OpenAI)", value: "Custo inicial zero*" },
                { icon: MessageSquare, label: "Voz (ElevenLabs)", value: "R$ 100 – R$ 400/mês" },
                { icon: Database, label: "Infraestrutura", value: "R$ 50 – R$ 200/mês" },
              ].map((c) => (
                <MScaleItem key={c.label} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <c.icon className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-bold text-foreground">{c.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{c.value}</p>
                </MScaleItem>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 space-y-2.5 flex-1">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Autogestão:</strong> Vocês podem gerenciar a infraestrutura por conta própria, eliminando o custo de manutenção — porém sem suporte técnico.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Suporte ≠ Alterações:</strong> O plano cobre estabilidade, quedas e monitoramento. Modificações e novas funcionalidades são cobradas por hora.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">*OpenAI:</strong> Custo inicial zero — compartilha o plano da Plataforma Vision Lift. Pode escalar com volume de uso.
              </p>
            </div>
          </div>
          {/* Plano de Manutenção */}
          <div className="col-span-5">
            <MScaleItem className="rounded-2xl border border-primary/20 bg-primary/5 p-7 flex flex-col gap-4 h-full justify-center">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Plano de Manutenção</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Monitoramento e estabilidade (quedas, erros, integrações)",
                  "Gestão da infraestrutura + ecommerce",
                  "Atualizações de segurança e performance",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="text-3xl font-bold text-foreground mt-2">R$ 297<span className="text-base font-normal text-muted-foreground"> / mês</span></p>
              <p className="text-xs text-muted-foreground leading-snug">
                Valor válido se a gestão da infra e do ecommerce ficar conosco. Considera o plano Shopify de R$ 150/mês.
              </p>
            </MScaleItem>
          </div>
        </div>
      </MStagger>
    ),
  },

  /* ── CRONOGRAMA DE IMPLEMENTAÇÃO ── */
  {
    id: "cronograma",
    title: "Cronograma de Implementação",
    content: () => {
      const phases = [
        {
          week: "Semana 1",
          title: "Planejamento & Setup",
          color: "hsl(210 100% 50% / 0.15)",
          borderColor: "hsl(210 100% 50% / 0.4)",
          items: [
            "Definição de escopo e conteúdo",
            "Setup do ecommerce (Shopify/WooCommerce)",
            "Configuração de domínio e infraestrutura",
            "Wireframe e aprovação da estrutura",
          ],
        },
        {
          week: "Semana 2",
          title: "Design & Desenvolvimento",
          color: "hsl(210 100% 50% / 0.12)",
          borderColor: "hsl(210 100% 50% / 0.35)",
          items: [
            "Design das landing pages (paciente + profissional)",
            "Desenvolvimento front-end do site",
            "Integração com gateway de pagamento",
            "Integração com Melhor Envio",
          ],
        },
        {
          week: "Semana 3",
          title: "Funcionalidades & Conteúdo",
          color: "hsl(210 100% 50% / 0.09)",
          borderColor: "hsl(210 100% 50% / 0.3)",
          items: [
            "Diagnóstico visual interativo (se aplicável)",
            "Blog e estratégia de conteúdo",
            "Cadastro de produtos e planos",
            "Analytics, SEO e Meta Pixel",
          ],
        },
        {
          week: "Semana 4",
          title: "Testes & Lançamento",
          color: "hsl(210 100% 50% / 0.06)",
          borderColor: "hsl(210 100% 50% / 0.25)",
          items: [
            "Testes de checkout e pagamento",
            "Testes de responsividade e performance",
            "Ajustes finais e QA",
            "Go-live e monitoramento inicial",
          ],
        },
      ];
      return (
        <MStagger className="flex flex-col h-full px-12 py-8 gap-4">
          <MItem className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/70 mb-2">Timeline</p>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Implementação em 30 dias</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
              O projeto é dividido em <strong className="text-foreground">4 fases semanais</strong>, com entregas incrementais e validações ao longo do processo.
            </p>
          </MItem>
          <div className="grid grid-cols-4 gap-4 flex-1 items-stretch mt-1">
            {phases.map((phase, i) => (
              <MScaleItem key={phase.week}>
                <div className="rounded-2xl border p-5 flex flex-col gap-3 h-full" style={{ background: phase.color, borderColor: phase.borderColor }}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{phase.week}</span>
                </div>
                <h3 className="text-base font-bold text-foreground">{phase.title}</h3>
                <ul className="space-y-2 flex-1">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {i === 3 && (
                  <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-center">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">🚀 Go-live</span>
                  </div>
                )}
                </div>
              </MScaleItem>
            ))}
          </div>
          <MItem className="text-center">
            <p className="text-xs text-muted-foreground">
              O cronograma pode variar conforme o plano escolhido e a velocidade de aprovação dos materiais.
            </p>
          </MItem>
        </MStagger>
      );
    },
  },

  /* ── STACK TÉCNICA ── */
  {
    id: "stack-tecnica",
    title: "Stack Técnica",
    content: () => {
      const layers = [
        {
          title: "Front-end",
          icon: Monitor,
          color: "bg-blue-500/10 border-blue-500/20 text-blue-600",
          items: [
            { label: "React 18 + TypeScript", desc: "SPA com tipagem estática" },
            { label: "Vite", desc: "Build ultrarrápido, HMR" },
            { label: "Tailwind CSS", desc: "Design system utilitário" },
            { label: "Framer Motion", desc: "Animações fluidas" },
          ],
        },
        {
          title: "Back-end & BD",
          icon: Database,
          color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
          items: [
            { label: "Supabase (PostgreSQL)", desc: "Banco relacional gerenciado" },
            { label: "Edge Functions (Deno)", desc: "Serverless na borda" },
            { label: "Row-Level Security", desc: "Políticas de acesso por linha" },
            { label: "Auth nativo", desc: "JWT, OAuth, MFA" },
          ],
        },
        {
          title: "Integrações & APIs",
          icon: ExternalLink,
          color: "bg-amber-500/10 border-amber-500/20 text-amber-600",
          items: [
            { label: "B4You / Pagar.me", desc: "Checkout e assinaturas" },
            { label: "Melhor Envio", desc: "Frete, rastreio, logística" },
            { label: "ElevenLabs", desc: "Voz IA no diagnóstico" },
            { label: "Webhooks bidirecionais", desc: "Eventos em tempo real" },
          ],
        },
        {
          title: "Infra & Segurança",
          icon: ShieldCheck,
          color: "bg-purple-500/10 border-purple-500/20 text-purple-600",
          items: [
            { label: "Deploy contínuo", desc: "CI/CD automático" },
            { label: "CDN global", desc: "Assets otimizados na borda" },
            { label: "HTTPS + LGPD", desc: "Criptografia e compliance" },
            { label: "Monitoramento", desc: "Logs, alertas, uptime" },
          ],
        },
      ];

      return (
        <MStagger className="flex flex-col h-full gap-5">
          <SlideHeader icon={Layers} title="Stack Técnica" />
          <MItem>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Arquitetura moderna, escalável e segura — com tecnologias de mercado comprovadas e integrações prontas para operação.
            </p>
          </MItem>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {layers.map((layer) => (
              <MScaleItem key={layer.title}>
                <div className={`rounded-2xl border p-5 h-full ${layer.color}`}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <layer.icon className="h-5 w-5" />
                    <h3 className="text-sm font-bold text-foreground">{layer.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {layer.items.map((item) => (
                      <div key={item.label} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-foreground">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">— {item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </MScaleItem>
            ))}
          </div>
          <MItem>
            <div className="rounded-xl border bg-muted/30 px-4 py-2.5 flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                <strong className="text-foreground">API Gateway unificado</strong> — todos os serviços conectados via REST com autenticação JWT + API Key, rate limiting e logs de auditoria.
              </p>
            </div>
          </MItem>
        </MStagger>
      );
    },
  },

  {
    id: "mensagem-final",
    title: "Mensagem Final",
    content: () => (
      <MStagger className="flex flex-col items-center justify-center h-full gap-8 text-center px-16">
        <MPopItem><img src={logoVisionLift} alt="Vision Lift" className="h-14 w-auto" /></MPopItem>
        <MItem>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight max-w-3xl">
            Construindo a Nova Experiência Digital<br />
            <span className="text-primary">Vision Lift</span>
          </h2>
        </MItem>
        <MItem>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Este projeto cria uma estrutura digital moderna capaz de <strong className="text-foreground">educar usuários</strong>, <strong className="text-foreground">recomendar o produto</strong> e <strong className="text-foreground">sustentar o crescimento comercial</strong> da Vision Lift.
          </p>
        </MItem>
        <MScaleItem className="rounded-2xl border border-primary/20 bg-primary/5 px-10 py-6 max-w-3xl">
          <p className="text-base text-muted-foreground leading-relaxed">
            Um site que <strong className="text-foreground">educa</strong>, <strong className="text-foreground">diagnostica</strong> e <strong className="text-foreground">converte</strong> — conectando o usuário à experiência Vision Lift.
          </p>
        </MScaleItem>
        <MItem className="flex flex-col items-center gap-2 mt-4">
          <p className="text-sm text-muted-foreground">Estamos à disposição para esclarecimentos.</p>
          <p className="text-sm font-semibold text-foreground">easymore.com.br</p>
        </MItem>
      </MStagger>
    ),
  },
];

/* ─── presentation shell ─── */
const WebsiteProposal: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [generating, setGenerating] = useState(false);
  const total = slides.length;

  const goNext = useCallback(() => setCurrent((c) => Math.min(c + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  const handleDownloadPDF = useCallback(async () => {
    if (generating) return;
    setGenerating(true);

    try {
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = 297;
      const pdfHeight = 210;
      const captureWidth = 1280;
      const captureHeight = 720;

      const slideRatio = captureWidth / captureHeight;
      let renderWidth = pdfWidth;
      let renderHeight = renderWidth / slideRatio;
      if (renderHeight > pdfHeight) { renderHeight = pdfHeight; renderWidth = renderHeight * slideRatio; }
      const offsetX = (pdfWidth - renderWidth) / 2;
      const offsetY = (pdfHeight - renderHeight) / 2;

      const bgRaw = getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
      const bgColor = bgRaw ? `hsl(${bgRaw})` : "#ffffff";

      const { createRoot } = await import("react-dom/client");
      const { flushSync } = await import("react-dom");

      if (document.fonts?.ready) await document.fonts.ready;

      for (let i = 0; i < slides.length; i++) {
        const SlideComp = slides[i].content;

        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-pdf-capture", "true");
        wrapper.style.cssText = `width:${captureWidth}px;height:${captureHeight}px;position:fixed;top:0;left:-100000px;background:${bgColor};overflow:hidden;pointer-events:none;`;

        const rootStyles = getComputedStyle(document.documentElement);
        ["--background","--foreground","--primary","--secondary","--muted","--muted-foreground","--accent","--border","--card","--card-foreground","--primary-foreground","--secondary-foreground","--accent-foreground","--destructive","--destructive-foreground","--ring","--input","--popover","--popover-foreground"].forEach((token) => {
          const value = rootStyles.getPropertyValue(token);
          if (value) wrapper.style.setProperty(token, value);
        });

        const forceStyle = document.createElement("style");
        forceStyle.textContent = `[data-pdf-capture="true"] *,[data-pdf-capture="true"] *::before,[data-pdf-capture="true"] *::after{animation:none!important;transition:none!important;}[data-pdf-capture="true"] [style*="opacity: 0"]{opacity:1!important;}`;
        wrapper.appendChild(forceStyle);
        document.body.appendChild(wrapper);

        const root = createRoot(wrapper);

        try {
          flushSync(() => {
            root.render(
              <StaticSlideWrapper>
                <div style={{ width: `${captureWidth}px`, height: `${captureHeight}px`, display: "flex", flexDirection: "column" }}>
                  <SlideComp />
                </div>
              </StaticSlideWrapper>
            );
          });

          const images = wrapper.querySelectorAll("img");
          await Promise.all(Array.from(images).map(async (img) => {
            if (!img.complete) await new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r(); });
            try { await img.decode(); } catch {}
          }));

          await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

          const canvas = await html2canvas(wrapper, {
            scale: 2, useCORS: true, logging: false,
            width: captureWidth, height: captureHeight,
            windowWidth: captureWidth, windowHeight: captureHeight,
            backgroundColor: bgColor,
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "JPEG", offsetX, offsetY, renderWidth, renderHeight);
        } finally {
          root.unmount();
          document.body.removeChild(wrapper);
        }
      }

      pdf.save("Proposta-Site-Vision-Lift.pdf");
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setGenerating(false);
    }
  }, [generating]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const Slide = slides[current].content;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-background/80 backdrop-blur-md shrink-0">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Home className="h-4 w-4" /> Voltar
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{current + 1} / {total}</span>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={generating} className="gap-2 text-xs">
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {generating ? "Gerando PDF…" : "Baixar PDF"}
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">Use ← → para navegar</span>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col"
          >
            <Slide />
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="flex items-center justify-between px-6 h-16 border-t border-border bg-background/80 backdrop-blur-md shrink-0">
        <Button variant="ghost" size="sm" onClick={goPrev} disabled={current === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"}`} />
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={goNext} disabled={current === total - 1}>
          Próximo <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </footer>
    </div>
  );
};

export default WebsiteProposal;
