import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, Coins, CheckCircle2, Clock,
  ChevronRight, Stethoscope, TrendingUp, AlertTriangle,
  Copy, Share2, Smartphone, Link2, Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RegisterPartnerNetworkModal } from "@/components/partner/RegisterPartnerNetworkModal";

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

// ─── Data ────────────────────────────────────────────────────
const REFERRAL_LINK = "https://visionlift.com.br/partner/convite/hogv-100";

interface ReferredPartner {
  name: string;
  initials: string;
  specialty: string;
  crm: string;
  status: "active" | "onboarding" | "inactive";
  joinedDate: string;
  totalPatients: number;
  activePatients: number;
  hasQuizLink: boolean;
  totalPurchases: number;
  totalRevenue: number;
  pointsGenerated: number;
  yourShare: number;
}

const REFERRED_PARTNERS: ReferredPartner[] = [
  {
    name: "Dr. Carlos Mendes",
    initials: "CM",
    specialty: "Oftalmologia",
    crm: "CRM/MG 54321",
    status: "active",
    joinedDate: "Out/25",
    totalPatients: 18,
    activePatients: 15,
    hasQuizLink: true,
    totalPurchases: 42,
    totalRevenue: 18_732,
    pointsGenerated: 18_732,
    yourShare: 1_873,
  },
  {
    name: "Dra. Fernanda Alves",
    initials: "FA",
    specialty: "Geriatria",
    crm: "CRM/MG 67890",
    status: "active",
    joinedDate: "Nov/25",
    totalPatients: 12,
    activePatients: 10,
    hasQuizLink: true,
    totalPurchases: 28,
    totalRevenue: 12_488,
    pointsGenerated: 12_488,
    yourShare: 1_249,
  },
  {
    name: "Dr. Bruno Oliveira",
    initials: "BO",
    specialty: "Clínica Geral",
    crm: "CRM/MG 11223",
    status: "active",
    joinedDate: "Dez/25",
    totalPatients: 8,
    activePatients: 7,
    hasQuizLink: true,
    totalPurchases: 15,
    totalRevenue: 6_693,
    pointsGenerated: 6_693,
    yourShare: 669,
  },
  {
    name: "Dra. Juliana Costa",
    initials: "JC",
    specialty: "Oftalmologia",
    crm: "CRM/MG 33445",
    status: "onboarding",
    joinedDate: "Fev/26",
    totalPatients: 0,
    activePatients: 0,
    hasQuizLink: false,
    totalPurchases: 0,
    totalRevenue: 0,
    pointsGenerated: 0,
    yourShare: 0,
  },
  {
    name: "Dr. Marcos Santos",
    initials: "MS",
    specialty: "Nutrologia",
    crm: "CRM/MG 55667",
    status: "inactive",
    joinedDate: "Set/25",
    totalPatients: 3,
    activePatients: 0,
    hasQuizLink: true,
    totalPurchases: 5,
    totalRevenue: 2_490,
    pointsGenerated: 2_490,
    yourShare: 249,
  },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  active: { label: "Ativo", cls: "bg-accent/10 text-accent" },
  onboarding: { label: "Cadastrando", cls: "bg-warning/10 text-warning" },
  inactive: { label: "Inativo", cls: "bg-destructive/10 text-destructive" },
};

