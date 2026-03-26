import React from "react";
import { Pill } from "lucide-react";
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

const QuizStepMedications: React.FC<Props> = ({ data, update }) => (
  <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
    <div className="flex items-center gap-2.5 mb-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
        <Pill className="h-4 w-4 text-warning" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground">Medicações</h2>
        <p className="text-[11px] text-muted-foreground">Informe os medicamentos em uso</p>
      </div>
    </div>

    <div className="space-y-1.5">
      <QuizFieldLabel required={false}>Uso contínuo de medicamentos?</QuizFieldLabel>
      <Select
        value={data.continuousMedications ? "yes" : "no"}
        onValueChange={(v) => update({ continuousMedications: v === "yes" })}
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

    {data.continuousMedications && (
      <div className="space-y-1.5">
        <QuizFieldLabel>Quais medicamentos?</QuizFieldLabel>
        <Textarea
          value={data.medicationsDetail}
          onChange={(e) => update({ medicationsDetail: e.target.value })}
          placeholder="Liste os medicamentos em uso contínuo..."
          className="h-20 rounded-xl border-border bg-secondary/30 text-sm resize-none placeholder:text-muted-foreground/40"
        />
      </div>
    )}

    <div className="space-y-1.5">
      <QuizFieldLabel required={false}>Uso atual de colírios?</QuizFieldLabel>
      <Select
        value={data.usesEyeDrops ? "yes" : "no"}
        onValueChange={(v) => update({ usesEyeDrops: v === "yes" })}
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

    {data.usesEyeDrops && (
      <div className="space-y-1.5">
        <QuizFieldLabel>Quais colírios?</QuizFieldLabel>
        <Textarea
          value={data.eyeDropsDetail}
          onChange={(e) => update({ eyeDropsDetail: e.target.value })}
          placeholder="Liste os colírios em uso..."
          className="h-20 rounded-xl border-border bg-secondary/30 text-sm resize-none placeholder:text-muted-foreground/40"
        />
      </div>
    )}
  </div>
);

export default QuizStepMedications;
