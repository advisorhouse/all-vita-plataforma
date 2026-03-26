import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, MessageSquare, TrendingUp, BarChart3, Crown,
  Play, Check, Lock, ChevronLeft, ChevronRight, Clock,
  Award, ArrowRight, Eye, Lightbulb, Zap, Users,
  ShieldCheck, CalendarDays, PlayCircle, GraduationCap,
  Star, Heart, Sun, Moon, CloudSun, Sparkles, X, Radio,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import speakerDra from "@/assets/speaker-dra-marina.png";
import eventTraining from "@/assets/event-training.png";

// Per-module cover images
const MODULE_COVERS: Record<string, string> = {};
const coverImports = import.meta.glob("@/assets/cover-*-*.jpg", { eager: true, import: "default" });
Object.entries(coverImports).forEach(([path, url]) => {
  // Extract "1-1" from "/src/assets/cover-1-1.jpg"
  const match = path.match(/cover-(\d+-\d+)\./);
  if (match) MODULE_COVERS[match[1]] = url as string;
});

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

// ─── Cover Art with real AI-generated images ────────────────
const CoverArt: React.FC<{ moduleId: string; locked?: boolean }> = ({ moduleId, locked }) => {
  const coverImage = MODULE_COVERS[moduleId] || "";
  return (
    <div className="absolute inset-0 overflow-hidden">
      {coverImage ? (
        <img src={coverImage} alt="" className="absolute inset-0 w-full h-full object-cover brightness-[0.55] contrast-[1.1]" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent/60" />
      )}
      {/* Top vignette */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
      {/* Bottom gradient for text legibility */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      {locked && <div className="absolute inset-0 bg-black/40 backdrop-saturate-0" />}
    </div>
  );
};

// ─── Data ────────────────────────────────────────────────────
interface Module {
  id: string;
  title: string;
  duration: string;
  summary: string[];
}

interface Level {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  conquest: string;
  icon: React.ElementType;
  requiredLevel: number;
  modules: Module[];
}

const LEVELS: Level[] = [
  {
    id: 1, key: "fundamentals", title: "Fundamentos & Posicionamento", subtitle: "Marca, ética e comunicação",
    conquest: "Base Concluída", icon: BookOpen, requiredLevel: 0,
    modules: [
      { id: "1-1", title: "O propósito Vision Lift", duration: "5 min", summary: ["Missão da marca", "Longevidade visual", "Diferencial no mercado"] },
      { id: "1-2", title: "Comunicar sem prometer", duration: "6 min", summary: ["Limites legais", "Narrativa de cuidado", "Tom educativo"] },
      { id: "1-3", title: "Conte sua própria história", duration: "6 min", summary: ["Autenticidade", "Conexão emocional", "Postura profissional"] },
    ],
  },
  {
    id: 2, key: "sales", title: "Vendas & Recorrência", subtitle: "Modelo sustentável de receita",
    conquest: "Recorrência Ativa", icon: TrendingUp, requiredLevel: 1,
    modules: [
      { id: "2-1", title: "Gerando a primeira indicação", duration: "7 min", summary: ["Abordagem consultiva", "Momento certo", "Sem pressão"] },
      { id: "2-2", title: "Recorrência explicada", duration: "6 min", summary: ["Benefício contínuo", "Previsibilidade", "Projeção de ganhos"] },
      { id: "2-3", title: "Leitura de resultados", duration: "5 min", summary: ["Retenção", "Indicadores-chave", "Ações preventivas"] },
    ],
  },
  {
    id: 3, key: "growth", title: "Crescimento Profissional", subtitle: "Autoridade e consistência",
    conquest: "Formação Completa", icon: Crown, requiredLevel: 2,
    modules: [
      { id: "3-1", title: "Construindo autoridade", duration: "7 min", summary: ["Posicionamento pessoal", "Conteúdo consistente", "Prova social"] },
      { id: "3-2", title: "Base fiel de pacientes", duration: "7 min", summary: ["Relacionamento ativo", "Comunidade", "Valor contínuo"] },
      { id: "3-3", title: "Crescer com consistência", duration: "5 min", summary: ["Metas realistas", "Métricas pessoais", "Visão de longo prazo"] },
    ],
  },
];

const UPCOMING_EVENTS = [
  { title: "Live: Saúde ocular 40+", date: "10/05 • 20h", speaker: "Dra. Marina", img: speakerDra, type: "Live", highlight: true },
  { title: "Workshop: Abordagem empática", date: "15/05 • 19h", speaker: "Equipe VL", img: eventTraining, type: "Workshop", highlight: false },
  { title: "Masterclass: Retenção avançada", date: "22/05 • 20h", speaker: "Dra. Marina", img: speakerDra, type: "Masterclass", highlight: false },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const } }),
};

