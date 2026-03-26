/**
 * Vision Lift — Biblioteca Audiovisual
 *
 * 4 tiers: Início (0-1m), Consistência (1-3m), Proteção Avançada (3-6m), Elite Vision (12m+)
 * Max 4 videos per tier. Progress tracked per video.
 */

export type VideoTier = "inicio" | "consistencia" | "protecao_avancada" | "elite_vision";

export interface VideoItem {
  id: string;
  tier: VideoTier;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  durationSeconds: number;
  thumbnailColor: string;
  coverImage: string;
  tags: string[];
  videoUrl?: string;
}

export interface VideoProgress {
  videoId: string;
  percentWatched: number;
  completed: boolean;
  lastWatchedAt: string;
}

// ─── Tier metadata ───────────────────────────────────────────
export interface TierInfo {
  id: VideoTier;
  label: string;
  subtitle: string;
  minMonths: number;
  requiresElite: boolean;
}

export const TIERS: TierInfo[] = [
  {
    id: "inicio",
    label: "Primeiros Passos",
    subtitle: "Vídeos rápidos para começar sua jornada com confiança",
    minMonths: 0,
    requiresElite: false,
  },
  {
    id: "consistencia",
    label: "Construindo o Hábito",
    subtitle: "Entenda como a consistência transforma seus resultados",
    minMonths: 1,
    requiresElite: false,
  },
  {
    id: "protecao_avancada",
    label: "Saúde & Ciência",
    subtitle: "Aprofunde seu conhecimento sobre saúde visual",
    minMonths: 3,
    requiresElite: false,
  },
  {
    id: "elite_vision",
    label: "Conteúdo Exclusivo",
    subtitle: "Bastidores e conversas para membros Elite",
    minMonths: 12,
    requiresElite: true,
  },
];

