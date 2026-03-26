import React from "react";
import { CheckCircle, Heart } from "lucide-react";
import iconVisionLift from "@/assets/icon-vision-lift.png";

interface Props {
  patientName: string;
}

const QuizSuccessView: React.FC<Props> = ({ patientName }) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center px-4">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-card border-2 border-background flex items-center justify-center">
            <img src={iconVisionLift} alt="" className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-foreground">Tudo certo, {patientName.split(" ")[0]}!</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Seu questionário foi enviado com sucesso e seus dados estão vinculados ao seu médico.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-left">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Próximos passos</p>
        <div className="space-y-2">
          {[
            "Seu médico receberá suas informações antes da consulta",
            "Você receberá acesso ao Vision Lift Club",
            "Acompanhe sua jornada de saúde ocular na plataforma",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-accent">{i + 1}</span>
              </div>
              <p className="text-[12px] text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-muted-foreground/40">
        <Heart className="h-3 w-3" />
        <span className="text-[10px]">Vision Lift • Cuidando da sua visão</span>
      </div>
    </div>
  </div>
);

export default QuizSuccessView;
