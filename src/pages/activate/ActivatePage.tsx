import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ChevronLeft, Check, Lock,
  Gift, Percent, Glasses, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenantNavigation } from "@/hooks/useTenantNavigation";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import iconVisionLift from "@/assets/icon-vision-lift.png";
import product1Month from "@/assets/product-vision-lift-1month.png";
import product3Month from "@/assets/product-vision-lift-3month.png";
import product5Month from "@/assets/product-vision-lift-5month.png";
import { OnboardingHeader, OnboardingFooter } from "@/components/onboarding/OnboardingLayout";

type Step = "welcome" | "register" | "confirmation";

const products = [
  { id: "1month", label: "1 Mês", desc: "30 cápsulas", img: product1Month },
  { id: "3month", label: "3 Meses", desc: "90 cápsulas", img: product3Month },
  { id: "5month", label: "5 Meses", desc: "150 cápsulas", img: product5Month },
];

const MEMBER_REWARDS = [
  { icon: Gift, text: "Kit Bem-Estar Visual no 1º mês", accent: true },
  { icon: Percent, text: "15% de desconto no 2º mês", accent: false },
  { icon: Glasses, text: "Óculos de sol premium no 4º mês", accent: false },
  { icon: Heart, text: "Caixa surpresa de saúde no 6º mês", accent: false },
];

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

