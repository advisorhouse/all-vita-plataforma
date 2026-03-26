import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, MessageCircle, Calendar, Users, Megaphone,
  Star, Sparkles, Eye, Quote, Leaf, Activity, Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import coverLevel5 from "@/assets/cover-level-5.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

/* ─── Official posts (managed by Vision Lift team) ─── */
const POSTS = [
  {
    id: "p1",
    author: "Equipe Vision Lift",
    date: "28 Fev, 2026",
    title: "Celebramos 1.200 membros ativos!",
    body: "Obrigado por fazer parte dessa jornada. Sua consistência nos inspira a continuar inovando em saúde ocular. Este mês, mais de 500 membros completaram o desafio de consistência.",
    likes: 87,
    comments: 14,
    pinned: true,
  },
  {
    id: "p2",
    author: "Equipe Vision Lift",
    date: "20 Fev, 2026",
    title: "Dica da semana: Regra 20-20-20",
    body: "A cada 20 minutos olhando para telas, olhe para algo a 6 metros de distância por 20 segundos. Esse hábito simples reduz a fadiga ocular em até 40%.",
    likes: 52,
    comments: 8,
    pinned: false,
  },
  {
    id: "p3",
    author: "Equipe Vision Lift",
    date: "12 Fev, 2026",
    title: "Novos vídeos na seção Aprender Saúde",
    body: "Adicionamos 2 novos conteúdos sobre proteção da retina e alimentação para a saúde visual. Confira na aba 'Aprender Saúde' do menu.",
    likes: 34,
    comments: 5,
    pinned: false,
  },
];

/* ─── Member testimonials ─── */
const TESTIMONIALS = [
  {
    id: "t1",
    name: "Carolina M.",
    months: 8,
    text: "Depois de 6 meses, percebi uma diferença real no cansaço dos olhos ao final do dia. Recomendo a todos da família!",
    likes: 34,
  },
  {
    id: "t2",
    name: "Roberto S.",
    months: 11,
    text: "Comecei cético, mas a consistência fez diferença. Minha esposa notou a mudança antes de mim.",
    likes: 52,
  },
  {
    id: "t3",
    name: "Fernanda L.",
    months: 5,
    text: "O calendário de consistência virou meu compromisso diário. Adoro ver o progresso.",
    likes: 28,
  },
];

/* ─── Wellness tips ─── */
const WELLNESS_TIPS = [
  { title: "Regra 20-20-20", desc: "A cada 20 min, olhe para algo a 6m por 20 segundos.", icon: Eye },
  { title: "Hidratação", desc: "Beba 2L de água por dia para manter os olhos lubrificados.", icon: Leaf },
  { title: "Sono reparador", desc: "7-8h de sono regeneram o tecido ocular por completo.", icon: Activity },
  { title: "Alimentação protetora", desc: "Espinafre e ovos fortalecem a mácula naturalmente.", icon: Shield },
];

/* ─── Upcoming events ─── */
const EVENTS = [
  {
    id: "ev1",
    title: "Live: Saúde visual na era digital",
    desc: "Como proteger seus olhos do excesso de telas.",
    date: "15 Mar, 2026 · 19h",
    speaker: "Dra. Marina Costa",
  },
  {
    id: "ev2",
    title: "Sessão de perguntas: Longevidade ocular",
    desc: "Tire dúvidas ao vivo sobre cuidados a longo prazo.",
    date: "22 Mar, 2026 · 20h",
    speaker: "Equipe Vision Lift",
  },
];

