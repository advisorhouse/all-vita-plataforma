import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import {
  Stethoscope, BarChart3, Handshake, ArrowRight, ChevronLeft, Check,
  Eye, EyeOff, Repeat, Heart, Monitor, Lock, Shield, Coins, Users,
  Link2, Gift, GraduationCap, Ticket, Wrench, CreditCard, Clock, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import iconVisionLift from "@/assets/icon-vision-lift.png";
import partnerHeroImg from "@/assets/partner-onboarding-hero.png";

// ─── Types ───────────────────────────────────────────────────
interface DoctorFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  crm: string;
  crmState: string;
  specialty: string;
  clinicName: string;
  clinicCity: string;
  clinicState: string;
  cpfCnpj: string;
  pixKey: string;
  paymentName: string;
}

const defaultData: DoctorFormData = {
  fullName: "", email: "", phone: "", password: "",
  crm: "", crmState: "", specialty: "", clinicName: "", clinicCity: "", clinicState: "",
  cpfCnpj: "", pixKey: "", paymentName: "",
};

type Screen = "welcome" | "brand" | "points" | "s1" | "s2" | "s3" | "s4" | "done";

const STEP_ORDER: Screen[] = ["welcome", "brand", "points", "s1", "s2", "s3", "s4", "done"];
const FORM_STEPS: Screen[] = ["s1", "s2", "s3", "s4"];

const STATES = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT",
  "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

const SPECIALTIES = [
  "Oftalmologia", "Clínica Geral", "Geriatria", "Neurologia",
  "Endocrinologia", "Nutrologia", "Medicina do Esporte", "Outra",
];

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