// ─── Video catalog ───────────────────────────────────────────
export const VIDEO_CATALOG: VideoItem[] = [
  // INÍCIO — videos curtos, práticos
  {
    id: "v-ini-1",
    tier: "inicio",
    title: "Como usar corretamente",
    subtitle: "O básico da aplicação diária",
    description: "Aprenda a forma correta de utilizar o Vision Lift no seu dia a dia para obter os melhores resultados.",
    duration: "2 min",
    durationSeconds: 120,
    thumbnailColor: "bg-secondary",
    coverImage: "cover-1-1",
    tags: ["tutorial", "rápido"],
  },
  {
    id: "v-ini-2",
    tier: "inicio",
    title: "Integrando à sua rotina",
    subtitle: "Manhã ou noite — o que funciona melhor",
    description: "Descubra como encaixar o Vision Lift na sua rotina matinal ou noturna sem complicação.",
    duration: "2 min",
    durationSeconds: 135,
    thumbnailColor: "bg-secondary",
    coverImage: "cover-1-2",
    tags: ["rotina", "rápido"],
  },
  {
    id: "v-ini-3",
    tier: "inicio",
    title: "Por que a consistência importa",
    subtitle: "O segredo dos resultados reais",
    description: "Entenda como o registro diário cria um hábito que fortalece sua proteção visual a longo prazo.",
    duration: "3 min",
    durationSeconds: 170,
    thumbnailColor: "bg-secondary",
    coverImage: "cover-1-3",
    tags: ["mindset", "hábito"],
  },
  {
    id: "v-ini-4",
    tier: "inicio",
    title: "O que acontece nos seus olhos",
    subtitle: "Ciência simplificada em 3 minutos",
    description: "Uma visão geral sobre como nutrientes específicos atuam na proteção da retina e da mácula.",
    duration: "3 min",
    durationSeconds: 195,
    thumbnailColor: "bg-secondary",
    coverImage: "cover-1-4",
    tags: ["ciência", "educação"],
  },

  // CONSISTÊNCIA — aprofundamento leve
  {
    id: "v-con-1",
    tier: "consistencia",
    title: "Resultados que se acumulam",
    subtitle: "Por que parar é perder progresso",
    description: "Saiba por que a continuidade é mais importante do que a intensidade quando se trata de proteção visual.",
    duration: "4 min",
    durationSeconds: 240,
    thumbnailColor: "bg-primary/5",
    coverImage: "cover-2-1",
    tags: ["motivação", "ciência"],
  },
  {
    id: "v-con-2",
    tier: "consistencia",
    title: "Hábitos que protegem a visão",
    subtitle: "Além do produto — estilo de vida",
    description: "Hábitos diários que complementam a proteção oferecida pelo Vision Lift.",
    duration: "4 min",
    durationSeconds: 255,
    thumbnailColor: "bg-primary/5",
    coverImage: "cover-2-2",
    tags: ["lifestyle", "dicas"],
  },
  {
    id: "v-con-3",
    tier: "consistencia",
    title: "Dúvidas mais comuns",
    subtitle: "Respostas diretas e honestas",
    description: "As dúvidas mais comuns respondidas de forma clara e objetiva.",
    duration: "5 min",
    durationSeconds: 300,
    thumbnailColor: "bg-primary/5",
    coverImage: "cover-2-3",
    tags: ["FAQ", "suporte"],
  },
  {
    id: "v-con-4",
    tier: "consistencia",
    title: "Alimentação e saúde ocular",
    subtitle: "O que comer para ver melhor",
    description: "Nutrientes e alimentos que potencializam a saúde dos seus olhos.",
    duration: "4 min",
    durationSeconds: 240,
    thumbnailColor: "bg-primary/5",
    coverImage: "cover-2-4",
    tags: ["nutrição", "educação"],
  },

  // PROTEÇÃO AVANÇADA — conteúdo profundo
  {
    id: "v-adv-1",
    tier: "protecao_avancada",
    title: "Seus olhos daqui a 20 anos",
    subtitle: "Prevenção é o melhor investimento",
    description: "Entenda como hábitos consistentes hoje impactam a saúde dos seus olhos nas próximas décadas.",
    duration: "6 min",
    durationSeconds: 360,
    thumbnailColor: "bg-accent/5",
    coverImage: "cover-3-1",
    tags: ["longevidade", "profundo"],
  },
  {
    id: "v-adv-2",
    tier: "protecao_avancada",
    title: "Luz azul: mito ou realidade?",
    subtitle: "O que a ciência realmente diz",
    description: "Como o ambiente moderno afeta a sua visão e o que você pode fazer a respeito.",
    duration: "5 min",
    durationSeconds: 300,
    thumbnailColor: "bg-accent/5",
    coverImage: "cover-3-2",
    tags: ["ciência", "tecnologia"],
  },
  {
    id: "v-adv-3",
    tier: "protecao_avancada",
    title: "Sono, estresse e seus olhos",
    subtitle: "Conexões que você não imaginava",
    description: "A relação entre qualidade de vida, sono, estresse e a saúde da sua retina.",
    duration: "5 min",
    durationSeconds: 310,
    thumbnailColor: "bg-accent/5",
    coverImage: "cover-3-3",
    tags: ["wellbeing", "profundo"],
  },
  {
    id: "v-adv-4",
    tier: "protecao_avancada",
    title: "Estudos que comprovam",
    subtitle: "Ciência traduzida para você",
    description: "Os principais estudos sobre proteção macular explicados de forma simples e direta.",
    duration: "7 min",
    durationSeconds: 420,
    thumbnailColor: "bg-accent/5",
    coverImage: "cover-3-4",
    tags: ["pesquisa", "profundo"],
  },

  // ELITE VISION
  {
    id: "v-eli-1",
    tier: "elite_vision",
    title: "Conversa com a Dra. Marina",
    subtitle: "A especialista por trás da fórmula",
    description: "Uma conversa com o especialista por trás do desenvolvimento do Vision Lift.",
    duration: "8 min",
    durationSeconds: 480,
    thumbnailColor: "bg-foreground/5",
    coverImage: "cover-4-1",
    tags: ["entrevista", "exclusivo"],
  },
  {
    id: "v-eli-2",
    tier: "elite_vision",
    title: "Bastidores do laboratório",
    subtitle: "Como seu produto é desenvolvido",
    description: "Conheça o processo de pesquisa e desenvolvimento que torna o Vision Lift único.",
    duration: "6 min",
    durationSeconds: 360,
    thumbnailColor: "bg-foreground/5",
    coverImage: "cover-4-2",
    tags: ["bastidores", "exclusivo"],
  },
  {
    id: "v-eli-3",
    tier: "elite_vision",
    title: "O futuro da saúde visual",
    subtitle: "Tendências e inovações",
    description: "Acesse informações e novidades antes de serem publicadas para o público geral.",
    duration: "5 min",
    durationSeconds: 300,
    thumbnailColor: "bg-foreground/5",
    coverImage: "cover-4-3",
    tags: ["tendências", "exclusivo"],
  },
  {
    id: "v-eli-4",
    tier: "elite_vision",
    title: "Próximos lançamentos Vision Lift",
    subtitle: "Em primeira mão para você",
    description: "Um olhar exclusivo sobre os próximos passos da Vision Lift.",
    duration: "4 min",
    durationSeconds: 250,
    thumbnailColor: "bg-foreground/5",
    coverImage: "cover-4-4",
    tags: ["preview", "exclusivo"],
  },
];

// ─── Helpers ─────────────────────────────────────────────────
export function getEligibleTiers(activeMonths: number, isElite: boolean): VideoTier[] {
  return TIERS
    .filter((t) => {
      if (t.requiresElite && !isElite) return false;
      return activeMonths >= t.minMonths;
    })
    .map((t) => t.id);
}

export function getVideosByTier(tier: VideoTier): VideoItem[] {
  return VIDEO_CATALOG.filter((v) => v.tier === tier);
}

export function getVideoById(id: string): VideoItem | undefined {
  return VIDEO_CATALOG.find((v) => v.id === id);
}

export function getRelatedVideos(videoId: string, maxCount = 2): VideoItem[] {
  const video = getVideoById(videoId);
  if (!video) return [];
  return VIDEO_CATALOG
    .filter((v) => v.tier === video.tier && v.id !== videoId)
    .slice(0, maxCount);
}

export function recommendVideo(
  activeMonths: number,
  isElite: boolean,
  consistencyScore: number,
  watchedIds: string[]
): VideoItem | null {
  const eligible = getEligibleTiers(activeMonths, isElite);
  const unwatched = VIDEO_CATALOG.filter(
    (v) => eligible.includes(v.tier) && !watchedIds.includes(v.id)
  );

  if (unwatched.length === 0) return null;

  if (consistencyScore < 50) {
    const consistencyVideos = unwatched.filter((v) => v.tier === "consistencia");
    if (consistencyVideos.length > 0) return consistencyVideos[0];
  }

  return unwatched[unwatched.length - 1] ?? unwatched[0];
}

/** Map coverImage key to import path — used at component level */
export const COVER_MAP: Record<string, string> = {};
