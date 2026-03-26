import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, Shield, ChevronDown, ChevronUp, User, Phone, Mail,
  Calendar, Heart, Pill, Stethoscope, AlertCircle, FileText,
  CheckSquare, Lock,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import iconVisionLift from "@/assets/icon-vision-lift.png";

interface QuizPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorName?: string;
  doctorCode?: string;
}

const inputClass = "h-11 rounded-xl border-border bg-secondary/30 text-sm placeholder:text-muted-foreground/30 focus:border-accent/40 focus:ring-0";

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required = true }) => (
  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
    {children}
    {required && <span className="text-destructive">*</span>}
  </label>
);

const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  number: number;
  open: boolean;
  onToggle: () => void;
}> = ({ icon: Icon, title, number, open, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors"
  >
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-[11px] font-bold text-accent">
        {number}
      </div>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-[13px] font-semibold text-foreground">{title}</span>
    </div>
    {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
  </button>
);

const QuizPreviewModal: React.FC<QuizPreviewModalProps> = ({
  open, onOpenChange, doctorName = "Dra. Camila Souza", doctorCode = "HOGV-100",
}) => {
  const [sections, setSections] = useState({ personal: true, health: false, eye: false, complaint: false, consent: false });

  const toggle = (key: keyof typeof sections) => setSections((s) => ({ ...s, [key]: !s[key] }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Banner */}
        <div className="bg-gradient-to-r from-accent to-accent/80 px-6 py-5 text-accent-foreground relative overflow-hidden shrink-0">
          <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={iconVisionLift} alt="Vision Lift" className="h-7 w-7" />
              <div>
                <p className="text-[10px] font-medium text-accent-foreground/60 uppercase tracking-wider">Quiz Pré-Consulta</p>
                <p className="text-base font-bold">{doctorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1 text-[10px] font-medium">
              <Eye className="h-3 w-3" />
              Prévia
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Intro */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-[13px] font-medium text-foreground">
              Olá! Preencha este questionário antes da sua consulta com <strong>{doctorName}</strong>.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Seus dados são protegidos pela LGPD e serão usados exclusivamente para melhorar seu atendimento.
            </p>
          </div>

          {/* Section 1 - Dados Pessoais */}
          <SectionHeader icon={User} title="Dados Pessoais" number={1} open={sections.personal} onToggle={() => toggle("personal")} />
          {sections.personal && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pl-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <FieldLabel>Nome completo</FieldLabel>
                  <Input placeholder="Seu nome" className={inputClass} disabled />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>CPF</FieldLabel>
                  <Input placeholder="000.000.000-00" className={inputClass} disabled />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Data de nascimento</FieldLabel>
                  <Input placeholder="DD/MM/AAAA" className={inputClass} disabled />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Telefone / WhatsApp</FieldLabel>
                  <Input placeholder="(00) 00000-0000" className={inputClass} disabled />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>E-mail</FieldLabel>
                  <Input placeholder="seu@email.com" className={inputClass} disabled />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Sexo</FieldLabel>
                  <Select disabled>
                    <SelectTrigger className={cn(inputClass, "w-full")}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">Masculino</SelectItem>
                      <SelectItem value="f">Feminino</SelectItem>
                      <SelectItem value="o">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Idade</FieldLabel>
                  <Input placeholder="Ex: 45" className={inputClass} disabled />
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 2 - Histórico de Saúde */}
          <SectionHeader icon={Heart} title="Histórico de Saúde Geral" number={2} open={sections.health} onToggle={() => toggle("health")} />
          {sections.health && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pl-2">
              <div className="space-y-2">
                <FieldLabel>Condições de saúde (marque todas que se aplicam)</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {["Diabetes", "Hipertensão (HAS)", "Glaucoma", "Catarata", "Doenças autoimunes", "Problemas de tireoide", "Colesterol alto", "Nenhuma das anteriores"].map((c) => (
                    <div key={c} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/20">
                      <Checkbox disabled className="h-4 w-4" />
                      <span className="text-[12px] text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <FieldLabel required={false}>Outras condições</FieldLabel>
                <Textarea placeholder="Descreva outras condições relevantes..." className={cn(inputClass, "h-20 resize-none")} disabled />
              </div>
            </motion.div>
          )}

          {/* Section 3 - Histórico Oftalmológico */}
          <SectionHeader icon={Stethoscope} title="Histórico Oftalmológico" number={3} open={sections.eye} onToggle={() => toggle("eye")} />
          {sections.eye && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pl-2">
              <div className="space-y-1.5">
                <FieldLabel>Usa óculos ou lentes de contato?</FieldLabel>
                <Select disabled>
                  <SelectTrigger className={cn(inputClass, "w-full")}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glasses">Óculos</SelectItem>
                    <SelectItem value="lenses">Lentes de contato</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                    <SelectItem value="none">Nenhum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Já fez cirurgias nos olhos?</FieldLabel>
                <Select disabled>
                  <SelectTrigger className={cn(inputClass, "w-full")}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Não</SelectItem>
                    <SelectItem value="lasik">Sim — LASIK/PRK</SelectItem>
                    <SelectItem value="cataract">Sim — Catarata</SelectItem>
                    <SelectItem value="other">Sim — Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <FieldLabel required={false}>Medicações e colírios em uso</FieldLabel>
                <Textarea placeholder="Liste medicações e colírios que utiliza atualmente..." className={cn(inputClass, "h-20 resize-none")} disabled />
              </div>
            </motion.div>
          )}

          {/* Section 4 - Queixa Principal */}
          <SectionHeader icon={AlertCircle} title="Motivo da Consulta" number={4} open={sections.complaint} onToggle={() => toggle("complaint")} />
          {sections.complaint && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pl-2">
              <div className="space-y-1.5">
                <FieldLabel>Qual o motivo principal da consulta?</FieldLabel>
                <Select disabled>
                  <SelectTrigger className={cn(inputClass, "w-full")}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Exame de rotina</SelectItem>
                    <SelectItem value="vision">Dificuldade de visão</SelectItem>
                    <SelectItem value="pain">Dor ou desconforto</SelectItem>
                    <SelectItem value="redness">Vermelhidão / irritação</SelectItem>
                    <SelectItem value="followup">Retorno / acompanhamento</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <FieldLabel required={false}>Descreva sua queixa com mais detalhes</FieldLabel>
                <Textarea placeholder="Descreva seus sintomas, há quanto tempo sente, frequência..." className={cn(inputClass, "h-24 resize-none")} disabled />
              </div>
            </motion.div>
          )}

          {/* Section 5 - Consentimento LGPD */}
          <SectionHeader icon={Shield} title="Consentimento e Autorização" number={5} open={sections.consent} onToggle={() => toggle("consent")} />
          {sections.consent && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pl-2">
              <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Checkbox disabled className="mt-0.5 h-4 w-4" />
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Autorizo o uso dos meus dados de saúde exclusivamente para fins de atendimento médico e acompanhamento de saúde pela plataforma Vision Lift, conforme a <strong className="text-foreground">Lei Geral de Proteção de Dados (LGPD)</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Checkbox disabled className="mt-0.5 h-4 w-4" />
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Autorizo o contato por WhatsApp e e-mail para informações sobre minha jornada de saúde e produtos relacionados.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Checkbox disabled className="mt-0.5 h-4 w-4" />
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Declaro que li e concordo com os <strong className="text-foreground">Termos de Uso</strong> e a <strong className="text-foreground">Política de Privacidade</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit preview */}
          <div className="pt-2 space-y-3">
            <Button disabled className="w-full h-12 rounded-xl text-[14px] font-semibold bg-accent text-accent-foreground opacity-60 cursor-not-allowed">
              Enviar Questionário
            </Button>
            <div className="flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/40">Protegido pela LGPD • Criptografia AES-256</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizPreviewModal;
