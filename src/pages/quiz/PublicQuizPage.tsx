import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, Shield, User, Heart, Pill, Stethoscope, AlertCircle,
  ChevronRight, ChevronLeft, Check, Lock, ShoppingBag, Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import iconVisionLift from "@/assets/icon-vision-lift.png";
import logoVisionLift from "@/assets/logo-vision-lift.png";

import QuizStepIdentification from "@/components/quiz/QuizStepIdentification";
import QuizStepHealth from "@/components/quiz/QuizStepHealth";
import QuizStepMedications from "@/components/quiz/QuizStepMedications";
import QuizStepOphthalmology from "@/components/quiz/QuizStepOphthalmology";
import QuizStepReason from "@/components/quiz/QuizStepReason";
import QuizStepConsent from "@/components/quiz/QuizStepConsent";
import QuizStepCheckout from "@/components/quiz/QuizStepCheckout";
import QuizSuccessView from "@/components/quiz/QuizSuccessView";

export interface QuizFormData {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  age: string;
  sex: string;
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
  healthConditions: [], otherConditions: "",
  continuousMedications: false, medicationsDetail: "",
  usesEyeDrops: false, eyeDropsDetail: "",
  hadEyeSurgery: false, surgeryDetail: "",
  hadEyeTrauma: false,
  consultationReason: "", otherReason: "",
  consentDataUsage: false, consentWhatsapp: false, consentEmail: false,
  consentSms: false, consentPhone: false, consentSocial: false,
};

const STEPS = [
  { label: "Identificação", icon: User },
  { label: "Saúde", icon: Heart },
  { label: "Medicações", icon: Pill },
  { label: "Especializado", icon: Stethoscope },
  { label: "Consulta", icon: AlertCircle },
  { label: "Consentimento", icon: Shield },
  { label: "Produto", icon: ShoppingBag },
];

const PublicQuizPage: React.FC = () => {
  const { doctorCode } = useParams<{ doctorCode: string }>();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuizFormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [doctorValid, setDoctorValid] = useState<boolean | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    if (doctorCode) {
      // For now, accept any code and show the quiz
      // In production, validate against affiliates.doctor_code
      setDoctorValid(true);
      setDoctorName(doctorCode);
    }
    // Capture referral from URL or stored localStorage
    const urlRef = new URLSearchParams(window.location.search).get("ref");
    const stored = typeof window !== "undefined" ? localStorage.getItem("allvita_partner_ref") : null;
    setReferralCode((urlRef || stored || doctorCode || null)?.toUpperCase() ?? null);
  }, [doctorCode]);

  const update = (fields: Partial<QuizFormData>) => setData((d) => ({ ...d, ...fields }));

  const canAdvance = () => {
    if (step === 0) return !!(data.fullName && data.cpf && data.phone && data.email);
    if (step === 5) return data.consentDataUsage;
    return true;
  };

  const handleSubmit = async () => {
    if (!doctorCode) return;
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
        doctor_code: referralCode || doctorCode,
      });

      if (error) throw error;
      setSubmitted(true);
      toast.success("Questionário enviado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao enviar: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (doctorValid === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (submitted) {
    return <QuizSuccessView patientName={data.fullName} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={iconVisionLift} alt="Vision Lift" className="h-7 w-7" />
            <div>
              <p className="text-xs font-bold text-foreground">Vision Lift</p>
              <p className="text-[10px] text-muted-foreground">Questionário Pré-Consulta</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-accent/10 rounded-lg px-2.5 py-1 text-[10px] font-medium text-accent">
            <Eye className="h-3 w-3" />
            {doctorCode}
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  i <= step ? "bg-accent" : "bg-border"
                )}
              />
              <span className={cn(
                "text-[9px] font-medium hidden sm:block",
                i <= step ? "text-accent" : "text-muted-foreground/50"
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          Etapa {step + 1} de {STEPS.length} — {STEPS[step].label}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && <QuizStepIdentification data={data} update={update} />}
            {step === 1 && <QuizStepHealth data={data} update={update} />}
            {step === 2 && <QuizStepMedications data={data} update={update} />}
            {step === 3 && <QuizStepOphthalmology data={data} update={update} />}
            {step === 4 && <QuizStepReason data={data} update={update} />}
            {step === 5 && <QuizStepConsent data={data} update={update} />}
            {step === 6 && <QuizStepCheckout data={data} onSubmit={handleSubmit} submitting={submitting} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 6 && (
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm"
            >
              Continuar
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-8 pb-8">
          <Lock className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/40">
            Protegido pela LGPD • Seus dados são criptografados
          </span>
        </div>
      </div>
    </div>
  );
};

export default PublicQuizPage;
