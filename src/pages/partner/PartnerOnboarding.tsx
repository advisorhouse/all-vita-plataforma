import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import {
  Stethoscope, BarChart3, Handshake, ArrowRight, ChevronLeft, Check,
  Eye, EyeOff, Repeat, Heart, Monitor, Lock, Shield, Coins, Users,
  Link2, Gift, GraduationCap, Ticket, Wrench, CreditCard, Clock, AlertTriangle,
  Building2, MapPin, Landmark, Fingerprint, FileText, User, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import InputMask from "react-input-mask";
import { useCNPJLookup } from "@/hooks/use-cnpj-lookup";
import { useCEPLookup } from "@/hooks/use-cep-lookup";
import iconVisionLift from "@/assets/icon-vision-lift.png";
import partnerHeroImg from "@/assets/partner-onboarding-hero.png";
import { OnboardingHeader, OnboardingFooter } from "@/components/onboarding/OnboardingLayout";

// ─── Types ───────────────────────────────────────────────────
interface PartnerFormData {
  // Account
  fullName: string;
  email: string;
  phone: string;
  phoneDdi: string;
  password: string;
  
  // Documents
  cpf: string;
  rg: string;
  
  // Partner Type
  type: "PF" | "PJ";
  
  // Professional (Open text)
  crm: string; // Or Register
  specialty: string;
  
  // PJ Data
  cnpj?: string;
  socialName?: string;
  tradingName?: string;
  responsibleName?: string;
  
  // Address
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  
  // Financial
  pixType: "CPF" | "CNPJ" | "Email" | "Phone" | "Random";
  pixKey: string;
  bank: string;
  agency: string;
  account: string;
  hasProfessionalRegister: boolean;
  hasSpecialty: boolean;
}

const defaultData: PartnerFormData = {
  fullName: "", email: "", phone: "", phoneDdi: "+55", password: "",
  cpf: "", rg: "",
  type: "PF",
  crm: "", specialty: "",
  cnpj: "", socialName: "", tradingName: "", responsibleName: "",
  cep: "", street: "", number: "", complement: "", district: "", city: "", state: "",
  pixType: "CPF", pixKey: "", bank: "", agency: "", account: "",
  hasProfessionalRegister: false,
  hasSpecialty: false,
};

const PIX_TYPES = [
  { id: "CPF", label: "CPF", mask: "999.999.999-99" },
  { id: "CNPJ", label: "CNPJ", mask: "99.999.999/9999-99" },
  { id: "Email", label: "E-mail", mask: null },
  { id: "Phone", label: "Telefone", mask: "(99) 99999-9999" },
  { id: "Random", label: "Chave Aleatória", mask: null },
];

type Screen = "welcome" | "brand" | "points" | "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "done";

const STEP_ORDER: Screen[] = ["welcome", "brand", "points", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "done"];
const FORM_STEPS: Screen[] = ["s1", "s2", "s3", "s4", "s5", "s6"];

const STATES = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT",
  "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

const DDI_OPTIONS = [
  { value: "+55", label: "BR +55", flag: "🇧🇷", mask: "(99) 99999-9999" },
  { value: "+1", label: "US +1", flag: "🇺🇸", mask: "(999) 999-9999" },
  { value: "+351", label: "PT +351", flag: "🇵🇹", mask: "999 999 999" },
  { value: "+44", label: "UK +44", flag: "🇬🇧", mask: "9999 999999" },
  { value: "+34", label: "ES +34", flag: "🇪🇸", mask: "999 999 999" },
  { value: "+33", label: "FR +33", flag: "🇫🇷", mask: "9 99 99 99 99" },
  { value: "+49", label: "DE +49", flag: "🇩🇪", mask: "9999 9999999" },
  { value: "+54", label: "AR +54", flag: "🇦🇷", mask: "99 9999-9999" },
  { value: "+598", label: "UY +598", flag: "🇺🇾", mask: "9 999 9999" },
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
  const referrerParam = searchParams.get("ref");
  const { currentTenant, isLoading } = useTenant();
  const [screen, setScreen] = useState<Screen>("welcome");
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<PartnerFormData>(defaultData);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { lookupCNPJ, loading: loadingCNPJ } = useCNPJLookup();
  const { lookupCEP, loading: loadingCEP } = useCEPLookup();

  const handleCNPJLookup = async () => {
    if (!data.cnpj) return;
    const result = await lookupCNPJ(data.cnpj);
    if (result) {
      update({
        socialName: result.razao_social,
        tradingName: result.nome_fantasia || result.razao_social,
        responsibleName: result.qsa?.[0]?.nome || "",
        cep: result.cep,
        street: result.logradouro,
        number: result.numero,
        district: result.bairro,
        city: result.municipio,
        state: result.uf,
      });
      toast.success("Dados do CNPJ carregados com sucesso!");
    }
  };

  const handleCEPLookup = async (cepValue: string) => {
    const cleanCEP = cepValue.replace(/\D/g, "");
    if (cleanCEP.length === 8) {
      const result = await lookupCEP(cleanCEP);
      if (result) {
        update({
          street: result.logradouro,
          district: result.bairro,
          city: result.localidade,
          state: result.uf,
        });
        toast.success("Endereço preenchido automaticamente!");
      }
    }
  };

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
          data: { 
            full_name: data.fullName, 
            first_name: firstName, 
            last_name: lastName,
            parent_partner_id: referrerParam,
            is_level_1: !referrerParam 
          },
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
              ...data,
              phone: `${data.phoneDdi}${data.phone.replace(/\D/g, "")}`,
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

  const update = (partial: Partial<PartnerFormData>) => setData((d) => ({ ...d, ...partial }));

  // ─── Shared sub-components ─────────────────────────────────
  const SecurityFooter = () => (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <Lock className="h-3 w-3 text-muted-foreground/40" />
      <span className="text-[10px] text-muted-foreground/40">
        Seus dados são protegidos pela LGPD.{" "}
        <button onClick={() => window.open('/privacy', '_blank')} className="underline hover:text-muted-foreground transition-colors">Política de privacidade</button>
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
      <div className="w-full max-w-lg mx-auto px-6 pt-12">
        <OnboardingHeader 
          logoUrl={currentTenant?.logo_url} 
          tradeName={currentTenant?.trade_name} 
          loading={isLoading}
        />
      </div>

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
      <div className="flex-1 flex items-start justify-center px-6 py-8">
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
                  className="space-y-12"
                >
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
                      Vincule seus pacientes e acumule Vitacoins a cada jornada acompanhada.
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
                </motion.div>
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
                    { icon: Coins, title: "Pontos automáticos", body: "Toda compra futura desse paciente na plataforma gera Vitacoins para você — de forma automática e recorrente." },
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
              </div>
            )}

            {/* ═══ POINTS — Vitacoins ═══ */}
            {screen === "points" && (
              <div className="text-center space-y-8 py-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                    <Coins className="h-4 w-4 text-accent" />
                    <span className="text-[12px] font-semibold text-accent">Moeda interna</span>
                  </div>
                  <h2 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
                    Vitacoins
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
                      <span>Você recebe <strong className="text-foreground">528 Vitacoins</strong></span>
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
                    <div className="flex gap-2">
                      <Select
                        value={data.phoneDdi}
                        onValueChange={(v) => update({ phoneDdi: v, phone: "" })}
                      >
                        <SelectTrigger className={cn(inputClass, "w-[100px] shrink-0 px-3")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DDI_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center gap-2">
                                <span>{opt.flag}</span>
                                <span>{opt.value}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex-1">
                        <InputMask
                          mask={DDI_OPTIONS.find(o => o.value === data.phoneDdi)?.mask || "999999999999999"}
                          maskChar={null}
                          value={data.phone}
                          onChange={(e) => update({ phone: e.target.value })}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder="99999-9999"
                              className={inputClass}
                            />
                          )}
                        </InputMask>
                      </div>
                    </div>
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
                  disabled={!data.fullName || !data.email || !data.password || !data.phone}
                />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 2 — Documentos Pessoais ═══ */}
            {screen === "s2" && (
              <div className="space-y-8 pt-14">
                <div className="space-y-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    Atuação e Identificação.
                  </h2>
                  <p className="text-muted-foreground text-sm font-light">
                    Escolha como deseja atuar como parceiro.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <FieldLabel>Tipo de parceiro</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "PF", label: "Pessoa Física", icon: User },
                        { id: "PJ", label: "Pessoa Jurídica", icon: Building2 },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => update({ type: t.id as "PF" | "PJ" })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                            data.type === t.id
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-secondary/30 text-muted-foreground hover:border-muted-foreground/40"
                          }`}
                        >
                          <t.icon className="h-5 w-5" />
                          <span className="text-[13px] font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {data.type === "PF" ? (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <FieldLabel>CPF</FieldLabel>
                        <InputMask
                          mask="999.999.999-99"
                          value={data.cpf}
                          onChange={(e) => update({ cpf: e.target.value })}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder="000.000.000-00"
                              className={inputClass}
                            />
                          )}
                        </InputMask>
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>RG</FieldLabel>
                        <InputMask
                          mask="99.999.999-*"
                          value={data.rg}
                          onChange={(e) => update({ rg: e.target.value })}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder="00.000.000-0"
                              className={inputClass}
                            />
                          )}
                        </InputMask>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <FieldLabel>CNPJ</FieldLabel>
                        <div className="flex gap-2">
                          <InputMask
                            mask="99.999.999/9999-99"
                            value={data.cnpj}
                            onChange={(e) => update({ cnpj: e.target.value })}
                            className="flex-1"
                          >
                            {(inputProps: any) => (
                              <Input
                                {...inputProps}
                                placeholder="00.000.000/0000-00"
                                className={inputClass}
                              />
                            )}
                          </InputMask>
                          <Button 
                            type="button" 
                            variant="secondary" 
                            className="h-13 px-4"
                            onClick={handleCNPJLookup}
                            disabled={loadingCNPJ || !data.cnpj || data.cnpj.replace(/\D/g, "").length !== 14}
                          >
                            <Search className={cn("h-4 w-4", loadingCNPJ && "animate-spin")} />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>Razão Social</FieldLabel>
                        <Input
                          value={data.socialName}
                          onChange={(e) => update({ socialName: e.target.value })}
                          placeholder="Nome oficial da empresa"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <ContinueButton
                  onClick={goNext}
                  disabled={data.type === "PF" ? !data.cpf : !data.cnpj || !data.socialName}
                />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 3 — Profissional ═══ */}
            {screen === "s3" && (
              <div className="space-y-8 pt-14">
                <div className="space-y-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    Perfil Profissional.
                  </h2>
                  <p className="text-muted-foreground text-sm font-light">
                    Dados de atuação (opcional).
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Registro Profissional</p>
                        <p className="text-[11px] text-muted-foreground">CRM, CRP, etc.</p>
                      </div>
                      <Switch 
                        checked={data.hasProfessionalRegister}
                        onCheckedChange={(v) => update({ hasProfessionalRegister: v })}
                      />
                    </div>
                    
                    {data.hasProfessionalRegister && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2"
                      >
                        <Input
                          value={data.crm}
                          onChange={(e) => update({ crm: e.target.value })}
                          placeholder="Número do seu registro"
                          className={inputClass}
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Especialidade Principal</p>
                        <p className="text-[11px] text-muted-foreground">Sua área de atuação</p>
                      </div>
                      <Switch 
                        checked={data.hasSpecialty}
                        onCheckedChange={(v) => update({ hasSpecialty: v })}
                      />
                    </div>
                    
                    {data.hasSpecialty && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2"
                      >
                        <Input
                          value={data.specialty}
                          onChange={(e) => update({ specialty: e.target.value })}
                          placeholder="Ex: Dermatologia, Nutrição"
                          className={inputClass}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <ContinueButton onClick={goNext} />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 4 — Dados Adicionais / PJ ═══ */}
            {screen === "s4" && (
              <div className="space-y-8 pt-14">
                <div className="space-y-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    {data.type === "PF" ? "Responsável." : "Dados da empresa."}
                  </h2>
                  <p className="text-muted-foreground text-sm font-light">
                    {data.type === "PF" ? "Informação adicional de identificação." : "Informações da sua pessoa jurídica."}
                  </p>
                </div>

                <div className="space-y-4">
                  {data.type === "PJ" && (
                    <div className="space-y-1.5">
                      <FieldLabel>Nome Fantasia</FieldLabel>
                      <Input
                        value={data.tradingName}
                        onChange={(e) => update({ tradingName: e.target.value })}
                        placeholder="Nome da sua clínica/marca"
                        className={inputClass}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <FieldLabel>Nome do Responsável</FieldLabel>
                    <Input
                      value={data.responsibleName}
                      onChange={(e) => update({ responsibleName: e.target.value })}
                      placeholder="Nome completo do responsável"
                      className={inputClass}
                    />
                  </div>
                </div>

                <ContinueButton
                  onClick={goNext}
                  disabled={!data.responsibleName}
                />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 5 — Endereço ═══ */}
            {screen === "s5" && (
              <div className="space-y-8 pt-14">
                <div className="space-y-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    Endereço de atuação.
                  </h2>
                  <p className="text-muted-foreground text-sm font-light">
                    Onde sua clínica ou consultório está localizado.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <FieldLabel>CEP</FieldLabel>
                      <InputMask
                        mask="99999-999"
                        value={data.cep}
                        onChange={(e) => {
                          const val = e.target.value;
                          update({ cep: val });
                          handleCEPLookup(val);
                        }}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            placeholder="00000-000"
                            className={inputClass}
                          />
                        )}
                      </InputMask>
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel>UF</FieldLabel>
                      <select
                        value={data.state}
                        onChange={(e) => update({ state: e.target.value })}
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
                    <FieldLabel>Rua/Logradouro</FieldLabel>
                    <Input
                      value={data.street}
                      onChange={(e) => update({ street: e.target.value })}
                      placeholder="Endereço completo"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <FieldLabel>Número</FieldLabel>
                      <Input
                        value={data.number}
                        onChange={(e) => update({ number: e.target.value })}
                        placeholder="123"
                        className={inputClass}
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <FieldLabel>Bairro</FieldLabel>
                      <Input
                        value={data.district}
                        onChange={(e) => update({ district: e.target.value })}
                        placeholder="Bairro"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>Cidade</FieldLabel>
                    <Input
                      value={data.city}
                      onChange={(e) => update({ city: e.target.value })}
                      placeholder="Sua cidade"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>Complemento (Opcional)</FieldLabel>
                    <Input
                      value={data.complement}
                      onChange={(e) => update({ complement: e.target.value })}
                      placeholder="Sala, andar, etc."
                      className={inputClass}
                    />
                  </div>
                </div>

                <ContinueButton
                  onClick={goNext}
                  disabled={!data.cep || !data.street || !data.city || !data.state}
                />
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 6 — Dados Financeiros ═══ */}
            {screen === "s6" && (
              <div className="space-y-8 pt-14">
                <div className="space-y-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">
                    Dados financeiros.
                  </h2>
                  <p className="text-muted-foreground text-sm font-light">
                    Onde você receberá seus resgates em Pix.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <FieldLabel>Tipo de Chave PIX</FieldLabel>
                    <Select 
                      value={data.pixType} 
                      onValueChange={(v: any) => update({ pixType: v, pixKey: "" })}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {PIX_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>Chave PIX</FieldLabel>
                    {PIX_TYPES.find(t => t.id === data.pixType)?.mask ? (
                      <InputMask
                        mask={PIX_TYPES.find(t => t.id === data.pixType)!.mask!}
                        value={data.pixKey}
                        onChange={(e) => update({ pixKey: e.target.value })}
                      >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder={
                                data.pixType === "Phone" ? "(00) 00000-0000" : 
                                data.pixType === "CNPJ" ? "00.000.000/0000-00" : 
                                "000.000.000-00"
                              }
                              className={inputClass}
                            />
                          )}
                      </InputMask>
                    ) : (
                      <Input
                        value={data.pixKey}
                        onChange={(e) => update({ pixKey: e.target.value })}
                        placeholder={data.pixType === "Email" ? "exemplo@email.com" : "Sua chave aleatória"}
                        className={inputClass}
                      />
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Dados Bancários (Reserva)
                    </p>
                    <div className="space-y-1.5">
                      <FieldLabel>Banco</FieldLabel>
                      <Input
                        value={data.bank}
                        onChange={(e) => update({ bank: e.target.value })}
                        placeholder="Ex: Nubank, Itaú, BB"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <FieldLabel>Agência</FieldLabel>
                        <Input
                          value={data.agency}
                          onChange={(e) => update({ agency: e.target.value })}
                          placeholder="0001"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>Conta</FieldLabel>
                        <Input
                          value={data.account}
                          onChange={(e) => update({ account: e.target.value })}
                          placeholder="000000-0"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleFinishSignup}
                  disabled={!data.pixKey || loading}
                  className="w-full h-13 bg-foreground hover:bg-foreground/90 text-background rounded-xl text-[15px] font-medium disabled:opacity-30"
                >
                  {loading ? "Criando conta..." : "Finalizar cadastro"}
                  {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
                <SecurityFooter />
              </div>
            )}

            {/* ═══ STEP 7 — Entenda o fluxo (antigo s3) ═══ */}
            {screen === "s7" && (
              <div className="space-y-8 pt-14">
                {/* ... keep existing s3 content if needed, but I'll skip it for now to follow the user's focus on data collection */}
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
                    Seus dados serão validados pela equipe do tenant. Você receberá a confirmação por e-mail e WhatsApp em até 48h.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 text-left space-y-2">
                  <p className="text-[13px] font-semibold text-foreground">Próximos passos:</p>
                  <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      Validação do registro (até 48h)
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      Acesso ao painel e ferramentas de parceiro
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      Início da gestão de suas vendas e rede
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => navigate(tenantParam ? `/partner?tenant=${tenantParam}` : "/partner")}
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
      <div className="w-full max-w-lg mx-auto px-6 pb-12 flex justify-center">
        <OnboardingFooter tenantName={currentTenant?.trade_name} />
      </div>
    </div>
  );
};

export default PartnerOnboarding;
