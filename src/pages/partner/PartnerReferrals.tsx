import React, { useState } from "react";
import QuizPreviewModal from "@/components/partner/QuizPreviewModal";
import { motion } from "framer-motion";
import {
  ClipboardList, Copy, Link2, QrCode, Eye,
  Users, CheckCircle2, Share2,
  Smartphone, Download, ExternalLink,
  Sparkles, BarChart3, Zap, Coins,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const } }),
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipUI>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-muted-foreground/40">
          <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
        </svg>
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </TooltipUI>
);

// ─── Data ────────────────────────────────────────────────────
const QUIZ_LINK = "https://visionlift.com.br/quiz/hogv-100";
const DOCTOR_CODE = "HOGV-100";

const QUIZ_FIELDS = [
  "Nome, CPF, Telefone, E-mail, Idade, Sexo",
  "Histórico de saúde (diabetes, HAS, glaucoma...)",
  "Medicações em uso e colírios",
  "Histórico oftalmológico e cirurgias",
  "Motivo da consulta / queixa principal",
  "Consentimento LGPD e autorização de contato",
];

const RECENT_PATIENTS = [
  { name: "Maria S.", date: "28/02", status: "Comprou", plan: "5 meses", points: 528 },
  { name: "Roberto N.", date: "25/02", status: "Comprou", plan: "3 meses", points: 396 },
  { name: "Ana Paula C.", date: "22/02", status: "Pendente", plan: "—", points: 0 },
  { name: "Juliana M.", date: "18/02", status: "Comprou", plan: "9 meses", points: 697 },
  { name: "Fernanda L.", date: "15/02", status: "Pendente", plan: "—", points: 0 },
];

const SHARE_MESSAGE = encodeURIComponent(
  `Olá! Antes da sua consulta, por favor preencha este questionário rápido: ${QUIZ_LINK}\n\nÉ rápido e nos ajuda a ter uma consulta mais eficiente. 🩺`
);

