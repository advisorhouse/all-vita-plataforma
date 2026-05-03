import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, Shield, User, Heart, Pill, Stethoscope, AlertCircle,
  ChevronRight, ChevronLeft, Lock, ShoppingBag, Loader2, BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/contexts/TenantContext";
import { toTitleCase } from "@/lib/utils";

// Form steps identification, health, medications, etc removed as per user request
import QuizStepScreenTime, { ScreenTimeOption } from "@/components/quiz/QuizStepScreenTime";
import QuizStepSymptoms, { SymptomOption } from "@/components/quiz/QuizStepSymptoms";
import QuizStepLastVisit, { LastVisitOption } from "@/components/quiz/QuizStepLastVisit";
import QuizStepAgeRange, { AgeOption } from "@/components/quiz/QuizStepAgeRange";
import QuizStepSupplements, { SupplementOption } from "@/components/quiz/QuizStepSupplements";
import QuizStepUV, { UVOption } from "@/components/quiz/QuizStepUV";
import QuizStepResult, { ResultLevel } from "@/components/quiz/QuizStepResult";
import { computeProtectionScore, ScoreWeights } from "@/lib/quizScore";

export interface QuizFormData {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  age: string;
  ageRange: string;
  lastVisit: string;
  supplements: string;
  uvExposure: string;
  sex: string;
  screenTime: string;
  symptoms: string[];
  healthConditions: string[];
  otherConditions: string;
  continuousMedications: boolean;
  medicationsDetail: string;
  usesEyeDrops: boolean;
  eyeDropsDetail: string;
  hadEyeSurgery: boolean;
  surgeryDetail: string;
  hadEyeTrauma: boolean;
  consultationReason: string;
  otherReason: string;
  consentDataUsage: boolean;
  consentWhatsapp: boolean;
  consentEmail: boolean;
  consentSms: boolean;
  consentPhone: boolean;
  consentSocial: boolean;
}

const INITIAL_DATA: QuizFormData = {
  fullName: "", cpf: "", phone: "", email: "", age: "", ageRange: "", lastVisit: "", supplements: "", uvExposure: "", sex: "",
  screenTime: "",
  symptoms: [],
  healthConditions: [], otherConditions: "",
  continuousMedications: false, medicationsDetail: "",
  usesEyeDrops: false, eyeDropsDetail: "",
  hadEyeSurgery: false, surgeryDetail: "",
  hadEyeTrauma: false,
  consultationReason: "", otherReason: "",
  consentDataUsage: false, consentWhatsapp: false, consentEmail: false,
  consentSms: false, consentPhone: false, consentSocial: false,
};

const STEPS_META = [
  { label: "Rotina" },
  { label: "Sintomas" },
  { label: "Idade" },
  { label: "Última visita" },
  { label: "Suplementos" },
  { label: "Exposição UV" },
  { label: "Resultado" },
];

const DEFAULT_LEVELS: ResultLevel[] = [
  { max: 40, label: "Nível de risco: Alto", color: "#D9534F", message: "Sua proteção atual está abaixo do recomendado. É essencial iniciar um protocolo estruturado para fortalecer a barreira de proteção da retina." },
  { max: 70, label: "Nível de risco: Moderado", color: "#D97757", message: "Você tem uma proteção parcial, mas existem lacunas importantes que merecem atenção. A exposição digital diária cria um desgaste cumulativo que sua proteção atual pode não cobrir totalmente.\n\nCom um protocolo baseado em astaxantina + luteína + zeaxantina, é possível fortalecer significativamente sua barreira de proteção macular." },
  { max: 100, label: "Nível de risco: Baixo", color: "#5CB85C", message: "Excelente! Sua proteção atual está em bom nível. Manter um protocolo de suporte ajuda a preservar a saúde da retina ao longo do tempo." },
];

const DEFAULT_WEIGHTS: ScoreWeights = {
  screenTime: [80, 60, 35, 15],
  symptoms: [70, 60, 60, 65],
  ageRange: [85, 70, 55, 40],
  lastVisit: [90, 65, 35, 25],
  supplements: [90, 70, 45, 20],
  uvExposure: [90, 65, 40, 20],
};