// ─── Netflix-style Carousel Row ──────────────────────────────
const CarouselRow: React.FC<{
  level: Level;
  locked: boolean;
  completedModules: Set<string>;
  onPlay: (moduleId: string) => void;
  onSelect: (level: Level, mod: Module) => void;
}> = ({ level, locked, completedModules, onPlay, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = level.icon;
  const progress = level.modules.filter((m) => completedModules.has(m.id)).length;
  const total = level.modules.length;
  const pct = Math.round((progress / total) * 100);
  const isComplete = pct === 100;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="space-y-2.5">
      {/* Row header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            isComplete ? "bg-accent/15" : locked ? "bg-muted/30" : "bg-foreground/10"
          )}>
            {locked ? <Lock className="h-3.5 w-3.5 text-muted-foreground/50" /> : isComplete ? <Check className="h-3.5 w-3.5 text-accent" /> : <Icon className="h-3.5 w-3.5 text-foreground" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold text-foreground">{level.title}</h3>
              {isComplete && (
                <span className="text-[9px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">✓ {level.conquest}</span>
              )}
              {locked && (
                <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">🔒 Bloqueado</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">{level.subtitle} • {total} aulas</p>
          </div>
        </div>
        {!locked && !isComplete && (
          <div className="flex items-center gap-2 ml-auto pl-4">
            <Progress value={pct} className="h-1.5 w-20" />
            <span className="text-[10px] text-muted-foreground font-medium">{pct}%</span>
          </div>
        )}
      </div>

      {/* Cards carousel */}
      <div className="relative group/carousel">
        {/* Scroll buttons — NO background gradient, just icon on hover */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-lg ml-1"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-lg mr-1"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {level.modules.map((mod, mi) => {
            const done = completedModules.has(mod.id);
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: mi * 0.05 }}
                className="snap-start shrink-0"
                style={{ width: "260px" }}
              >
                <div
                  onClick={() => !locked && onSelect(level, mod)}
                  className={cn(
                    "rounded-2xl overflow-hidden transition-all cursor-pointer group/card",
                    locked ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.03] hover:shadow-xl"
                  )}
                >
                  {/* Thumbnail with AI-generated cover */}
                  <div className="relative h-[146px] flex items-center justify-center">
                    <CoverArt moduleId={mod.id} locked={locked} />

                    {/* Episode number */}
                    <span className="absolute top-3 left-3 text-white/30 text-[42px] font-black leading-none z-[1]">
                      {mi + 1}
                    </span>
                    {/* Play button */}
                    {!locked && (
                      <div className={cn(
                        "relative z-[2] flex h-12 w-12 items-center justify-center rounded-full transition-all",
                        done ? "bg-accent/80" : "bg-white/20 backdrop-blur-sm group-hover/card:bg-white/30 group-hover/card:scale-110"
                      )}>
                        {done ? <Check className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
                      </div>
                    )}
                    {locked && (
                      <Lock className="h-8 w-8 text-white/30 relative z-[2]" />
                    )}
                    {/* Duration pill */}
                    <span className="absolute bottom-2 right-2 z-[2] text-[10px] text-white/90 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {mod.duration}
                    </span>
                    {/* Progress bar at bottom */}
                    {done && (
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent z-[2]" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3 bg-card border border-t-0 border-border rounded-b-2xl">
                    <p className={cn(
                      "text-[13px] font-semibold leading-snug line-clamp-1",
                      done ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {mod.title}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {mod.summary.slice(0, 2).map((s, si) => (
                        <span key={si} className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Module Detail Drawer ────────────────────────────────────
const ModuleDrawer: React.FC<{
  level: Level;
  module: Module;
  done: boolean;
  onClose: () => void;
  onPlay: () => void;
}> = ({ level, module, done, onClose, onPlay }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 30 }}
      className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cover with AI art */}
      <div className="relative h-48 flex items-center justify-center">
        <CoverArt moduleId={module.id} />
        <button onClick={onClose} className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>
        <div className={cn(
          "relative z-10 flex h-16 w-16 items-center justify-center rounded-full cursor-pointer transition-all",
          done ? "bg-accent" : "bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-110"
        )} onClick={onPlay}>
          {done ? <Check className="h-7 w-7 text-white" /> : <Play className="h-7 w-7 text-white ml-1" />}
        </div>
        <span className="absolute bottom-3 left-4 z-10 text-white/70 text-[11px] font-medium">{level.title} • Aula {level.modules.indexOf(module) + 1}</span>
        <span className="absolute bottom-3 right-4 z-10 text-white/70 text-[11px] flex items-center gap-1"><Clock className="h-3 w-3" /> {module.duration}</span>
      </div>
      {/* Content */}
      <div className="bg-card p-5 space-y-4">
        <h3 className="text-lg font-bold text-foreground">{module.title}</h3>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">O que você vai aprender</p>
          <div className="space-y-1.5">
            {module.summary.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span className="text-[13px] text-foreground">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <Button
          onClick={onPlay}
          className="w-full rounded-xl h-11 text-[13px] font-semibold gap-2"
        >
          {done ? <><Check className="h-4 w-4" /> Assistir novamente</> : <><Play className="h-4 w-4" /> Assistir aula</>}
        </Button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Component ───────────────────────────────────────────────
const PartnerFormation: React.FC = () => {
  const [completedModules, setCompletedModules] = useState<Set<string>>(
    new Set(["1-1", "1-2"])
  );
  const [selectedItem, setSelectedItem] = useState<{ level: Level; module: Module } | null>(null);




  const getCompletedLevel = () => {
    let highest = 0;
    for (const level of LEVELS) {
      const allDone = level.modules.every((m) => completedModules.has(m.id));
      if (allDone) highest = level.id;
      else break;
    }
    return highest;
  };

  const completedLevel = getCompletedLevel();
  const isLevelLocked = (level: Level) => level.requiredLevel > completedLevel;

  const handleCompleteModule = (moduleId: string) => {
    setCompletedModules((prev) => {
      const next = new Set(prev);
      next.add(moduleId);
      return next;
    });
  };

  const totalModules = LEVELS.reduce((a, l) => a + l.modules.length, 0);
  const totalCompleted = completedModules.size;
  const overallProgress = Math.round((totalCompleted / totalModules) * 100);

  // Find next module
  const nextModule = (() => {
    for (const level of LEVELS) {
      if (isLevelLocked(level)) continue;
      const mod = level.modules.find((m) => !completedModules.has(m.id));
      if (mod) return { level, module: mod };
    }
    return null;
  })();

  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-6 pb-12">

      {/* ═══ Header ═══ */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground">Formação</h1>
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {totalCompleted}/{totalModules} aulas
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Complete os 3 níveis para desbloquear ferramentas avançadas e campanhas.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
            <Zap className="h-3 w-3 text-warning" />
            <p className="text-[10px] text-muted-foreground">Vínculo: <span className="font-semibold text-foreground">Último Quiz</span></p>
            <Tip text="Modelo Último Click: o paciente é vinculado ao médico cujo quiz foi preenchido por último." />
          </div>
        </div>
      </motion.div>

      {/* ═══ Hero — Continue Watching (styled as lesson cover) ═══ */}
      <div className="grid grid-cols-12 gap-4">
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
          {nextModule ? (
            <Card className="relative overflow-hidden border-none shadow-lg h-full rounded-2xl">
              {/* Full cover art background */}
              <CoverArt moduleId={nextModule.module.id} />
              {/* Extra overlay for hero text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-[1]" />
              <CardContent className="relative z-10 p-7 flex flex-col justify-end h-full text-white min-h-[240px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-3.5 w-3.5 text-white ml-0.5" />
                  </div>
                  <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Continue assistindo</p>
                </div>
                <p className="text-[11px] text-white/50 mb-0.5">
                  Nível {nextModule.level.id} — {nextModule.level.title}
                </p>
                <h2 className="text-[24px] font-bold leading-tight">
                  {nextModule.module.title}
                </h2>
                <p className="text-[13px] text-white/60 mt-1.5 max-w-md">
                  {nextModule.module.duration} • {nextModule.module.summary.join(" · ")}
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <Button
                    onClick={() => handleCompleteModule(nextModule.module.id)}
                    className="rounded-xl h-11 px-6 text-[13px] font-semibold bg-white text-foreground hover:bg-white/90 gap-2 shadow-lg"
                  >
                    <Play className="h-4 w-4" /> Assistir agora
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedItem({ level: nextModule.level, module: nextModule.module })}
                    className="rounded-xl h-11 px-5 text-[13px] font-semibold border-white/25 text-white bg-white/10 hover:bg-white/20 gap-2"
                  >
                    <Eye className="h-4 w-4" /> Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="relative overflow-hidden border-accent/30 shadow-sm bg-gradient-to-br from-accent via-accent/90 to-accent/70 h-full rounded-2xl">
              <CardContent className="relative z-10 p-7 flex flex-col justify-center h-full text-accent-foreground min-h-[240px]">
                <h2 className="text-[22px] font-bold leading-tight">
                  Formação concluída! 🎉
                </h2>
                <p className="text-[13px] text-accent-foreground/70 mt-1.5">
                  Você completou todos os 5 níveis. Parabéns pela dedicação!
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Right — Progress + Conquistas */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
            <Card className="border-border shadow-sm h-full bg-foreground">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full gap-2 text-center text-background">
                <h3 className="text-[13px] font-semibold">Progresso Geral</h3>
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(0 0% 100% / 0.1)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(overallProgress / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{overallProgress}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-background/60">{totalCompleted}/{totalModules} aulas concluídas</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex-1">
            <Card className="border-border shadow-sm h-full">
              <CardContent className="p-4 flex flex-col justify-center h-full gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="text-[13px] font-bold text-foreground">Suas Conquistas</h3>
                </div>
                <div className="space-y-1.5">
                  {LEVELS.map((level) => {
                    const done = level.modules.every((m) => completedModules.has(m.id));
                    const Icon = level.icon;
                    return (
                      <div key={level.id} className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all",
                        done ? "bg-accent/10" : "bg-secondary/50"
                      )}>
                        <div className={cn(
                          "h-6 w-6 rounded-md flex items-center justify-center shrink-0",
                          done ? "bg-accent text-accent-foreground" : "bg-muted"
                        )}>
                          {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-[12px] font-semibold truncate", done ? "text-foreground" : "text-foreground/60")}>
                            {level.conquest}
                          </p>
                          <p className={cn("text-[10px]", done ? "text-muted-foreground" : "text-muted-foreground/60")}>Nível {level.id} — {level.title}</p>
                        </div>
                        {done && <Check className="h-3.5 w-3.5 text-accent shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ═══ Netflix Rows — Course Levels ═══ */}
      <div className="space-y-6">
        {LEVELS.map((level, idx) => (
          <motion.div key={level.id} custom={idx + 4} variants={fadeUp} initial="hidden" animate="visible">
            <CarouselRow
              level={level}
              locked={isLevelLocked(level)}
              completedModules={completedModules}
              onPlay={(moduleId) => handleCompleteModule(moduleId)}
              onSelect={(l, m) => !isLevelLocked(l) && setSelectedItem({ level: l, module: m })}
            />
          </motion.div>
        ))}
      </div>

      {/* ═══ Bottom Row — Lives (prominent) + Insight ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* Lives — full width on accent dark bg for prominence */}
        <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible" className="col-span-12 lg:col-span-8">
          <Card className="border-none shadow-lg bg-foreground overflow-hidden">
            <CardContent className="p-5 space-y-4 text-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <Radio className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold">Eventos e Lives ao Vivo</h3>
                    <p className="text-[10px] text-background/50">Participe e tire suas dúvidas em tempo real</p>
                  </div>
                </div>
                <span className="text-[10px] text-background/40 bg-background/10 px-2 py-0.5 rounded-full">{UPCOMING_EVENTS.length} próximos</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {UPCOMING_EVENTS.map((event, i) => (
                  <div key={i} className={cn(
                    "rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02]",
                    event.highlight ? "ring-2 ring-accent" : "ring-1 ring-background/10"
                  )}>
                    <div className={cn(
                      "h-24 flex items-center justify-center relative overflow-hidden",
                      event.highlight ? "bg-gradient-to-br from-accent/30 to-accent/10" : "bg-background/5"
                    )}>
                      <Avatar className="h-14 w-14 rounded-full shrink-0 ring-2 ring-background/20">
                        <AvatarImage src={event.img} alt={event.speaker} className="object-cover" />
                        <AvatarFallback className="rounded-full bg-background/10 text-[10px] text-background">VL</AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full",
                        event.highlight ? "bg-destructive text-white" : "bg-accent/20 text-accent"
                      )}>
                        {event.highlight && "● "}{event.type}
                      </span>
                    </div>
                    <div className="p-3 bg-background/5">
                      <p className="text-[12px] font-semibold text-background leading-tight">{event.title}</p>
                      <p className="text-[10px] text-background/50 mt-1">{event.date} • {event.speaker}</p>
                      {event.highlight && (
                        <Button size="sm" className="mt-2 h-7 text-[10px] rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 w-full gap-1">
                          <CalendarDays className="h-3 w-3" /> Inscrever-se
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          <motion.div custom={11} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border-border shadow-sm bg-accent/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <h3 className="text-[12px] font-semibold text-foreground">Dica de Quem Já Passou Por Isso</h3>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  "Partners que completam a formação vendem em média <strong className="text-foreground">2.4x mais</strong> e têm taxa de retenção <strong className="text-accent">35% superior</strong>."
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={12} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border-border shadow-sm bg-secondary/30">
              <CardContent className="p-4 text-center space-y-2">
                <Heart className="h-4 w-4 text-accent mx-auto" />
                <p className="text-[12px] text-foreground font-medium">
                  Cada aula assistida é um passo para se tornar referência.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Sua evolução inspira quem está ao seu redor.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ═══ Module Detail Drawer ═══ */}
      <AnimatePresence>
        {selectedItem && (
          <ModuleDrawer
            level={selectedItem.level}
            module={selectedItem.module}
            done={completedModules.has(selectedItem.module.id)}
            onClose={() => setSelectedItem(null)}
            onPlay={() => {
              handleCompleteModule(selectedItem.module.id);
              setSelectedItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
    </TooltipProvider>
  );
};

export default PartnerFormation;
