import React from "react";
import { motion } from "framer-motion";
import {
  Coins, Gift, ShieldCheck, ArrowRight, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { useTenant } from "@/contexts/TenantContext";
import logoVisionLift from "@/assets/logo-vision-lift.png";

const PILLARS = [
  {
    icon: Link2,
    title: "Vínculo médico–paciente",
    desc: "Envie o quiz pré-consulta. O paciente preenche, autoriza LGPD e fica vinculado a você automaticamente.",
  },
  {
    icon: Coins,
    title: "VisionPoints Coin",
    desc: "Moeda interna da plataforma. Acumule pontos por vendas, quizzes e indicações — sem comissão direta.",
  },
  {
    icon: Gift,
    title: "Resgate como preferir",
    desc: "Troque pontos por Pix, produtos, cursos, congressos ou equipamentos na sua wallet médica.",
  },
  {
    icon: ShieldCheck,
    title: "Ético e transparente",
    desc: "Modelo baseado em pontos, sem cupons e sem vínculo com prescrição. Compliance LGPD completo.",
  },
];

const PartnerStart: React.FC = () => {
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg flex flex-col items-center text-center"
      >
        <img src={tenantLogo} alt={tenantName} className="h-8 w-auto mb-6" />

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Bem-vindo(a) ao {tenantName} Partners
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Plataforma para profissionais de saúde. Vincule pacientes, acumule VisionPoints Coin e resgate como preferir.
        </p>

        {/* Pillars */}
        <div className="mt-8 w-full space-y-3">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{pillar.title}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{pillar.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 w-full space-y-3"
        >
          <Button className="w-full gap-2" onClick={() => navigate("/partner/onboarding?redirect=/partner")}>
            Cadastrar meu CRM <ArrowRight className="h-4 w-4" />
          </Button>
          <button
            onClick={() => navigate("/")}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao hub
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PartnerStart;