const DEFAULT_AGES: AgeOption[] = [
  { icon: "Zap", title: "18 a 30 anos", description: "Proteção natural ainda alta" },
  { icon: "Activity", title: "31 a 45 anos", description: "Começa a reduzir gradualmente" },
  { icon: "Heart", title: "46 a 60 anos", description: "Momento importante de cuidar" },
  { icon: "ShieldCheck", title: "Acima de 60", description: "Proteção ativa é essencial" },
];

const DEFAULT_LASTVISIT: LastVisitOption[] = [
  { icon: "Check", title: "Menos de 1 ano", description: "Ótimo, continue assim!" },
  { icon: "Clock", title: "1 a 2 anos", description: "Talvez seja hora de agendar" },
  { icon: "AlertTriangle", title: "Mais de 2 anos", description: "Vale a pena remarcar" },
  { icon: "AlertTriangle", title: "Não lembro", description: "Acontece — mas vamos resolver" },
];

const DEFAULT_SUPPLEMENTS: SupplementOption[] = [
  { icon: "Sparkles", title: "Sim, com astaxantina", description: "Excelente escolha" },
  { icon: "Shield", title: "Sim, luteína ou zeaxantina", description: "Um bom começo" },
  { icon: "Activity", title: "Outro suplemento", description: "Pode não ser suficiente" },
  { icon: "AlertTriangle", title: "Não tomo nenhum", description: "Sem proteção ativa no momento" },
];

const DEFAULT_UV: UVOption[] = [
  { icon: "Glasses", title: "Raramente", description: "Sempre uso proteção" },
  { icon: "Sun", title: "Às vezes", description: "Quando esqueço" },
  { icon: "Sun", title: "Com frequência", description: "Na maioria das vezes" },
  { icon: "AlertTriangle", title: "Quase sempre", description: "Sem proteção UV" },
];

const DEFAULT_SYMPTOMS: SymptomOption[] = [
  { icon: "Droplet", title: "Olhos secos ou ardendo", description: "Sensação de areia ou ressecamento" },
  { icon: "Eye", title: "Visão embaçada às vezes", description: "Dificuldade de foco em algum momento" },
  { icon: "Brain", title: "Dor de cabeça frequente", description: "Principalmente após uso de telas" },
  { icon: "Sun", title: "Incômodo com luz forte", description: "Sensibilidade ao sair para a claridade" },
];

const DEFAULT_OPTIONS: ScreenTimeOption[] = [
  { icon: "Smartphone", title: "Menos de 4h", description: "Uso tranquilo" },
  { icon: "Monitor", title: "4 a 8 horas", description: "Bastante comum hoje em dia" },
  { icon: "Tv", title: "8 a 12 horas", description: "Rotina intensa" },
  { icon: "AlertTriangle", title: "Mais de 12h", description: "Seus olhos merecem atenção extra" },
];

const DEFAULT_HEADER = {
  title: "{doctor} recomendou esta avaliação",
  subtitle: "Complete este diagnóstico complementar para que seu protocolo de proteção seja personalizado ao seu perfil clínico",
  question_title: "Vamos começar pelo dia a dia — quanto tempo você passa olhando para telas?",
  question_subtitle: "Pode ser computador, celular, tablet ou TV. Soma tudo, sem culpa.",
  badges: ["Seus dados estão protegidos", "LGPD compliant", "Validado por oftalmologistas"],
};

