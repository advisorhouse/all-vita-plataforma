import React from "react";
import { AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { QuizFormData } from "@/pages/quiz/PublicQuizPage";
import QuizFieldLabel from "./QuizFieldLabel";

const REASONS = [
  "Prevenção e check-up",
  "Queixa ou sintoma específico",
  "Acompanhamento de tratamento",
  "Avaliação pré-procedimento",
  "Segunda opinião médica",
  "Indicação de outro profissional",
  "Interesse em produto/tratamento",
  "Renovação de receita",
];

interface Props {
  data: QuizFormData;
  update: (fields: Partial<QuizFormData>) => void;
}

const QuizStepReason: React.FC<Props> = ({ data, update }) => (
  <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
    <div className="flex items-center gap-2.5 mb-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
        <AlertCircle className="h-4 w-4 text-warning" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground">Motivo da Consulta</h2>
        <p className="text-[11px] text-muted-foreground">Selecione a principal razão</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {REASONS.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => update({ consultationReason: r })}
          className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors text-left ${
            data.consultationReason === r
              ? "border-accent bg-accent/5"
              : "border-border bg-secondary/20 hover:bg-secondary/40"
          }`}
        >
          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
            data.consultationReason === r ? "border-accent" : "border-muted-foreground/30"
          }`}>
            {data.consultationReason === r && <div className="h-2 w-2 rounded-full bg-accent" />}
          </div>
          <span className="text-[12px] text-foreground">{r}</span>
        </button>
      ))}
    </div>

    <div className="space-y-1.5">
      <QuizFieldLabel required={false}>Outro motivo / detalhes adicionais</QuizFieldLabel>
      <Textarea
        value={data.otherReason}
        onChange={(e) => update({ otherReason: e.target.value })}
        placeholder="Descreva seus sintomas, há quanto tempo sente, frequência..."
        className="h-24 rounded-xl border-border bg-secondary/30 text-sm resize-none placeholder:text-muted-foreground/40"
      />
    </div>
  </div>
);

export default QuizStepReason;