// ─── Component ───────────────────────────────────────────────
const PartnerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantParam = searchParams.get("tenant");
  const { currentTenant } = useTenant();
  const [screen, setScreen] = useState<Screen>("welcome");
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<DoctorFormData>(defaultData);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentIndex = STEP_ORDER.indexOf(screen);
  const formStepIndex = FORM_STEPS.indexOf(screen) + 1;
  const showProgress = FORM_STEPS.includes(screen);

  const goTo = (next: Screen) => {
    const ni = STEP_ORDER.indexOf(next);
    setDirection(ni > currentIndex ? 1 : -1);
    setScreen(next);
  };

  const goBack = () => {
    if (currentIndex > 0) goTo(STEP_ORDER[currentIndex - 1]);
  };

  const goNext = () => {
    if (currentIndex < STEP_ORDER.length - 1) goTo(STEP_ORDER[currentIndex + 1]);
  };

  const handleFinishSignup = async () => {
    if (!currentTenant) {
      toast.error("Tenant não identificado.");
      return;
    }
    setLoading(true);
    try {
      const nameParts = data.fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: data.fullName, first_name: firstName, last_name: lastName },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }

      if (!signUpData.session) {
        toast.info("Verifique seu email para confirmar a conta.");
      }

      if (signUpData.session) {
        const { error: fnError } = await supabase.functions.invoke("tenant-signup", {
          body: {
            tenant_id: currentTenant.id,
            role: "partner",
            metadata: {
              crm: data.crm,
              crm_state: data.crmState,
              specialty: data.specialty,
              clinic_name: data.clinicName,
              clinic_city: data.clinicCity,
              clinic_state: data.clinicState,
              cpf_cnpj: data.cpfCnpj,
              pix_key: data.pixKey,
              payment_name: data.paymentName,
              phone: data.phone,
              source: "partner_onboarding",
            },
          },
        });

        if (fnError) {
          console.error("tenant-signup error:", fnError);
          toast.error("Erro ao configurar acesso.");
          setLoading(false);
          return;
        }
      }

      goTo("done");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const update = (partial: Partial<DoctorFormData>) => setData((d) => ({ ...d, ...partial }));

  // ─── Shared sub-components ─────────────────────────────────
  const SecurityFooter = () => (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <Lock className="h-3 w-3 text-muted-foreground/40" />
      <span className="text-[10px] text-muted-foreground/40">
        Seus dados são protegidos pela LGPD.{" "}
        <button className="underline hover:text-muted-foreground transition-colors">Política de privacidade</button>
      </span>
    </div>
  );

  const ContinueButton: React.FC<{ onClick: () => void; label?: string; disabled?: boolean }> = ({
    onClick, label = "Continuar", disabled = false,
  }) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-13 bg-foreground hover:bg-foreground/90 text-background rounded-xl text-[15px] font-medium disabled:opacity-30"
    >
      {label}
      <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
  );

  const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
      {children}
    </label>
  );

  const inputClass = "h-13 rounded-xl border-border bg-secondary/30 text-[15px] placeholder:text-muted-foreground/30 focus:border-muted-foreground/40 focus:ring-0";

  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={goBack}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 flex items-center gap-1.5">
              {FORM_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i + 1 <= formStepIndex ? "bg-accent" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
              {formStepIndex}/{FORM_STEPS.length}
            </span>
          </div>
        </div>
      )}

      {/* Back button for non-form screens */}
      {!showProgress && screen !== "welcome" && screen !== "done" && (
        <div className="fixed top-0 left-0 z-50 p-4">
          <button
            onClick={goBack}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={screen}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-lg"
          >
            {/* ═══ WELCOME ═══ */}
            {screen === "welcome" && (
              <div className="text-center space-y-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <div className="inline-flex items-center gap-2.5">
                    <img src={iconVisionLift} alt="Vision Lift" className="h-7 w-7" />
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                      Vision Lift Partners
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="space-y-3"
                >
                  <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-foreground">
                    Cadastro de
                    <br />
                    Profissional Parceiro.
                  </h1>
                  <p className="text-muted-foreground text-base font-light">
                    Vincule seus pacientes e acumule VisionPoints Coin a cada jornada acompanhada.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex justify-center gap-8 sm:gap-10"
                >
                  {[
                    { icon: Link2, label: "Vínculo automático via quiz pré-consulta." },
                    { icon: Coins, label: "Pontos por vendas, quizzes e indicações." },
                    { icon: Gift, label: "Resgate: Pix, produtos, cursos e mais." },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-3 max-w-[100px]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium leading-snug text-center">
                        {label}
                      </span>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="space-y-2 pt-2"
                >
                  <ContinueButton onClick={() => goTo("brand")} label="Iniciar cadastro" />
                  <p className="text-[11px] text-muted-foreground/40 pt-1">Leva menos de 5 minutos.</p>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/partner")}
                    className="w-full h-10 text-muted-foreground text-sm font-normal rounded-xl"
                  >
                    Já tenho cadastro
                  </Button>
                </motion.div>

                <SecurityFooter />
              </div>
            )}

            {/* ═══ BRAND STORY — Sistema de Vínculo ═══ */}
            {screen === "brand" && (
              <div className="text-center space-y-8 py-8">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative rounded-2xl overflow-hidden aspect-[16/9]"
                >
                  <img src={partnerHeroImg} alt="Vision Lift Partner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                </motion.div>

                <div className="space-y-3">
                  <h2 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
                    Sistema de Vínculo Médico–Paciente
                  </h2>
                  <p className="text-muted-foreground text-[15px] font-light">
                    O coração do Vision Lift Partners.
                  </p>
                </div>

                {/* Fluxo de vínculo */}
                <div className="space-y-3 text-left">
                  <p className="text-[13px] font-semibold text-foreground px-1">Fluxo do vínculo:</p>
                  {[
                    { icon: Link2, title: "Envie o quiz", body: "Compartilhe seu link exclusivo do quiz pré-consulta com seus pacientes — na clínica, por WhatsApp ou QR Code." },
                    { icon: Stethoscope, title: "Paciente preenche", body: "O paciente responde um questionário de saúde digital antes da consulta. Dados protegidos pela LGPD." },
                    { icon: Shield, title: "Autorização LGPD", body: "O paciente autoriza o uso dos dados e o vínculo médico–paciente é criado automaticamente no sistema." },
                    { icon: Coins, title: "Pontos automáticos", body: "Toda compra futura desse paciente na plataforma gera VisionPoints Coin para você — de forma automática e recorrente." },
                  ].map(({ icon: Icon, title, body }) => (
                    <div key={title} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{title}</p>
                        <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Regra de atribuição */}
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-accent" />
                    <p className="text-[13px] font-semibold text-foreground">Modelo Último Click</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Se um paciente preencher um novo quiz de outro médico, o vínculo anterior é desativado e o <strong className="text-foreground">novo médico se torna o ativo</strong>. Isso garante que o profissional mais recente e relevante na jornada do paciente receba os pontos.
                  </p>
                </div>

                <ContinueButton onClick={() => goTo("points")} />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ POINTS — VisionPoints Coin ═══ */}
            {screen === "points" && (
              <div className="text-center space-y-8 py-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                    <Coins className="h-4 w-4 text-accent" />
                    <span className="text-[12px] font-semibold text-accent">Moeda interna</span>
                  </div>
                  <h2 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
                    VisionPoints Coin
                  </h2>
                  <p className="text-muted-foreground text-[15px] font-light">
                    Sua moeda dentro da plataforma. Acumule e resgate como preferir.
                  </p>
                </div>

                {/* Como ganhar pontos */}
                <div className="text-left space-y-3">
                  <p className="text-[13px] font-semibold text-foreground px-1">Como ganhar pontos:</p>
                  {[
                    { icon: CreditCard, label: "Venda concluída", desc: "Paciente vinculado faz uma compra na plataforma" },
                    { icon: Stethoscope, label: "Quiz preenchido", desc: "Cada novo paciente que preencher seu quiz" },
                    { icon: Handshake, label: "Indicação de médico", desc: "Indique colegas — toda compra dos pacientes deles também gera pontos para você" },
                    { icon: Users, label: "Rede de indicados", desc: "Quando pacientes de médicos que você indicou compram, você recebe uma parcela dos pontos automaticamente" },
                    { icon: Repeat, label: "Campanhas especiais", desc: "Multiplicadores em ações sazonais" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-center gap-4 p-3.5 rounded-xl border border-border bg-card">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <Icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground">{desc}</p>
                      </div>
                      <span className="text-[11px] text-accent font-semibold whitespace-nowrap">+ pontos</span>
                    </div>
                  ))}
                </div>

                {/* Wallet médico */}
                <div className="text-left space-y-3">
                  <p className="text-[13px] font-semibold text-foreground px-1">Sua Wallet Médica:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Clock, label: "Pendentes", desc: "Carência 30 dias" },
                      { icon: Check, label: "Liberados", desc: "Prontos para resgate" },
                      { icon: AlertTriangle, label: "Expiram", desc: "Validade de 2 anos" },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="p-3 rounded-xl border border-border bg-card text-center">
                        <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-[12px] font-medium text-foreground">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opções de resgate */}
                <div className="text-left space-y-3">
                  <p className="text-[13px] font-semibold text-foreground px-1">Opções de resgate:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: CreditCard, label: "Pix" },
                      { icon: Gift, label: "Produtos" },
                      { icon: GraduationCap, label: "Cursos" },
                      { icon: Ticket, label: "Congressos" },
                      { icon: Wrench, label: "Equipamentos" },
                      { icon: Monitor, label: "Mais em breve" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card">
                        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exemplo prático */}
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-left space-y-3">
                  <p className="text-[13px] font-semibold text-foreground">💡 Exemplo prático</p>
                  <div className="space-y-2 text-[12px] text-muted-foreground leading-relaxed">
                    <p>Paciente adquire plano de 5 meses por R$ 528:</p>
                    <div className="flex items-center gap-3 pl-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      <span>Você recebe <strong className="text-foreground">528 VisionPoints</strong></span>
                    </div>
                    <div className="flex items-center gap-3 pl-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      <span>Pontos ficam pendentes por <strong className="text-foreground">30 dias</strong></span>
                    </div>
                    <div className="flex items-center gap-3 pl-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      <span>Após carência → pontos <strong className="text-foreground">liberados para resgate</strong></span>
                    </div>
                    <div className="flex items-center gap-3 pl-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      <span>Renovações geram <strong className="text-foreground">pontos recorrentes</strong></span>
                    </div>
                  </div>
                </div>

                <ContinueButton onClick={() => goTo("s1")} />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 1 — Dados Pessoais ═══ */}
            {screen === "s1" && (
              <div className="space-y-8 pt-14">
                <div className="space-y-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    Seus dados pessoais.
                  </h2>
                  <p className="text-muted-foreground text-sm font-light">
                    Usaremos para criar sua conta na plataforma.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <FieldLabel>Nome completo</FieldLabel>
                    <Input
                      value={data.fullName}
                      onChange={(e) => update({ fullName: e.target.value })}
                      placeholder="Dr(a). Nome Completo"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>E-mail</FieldLabel>
                    <Input
                      type="email"
                      value={data.email}
                      onChange={(e) => update({ email: e.target.value })}
                      placeholder="Seu melhor e-mail"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Telefone (WhatsApp)</FieldLabel>
                    <Input
                      value={data.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Senha</FieldLabel>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={data.password}
                        onChange={(e) => update({ password: e.target.value })}
                        placeholder="Crie uma senha segura"
                        className={inputClass + " pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground pl-1">Mínimo 8 caracteres.</p>
                  </div>
                </div>

                <ContinueButton
                  onClick={goNext}
                  disabled={!data.fullName || !data.email || !data.password}
                />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 2 — Dados Profissionais ═══ */}
            {screen === "s2" && (
              <div className="space-y-8 pt-14">
                <div className="space-y-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    Dados profissionais.
                  </h2>
                  <p className="text-muted-foreground text-sm font-light">
                    Para validar seu registro e vincular sua clínica.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <FieldLabel>Número do CRM</FieldLabel>
                      <Input
                        value={data.crm}
                        onChange={(e) => update({ crm: e.target.value })}
                        placeholder="000000"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel>UF</FieldLabel>
                      <select
                        value={data.crmState}
                        onChange={(e) => update({ crmState: e.target.value })}
                        className={cn(inputClass, "w-full appearance-none cursor-pointer")}
                      >
                        <option value="">UF</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>Especialidade</FieldLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {SPECIALTIES.map((spec) => (
                        <button
                          key={spec}
                          onClick={() => update({ specialty: spec })}
                          className={`py-3 px-3 rounded-xl text-[13px] font-medium transition-all duration-200 text-left ${
                            data.specialty === spec
                              ? "bg-foreground text-background shadow-sm"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>Nome da Clínica / Hospital</FieldLabel>
                    <Input
                      value={data.clinicName}
                      onChange={(e) => update({ clinicName: e.target.value })}
                      placeholder="Ex: Hospital de Olhos de Gov. Valadares"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <FieldLabel>Cidade</FieldLabel>
                      <Input
                        value={data.clinicCity}
                        onChange={(e) => update({ clinicCity: e.target.value })}
                        placeholder="Cidade"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel>UF</FieldLabel>
                      <select
                        value={data.clinicState}
                        onChange={(e) => update({ clinicState: e.target.value })}
                        className={cn(inputClass, "w-full appearance-none cursor-pointer")}
                      >
                        <option value="">UF</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <ContinueButton
                  onClick={goNext}
                  disabled={!data.crm || !data.crmState || !data.specialty || !data.clinicName}
                />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 3 — Como funciona ═══ */}
            {screen === "s3" && (
              <div className="space-y-8 pt-14">
                <div className="space-y-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    Entenda o fluxo.
                  </h2>
                  <p className="text-muted-foreground text-sm font-light">
                    Revise como o sistema de pontos funciona na prática.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { step: "1", title: "Paciente preenche o quiz", desc: "Na sua clínica ou via link enviado por WhatsApp. O questionário de saúde vincula o paciente ao seu cadastro automaticamente." },
                    { step: "2", title: "Paciente compra na plataforma", desc: "Quando o paciente fizer uma compra na Vision Lift, o sistema reconhece o vínculo e credita VisionPoints na sua wallet." },
                    { step: "3", title: "Pontos ficam pendentes (30 dias)", desc: "Os pontos entram em carência de 30 dias para garantir a qualidade da venda. Após esse período, ficam liberados." },
                    { step: "4", title: "Resgate como preferir", desc: "Pontos liberados podem ser trocados por: transferência Pix, produtos, cursos, congressos ou equipamentos." },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-[14px] font-bold">
                        {step}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-foreground">{title}</p>
                        <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-accent" />
                    <p className="text-[13px] font-semibold text-foreground">Ético e transparente</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    O programa é baseado em <strong className="text-foreground">VisionPoints Coin</strong> — uma moeda interna da plataforma. Não é comissão por venda. Você acumula pontos pela jornada dos seus pacientes e resgata como preferir. Compliance LGPD e sem vínculo com prescrição.
                  </p>
                </div>

                <ContinueButton onClick={goNext} />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 4 — Preferências de Resgate ═══ */}
            {screen === "s4" && (
              <div className="space-y-8 pt-14">
                <div className="space-y-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    Preferências de resgate.
                  </h2>
                  <p className="text-muted-foreground text-sm font-light">
                    Configure como deseja utilizar seus VisionPoints.
                  </p>
                </div>

                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-2">
                  <p className="text-[13px] font-semibold text-foreground">Como funciona o resgate?</p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Seus VisionPoints ficam <strong className="text-foreground">pendentes por 30 dias</strong> (período de carência). Após a liberação, você pode resgatá-los por:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Produtos", "Cursos", "Congressos", "Equipamentos", "Pix"].map((opt) => (
                      <span key={opt} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-border text-[11px] font-medium text-foreground">
                        {opt}
                      </span>
                    ))}
                  </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                    <strong className="text-foreground">Pix:</strong> valor mínimo de resgate é <strong className="text-foreground">R$ 1.000</strong>. Saldo abaixo desse valor fica acumulando até atingir o mínimo.
                  </p>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <FieldLabel>CPF ou CNPJ (identificação fiscal)</FieldLabel>
                    <Input
                      value={data.cpfCnpj}
                      onChange={(e) => update({ cpfCnpj: e.target.value })}
                      placeholder="000.000.000-00"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Chave Pix (caso opte por resgate via Pix)</FieldLabel>
                    <Input
                      value={data.pixKey}
                      onChange={(e) => update({ pixKey: e.target.value })}
                      placeholder="E-mail, CPF, telefone ou chave aleatória"
                      className={inputClass}
                    />
                    <p className="text-[10px] text-muted-foreground pl-1">Opcional — você pode configurar depois. Sem a chave, seus resgates serão em produtos, cursos ou congressos.</p>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Nome do titular</FieldLabel>
                    <Input
                      value={data.paymentName}
                      onChange={(e) => update({ paymentName: e.target.value })}
                      placeholder="Nome completo do titular"
                      className={inputClass}
                    />
                  </div>
                </div>

                <ContinueButton
                  onClick={goNext}
                  label="Finalizar cadastro"
                  disabled={!data.cpfCnpj || !data.paymentName}
                />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ DONE ═══ */}
            {screen === "done" && (
              <div className="text-center space-y-10 py-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
                >
                  <Check className="h-8 w-8 text-primary" />
                </motion.div>

                <div className="space-y-3">
                  <h2 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
                    Cadastro recebido!
                  </h2>
                  <p className="text-muted-foreground text-[15px] font-light">
                    Seu CRM será validado pela equipe. Você receberá a confirmação por e-mail e WhatsApp em até 48h.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 text-left space-y-2">
                  <p className="text-[13px] font-semibold text-foreground">Próximos passos:</p>
                  <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      Validação do CRM (até 48h)
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      Acesso ao painel e quiz personalizado
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      Início do acúmulo de VisionPoints
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => navigate("/partner")}
                  className="w-full h-13 bg-foreground hover:bg-foreground/90 text-background rounded-xl text-[15px] font-medium"
                >
                  Acessar painel
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartnerOnboarding;