const PartnerReferredPartners: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalReferred = REFERRED_PARTNERS.length;
  const totalActive = REFERRED_PARTNERS.filter(p => p.status === "active").length;
  const totalYourPoints = REFERRED_PARTNERS.reduce((sum, p) => sum + p.yourShare, 0);
  const totalPatientsFromNetwork = REFERRED_PARTNERS.reduce((sum, p) => sum + p.activePatients, 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMessage = encodeURIComponent(
    `Olá, colega! Conheça o Vision Lift Partners — uma plataforma de pontos para profissionais de saúde. Cadastre-se pelo meu link: ${REFERRAL_LINK}`
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* Header */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-foreground">Parceiros Indicados</h1>
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                  {totalReferred} indicados
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Acompanhe os colegas que você indicou e os pontos gerados pela rede deles.
              </p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl h-10 px-5 text-[13px] font-semibold gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Convidar Colega
            </Button>
          </div>
        </motion.div>

        <RegisterPartnerNetworkModal open={isModalOpen} onOpenChange={setIsModalOpen} />

        {/* KPIs */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Parceiros Indicados", value: totalReferred.toString(), icon: UserPlus, tip: "Total de colegas que você indicou para a plataforma." },
              { label: "Ativos", value: totalActive.toString(), icon: Users, tip: "Parceiros indicados que estão ativos e com pacientes.", accent: true },
              { label: "Pacientes da Rede", value: totalPatientsFromNetwork.toString(), icon: Stethoscope, tip: "Total de pacientes ativos dos parceiros que você indicou." },
              { label: "Seus Pontos de Rede", value: totalYourPoints.toLocaleString("pt-BR"), icon: Coins, tip: "Vitacoins que você ganhou a partir das vendas dos parceiros indicados (10% dos pontos deles).", accent: true },
            ].map(({ label, value, icon: Icon, tip, accent }) => (
              <Card key={label} className={accent ? "border-accent/20 shadow-sm bg-accent/5" : "border-border shadow-sm"}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-accent/10" : "bg-secondary"}`}>
                      <Icon className={`h-4 w-4 ${accent ? "text-accent" : "text-foreground"}`} strokeWidth={1.5} />
                    </div>
                    <Tip text={tip} />
                  </div>
                  <p className="text-xl font-bold text-foreground">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Invite CTA */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="relative overflow-hidden border-accent/30 shadow-sm bg-gradient-to-br from-accent via-accent/90 to-accent/70">
            <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
            <CardContent className="relative z-10 p-6 text-accent-foreground">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-5 w-5" />
                <h2 className="text-[15px] font-bold">Indique um colega médico</h2>
              </div>
              <p className="text-[12px] text-accent-foreground/70 mb-4 max-w-lg">
                Quando um colega que você indicou cadastra pacientes e gera vendas, <strong className="text-accent-foreground">você recebe 10% dos pontos dele automaticamente</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/20">
                  <Link2 className="h-4 w-4 text-accent-foreground/50 shrink-0" />
                  <span className="text-[12px] text-accent-foreground/80 truncate font-mono">{REFERRAL_LINK}</span>
                </div>
                <Button onClick={handleCopy} className="rounded-xl h-10 px-5 text-[13px] font-semibold bg-white text-accent hover:bg-white/90 gap-2 shrink-0">
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
                <a href={`https://wa.me/?text=${shareMessage}`} target="_blank" rel="noopener noreferrer">
                  <Button className="rounded-xl h-10 px-5 text-[13px] font-semibold bg-[hsl(142,70%,49%)] hover:bg-[hsl(142,70%,42%)] text-white gap-2 w-full sm:w-auto">
                    <Smartphone className="h-4 w-4" /> WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How it works */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-[13px] font-semibold text-foreground mb-3">Como funciona a rede de indicações</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { step: "1", title: "Você indica", desc: "Envie o link para um colega médico se cadastrar na plataforma.", icon: Share2 },
                  { step: "2", title: "Colega vende", desc: "O médico indicado cadastra pacientes via quiz e gera vendas normalmente.", icon: Stethoscope },
                  { step: "3", title: "Você ganha", desc: "A cada venda do paciente dele, você recebe 10% dos pontos gerados automaticamente.", icon: Coins },
                ].map(({ step, title, desc, icon: Icon }) => (
                  <div key={step} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent text-[12px] font-bold">
                      {step}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-foreground">{title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Partners Table */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-foreground">Detalhamento por Parceiro</h3>
                <Tip text="Visão detalhada de cada parceiro indicado, seus pacientes e pontos gerados para você." />
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">Parceiro</TableHead>
                      <TableHead className="text-[11px]">Status</TableHead>
                      <TableHead className="text-[11px] text-center">Quiz Ativo</TableHead>
                      <TableHead className="text-[11px] text-right">Pacientes</TableHead>
                      <TableHead className="text-[11px] text-right">Compras</TableHead>
                      <TableHead className="text-[11px] text-right">Pontos Dele</TableHead>
                      <TableHead className="text-[11px] text-right">Seus Pontos (10%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {REFERRED_PARTNERS.map((p) => {
                      const st = statusConfig[p.status];
                      return (
                        <TableRow key={p.crm}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-foreground">
                                {p.initials}
                              </div>
                              <div>
                                <p className="text-[12px] font-medium text-foreground">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground">{p.specialty} • {p.crm}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", st.cls)}>
                              {st.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {p.hasQuizLink ? (
                              <CheckCircle2 className="h-4 w-4 text-accent mx-auto" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-[12px] font-semibold text-foreground">{p.activePatients}</span>
                            <span className="text-[10px] text-muted-foreground">/{p.totalPatients}</span>
                          </TableCell>
                          <TableCell className="text-right text-[12px] text-foreground font-medium">
                            {p.totalPurchases}
                          </TableCell>
                          <TableCell className="text-right text-[12px] text-muted-foreground">
                            {p.pointsGenerated.toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-[12px] font-bold text-accent">
                              +{p.yourShare.toLocaleString("pt-BR")}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-[12px] text-muted-foreground">Total de pontos da rede de indicações:</span>
                </div>
                <span className="text-[15px] font-bold text-accent">
                  +{totalYourPoints.toLocaleString("pt-BR")} pts
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alert for inactive */}
        {REFERRED_PARTNERS.some(p => p.status === "inactive") && (
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border-warning/30 shadow-sm bg-warning/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-foreground">Parceiro inativo na rede</p>
                  <p className="text-[11px] text-muted-foreground">
                    {REFERRED_PARTNERS.filter(p => p.status === "inactive").map(p => p.name).join(", ")} está inativo. Entre em contato para reativá-lo e voltar a ganhar pontos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </TooltipProvider>
  );
};

export default PartnerReferredPartners;
