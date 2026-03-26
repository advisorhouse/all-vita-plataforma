import React from "react";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizFormData } from "@/pages/quiz/PublicQuizPage";
import productImage from "@/assets/product-vision-lift-original.png";

interface Props {
  data: QuizFormData;
  onSubmit: () => void;
  submitting: boolean;
}

const QuizStepCheckout: React.FC<Props> = ({ data, onSubmit, submitting }) => (
  <div className="space-y-4">
    {/* Product card */}
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <ShoppingBag className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Produto Recomendado</h2>
          <p className="text-[11px] text-muted-foreground">Indicação personalizada do seu profissional de saúde</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="h-24 w-24 rounded-xl bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
          <img src={productImage} alt="Produto recomendado" className="h-20 w-20 object-contain" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Assinatura mensal</p>
          <p className="text-2xl font-bold text-foreground">
            R$ 149<span className="text-sm font-normal text-muted-foreground">,90/mês</span>
          </p>
          <div className="flex items-center gap-1.5 text-success">
            <Check className="h-3 w-3" />
            <span className="text-[11px] font-medium">Desconto aplicado via seu profissional</span>
          </div>
        </div>
      </div>
    </div>

    {/* Summary */}
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Resumo do pedido</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Produto recomendado (1x)</span>
          <span className="text-muted-foreground line-through">R$ 199,90</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-success font-medium">Desconto profissional (25%)</span>
          <span className="text-success font-medium">-R$ 50,00</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="text-sm font-bold text-foreground">Total mensal</span>
          <span className="text-lg font-bold text-foreground">R$ 149,90</span>
        </div>
      </div>
    </div>

    {/* Patient info summary */}
    <div className="rounded-xl bg-secondary/30 p-3 space-y-1">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Dados do paciente</p>
      <p className="text-xs text-foreground">{data.fullName}</p>
      <p className="text-[11px] text-muted-foreground">{data.email} • {data.phone}</p>
    </div>

    {/* CTA */}
    <Button
      onClick={onSubmit}
      disabled={submitting}
      className="w-full h-12 rounded-xl text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4 mr-2" />
          Finalizar e Assinar
        </>
      )}
    </Button>

    <p className="text-[10px] text-center text-muted-foreground/50">
      O pagamento será processado de forma segura. Você pode cancelar a qualquer momento.
    </p>
  </div>
);

export default QuizStepCheckout;
