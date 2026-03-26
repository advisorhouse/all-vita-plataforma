import React from "react";
import { Stethoscope } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { QuizFormData } from "@/pages/quiz/PublicQuizPage";
import QuizFieldLabel from "./QuizFieldLabel";

interface Props {
  data: QuizFormData;
  update: (fields: Partial<QuizFormData>) => void;
}

const QuizStepOphthalmology: React.FC<Props> = ({ data, update }) => (
  <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
    <div className="flex items-center gap-2.5 mb-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
        <Stethoscope className="h-4 w-4 text-accent" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground">Histórico Especializado</h2>
        <p className="text-[11px] text-muted-foreground">Informações relevantes para o seu médico</p>
      </div>
    </div>

    <div className="space-y-1.5">
      <QuizFieldLabel required={false}>Já realizou cirurgias relacionadas à especialidade?</QuizFieldLabel>
      <Select
        value={data.hadEyeSurgery ? "yes" : "no"}
        onValueChange={(v) => update({ hadEyeSurgery: v === "yes" })}
      >
        <SelectTrigger className="h-11 rounded-xl border-border bg-secondary/30 text-sm w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no">Não</SelectItem>
          <SelectItem value="yes">Sim</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {data.hadEyeSurgery && (
      <div className="space-y-1.5">
        <QuizFieldLabel>Qual(is) procedimento(s)?</QuizFieldLabel>
        <Textarea
          value={data.surgeryDetail}
          onChange={(e) => update({ surgeryDetail: e.target.value })}
          placeholder="Descreva os procedimentos realizados..."
          className="h-20 rounded-xl border-border bg-secondary/30 text-sm resize-none placeholder:text-muted-foreground/40"
        />
      </div>
    )}

    <div className="space-y-1.5">
      <QuizFieldLabel required={false}>Já sofreu algum trauma relevante na área?</QuizFieldLabel>
      <Select
        value={data.hadEyeTrauma ? "yes" : "no"}
        onValueChange={(v) => update({ hadEyeTrauma: v === "yes" })}
      >
        <SelectTrigger className="h-11 rounded-xl border-border bg-secondary/30 text-sm w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no">Não</SelectItem>
          <SelectItem value="yes">Sim</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default QuizStepOphthalmology;