const PartnerReferrals: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"link" | "qr">("link");
  const [quizPreviewOpen, setQuizPreviewOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(QUIZ_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalQuiz = 87;
  const totalConverted = 48;
  const conversionRate = ((totalConverted / totalQuiz) * 100).toFixed(0);
  const pointsFromQuiz = 12_480;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12">

        {/* ═══ Header ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-foreground">Quiz Pré-Consulta</h1>
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                  Código: {DOCTOR_CODE}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Gerencie o questionário que vincula seus pacientes automaticamente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setQuizPreviewOpen(true)}>
                <Eye className="h-3.5 w-3.5" />
                Visualizar Quiz
              </Button>
              <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
                <Zap className="h-3 w-3 text-warning" />
                <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
                <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ KPIs ═══ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Quiz Preenchidos", value: totalQuiz.toString(), icon: ClipboardList, tip: "Total de pacientes que preencheram o quiz pré-consulta." },
              { label: "Pacientes Vinculados", value: totalConverted.toString(), icon: Users, tip: "Pacientes do quiz que compraram e estão vinculados a você.", accent: true },
              { label: "Taxa de Conversão", value: `${conversionRate}%`, icon: BarChart3, tip: "Percentual de pacientes do quiz que viraram compradores." },
              { label: "VisionPoints Gerados", value: pointsFromQuiz.toLocaleString("pt-BR"), icon: Coins, tip: "Total de VisionPoints acumulados a partir de compras via quiz.", accent: true },
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

        {/* ═══ Hero — Quiz Link ═══ */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="relative overflow-hidden border-accent/30 shadow-sm bg-gradient-to-br from-accent via-accent/90 to-accent/70">
            <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
            <CardContent className="relative z-10 p-7 text-accent-foreground">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-medium text-accent-foreground/60 uppercase tracking-wider">Seu questionário exclusivo</p>
              </div>
              <h2 className="text-xl font-bold leading-tight">
                Envie o quiz antes da consulta.
              </h2>
              <p className="text-[13px] text-accent-foreground/70 mt-1 max-w-lg">
                O paciente preenche dados de saúde, autoriza LGPD e fica vinculado ao seu cadastro <strong className="text-accent-foreground">automaticamente</strong>. Toda compra futura gera VisionPoints para você.
              </p>

              {/* Tab toggle: Link / QR */}
              <div className="mt-5 flex items-center gap-1 bg-white/10 rounded-xl p-1 w-fit">
                <button
                  onClick={() => setActiveTab("link")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5",
                    activeTab === "link" ? "bg-white text-accent shadow-sm" : "text-accent-foreground/70 hover:text-accent-foreground"
                  )}
                >
                  <Link2 className="h-3.5 w-3.5" /> Link
                </button>
                <button
                  onClick={() => setActiveTab("qr")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5",
                    activeTab === "qr" ? "bg-white text-accent shadow-sm" : "text-accent-foreground/70 hover:text-accent-foreground"
                  )}
                >
                  <QrCode className="h-3.5 w-3.5" /> QR Code
                </button>
              </div>

              {activeTab === "link" && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/20">
                    <Link2 className="h-4 w-4 text-accent-foreground/50 shrink-0" />
                    <span className="text-[13px] text-accent-foreground/80 truncate font-mono">{QUIZ_LINK}</span>
                  </div>
                  <Button
                    onClick={handleCopy}
                    className="rounded-xl h-10 px-5 text-[13px] font-semibold bg-white text-accent hover:bg-white/90 gap-2 shrink-0"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado!" : "Copiar Link"}
                  </Button>
                </motion.div>
              )}

              {activeTab === "qr" && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-5">
                  <div className="w-28 h-28 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <QrCode className="h-16 w-16 text-accent/30" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[12px] text-accent-foreground/70 leading-relaxed">
                      Imprima e coloque na recepção da clínica. O paciente escaneia e já preenche pelo celular.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-8 text-[11px] gap-1.5 bg-white/10 border-white/20 text-accent-foreground hover:bg-white hover:text-accent"
                    >
                      <Download className="h-3 w-3" /> Baixar para impressão
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ ROW — Compartilhar + O que o quiz coleta ═══ */}
        <div className="grid grid-cols-12 gap-4">
          {/* Compartilhar */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-5">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Share2 className="h-4 w-4 text-accent" />
                    <h3 className="text-[15px] font-semibold text-foreground">Enviar para paciente</h3>
                  </div>
                  <p className="text-[12px] text-muted-foreground mb-4">
                    Envie o link do quiz diretamente pelo WhatsApp da sua recepção ou secretária.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <a
                    href={`https://wa.me/?text=${SHARE_MESSAGE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full h-11 rounded-xl text-[13px] font-semibold bg-[hsl(142,70%,49%)] hover:bg-[hsl(142,70%,42%)] text-white gap-2">
                      <Smartphone className="h-4 w-4" />
                      Enviar pelo WhatsApp
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="h-11 rounded-xl text-[13px] gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* O que o quiz coleta */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-7">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">O que o quiz coleta</h3>
                  <Tip text="Dados coletados com consentimento LGPD. O paciente autoriza antes do envio." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUIZ_FIELDS.map((field, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-secondary/30">
                      <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <p className="text-[12px] text-muted-foreground leading-relaxed">{field}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══ Últimos pacientes do quiz ═══ */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-foreground">Últimos pacientes do quiz</h3>
                <Button variant="ghost" size="sm" className="text-[12px] text-accent gap-1" onClick={() => navigate("/partner/clients")}>
                  Ver todos <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {RECENT_PATIENTS.map(({ name, date, status, plan, points }) => (
                  <div key={name + date} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-foreground">
                        {name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{name}</p>
                        <p className="text-[11px] text-muted-foreground">Quiz em {date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {points > 0 && (
                        <div className="hidden sm:flex items-center gap-1 text-[11px] text-accent font-semibold">
                          <Coins className="h-3 w-3" />
                          +{points} pts
                        </div>
                      )}
                      <div className="text-right">
                        <span className={cn(
                          "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                          status === "Comprou" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
                        )}>
                          {status}
                        </span>
                        {plan !== "—" && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{plan}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Link alternativo (fallback) ═══ */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm border-dashed">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary shrink-0">
                <Link2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">Link direto de indicação</p>
                <p className="text-[11px] text-muted-foreground">Para pacientes que não passaram pelo quiz, use seu link direto como alternativa.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl text-[12px] shrink-0" onClick={handleCopy}>
                <Copy className="h-3 w-3 mr-1" /> Copiar
              </Button>
            </CardContent>
          </Card>
        </motion.div>

      </div>
      <QuizPreviewModal open={quizPreviewOpen} onOpenChange={setQuizPreviewOpen} />
    </TooltipProvider>
  );
};

export default PartnerReferrals;
