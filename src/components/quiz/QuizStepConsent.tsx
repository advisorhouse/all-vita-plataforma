import React from "react";
import { Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuizFormData } from "@/pages/quiz/PublicQuizPage";

interface Props {
  data: QuizFormData;
  update: (fields: Partial<QuizFormData>) => void;
}

const QuizStepConsent: React.FC<Props> = ({ data, update }) => (
  <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
    <div className="flex items-center gap-2.5 mb-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
        <Shield className="h-4 w-4 text-success" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground">Consentimento e Proteção de Dados</h2>
        <p className="text-[11px] text-muted-foreground">Em conformidade com a LGPD (Lei nº 13.709/2018)</p>
      </div>
    </div>

    {/* Consent 1 - Data usage */}
    <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Autorização 1</p>
      <button
        type="button"
        onClick={() => update({ consentDataUsage: !data.consentDataUsage })}
        className="flex items-start gap-3 w-full text-left"
      >
        <Checkbox checked={data.consentDataUsage} className="mt-0.5 h-4 w-4" />
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          Autorizo que meus dados possam ser utilizados para <strong className="text-foreground">pesquisas clínicas e científicas</strong>, 
          programas de prevenção e educação em saúde, e inclusão em grupos de informações relacionadas à área médica. 
          <span className="text-destructive font-medium"> *Obrigatório</span>
        </p>
      </button>
    </div>

    {/* Consent 2 - Contact channels */}
    <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Autorização 2 — Canais de contato</p>
      <p className="text-[11px] text-muted-foreground">Autorizo o contato por:</p>

      <div className="grid grid-cols-2 gap-2">
        {[
          { key: "consentWhatsapp" as const, label: "WhatsApp" },
          { key: "consentEmail" as const, label: "E-mail" },
          { key: "consentSms" as const, label: "SMS" },
          { key: "consentPhone" as const, label: "Ligações telefônicas" },
          { key: "consentSocial" as const, label: "Redes sociais" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => update({ [key]: !data[key] })}
            className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
              data[key] ? "border-accent bg-accent/5" : "border-border bg-secondary/20"
            }`}
          >
            <Checkbox checked={data[key]} className="h-4 w-4" />
            <span className="text-[12px] text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>

    <p className="text-[10px] text-muted-foreground/60 text-center">
      Seus dados não serão comercializados. Declaro que as informações prestadas são verdadeiras.
    </p>
  </div>
);

export default QuizStepConsent;
