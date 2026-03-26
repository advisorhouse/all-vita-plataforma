import React from "react";
import { Heart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { QuizFormData } from "@/pages/quiz/PublicQuizPage";
import QuizFieldLabel from "./QuizFieldLabel";

const CONDITIONS = [
  "Diabetes Mellitus",
  "Hipertensão Arterial (HAS)",
  "Glaucoma",
  "Doença da Retina",
  "Catarata",
  "Alergias medicamentosas",
];

interface Props {
  data: QuizFormData;
  update: (fields: Partial<QuizFormData>) => void;
}

const QuizStepHealth: React.FC<Props> = ({ data, update }) => {
  const toggle = (condition: string) => {
    const current = data.healthConditions;
    update({
      healthConditions: current.includes(condition)
        ? current.filter((c) => c !== condition)
        : [...current, condition],
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
          <Heart className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Histórico de Saúde</h2>
          <p className="text-[11px] text-muted-foreground">Marque as condições que se aplicam</p>
        </div>
      </div>

      <div className="space-y-2">
        <QuizFieldLabel required={false}>Condições de saúde</QuizFieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors text-left ${
                data.healthConditions.includes(c)
                  ? "border-accent bg-accent/5"
                  : "border-border bg-secondary/20 hover:bg-secondary/40"
              }`}
            >
              <Checkbox checked={data.healthConditions.includes(c)} className="h-4 w-4" />
              <span className="text-[12px] text-foreground">{c}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <QuizFieldLabel required={false}>Outras doenças</QuizFieldLabel>
        <Textarea
          value={data.otherConditions}
          onChange={(e) => update({ otherConditions: e.target.value })}
          placeholder="Descreva outras condições relevantes..."
          className="h-20 rounded-xl border-border bg-secondary/30 text-sm resize-none placeholder:text-muted-foreground/40"
        />
      </div>
    </div>
  );
};

export default QuizStepHealth;
