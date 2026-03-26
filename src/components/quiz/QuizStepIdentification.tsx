import React from "react";
import { User, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { QuizFormData } from "@/pages/quiz/PublicQuizPage";
import QuizFieldLabel from "./QuizFieldLabel";

const inputClass = "h-11 rounded-xl border-border bg-secondary/30 text-sm placeholder:text-muted-foreground/40 focus:border-accent/40 focus:ring-0";

interface Props {
  data: QuizFormData;
  update: (fields: Partial<QuizFormData>) => void;
}

const QuizStepIdentification: React.FC<Props> = ({ data, update }) => (
  <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
    <div className="flex items-center gap-2.5 mb-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
        <User className="h-4 w-4 text-accent" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground">Identificação do Paciente</h2>
        <p className="text-[11px] text-muted-foreground">Preencha seus dados pessoais</p>
      </div>
    </div>

    <div className="space-y-1.5">
      <QuizFieldLabel>Nome Completo</QuizFieldLabel>
      <Input
        value={data.fullName}
        onChange={(e) => update({ fullName: e.target.value })}
        placeholder="Seu nome completo"
        className={inputClass}
      />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <QuizFieldLabel>CPF</QuizFieldLabel>
        <Input
          value={data.cpf}
          onChange={(e) => update({ cpf: e.target.value })}
          placeholder="000.000.000-00"
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <QuizFieldLabel>Idade</QuizFieldLabel>
        <Input
          value={data.age}
          onChange={(e) => update({ age: e.target.value })}
          placeholder="Ex: 45"
          type="number"
          className={inputClass}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <QuizFieldLabel icon={Phone}>Telefone / WhatsApp</QuizFieldLabel>
        <Input
          value={data.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="(00) 00000-0000"
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <QuizFieldLabel icon={Mail}>E-mail</QuizFieldLabel>
        <Input
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="seu@email.com"
          type="email"
          className={inputClass}
        />
      </div>
    </div>

    <div className="space-y-1.5">
      <QuizFieldLabel required={false}>Sexo</QuizFieldLabel>
      <Select value={data.sex} onValueChange={(v) => update({ sex: v })}>
        <SelectTrigger className={`${inputClass} w-full`}>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="masculino">Masculino</SelectItem>
          <SelectItem value="feminino">Feminino</SelectItem>
          <SelectItem value="prefere_nao_informar">Prefere não informar</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default QuizStepIdentification;
