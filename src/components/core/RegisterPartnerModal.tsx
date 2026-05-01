import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Stethoscope, Building2, CreditCard, Check,
  ChevronLeft, ChevronRight, Lock, ArrowRight,
  FileText, MapPin, User, Fingerprint, Search, Loader2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import InputMask from "react-input-mask";
import { useCNPJLookup } from "@/hooks/use-cnpj-lookup";
import { useCEPLookup } from "@/hooks/use-cep-lookup";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface RegisterPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PartnerFormData {
  // Account
  fullName: string;
  email: string;
  phone: string;
  phoneDdi: string;
  
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
  fullName: "", email: "", phone: "", phoneDdi: "+55",
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

const STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
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

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, { title: string; desc: string; icon: React.ElementType }> = {
  1: { title: "Dados Básicos", desc: "Tipo e informações de contato", icon: UserPlus },
  2: { title: "Documentos", desc: "Identificação do parceiro", icon: FileText },
  3: { title: "Profissional", desc: "Dados de atuação (Opcional)", icon: Stethoscope },
  4: { title: "Endereço", desc: "Local de atuação", icon: MapPin },
  5: { title: "Financeiro", desc: "Dados para pagamento", icon: CreditCard },
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
  const [loading, setLoading] = useState(false);
  const { currentTenant } = useTenant();
  const { lookupCNPJ, loading: loadingCNPJ } = useCNPJLookup();
  const { lookupCEP, loading: loadingCEP } = useCEPLookup();

  const update = (partial: Partial<PartnerFormData>) => setData((d) => ({ ...d, ...partial }));

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

  const goTo = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return !!(data.fullName.trim() && data.email.trim() && data.phone.trim());
      case 2: return data.type === "PF" ? !!data.cpf : !!(data.cnpj && data.socialName);
      case 3: return true; // Switches are optional
      case 4: return !!(data.cep && data.street && data.city && data.state);
      case 5: return !!data.pixKey;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!currentTenant) {
      toast.error("Empresa não identificada.");
      return;
    }

    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("manage-users/create", {
        headers: { "X-Tenant-Id": currentTenant.id },
        body: {
          email: data.email,
          full_name: data.fullName,
          phone: `${data.phoneDdi}${data.phone.replace(/\D/g, "")}`,
          role: "partner",
        },
      });

      if (error) throw error;
      if (res?.error) throw new Error(res.error);

      setDone(true);
    } catch (err: any) {
      console.error("Error creating partner:", err);
      toast.error("Erro ao cadastrar parceiro", { description: err.message });
    } finally {
      setLoading(false);
    }
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
                <span className="text-muted-foreground">Registro</span>
                <span className="text-foreground font-medium text-right">{data.crm}</span>
                <span className="text-muted-foreground">Especialidade</span>
                <span className="text-foreground font-medium text-right">{data.specialty}</span>
                <span className="text-muted-foreground">Tipo</span>
                <span className="text-foreground font-medium text-right">{data.type}</span>
                <span className="text-muted-foreground">Cidade</span>
                <span className="text-foreground font-medium text-right">{data.city}/{data.state}</span>
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
            {([1, 2, 3, 4, 5] as Step[]).map((s) => (
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
        <div className="px-6 py-5 min-h-[320px]">
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
              {/* Step 1 - Dados Básicos */}
              {step === 1 && (
                <>
                  <div className="space-y-1.5">
                    <FieldLabel>Tipo de parceiro *</FieldLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "PF", label: "Pessoa Física", icon: User },
                        { id: "PJ", label: "Pessoa Jurídica", icon: Building2 },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => update({ type: t.id as "PF" | "PJ" })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            data.type === t.id
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-secondary/30 text-muted-foreground"
                          }`}
                        >
                          <t.icon className="h-4 w-4" />
                          <span className="text-[12px] font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Nome completo *</FieldLabel>
                    <Input
                      value={data.fullName}
                      onChange={(e) => update({ fullName: e.target.value })}
                      placeholder="Dr. Carlos Mendes"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {data.type === "PF" ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <FieldLabel>CPF *</FieldLabel>
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
                        <FieldLabel>CNPJ *</FieldLabel>
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
                            className="h-11 px-3"
                            onClick={handleCNPJLookup}
                            disabled={loadingCNPJ || !data.cnpj || data.cnpj.replace(/\D/g, "").length !== 14}
                          >
                            <Search className={cn("h-4 w-4", loadingCNPJ && "animate-spin")} />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>Razão Social *</FieldLabel>
                        <Input
                          value={data.socialName}
                          onChange={(e) => update({ socialName: e.target.value })}
                          placeholder="Nome oficial da empresa"
                          className={inputClass}
                        />
                      </div>
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
                  )}
                </>
              )}

              {/* Step 3 - Profissional */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-4">
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

                  <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-4">
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
              )}

              {/* Step 4 - Endereço */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <FieldLabel>CEP *</FieldLabel>
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
                      <FieldLabel>UF *</FieldLabel>
                      <Select value={data.state} onValueChange={(v) => update({ state: v })}>
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
                    <FieldLabel>Rua / Logradouro *</FieldLabel>
                    <Input
                      value={data.street}
                      onChange={(e) => update({ street: e.target.value })}
                      placeholder="Endereço"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <FieldLabel>Número</FieldLabel>
                      <Input
                        value={data.number}
                        onChange={(e) => update({ number: e.target.value })}
                        placeholder="Nº"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel>Bairro *</FieldLabel>
                      <Input
                        value={data.district}
                        onChange={(e) => update({ district: e.target.value })}
                        placeholder="Bairro"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Cidade *</FieldLabel>
                    <Input
                      value={data.city}
                      onChange={(e) => update({ city: e.target.value })}
                      placeholder="Cidade"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {/* Step 5 - Financeiro */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <FieldLabel>Tipo de Chave PIX *</FieldLabel>
                      <Select 
                        value={data.pixType} 
                        onValueChange={(v: any) => update({ pixType: v, pixKey: "" })}
                      >
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder="Selecione o tipo de chave" />
                        </SelectTrigger>
                        <SelectContent>
                          {PIX_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel>Chave PIX *</FieldLabel>
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
                  </div>
                  <div className="space-y-4 pt-4 border-t border-border">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Dados Bancários (Opcional)
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

          {step < 5 ? (
            <Button
              size="sm"
              onClick={() => goTo((step + 1) as Step)}
              disabled={!canAdvance()}
              className="gap-1 rounded-xl"
            >
              Próximo
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canAdvance() || loading}
              className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 h-11 px-6 min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Finalizar
                  <Check className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterPartnerModal;
