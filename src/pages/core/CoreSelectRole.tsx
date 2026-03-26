import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Users, Eye, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logoVisionLift from "@/assets/logo-vision-lift.png";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const ROLES = [
  {
    key: "master",
    icon: Crown,
    label: "Master Admin",
    desc: "Acesso global total à plataforma.",
    href: "/core",
  },
  {
    key: "partner_mgr",
    icon: Users,
    label: "Partner Manager",
    desc: "Gestão de partners e performance.",
    href: "/core",
  },
  {
    key: "client_mgr",
    icon: Eye,
    label: "Client Manager",
    desc: "Gestão de clientes e retenção.",
    href: "/core/customers",
  },
  {
    key: "content_mgr",
    icon: BookOpen,
    label: "Content Manager",
    desc: "Conteúdo, formação e materiais.",
    href: "/core",
  },
];

const CoreSelectRole: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Demo badge */}
      <div className="absolute top-4 right-4">
        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
          Modo demonstração
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-10"
      >
        <img src={logoVisionLift} alt="Vision Lift" className="h-8 w-auto mb-5" />
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground text-center">
          Vision Core
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground text-center">
          Selecione o nível de acesso para continuar.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 w-full max-w-lg">
        {ROLES.map((role, i) => {
          const Icon = role.icon;
          return (
            <motion.div key={role.key} custom={i} variants={fadeUp} initial="hidden" animate="visible">
              <button
                onClick={() => navigate(role.href)}
                className="w-full text-left"
              >
                <Card className="border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
                  <CardContent className="p-5 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{role.label}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{role.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => navigate("/")}
        className="mt-8 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Voltar ao hub
      </motion.button>
    </div>
  );
};

export default CoreSelectRole;
