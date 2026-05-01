import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Stethoscope, Building2, CreditCard, Check,
  ChevronLeft, ChevronRight, Lock, ArrowRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import InputMask from "react-input-mask";

interface RegisterPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PartnerFormData {
  fullName: string;
  email: string;
  phone: string;
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

const defaultData: PartnerFormData = {
  fullName: "", email: "", phone: "",
  crm: "", crmState: "", specialty: "",
  clinicName: "", clinicCity: "", clinicState: "",
  cpfCnpj: "", pixKey: "", paymentName: "",
};

const STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

const SPECIALTIES = [
  "Oftalmologia", "Clínica Geral", "Geriatria", "Neurologia",
  "Endocrinologia", "Nutrologia", "Medicina do Esporte", "Outra",
];

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<Step, { title: string; desc: string; icon: React.ElementType }> = {
  1: { title: "Dados Pessoais", desc: "Informações básicas do profissional", icon: UserPlus },
  2: { title: "Dados Profissionais", desc: "CRM, especialidade e registro", icon: Stethoscope },
  3: { title: "Clínica / Consultório", desc: "Local de atendimento principal", icon: Building2 },
  4: { title: "Dados Financeiros", desc: "Informações para pagamento de comissões", icon: CreditCard },
};

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
};

const RegisterPartnerModal: React.FC<RegisterPartnerModalProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<PartnerFormData>(defaultData);
  const [done, setDone] = useState(false);

  const update = (partial: Partial<PartnerFormData>) => setData((d) => ({ ...d, ...partial }));

  const goTo = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return !!(data.fullName.trim() && data.email.trim() && data.phone.trim());
      case 2: return !!(data.crm.trim() && data.crmState && data.specialty);
      case 3: return !!(data.clinicName.trim() && data.clinicCity.trim() && data.clinicState);
      case 4: return !!(data.cpfCnpj.trim() && data.pixKey.trim());
      default: return false;
    }
  };

  const handleSubmit = () => {
    // TODO: integrate with Supabase to create affiliate + profile
    setDone(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setStep(1);
      setDirection(1);
      setData(defaultData);
      setDone(false);
    }, 300);
  };

  const inputClass = "h-11 rounded-xl border-border bg-secondary/30 text-sm placeholder:text-muted-foreground/30 focus:border-muted-foreground/40 focus:ring-0";

  const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </label>
  );

  if (done) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10"
            >
              <Check className="h-8 w-8 text-success" strokeWidth={2.5} />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Partner Cadastrado!</h2>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{data.fullName}</strong> foi cadastrado com sucesso.
                Um convite será enviado para <strong className="text-foreground">{data.email}</strong>.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-left space-y-2">
              <div className="grid grid-cols-2 gap-y-2 text-[12px]">
                <span className="text-muted-foreground">CRM</span>
                <span className="text-foreground font-medium text-right">{data.crm}/{data.crmState}</span>
                <span className="text-muted-foreground">Especialidade</span>
                <span className="text-foreground font-medium text-right">{data.specialty}</span>
                <span className="text-muted-foreground">Clínica</span>
                <span className="text-foreground font-medium text-right">{data.clinicName}</span>
                <span className="text-muted-foreground">Cidade</span>
                <span className="text-foreground font-medium text-right">{data.clinicCity}/{data.clinicState}</span>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full h-11 rounded-xl">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const StepIcon = STEP_LABELS[step].icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 space-y-3">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                <StepIcon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">{STEP_LABELS[step].title}</DialogTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">{STEP_LABELS[step].desc}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="flex items-center gap-1.5">
            {([1, 2, 3, 4] as Step[]).map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-500",
                  s <= step ? "bg-accent" : "bg-secondary"
                )}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-[280px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-4"
            >
              {/* Step 1 - Dados Pessoais */}
              {step === 1 && (
                <>
                  <div className="space-y-1.5">
                    <FieldLabel>Nome completo *</FieldLabel>
                    <Input
                      value={data.fullName}
                      onChange={(e) => update({ fullName: e.target.value })}
                      placeholder="Dr. Carlos Mendes"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>E-mail *</FieldLabel>
                    <Input
                      type="email"
                      value={data.email}
                      onChange={(e) => update({ email: e.target.value })}
                      placeholder="carlos@clinica.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Telefone / WhatsApp *</FieldLabel>
                    <Input
                      value={data.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* Step 2 - Dados Profissionais */}
              {step === 2 && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <FieldLabel>Número do CRM *</FieldLabel>
                      <Input
                        value={data.crm}
                        onChange={(e) => update({ crm: e.target.value })}
                        placeholder="123456"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel>UF *</FieldLabel>
                      <Select value={data.crmState} onValueChange={(v) => update({ crmState: v })}>
                        <SelectTrigger className={cn(inputClass, "w-full")}>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Especialidade principal *</FieldLabel>
                    <Select value={data.specialty} onValueChange={(v) => update({ specialty: v })}>
                      <SelectTrigger className={cn(inputClass, "w-full")}>
                        <SelectValue placeholder="Selecione a especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Step 3 - Clínica */}
              {step === 3 && (
                <>
                  <div className="space-y-1.5">
                    <FieldLabel>Nome da clínica / consultório *</FieldLabel>
                    <Input
                      value={data.clinicName}
                      onChange={(e) => update({ clinicName: e.target.value })}
                      placeholder="Clínica Vision Care"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <FieldLabel>Cidade *</FieldLabel>
                      <Input
                        value={data.clinicCity}
                        onChange={(e) => update({ clinicCity: e.target.value })}
                        placeholder="São Paulo"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel>UF *</FieldLabel>
                      <Select value={data.clinicState} onValueChange={(v) => update({ clinicState: v })}>
                        <SelectTrigger className={cn(inputClass, "w-full")}>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4 - Financeiro */}
              {step === 4 && (
                <>
                  <div className="space-y-1.5">
                    <FieldLabel>CPF ou CNPJ *</FieldLabel>
                    <Input
                      value={data.cpfCnpj}
                      onChange={(e) => update({ cpfCnpj: e.target.value })}
                      placeholder="000.000.000-00"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Chave PIX *</FieldLabel>
                    <Input
                      value={data.pixKey}
                      onChange={(e) => update({ pixKey: e.target.value })}
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Nome do titular (opcional)</FieldLabel>
                    <Input
                      value={data.paymentName}
                      onChange={(e) => update({ paymentName: e.target.value })}
                      placeholder="Nome conforme conta bancária"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Lock className="h-3 w-3 text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/40">
                      Dados financeiros protegidos com criptografia AES-256.
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step > 1 ? goTo((step - 1) as Step) : handleClose()}
            className="text-xs text-muted-foreground gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {step > 1 ? "Voltar" : "Cancelar"}
          </Button>

          {step < 4 ? (
            <Button
              size="sm"
              onClick={() => goTo((step + 1) as Step)}
              disabled={!canAdvance()}
              className="gap-1.5 text-xs"
            >
              Próximo
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canAdvance()}
              className="gap-1.5 text-xs bg-success hover:bg-success/90"
            >
              <Check className="h-3.5 w-3.5" />
              Cadastrar Partner
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterPartnerModal;
