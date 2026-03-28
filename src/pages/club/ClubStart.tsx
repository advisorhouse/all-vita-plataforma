import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Sparkles, BookOpen, Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { useTenant } from "@/contexts/TenantContext";
import logoVisionLift from "@/assets/logo-vision-lift.png";

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Produtos com respaldo científico",
    desc: "Nutracêuticos desenvolvidos com bioativos de alta biodisponibilidade e eficácia comprovada.",
  },
  {
    icon: Gift,
    title: "Benefícios exclusivos de membro",
    desc: "Descontos progressivos, brindes surpresa e acesso antecipado a lançamentos.",
  },
  {
    icon: BookOpen,
    title: "Biblioteca de saúde e bem-estar",
    desc: "Conteúdos com especialistas sobre cuidados, nutrição e qualidade de vida.",
  },
  {
    icon: Sparkles,
    title: "Acompanhamento personalizado",
    desc: "Protocolo de uso guiado e lembretes para manter sua consistência diária.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

const ClubStart: React.FC = () => {
  const { navigate } = useTenantNavigation();
  const { currentTenant } = useTenant();
  const tenantName = currentTenant?.trade_name || currentTenant?.name || "Vision Lift";
  const tenantLogo = currentTenant?.logo_url || logoVisionLift;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16 relative">
      <div className="absolute top-4 right-4">
        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
          Modo demonstração
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg flex flex-col items-center text-center"
      >
        <img
          src={tenantLogo}
          alt={tenantName}
          className="h-10 w-auto mb-10 object-contain"
        />

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-tight">
          Bem-vindo ao {tenantName} Club
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground max-w-sm leading-relaxed">
          Sua jornada de saúde e bem-estar começa aqui. Conheça os benefícios reservados para você como membro.
        </p>
      </motion.div>

      <div className="w-full max-w-lg mt-10 space-y-3">
        {BENEFITS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-10 w-full max-w-lg space-y-3"
      >
        <Button
          className="w-full h-12 text-[15px] gap-2"
          onClick={() => navigate("/activate?redirect=/club")}
        >
          Ativar meu acesso
          <ArrowRight className="h-4 w-4" />
        </Button>
        <button
          onClick={() => navigate("/")}
          className="block mx-auto text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Voltar ao início
        </button>
      </motion.div>
    </div>
  );
};

export default ClubStart;
