import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Handshake, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoVisionLift from "@/assets/logo-vision-lift.png";

const portals = [
  {
    title: "Vision Lift Club",
    description: "Área do assinante. Jornada, assinatura, conteúdo e acompanhamento.",
    href: "/club/start",
    icon: Users,
    cta: "Explorar experiência",
  },
  {
    title: "Vision Partner",
    description: "Área do parceiro. Formação, catálogo, comissões e crescimento recorrente.",
    href: "/partner/start",
    icon: Handshake,
    cta: "Explorar experiência",
  },
  {
    title: "Vision Core",
    description: "Administração. Gestão completa da operação, dados e estratégia.",
    href: "/core/select-role",
    icon: Settings,
    cta: "Acessar administração",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16 relative">
      {/* Demo badge */}
      <div className="absolute top-4 right-4">
        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
          Modo demonstração
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-3xl flex flex-col items-center text-center"
      >
        {/* Logo */}
        <img src={logoVisionLift} alt="Vision Lift" className="h-10 w-auto mb-6" />

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Vision Lift Platform
        </h1>

        {/* Institutional paragraph */}
        <p className="mt-5 max-w-[720px] text-[14px] sm:text-[15px] leading-relaxed text-muted-foreground">
          Vision Lift Platform é o ecossistema digital que conecta clientes, parceiros e administração
          em uma única infraestrutura inteligente. A plataforma organiza a jornada de longevidade visual
          dos assinantes, estrutura o crescimento recorrente dos parceiros e oferece à gestão uma visão
          completa de dados, retenção e performance.
        </p>

        {/* Subtitle */}
        <p className="mt-8 text-sm text-muted-foreground/70">
          Selecione o ambiente para continuar.
        </p>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-3 w-full mt-8">
          {portals.map((portal, i) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={portal.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              >
                <Link to={portal.href} className="block h-full">
                  <Card className="border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all h-full">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground">{portal.title}</h3>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                          {portal.description}
                        </p>
                      </div>
                      <Button variant="outline" className="w-full mt-auto text-[13px]" tabIndex={-1}>
                        {portal.cta}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Proposal links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 flex gap-3"
      >
        <Link to="/proposta">
          <Button variant="outline" size="sm" className="gap-2 text-[13px]">
            <FileText className="h-4 w-4" />
            Proposta Plataforma
          </Button>
        </Link>
        <Link to="/proposta-site">
          <Button variant="outline" size="sm" className="gap-2 text-[13px]">
            <FileText className="h-4 w-4" />
            Proposta Site
          </Button>
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-14 text-[11px] text-muted-foreground/40"
      >
        Vision Lift Platform · Ecossistema completo
      </motion.p>
    </div>
  );
};

export default Index;
