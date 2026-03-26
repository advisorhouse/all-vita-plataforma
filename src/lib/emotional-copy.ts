/**
 * EmotionalCopyService — Vision Lift Platform
 *
 * Centralized microcopy library following the 3-layer emotional structure:
 * 1. Reconhecimento (Recognition)
 * 2. Orientação (Guidance)
 * 3. Continuidade (Continuity)
 *
 * Tone: calm, sophisticated, secure, non-invasive.
 * Never: alarmist, promotional, aggressive scarcity, medical jargon.
 */

export type ToneType =
  | "calm"
  | "encouraging"
  | "recognition"
  | "guidance"
  | "neutral";

export interface CopyEntry {
  context: string;
  tone_type: ToneType;
  primary_text: string;
  secondary_text?: string;
  active: boolean;
}

// ─── Word substitution map (Emotional Dictionary) ───────────
export const WORD_MAP: Record<string, string> = {
  comprar: "adicionar à jornada",
  plano: "jornada",
  assinatura: "continuidade",
  desconto: "benefício",
  recompensa: "reconhecimento",
  cancelar: "encerrar jornada",
  erro: "algo precisa ser ajustado",
  promoção: "benefício",
  oferta: "oportunidade",
  vip: "parte do núcleo",
  meta: "progresso",
  falhar: "retomar",
  falhando: "podemos retomar",
  perdeu: "pode retomar",
  parabéns: "bom ritmo",
  urgente: "",
  "última chance": "",
  "não perca": "",
  "garanta agora": "",
  exclusivo: "especial",
};