const ActivatePage: React.FC = () => {
  const baseNavigate = useNavigate();
  const { navigate: tenantNavigate, tenantParam } = useTenantNavigation();
  const { currentTenant, isLoading } = useTenant();
  const [step, setStep] = useState<Step>("welcome");
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [product, setProduct] = useState("");

  const stepOrder: Step[] = ["welcome", "register", "confirmation"];
  const currentIndex = stepOrder.indexOf(step);

  const goTo = (next: Step) => {
    const ni = stepOrder.indexOf(next);
    setDirection(ni > currentIndex ? 1 : -1);
    setStep(next);
  };

  const canProceed = name.trim().length > 1 && email.includes("@") && password.length >= 6 && product !== "";

  const handleActivate = async () => {
    if (!currentTenant) {
      toast.error("Tenant não identificado. Acesse via link do tenant.");
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }

      if (!signUpData.session) {
        // Email confirmation required — still create tenant records
        toast.info("Verifique seu email para confirmar a conta.");
      }

      // 2. Call tenant-signup edge function
      if (signUpData.session) {
        const selectedProduct = products.find((p) => p.id === product);
        const { error: fnError } = await supabase.functions.invoke("tenant-signup", {
          body: {
            tenant_id: currentTenant.id,
            role: "client",
            metadata: {
              product_label: selectedProduct?.label,
              product_selection: product,
              source: "club_activation",
            },
          },
        });

        if (fnError) {
          console.error("tenant-signup error:", fnError);
          toast.error("Erro ao configurar acesso. Tente novamente.");
          setLoading(false);
          return;
        }
      }

      goTo("confirmation");
    } catch (err) {
      console.error("Activation error:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const SecurityFooter = () => (
    <div className="flex items-center justify-center gap-1.5 pt-6">
      <Lock className="h-3 w-3 text-muted-foreground/50" />
      <span className="text-[11px] text-muted-foreground/50">
        Seus dados são protegidos.
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {step === "register" && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => goTo("welcome")}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <div className="h-1 flex-1 rounded-full bg-accent" />
              <div className="h-1 flex-1 rounded-full bg-secondary" />
            </div>
            <span className="text-[12px] text-muted-foreground font-medium">1/2</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-md"
          >
            {/* ===== WELCOME ===== */}
            {step === "welcome" && (
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <OnboardingHeader 
                    logoUrl={currentTenant?.logo_url} 
                    tradeName={currentTenant?.trade_name} 
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="space-y-4"
                >
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Bem-vinda ao
                    <br />
                    {currentTenant?.trade_name || currentTenant?.name || "Vision Lift"} Club.
                  </h1>
                  <p className="text-muted-foreground text-lg font-light max-w-xs mx-auto">
                    Ative seu acesso e ganhe prêmios a cada mês.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="space-y-3 text-left"
                >
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">
                    O que você ganha como membro
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {MEMBER_REWARDS.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                        >
                          <Card className={`border shadow-sm h-full ${i === 0 ? "border-accent/30 bg-accent/5" : "border-border"}`}>
                            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${i === 0 ? "bg-accent/10" : "bg-secondary"}`}>
                                <Icon className={`h-5 w-5 ${i === 0 ? "text-accent" : "text-foreground"}`} />
                              </div>
                              <p className="text-sm font-medium text-foreground leading-snug">{item.text}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="space-y-3 pt-2"
                >
                  <Button
                    onClick={() => goTo("register")}
                    className="w-full h-16 bg-foreground hover:bg-foreground/90 text-background rounded-2xl text-lg font-medium"
                  >
                    Ativar meu acesso
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <p className="text-sm text-muted-foreground pt-1">Leva menos de 2 minutos.</p>
                  <Button
                    variant="ghost"
                    onClick={() => tenantNavigate("/auth/login?redirect=/club")}
                    className="w-full h-12 text-muted-foreground text-base font-normal rounded-xl"
                  >
                    Já tenho conta
                  </Button>
                </motion.div>

                <OnboardingFooter tenantName={currentTenant?.trade_name} />
              </div>
            )}

            {/* ===== REGISTER ===== */}
            {step === "register" && (
              <div className="space-y-8 pt-16">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Crie sua conta
                  </h2>
                  <p className="text-muted-foreground text-base font-light">
                    Preencha seus dados e escolha seu produto.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="h-14 rounded-xl border-border bg-secondary/50 text-base placeholder:text-muted-foreground/40 focus:border-muted-foreground/30 focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu melhor e-mail"
                      className="h-14 rounded-xl border-border bg-secondary/50 text-base placeholder:text-muted-foreground/40 focus:border-muted-foreground/30 focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Senha</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="h-14 rounded-xl border-border bg-secondary/50 text-base placeholder:text-muted-foreground/40 focus:border-muted-foreground/30 focus:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Qual produto você comprou?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setProduct(p.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          product === p.id
                            ? "border-foreground bg-secondary shadow-sm"
                            : "border-border bg-card hover:border-muted-foreground/20"
                        }`}
                      >
                        <img src={p.img} alt={p.label} className="h-14 w-14 object-contain" />
                        <div className="text-center">
                          <p className={`text-sm font-medium ${product === p.id ? "text-foreground" : "text-muted-foreground"}`}>
                            {p.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleActivate}
                  disabled={!canProceed || loading}
                  className="w-full h-16 bg-foreground hover:bg-foreground/90 text-background rounded-2xl text-lg font-medium disabled:opacity-30"
                >
                  {loading ? "Ativando..." : "Ativar meu acesso"}
                  {!loading && <ArrowRight className="h-5 w-5 ml-2" />}
                </Button>

                <OnboardingFooter tenantName={currentTenant?.trade_name} />
              </div>
            )}

            {/* ===== CONFIRMATION ===== */}
            {step === "confirmation" && (
              <div className="space-y-8 pt-8 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  >
                    <img src={currentTenant?.logo_url || iconVisionLift} alt={currentTenant?.trade_name || "Logo"} className="h-14 w-auto object-contain mx-auto" />
                  </motion.div>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                    Tudo pronto!
                  </h2>
                  <p className="text-muted-foreground text-lg font-light">
                    Seu acesso está ativo. Seu primeiro prêmio já está disponível.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Card className="border border-accent/20 bg-accent/5 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                          <Gift className="h-7 w-7 text-accent" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-accent uppercase tracking-wider">Prêmio do mês 1</p>
                          <p className="text-lg font-semibold text-foreground">Kit Bem-Estar Visual</p>
                          <p className="text-sm text-muted-foreground">Enviado junto com seu produto</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button
                    onClick={() => tenantNavigate("/club")}
                    className="w-full h-16 bg-foreground hover:bg-foreground/90 text-background rounded-2xl text-lg font-medium"
                  >
                    Ver meus prêmios
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>

                <OnboardingFooter tenantName={currentTenant?.trade_name} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivatePage;
