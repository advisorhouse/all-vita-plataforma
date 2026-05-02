import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import {
  TrendingUp, Users, ShieldCheck, Repeat, Coins,
  Clock, Zap, Gift, CreditCard, GraduationCap, Ticket, Wrench,
  QrCode, Copy, Download, Share2, Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Helpers ─────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-muted-foreground/40">
          <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
        </svg>
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </Tooltip>
);

// ─── Greeting Icon ────────────────────────────────────────────
const GreetingIcon: React.FC = () => {
  const h = new Date().getHours();
  if (h < 12) {
    return (
      <motion.div
        className="relative flex h-7 w-7 items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--warning) / 0.25) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg viewBox="0 0 24 24" className="h-5 w-5 relative z-10">
          <circle cx="12" cy="12" r="5" fill="hsl(var(--warning))" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line key={angle} x1="12" y1="2" x2="12" y2="4.5" stroke="hsl(var(--warning))" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${angle} 12 12)`} />
          ))}
        </svg>
      </motion.div>
    );
  }
  if (h < 18) {
    return (
      <motion.span
        className="text-lg select-none"
        animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        style={{ transformOrigin: "70% 70%", display: "inline-block" }}
      >
        👋
      </motion.span>
    );
  }
  return (
    <motion.div
      className="relative flex h-7 w-7 items-center justify-center"
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.25, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 24 24" className="h-5 w-5 relative z-10">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="hsl(var(--accent))" />
      </svg>
    </motion.div>
  );
};

// ─── Component ───────────────────────────────────────────────
const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { user } = useAuth();

  const { data: partnerData } = useQuery({
    queryKey: ["partner-dashboard-data", currentTenant?.id, user?.id],
    queryFn: async () => {
      if (!currentTenant?.id || !user?.id) return null;

      const [profileRes, partnerRes, walletRes] = await Promise.all([
        supabase.from("profiles").select("first_name").eq("id", user.id).single(),
        supabase.from("partners").select("id, level").eq("user_id", user.id).eq("tenant_id", currentTenant.id).single(),
        supabase.from("vitacoins_wallet").select("balance, total_earned").eq("user_id", user.id).eq("tenant_id", currentTenant.id).maybeSingle(),
      ]);

      const partnerId = partnerRes.data?.id;
      let patientsCount = 0;
      if (partnerId) {
        const referralsRes = await supabase.from("referrals").select("id", { count: "exact", head: true }).eq("partner_id", partnerId);
        patientsCount = referralsRes.count || 0;
      }

      return {
        firstName: profileRes.data?.first_name || "Partner",
        level: partnerRes.data?.level || "Iniciante",
        balance: walletRes.data?.balance || 0,
        totalEarned: walletRes.data?.total_earned || 0,
        patientsCount
      };
    },
    enabled: !!currentTenant?.id && !!user?.id
  });

  const KPI_CARDS = [
    { label: "Pacientes Vinculados", value: partnerData?.patientsCount.toString() || "0", change: "+0", icon: Users, tip: "Pacientes vinculados ao seu quiz com assinatura ativa." },
    { label: "Taxa de Retenção", value: "100%", change: "+0%", icon: ShieldCheck, tip: "Percentual de pacientes que renovaram. Acima de 90% é excelente." },
    { label: "Recorrência Média", value: "0 meses", change: "+0", icon: Repeat, tip: "Tempo médio que seus pacientes permanecem ativos." },
    { label: "Vitacoins Total", value: (partnerData?.balance || 0).toLocaleString("pt-BR"), change: "+0%", icon: Coins, tip: "Total de Vitacoins acumulados.", accent: true },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* ═══ Greeting ═══ */}
        <motion.div id="dashboard-greeting" custom={-1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-foreground">
                  {(() => {
                    const h = new Date().getHours();
                    const greeting = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
                    return `${greeting}, ${partnerData?.firstName || "Partner"}`;
                  })()}
                </h1>
                <GreetingIcon />
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                  Partner {partnerData?.level}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Acompanhe seus pacientes vinculados e gerencie seus Vitacoins.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
              <Zap className="h-3 w-3 text-warning" />
              <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
              <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
            </div>
          </div>
        </motion.div>

        {/* ═══ ROW 1 — KPIs ═══ */}
        <motion.div id="dashboard-kpis" custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {KPI_CARDS.map(({ label, value, change, icon: Icon, tip, accent }) => (
              <Card key={label} className={accent ? "border-accent/20 shadow-sm bg-accent/5" : "border-border shadow-sm"}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-accent/10" : "bg-secondary"}`}>
                      <Icon className={`h-4 w-4 ${accent ? "text-accent" : "text-foreground"}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-accent">{change}</span>
                      <Tip text={tip} />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ ROW 2 — Wallet Médica ═══ */}
        <div className="grid grid-cols-12 gap-4">
           <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 space-y-3 h-full flex flex-col items-center justify-center text-center">
                 <p className="text-muted-foreground text-sm font-medium">Histórico de Performance</p>
                 <p className="text-muted-foreground/60 text-[11px] mt-1">Dados de crescimento serão exibidos assim que houver volume suficiente.</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="col-span-12 lg:col-span-4">
            <motion.div id="dashboard-wallet" custom={2} variants={fadeUp} initial="hidden" animate="visible" className="h-full">
              <Card className="relative border-accent/30 shadow-sm overflow-hidden h-full bg-gradient-to-br from-accent via-accent/90 to-accent/70">
                <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/5" />
                <CardContent className="relative z-10 p-5 flex flex-col justify-between h-full text-accent-foreground">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                          <Coins className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="text-[13px] font-semibold">Wallet Médica</h3>
                      </div>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">+0%</span>
                    </div>

                    <p className="text-[10px] text-accent-foreground/60 uppercase tracking-wider mt-3">Saldo Disponível</p>
                    <p className="text-[28px] font-bold tracking-tight">{(partnerData?.balance || 0).toLocaleString("pt-BR")} pts</p>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg bg-white/15 backdrop-blur-sm p-2.5">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="h-2.5 w-2.5 text-accent-foreground/60" />
                          <p className="text-[9px] text-accent-foreground/60 uppercase tracking-wider">Acumulado</p>
                        </div>
                        <p className="text-sm font-bold">{(partnerData?.totalEarned || 0).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate("/partner/revenue")}
                      className="w-full py-2 bg-white text-accent rounded-lg text-xs font-bold mt-2"
                    >
                      Resgatar Pontos
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PartnerDashboard;