// ─── Copy Library ────────────────────────────────────────────
export const COPY_LIBRARY: Record<string, CopyEntry> = {
  // ═══ ONBOARDING ═══
  welcome_title: {
    context: "onboarding",
    tone_type: "calm",
    primary_text: "Bem-vinda à sua jornada.",
    secondary_text: "Nos próximos dias, vamos te acompanhar no início.",
    active: true,
  },
  welcome_button: {
    context: "onboarding",
    tone_type: "calm",
    primary_text: "Entendi",
    active: true,
  },

  // ═══ DASHBOARD ═══
  greeting_default: {
    context: "dashboard",
    tone_type: "calm",
    primary_text: "Seu cuidado com a visão continua.",
    secondary_text: "Organizamos tudo para você.",
    active: true,
  },
  greeting_3m: {
    context: "dashboard",
    tone_type: "recognition",
    primary_text: "Sua proteção está ativa.",
    secondary_text: "Organizamos tudo para você.",
    active: true,
  },
  greeting_6m: {
    context: "dashboard",
    tone_type: "recognition",
    primary_text: "Sua jornada está consolidada.",
    secondary_text: "Organizamos tudo para você.",
    active: true,
  },
  greeting_12m: {
    context: "dashboard",
    tone_type: "recognition",
    primary_text: "Você faz parte do núcleo Vision Lift.",
    secondary_text: "Organizamos tudo para você.",
    active: true,
  },
  next_step_title: {
    context: "dashboard",
    tone_type: "guidance",
    primary_text: "Seu próximo passo",
    active: true,
  },
  next_step_marked: {
    context: "dashboard",
    tone_type: "calm",
    primary_text: "Consistência registrada.",
    secondary_text: "Seu dia foi registrado. Continue no seu ritmo.",
    active: true,
  },
  next_step_unmarked: {
    context: "dashboard",
    tone_type: "guidance",
    primary_text: "Registre seu uso de hoje.",
    secondary_text: "Registrar o uso diário fortalece sua jornada.",
    active: true,
  },
  next_step_button_mark: {
    context: "dashboard",
    tone_type: "guidance",
    primary_text: "Marcar uso de hoje",
    active: true,
  },
  next_step_button_calendar: {
    context: "dashboard",
    tone_type: "neutral",
    primary_text: "Ver calendário",
    active: true,
  },
  progress_title: {
    context: "dashboard",
    tone_type: "neutral",
    primary_text: "Seu progresso",
    active: true,
  },
  progress_benefit_hint: {
    context: "dashboard",
    tone_type: "calm",
    primary_text: "Seu próximo reconhecimento se aproxima.",
    active: true,
  },
  content_title: {
    context: "dashboard",
    tone_type: "neutral",
    primary_text: "Por que a consistência importa.",
    secondary_text: "Leitura rápida · 2 min",
    active: true,
  },

  // ═══ CALENDÁRIO ═══
  calendar_mark_1: {
    context: "calendar",
    tone_type: "calm",
    primary_text: "Dia registrado.",
    active: true,
  },
  calendar_mark_streak2: {
    context: "calendar",
    tone_type: "encouraging",
    primary_text: "Consistência em construção.",
    active: true,
  },
  calendar_mark_streak5: {
    context: "calendar",
    tone_type: "recognition",
    primary_text: "Bom ritmo.",
    active: true,
  },
  calendar_progress: {
    context: "calendar",
    tone_type: "neutral",
    primary_text: "Você marcou {marked} de {total} dias.",
    active: true,
  },
  calendar_recovery: {
    context: "calendar",
    tone_type: "guidance",
    primary_text: "Podemos retomar hoje.",
    secondary_text: "Cada dia conta no seu progresso.",
    active: true,
  },
  calendar_milestone_7: {
    context: "calendar",
    tone_type: "recognition",
    primary_text: "Você alcançou 7 dias seguidos.",
    secondary_text: "Sua consistência está fazendo diferença.",
    active: true,
  },
  calendar_milestone_14: {
    context: "calendar",
    tone_type: "recognition",
    primary_text: "14 dias consecutivos.",
    secondary_text: "Seu progresso é contínuo.",
    active: true,
  },
  calendar_milestone_21: {
    context: "calendar",
    tone_type: "recognition",
    primary_text: "21 dias de consistência.",
    secondary_text: "Um ciclo completo de cuidado.",
    active: true,
  },
  calendar_confirmed: {
    context: "calendar",
    tone_type: "calm",
    primary_text: "Uso de hoje confirmado",
    active: true,
  },
  calendar_yesterday: {
    context: "calendar",
    tone_type: "neutral",
    primary_text: "Registrar dia anterior",
    active: true,
  },

  // ═══ ACTIVATION (Dias 1-7) ═══
  activation_day1_prompt: {
    context: "activation",
    tone_type: "guidance",
    primary_text: "Pronta para registrar seu primeiro dia?",
    active: true,
  },
  activation_day1_done: {
    context: "activation",
    tone_type: "calm",
    primary_text: "Primeiro dia registrado.",
    secondary_text: "Seu cuidado começou.",
    active: true,
  },
  activation_day2: {
    context: "activation",
    tone_type: "guidance",
    primary_text: "Consistência transforma cuidado em proteção.",
    active: true,
  },
  activation_day3_good: {
    context: "activation",
    tone_type: "encouraging",
    primary_text: "Você está construindo consistência.",
    secondary_text: "Continue registrando seus dias.",
    active: true,
  },
  activation_day3_low: {
    context: "activation",
    tone_type: "guidance",
    primary_text: "Podemos retomar no seu ritmo.",
    secondary_text: "Cada dia registrado faz diferença.",
    active: true,
  },
  activation_day4: {
    context: "activation",
    tone_type: "neutral",
    primary_text: "Seu progresso está avançando.",
    active: true,
  },
  activation_day5: {
    context: "activation",
    tone_type: "guidance",
    primary_text: "Como a retina responde à proteção contínua.",
    active: true,
  },
  activation_day6_good: {
    context: "activation",
    tone_type: "recognition",
    primary_text: "Bom ritmo.",
    secondary_text: "Sua consistência está acima da média.",
    active: true,
  },
  activation_day6_low: {
    context: "activation",
    tone_type: "calm",
    primary_text: "Cada dia conta.",
    secondary_text: "Continue no seu ritmo — o progresso é contínuo.",
    active: true,
  },
  activation_week_complete: {
    context: "activation",
    tone_type: "recognition",
    primary_text: "Primeiro ciclo concluído.",
    secondary_text: "Continue no seu ritmo.",
    active: true,
  },
  activation_badge: {
    context: "activation",
    tone_type: "recognition",
    primary_text: "Primeira Semana Ativa",
    secondary_text: "Reconhecimento desbloqueado",
    active: true,
  },

  // ═══ REENGAJAMENTO ═══
  reengagement_phase1: {
    context: "reengagement",
    tone_type: "guidance",
    primary_text: "Como está sua consistência este mês?",
    secondary_text: "Alguns dias ainda podem fazer diferença.",
    active: true,
  },
  reengagement_phase2: {
    context: "reengagement",
    tone_type: "guidance",
    primary_text: "Estamos organizando seu próximo ciclo.",
    secondary_text: "Que tal fortalecer sua consistência nos próximos dias?",
    active: true,
  },
  reengagement_phase2_recovery: {
    context: "reengagement",
    tone_type: "encouraging",
    primary_text: "Marque 3 dias consecutivos e ative um reconhecimento.",
    active: true,
  },
  reengagement_phase3_title: {
    context: "reengagement",
    tone_type: "calm",
    primary_text: "Antes do próximo ciclo…",
    secondary_text: "Deseja ajustar algo na sua jornada?",
    active: true,
  },
  reengagement_phase3_continue: {
    context: "reengagement",
    tone_type: "neutral",
    primary_text: "Continuar normalmente",
    active: true,
  },
  reengagement_phase3_pause: {
    context: "reengagement",
    tone_type: "neutral",
    primary_text: "Pausar por 30 dias",
    active: true,
  },
  reengagement_phase3_support: {
    context: "reengagement",
    tone_type: "neutral",
    primary_text: "Falar com suporte",
    active: true,
  },
  reengagement_notification: {
    context: "reengagement",
    tone_type: "calm",
    primary_text: "Estamos aqui caso precise.",
    active: true,
  },

  // ═══ MARCOS (3M / 6M / 12M) ═══
  milestone_3m_title: {
    context: "milestone",
    tone_type: "recognition",
    primary_text: "Mais um ciclo concluído.",
    secondary_text: "Consistência transforma cuidado em proteção.",
    active: true,
  },
  milestone_6m_title: {
    context: "milestone",
    tone_type: "recognition",
    primary_text: "6 meses de consistência.",
    secondary_text: "Você entrou na fase de longevidade.",
    active: true,
  },
  milestone_12m_title: {
    context: "milestone",
    tone_type: "recognition",
    primary_text: "1 ano de consistência.",
    secondary_text: "Você faz parte do núcleo Vision Lift.",
    active: true,
  },
  milestone_benefit_3m: {
    context: "milestone",
    tone_type: "calm",
    primary_text: "Reconhecimento desbloqueado",
    secondary_text: "Disponível para você",
    active: true,
  },
  milestone_benefit_6m: {
    context: "milestone",
    tone_type: "calm",
    primary_text: "Reconhecimento de permanência ativado",
    secondary_text: "Exclusivo para sua jornada",
    active: true,
  },
  milestone_benefit_12m: {
    context: "milestone",
    tone_type: "calm",
    primary_text: "Reconhecimento Elite ativado",
    secondary_text: "Exclusivo para membros Elite",
    active: true,
  },

  // ═══ EVOLUÇÃO ═══
  evolution_title_default: {
    context: "evolution",
    tone_type: "neutral",
    primary_text: "Sua evolução",
    active: true,
  },
  evolution_title_6m: {
    context: "evolution",
    tone_type: "recognition",
    primary_text: "Sua jornada consolidada",
    active: true,
  },
  evolution_title_12m: {
    context: "evolution",
    tone_type: "recognition",
    primary_text: "Sua trajetória",
    active: true,
  },
  evolution_upgrade: {
    context: "evolution",
    tone_type: "calm",
    primary_text: "Menos interrupções na sua jornada.",
    active: true,
  },
  evolution_ambassador: {
    context: "evolution",
    tone_type: "calm",
    primary_text: "Compartilhe sua jornada.",
    active: true,
  },
  evolution_content_default: {
    context: "evolution",
    tone_type: "neutral",
    primary_text: "Proteção Avançada",
    active: true,
  },
  evolution_content_6m: {
    context: "evolution",
    tone_type: "neutral",
    primary_text: "Conteúdo Avançado",
    active: true,
  },
  evolution_content_12m: {
    context: "evolution",
    tone_type: "neutral",
    primary_text: "Conteúdo Elite",
    active: true,
  },

  // ═══ ELITE / INDICAÇÃO ═══
  elite_invite_title: {
    context: "elite",
    tone_type: "calm",
    primary_text: "Compartilhe sua jornada.",
    secondary_text: "Convide alguém para conhecer o Vision Lift.",
    active: true,
  },
  elite_invite_button: {
    context: "elite",
    tone_type: "neutral",
    primary_text: "Gerar convite",
    active: true,
  },
  elite_invite_ready: {
    context: "elite",
    tone_type: "calm",
    primary_text: "Seu convite está pronto.",
    active: true,
  },
  elite_landing_title: {
    context: "elite",
    tone_type: "calm",
    primary_text: "Você foi convidada para conhecer o Vision Lift.",
    secondary_text: "Uma jornada de proteção visual.",
    active: true,
  },
  elite_landing_button: {
    context: "elite",
    tone_type: "neutral",
    primary_text: "Conhecer",
    active: true,
  },

  // ═══ CANCELAMENTO ═══
  cancel_title: {
    context: "cancellation",
    tone_type: "calm",
    primary_text: "Deseja encerrar sua jornada?",
    secondary_text: "Podemos ajustar antes, se preferir.",
    active: true,
  },
  cancel_adjust: {
    context: "cancellation",
    tone_type: "neutral",
    primary_text: "Ajustar",
    active: true,
  },
  cancel_pause: {
    context: "cancellation",
    tone_type: "neutral",
    primary_text: "Pausar",
    active: true,
  },
  cancel_confirm: {
    context: "cancellation",
    tone_type: "neutral",
    primary_text: "Confirmar encerramento",
    active: true,
  },
  cancel_elite_title: {
    context: "cancellation",
    tone_type: "calm",
    primary_text: "Você faz parte do núcleo Vision Lift.",
    secondary_text: "Se precisar ajustar algo, podemos adaptar sua jornada.",
    active: true,
  },

  // ═══ NOTIFICAÇÕES ═══
  notification_daily: {
    context: "notification",
    tone_type: "calm",
    primary_text: "Registrou seu dia hoje?",
    active: true,
  },
  notification_evening: {
    context: "notification",
    tone_type: "calm",
    primary_text: "Deseja registrar seu dia?",
    active: true,
  },
  notification_milestone: {
    context: "notification",
    tone_type: "recognition",
    primary_text: "Mais um ciclo concluído.",
    active: true,
  },

  // ═══ SHIPMENT / SUBSCRIPTION ═══
  shipment_next: {
    context: "subscription",
    tone_type: "neutral",
    primary_text: "Seu próximo envio está organizado.",
    active: true,
  },
  subscription_manage: {
    context: "subscription",
    tone_type: "neutral",
    primary_text: "Gerenciar",
    active: true,
  },

  // ═══ PRIMEIRA EXPERIÊNCIA ═══
  first_experience_label: {
    context: "first_experience",
    tone_type: "calm",
    primary_text: "Vision Lift Club",
    active: true,
  },
  first_experience_subtitle: {
    context: "first_experience",
    tone_type: "calm",
    primary_text: "Seu cuidado com a visão começa agora.",
    active: true,
  },
  first_experience_video_title: {
    context: "first_experience",
    tone_type: "calm",
    primary_text: "Uma mensagem para você.",
    active: true,
  },
  first_experience_video_hint: {
    context: "first_experience",
    tone_type: "neutral",
    primary_text: "Assista quando quiser.",
    active: true,
  },
  first_experience_cta: {
    context: "first_experience",
    tone_type: "guidance",
    primary_text: "Comece registrando seu primeiro dia.",
    secondary_text: "Registrar o uso diário fortalece sua jornada.",
    active: true,
  },
  first_experience_marked: {
    context: "first_experience",
    tone_type: "recognition",
    primary_text: "Excelente início.",
    secondary_text: "Seu primeiro dia foi registrado. Continue no seu ritmo.",
    active: true,
  },
  first_experience_organized: {
    context: "first_experience",
    tone_type: "calm",
    primary_text: "Tudo já está organizado.",
    active: true,
  },
};

// ─── Accessor helper ─────────────────────────────────────────
export function getCopy(key: string): CopyEntry {
  return COPY_LIBRARY[key] ?? {
    context: "unknown",
    tone_type: "neutral" as ToneType,
    primary_text: key,
    active: false,
  };
}

export function t(key: string): string {
  return getCopy(key).primary_text;
}

export function t2(key: string): string {
  return getCopy(key).secondary_text ?? "";
}

// ─── Template helper ─────────────────────────────────────────
export function tpl(key: string, vars: Record<string, string | number>): string {
  let text = t(key);
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, String(v));
  }
  return text;
}
