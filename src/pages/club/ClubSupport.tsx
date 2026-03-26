import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, HelpCircle, Sun, Moon, CloudSun, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const } }),
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Bom dia", Icon: Sun };
  if (h < 18) return { text: "Boa tarde", Icon: CloudSun };
  return { text: "Boa noite", Icon: Moon };
};

const MEMBER_NAME = "Carlos";

const FAQ = [
  { q: "Quando meu pedido é enviado?", a: "Todo dia 15 de cada mês. Você recebe o código de rastreio por WhatsApp." },
  { q: "Posso pausar minha assinatura?", a: "Sim, por até 30 dias sem perder seu nível. Vá em Configurações." },
  { q: "Como subo de nível?", a: "Use o produto diariamente. Seu nível sobe com a consistência de uso." },
  { q: "Posso trocar meu produto?", a: "Sim! Na página Minha Assinatura, até o dia 10 do mês." },
  { q: "Como funciona a indicação?", a: "Compartilhe seu link. Quando alguém assinar, você ganha desconto no próximo ciclo." },
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

const ClubSupport: React.FC = () => {
  const greeting = getGreeting();
  const GreetingIcon = greeting.Icon;

  return (
    <div className="space-y-6 pb-12">
      {/* Saudação */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            {greeting.text}, {MEMBER_NAME}
          </h1>
          <GreetingIcon className="h-5 w-5 text-warning" />
        </div>
        <p className="text-[15px] text-muted-foreground mt-1">
          Estamos aqui para te ajudar.
        </p>
      </motion.div>

      {/* Contato direto */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 shrink-0">
              <MessageCircle className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Fale com a gente pelo WhatsApp</h3>
              <p className="text-[14px] text-muted-foreground mt-0.5">Segunda a sexta, das 9h às 18h. Respondemos rápido!</p>
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
              clube@visionlift.com.br
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
  );
};

export default ClubSupport;
