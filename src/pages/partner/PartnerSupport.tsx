import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, HelpCircle, ChevronDown, Zap, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const } }),
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipUI>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <Info className="h-3.5 w-3.5 text-muted-foreground/40" />
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </TooltipUI>
);

const FAQ = [
  { q: "Como funciona o vínculo com pacientes?", a: "Você compartilha seu link exclusivo do Quiz Pré-Consulta. O paciente preenche, autoriza LGPD e fica vinculado automaticamente ao seu cadastro. Toda compra futura gera VisionPoints para você." },
  { q: "O que são VisionPoints?", a: "VisionPoints é a moeda interna da plataforma. Você acumula pontos automaticamente por indicações de pacientes, quizzes preenchidos e campanhas especiais. Pode resgatar por Pix, produtos, cursos, congressos ou equipamentos." },
  { q: "Como o paciente faz a compra?", a: "Após preencher o quiz, o paciente recebe o link de compra e escolhe seu plano de tratamento (1, 3, 5 ou 10 meses). Toda a compra e acompanhamento acontecem pela plataforma." },
  { q: "Quando meus VisionPoints são liberados?", a: "Os pontos ficam em carência por 30 dias após a venda. Depois, são liberados automaticamente na sua Wallet Médica para resgate." },
  { q: "O que acontece se outro médico enviar o quiz para meu paciente?", a: "O modelo é Último Click. Se o paciente preencher um novo quiz de outro médico, o vínculo anterior é desativado e os pontos futuros passam para o novo médico ativo." },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/30"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-foreground leading-snug">{q}</p>
        <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed">{a}</p>
      )}
    </button>
  );
};

const PartnerSupport: React.FC = () => {
  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground">Suporte</h1>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Estamos aqui para te ajudar. Canal exclusivo para Partners.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
            <Zap className="h-3 w-3 text-warning" />
            <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
            <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
          </div>
        </div>
      </motion.div>

      {/* Contato direto */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 shrink-0">
              <MessageCircle className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Canal exclusivo do Partner</h3>
              <p className="text-[14px] text-muted-foreground mt-0.5">Suporte prioritário via WhatsApp, de segunda a sexta, das 9h às 18h.</p>
            </div>
            <Button size="lg" className="rounded-xl text-[15px] w-full sm:w-auto">
              Abrir WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary shrink-0">
              <Mail className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Prefere e-mail?</h3>
              <p className="text-[14px] text-muted-foreground mt-0.5">Resposta em até 24 horas úteis.</p>
            </div>
            <Button variant="outline" size="lg" className="rounded-xl text-[15px] w-full sm:w-auto">
              parceiros@visionlift.com.br
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">Dúvidas Frequentes</h2>
        </div>
        <div className="space-y-2">
          {FAQ.map(({ q, a }) => (
            <FaqItem key={q} q={q} a={a} />
          ))}
        </div>
      </motion.div>
    </div>
    </TooltipProvider>
  );
};

export default PartnerSupport;