const PublicQuizPage: React.FC = () => {
  const { doctorCode: doctorCodeParam } = useParams<{ doctorCode: string }>();
  const [searchParams] = useSearchParams();
  const { currentTenant } = useTenant();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuizFormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [config, setConfig] = useState({
    headerTitle: DEFAULT_HEADER.title,
    headerSubtitle: DEFAULT_HEADER.subtitle,
    questionTitle: DEFAULT_HEADER.question_title,
    questionSubtitle: DEFAULT_HEADER.question_subtitle,
    options: DEFAULT_OPTIONS,
    badges: DEFAULT_HEADER.badges,
    symptomsTitle: "Você tem sentido algum desses incômodos nos olhos?",
    symptomsSubtitle: "Marque todos que se aplicam ao seu dia a dia — mesmo que pareçam leves.",
    symptomsOptions: DEFAULT_SYMPTOMS,
    ageTitle: "Qual é a sua faixa etária?",
    ageSubtitle: "A proteção natural da retina muda com o tempo — e isso faz parte do processo.",
    ageOptions: DEFAULT_AGES,
    lastVisitTitle: "Faz quanto tempo que você foi ao oftalmologista pela última vez?",
    lastVisitSubtitle: "Sem julgamento — o importante é começar a cuidar a partir de agora.",
    lastVisitOptions: DEFAULT_LASTVISIT,
    supplementsTitle: "Você já toma algum suplemento voltado para a saúde dos olhos?",
    supplementsSubtitle: "Alguns nutrientes ajudam a proteger a retina de forma ativa.",
    supplementsOptions: DEFAULT_SUPPLEMENTS,
    uvTitle: "Com que frequência você sai no sol sem óculos escuros?",
    uvSubtitle: "Os raios UV são um dos vilões silenciosos para a saúde da retina.",
    uvOptions: DEFAULT_UV,
    resultTitle: "Seu Nível de Proteção Macular",
    resultSubtitle: "Baseado nas suas respostas, calculamos seu score de proteção visual",
    resultLevels: DEFAULT_LEVELS,
    resultProductEyebrow: "PROTOCOLO RECOMENDADO",
    resultProductName: "Retina Shield System™",
    resultProductPoweredBy: "powered by CAROTENOID CORE™",
    resultCtaLabel: "Conhecer o protocolo",
    resultCtaUrl: "",
    resultDisclaimer: "Este diagnóstico é uma ferramenta de triagem e não substitui uma consulta oftalmológica profissional. Recomendamos acompanhamento regular com um especialista.",
    scoreWeights: DEFAULT_WEIGHTS,
  });

  // Resolve referral
  useEffect(() => {
    const urlRef = searchParams.get("ref");
    const stored = typeof window !== "undefined" ? localStorage.getItem("allvita_partner_ref") : null;
    const finalRef = (urlRef || stored || doctorCodeParam || null)?.trim() ?? null;
    setReferralCode(finalRef);
    
    if (finalRef) {
      const loadPartnerName = async () => {
        try {
          // Normalize the code for searching: upper case and both underscore/hyphen versions
          const codeUpper = finalRef.toUpperCase();
          const altCode = codeUpper.includes("_") ? codeUpper.replace(/_/g, "-") : codeUpper.replace(/-/g, "_");

          const { data, error } = await supabase
            .from("partners")
            .select(`
              profiles (
                first_name,
                last_name
              )
            `)
            .or(`referral_code.eq.${codeUpper},referral_code.eq.${altCode}`)
            .maybeSingle();

          if (data?.profiles) {
            const profile = data.profiles as any;
            const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
            setDoctorName(fullName);
          } else {
            setDoctorName(toTitleCase(finalRef));
          }
        } catch (e) {
          console.error("Error loading partner name:", e);
          setDoctorName(toTitleCase(finalRef));
        }
      };
      loadPartnerName();
    } else {
      setDoctorName("Geral");
    }
  }, [doctorCodeParam, searchParams]);

  // Load tenant-configured copy
  useEffect(() => {
    if (!currentTenant?.id) return;
    (async () => {
      const { data: row } = await (supabase as any)
        .from("tenant_protocol_landing")
        .select("quiz_header_title,quiz_header_subtitle,quiz_question_title,quiz_question_subtitle,quiz_question_options,quiz_footer_badges,quiz_symptoms_title,quiz_symptoms_subtitle,quiz_symptoms_options,quiz_age_title,quiz_age_subtitle,quiz_age_options,quiz_lastvisit_title,quiz_lastvisit_subtitle,quiz_lastvisit_options,quiz_supplements_title,quiz_supplements_subtitle,quiz_supplements_options,quiz_uv_title,quiz_uv_subtitle,quiz_uv_options,result_title,result_subtitle,result_levels,result_product_eyebrow,result_product_name,result_product_powered_by,result_cta_label,result_cta_url,result_disclaimer,score_weights")
        .eq("tenant_id", currentTenant.id)
        .maybeSingle();
      if (row) {
        setConfig((prev) => ({
          ...prev,
          headerTitle: row.quiz_header_title || prev.headerTitle,
          headerSubtitle: row.quiz_header_subtitle || prev.headerSubtitle,
          questionTitle: row.quiz_question_title || prev.questionTitle,
          questionSubtitle: row.quiz_question_subtitle || prev.questionSubtitle,
          options: Array.isArray(row.quiz_question_options) ? row.quiz_question_options : prev.options,
          badges: Array.isArray(row.quiz_footer_badges) ? row.quiz_footer_badges : prev.badges,
          symptomsTitle: row.quiz_symptoms_title || prev.symptomsTitle,
          symptomsSubtitle: row.quiz_symptoms_subtitle || prev.symptomsSubtitle,
          symptomsOptions: Array.isArray(row.quiz_symptoms_options) ? row.quiz_symptoms_options : prev.symptomsOptions,
          ageTitle: row.quiz_age_title || prev.ageTitle,
          ageSubtitle: row.quiz_age_subtitle || prev.ageSubtitle,
          ageOptions: Array.isArray(row.quiz_age_options) ? row.quiz_age_options : prev.ageOptions,
          lastVisitTitle: row.quiz_lastvisit_title || prev.lastVisitTitle,
          lastVisitSubtitle: row.quiz_lastvisit_subtitle || prev.lastVisitSubtitle,
          lastVisitOptions: Array.isArray(row.quiz_lastvisit_options) ? row.quiz_lastvisit_options : prev.lastVisitOptions,
          supplementsTitle: row.quiz_supplements_title || prev.supplementsTitle,
          supplementsSubtitle: row.quiz_supplements_subtitle || prev.supplementsSubtitle,
          supplementsOptions: Array.isArray(row.quiz_supplements_options) ? row.quiz_supplements_options : prev.supplementsOptions,
          uvTitle: row.quiz_uv_title || prev.uvTitle,
          uvSubtitle: row.quiz_uv_subtitle || prev.uvSubtitle,
          uvOptions: Array.isArray(row.quiz_uv_options) ? row.quiz_uv_options : prev.uvOptions,
          resultTitle: row.result_title || prev.resultTitle,
          resultSubtitle: row.result_subtitle || prev.resultSubtitle,
          resultLevels: Array.isArray(row.result_levels) ? row.result_levels : prev.resultLevels,
          resultProductEyebrow: row.result_product_eyebrow || prev.resultProductEyebrow,
          resultProductName: row.result_product_name || prev.resultProductName,
          resultProductPoweredBy: row.result_product_powered_by ?? prev.resultProductPoweredBy,
          resultCtaLabel: row.result_cta_label || prev.resultCtaLabel,
          resultCtaUrl: row.result_cta_url ?? prev.resultCtaUrl,
          resultDisclaimer: row.result_disclaimer || prev.resultDisclaimer,
          scoreWeights: (row.score_weights && typeof row.score_weights === "object") ? row.score_weights : prev.scoreWeights,
        }));
      }
    })();
  }, [currentTenant?.id]);

  const update = (fields: Partial<QuizFormData>) => setData((d) => ({ ...d, ...fields }));

  const canAdvance = () => {
    if (step === 0) return !!data.screenTime;
    if (step === 1) return data.symptoms.length > 0;
    if (step === 2) return !!data.ageRange;
    if (step === 3) return !!data.lastVisit;
    if (step === 4) return !!data.supplements;
    if (step === 5) return !!data.uvExposure;
    if (step === 6) return true; // Result step is always reachable now
    // Form validation moved to specific steps if needed in future
    return true;
    return true;
  };

  const handleSubmit = async () => {
    if (!referralCode && !doctorCodeParam) {
      toast.error("Código de indicação não encontrado.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase.from as any)("quiz_submissions").insert({
        full_name: data.fullName,
        cpf: data.cpf,
        phone: data.phone,
        email: data.email,
        age: data.age ? parseInt(data.age) : null,
        sex: data.sex || null,
        health_conditions: data.healthConditions,
        other_conditions: data.otherConditions || null,
        continuous_medications: data.continuousMedications,
        medications_detail: data.medicationsDetail || null,
        uses_eye_drops: data.usesEyeDrops,
        eye_drops_detail: data.eyeDropsDetail || null,
        had_eye_surgery: data.hadEyeSurgery,
        surgery_detail: data.surgeryDetail || null,
        had_eye_trauma: data.hadEyeTrauma,
        consultation_reason: data.consultationReason || null,
        other_reason: data.otherReason || null,
        consent_data_usage: data.consentDataUsage,
        consent_contact_whatsapp: data.consentWhatsapp,
        consent_contact_email: data.consentEmail,
        consent_contact_sms: data.consentSms,
        consent_contact_phone: data.consentPhone,
        consent_contact_social: data.consentSocial,
        doctor_code: referralCode || doctorCodeParam,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Protocolo enviado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao enviar: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // No automatic submission needed for now as identification step was removed
  // If we want to capture data, we should add a lead capture step later.
  useEffect(() => {
    // Logic for auto-submit if necessary
  }, [step]);



  const tenantLogo = currentTenant?.logo_url;
  const tenantName = currentTenant?.trade_name || currentTenant?.name || "";
  const headerTitle = config.headerTitle.replace("{doctor}", doctorName || "Médico");
  const progress = Math.round(((step + 1) / STEPS_META.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4">
      <div className="max-w-[720px] mx-auto">
        {/* Tenant logo */}
        <div className="flex items-center justify-center mb-6 h-10">
          {tenantLogo ? (
            <img src={tenantLogo} alt={tenantName} className="max-h-10 max-w-[180px] object-contain" />
          ) : (
            <span className="text-base font-semibold tracking-wide text-foreground">{tenantName}</span>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#1a1a1a] leading-tight">
            {headerTitle}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-2 max-w-[520px] mx-auto leading-relaxed">
            {config.headerSubtitle}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-muted-foreground">Progresso</span>
            <span className="text-[12px] font-semibold" style={{ color: currentTenant?.secondary_color || "#D97757" }}>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#EFEAE4] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: currentTenant?.secondary_color || "#D97757" }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-black/5 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <QuizStepScreenTime
                  title={config.questionTitle}
                  subtitle={config.questionSubtitle}
                  options={config.options}
                  value={data.screenTime}
                  onChange={(v) => update({ screenTime: v })}
                />
              )}
              {step === 1 && (
                <QuizStepSymptoms
                  title={config.symptomsTitle}
                  subtitle={config.symptomsSubtitle}
                  options={config.symptomsOptions}
                  value={data.symptoms}
                  onChange={(v) => update({ symptoms: v })}
                />
              )}
              {step === 2 && (
                <QuizStepAgeRange
                  title={config.ageTitle}
                  subtitle={config.ageSubtitle}
                  options={config.ageOptions}
                  value={data.ageRange}
                  onChange={(v) => update({ ageRange: v })}
                />
              )}
              {step === 3 && (
                <QuizStepLastVisit
                  title={config.lastVisitTitle}
                  subtitle={config.lastVisitSubtitle}
                  options={config.lastVisitOptions}
                  value={data.lastVisit}
                  onChange={(v) => update({ lastVisit: v })}
                />
              )}
              {step === 4 && (
                <QuizStepSupplements
                  title={config.supplementsTitle}
                  subtitle={config.supplementsSubtitle}
                  options={config.supplementsOptions}
                  value={data.supplements}
                  onChange={(v) => update({ supplements: v })}
                />
              )}
              {step === 5 && (
                <QuizStepUV
                  title={config.uvTitle}
                  subtitle={config.uvSubtitle}
                  options={config.uvOptions}
                  value={data.uvExposure}
                  onChange={(v) => update({ uvExposure: v })}
                />
              )}
              {step === 6 && (
                <QuizStepResult
                  score={computeProtectionScore(data, config.scoreWeights, {
                    screenTime: config.options,
                    symptoms: config.symptomsOptions,
                    ageRange: config.ageOptions,
                    lastVisit: config.lastVisitOptions,
                    supplements: config.supplementsOptions,
                    uvExposure: config.uvOptions,
                  })}
                  tenantLogo={tenantLogo}
                  tenantName={tenantName}
                  title={config.resultTitle}
                  subtitle={config.resultSubtitle}
                  levels={config.resultLevels}
                  productEyebrow={config.resultProductEyebrow}
                  productName={config.resultProductName}
                  productPoweredBy={config.resultProductPoweredBy}
                  ctaLabel={config.resultCtaLabel}
                  ctaUrl={config.resultCtaUrl}
                  disclaimer={config.resultDisclaimer}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {step < 6 && (
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-black/5">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className={cn(
                  "h-11 px-6 rounded-xl text-sm font-medium transition-all",
                  !canAdvance() && "bg-[#B5B5B5] text-white cursor-not-allowed hover:bg-[#B5B5B5]"
                )}
                style={canAdvance() ? {
                  backgroundColor: currentTenant?.secondary_color || "#1a1a1a",
                  color: "#ffffff"
                } : {}}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-6">
          {config.badges.map((b, i) => {
            const Icon = i === 0 ? Lock : i === 1 ? BadgeCheck : Eye;
            return (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {b}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicQuizPage;