const ClubCommunity: React.FC = () => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likedTestimonials, setLikedTestimonials] = useState<Set<string>>(new Set());
  const [confirmedEvents, setConfirmedEvents] = useState<Set<string>>(new Set());

  const toggleLikePost = (id: string) => {
    setLikedPosts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleLikeTestimonial = (id: string) => {
    setLikedTestimonials(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleConfirmEvent = (id: string) => {
    setConfirmedEvents(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="space-y-6 pb-12">

      {/* ===== HEADER ===== */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Comunidade</h1>
        <p className="text-base text-muted-foreground mt-1">
          Dicas, novidades e histórias de quem cuida da saúde ocular com você.
        </p>
      </motion.div>

      {/* ===== HERO BANNER ===== */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-44 overflow-hidden">
              <img src={coverLevel5} alt="Comunidade Vision Lift" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
              <div className="absolute inset-0 flex items-center px-7">
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-background">Você faz parte de algo maior</p>
                  <p className="text-sm text-background/70 max-w-md leading-relaxed">
                    Mais de <span className="font-semibold text-background">1.200 pessoas</span> cuidando da saúde ocular juntas.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== OFFICIAL POSTS (by Vision Lift team) ===== */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <Megaphone className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Mural da Vision Lift</h2>
            <p className="text-sm text-muted-foreground">Novidades, dicas e atualizações oficiais</p>
          </div>
        </div>

        <div className="space-y-4">
          {POSTS.map((post) => {
            const isLiked = likedPosts.has(post.id);
            return (
              <Card key={post.id} className={cn("border shadow-sm", post.pinned ? "border-accent/20 bg-accent/5" : "border-border")}>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground">
                        <span className="text-xs font-bold text-background">VL</span>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-foreground">{post.author}</p>
                        <p className="text-sm text-muted-foreground">{post.date}</p>
                      </div>
                    </div>
                    {post.pinned && (
                      <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Fixado</span>
                    )}
                  </div>

                  <p className="text-lg font-semibold text-foreground">{post.title}</p>
                  <p className="text-base text-muted-foreground leading-relaxed">{post.body}</p>

                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                        isLiked ? "bg-accent/10 text-accent" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isLiked && "fill-accent")} />
                      {post.likes + (isLiked ? 1 : 0)}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments} comentários
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* ===== MEMBER STORIES ===== */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
            <Quote className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Histórias de Membros</h2>
            <p className="text-sm text-muted-foreground">Depoimentos reais de quem usa Vision Lift</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => {
            const isLiked = likedTestimonials.has(t.id);
            return (
              <Card key={t.id} className="border border-border shadow-sm h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground shrink-0">
                      <span className="text-sm font-bold text-background">
                        {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.months} meses de jornada</p>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                  <button
                    onClick={() => toggleLikeTestimonial(t.id)}
                    className={cn(
                      "flex items-center gap-2 mt-4 rounded-xl px-4 py-2 text-sm font-medium transition-colors w-fit",
                      isLiked ? "bg-accent/10 text-accent" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-accent")} />
                    {t.likes + (isLiked ? 1 : 0)}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* ===== WELLNESS TIPS ===== */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Dicas de Bem-Estar</h2>
                <p className="text-sm text-muted-foreground">Hábitos simples que protegem seus olhos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WELLNESS_TIPS.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div key={tip.title} className="rounded-2xl bg-secondary/30 p-5 space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-base font-semibold text-foreground">{tip.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== UPCOMING EVENTS ===== */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Próximos Eventos</h2>
                <p className="text-sm text-muted-foreground">Lives e sessões ao vivo</p>
              </div>
            </div>

            <div className="space-y-3">
              {EVENTS.map((ev) => {
                const isConfirmed = confirmedEvents.has(ev.id);
                return (
                  <div key={ev.id} className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{ev.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{ev.desc}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{ev.date}</span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{ev.speaker}</span>
                      </div>
                      <Button
                        variant={isConfirmed ? "default" : "outline"}
                        onClick={() => toggleConfirmEvent(ev.id)}
                        className="rounded-xl h-11 text-sm gap-2"
                      >
                        {isConfirmed ? (
                          <>
                            <Star className="h-4 w-4" />
                            Confirmado ✓
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4" />
                            Quero participar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClubCommunity;
