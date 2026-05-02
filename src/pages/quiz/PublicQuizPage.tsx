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

import QuizStepIdentification from "@/components/quiz/QuizStepIdentification";
import QuizStepHealth from "@/components/quiz/QuizStepHealth";
import QuizStepMedications from "@/components/quiz/QuizStepMedications";
import QuizStepOphthalmology from "@/components/quiz/QuizStepOphthalmology";
import QuizStepReason from "@/components/quiz/QuizStepReason";
import QuizStepConsent from "@/components/quiz/QuizStepConsent";
import QuizStepCheckout from "@/components/quiz/QuizStepCheckout";
import QuizSuccessView from "@/components/quiz/QuizSuccessView";
import QuizStepScreenTime, { ScreenTimeOption } from "@/components/quiz/QuizStepScreenTime";

export interface QuizFormData {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  age: string;
  sex: string;
  screenTime: string;
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
  fullName: "", cpf: "", phone: "", email: "", age: "", sex: "",
  screenTime: "",
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
  { label: "Identificação" },
  { label: "Saúde" },
  { label: "Medicações" },
  { label: "Especializado" },
  { label: "Consulta" },
  { label: "Consentimento" },
  { label: "Produto" },
];

const DEFAULT_OPTIONS: ScreenTimeOption[] = [
  { icon: "Smartphone", title: "Menos de 4h", description: "Uso tranquilo" },
  { icon: "Monitor", title: "4 a 8 horas", description: "Bastante comum hoje em dia" },
  { icon: "Tv", title: "8 a 12 horas", description: "Rotina intensa" },
  { icon: "AlertTriangle", title: "Mais de 12h", description: "Seus olhos merecem atenção extra" },
];

const DEFAULT_HEADER = {
  title: "Dr. {doctor} recomendou esta avaliação",
  subtitle: "Complete este diagnóstico complementar para que seu protocolo de proteção seja personalizado ao seu perfil clínico",
  question_title: "Vamos começar pelo dia a dia — quanto tempo você passa olhando para telas?",
  question_subtitle: "Pode ser computador, celular, tablet ou TV. Soma tudo, sem culpa.",
  badges: ["Dados criptografados", "LGPD compliant", "Validado por oftalmologistas"],
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
  });

  // Resolve referral
  useEffect(() => {
    const urlRef = searchParams.get("ref");
    const stored = typeof window !== "undefined" ? localStorage.getItem("allvita_partner_ref") : null;
    const finalRef = (urlRef || stored || doctorCodeParam || null)?.toUpperCase() ?? null;
    setReferralCode(finalRef);
    setDoctorName(finalRef || "Geral");
  }, [doctorCodeParam, searchParams]);

  // Load tenant-configured copy
  useEffect(() => {
    if (!currentTenant?.id) return;
    (async () => {
      const { data: row } = await (supabase as any)
        .from("tenant_protocol_landing")
        .select("quiz_header_title,quiz_header_subtitle,quiz_question_title,quiz_question_subtitle,quiz_question_options,quiz_footer_badges")
        .eq("tenant_id", currentTenant.id)
        .maybeSingle();
      if (row) {
        setConfig({
          headerTitle: row.quiz_header_title || DEFAULT_HEADER.title,
          headerSubtitle: row.quiz_header_subtitle || DEFAULT_HEADER.subtitle,
          questionTitle: row.quiz_question_title || DEFAULT_HEADER.question_title,
          questionSubtitle: row.quiz_question_subtitle || DEFAULT_HEADER.question_subtitle,
          options: Array.isArray(row.quiz_question_options) ? row.quiz_question_options : DEFAULT_OPTIONS,
          badges: Array.isArray(row.quiz_footer_badges) ? row.quiz_footer_badges : DEFAULT_HEADER.badges,
        });
      }
    })();
  }, [currentTenant?.id]);

  const update = (fields: Partial<QuizFormData>) => setData((d) => ({ ...d, ...fields }));

  const canAdvance = () => {
    if (step === 0) return !!data.screenTime;
    if (step === 1) return !!(data.fullName && data.cpf && data.phone && data.email);
    if (step === 6) return data.consentDataUsage;
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

  if (submitted) return <QuizSuccessView patientName={data.fullName} />;

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
            <span className="text-[12px] font-semibold" style={{ color: "#D97757" }}>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#EFEAE4] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: "#D97757" }}
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
              {step === 1 && <QuizStepIdentification data={data} update={update} />}
              {step === 2 && <QuizStepHealth data={data} update={update} />}
              {step === 3 && <QuizStepMedications data={data} update={update} />}
              {step === 4 && <QuizStepOphthalmology data={data} update={update} />}
              {step === 5 && <QuizStepReason data={data} update={update} />}
              {step === 6 && <QuizStepConsent data={data} update={update} />}
              {step === 7 && <QuizStepCheckout data={data} onSubmit={handleSubmit} submitting={submitting} />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {step < 7 && (
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
                  "h-11 px-6 rounded-xl text-sm font-medium",
                  canAdvance() ? "bg-[#1a1a1a] hover:bg-[#1a1a1a]/90 text-white" : "bg-[#B5B5B5] text-white cursor-not-allowed hover:bg-[#B5B5B5]"
                )}
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
