
-- ============================================================
-- GAMIFICATION ENGINE SCHEMA
-- ============================================================

-- 1. Client level enum
CREATE TYPE public.client_level AS ENUM ('inicio', 'consistencia', 'protecao_ativa', 'longevidade', 'elite_vision');

-- 2. Affiliate level already exists as partner_level enum (basic, premium, elite)
-- Add 'advanced' to partner_level if needed — but enums can't easily add mid-values
-- We'll use a separate field for affiliate gamification level

-- 3. Add gamification columns to client_profiles
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'inicio',
  ADD COLUMN IF NOT EXISTS level_progress numeric NOT NULL DEFAULT 0;

-- 4. Add gamification columns to affiliates
ALTER TABLE public.affiliates
  ADD COLUMN IF NOT EXISTS affiliate_level text NOT NULL DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS affiliate_progress numeric NOT NULL DEFAULT 0;

-- 5. Gamification benefits (admin-configurable)
CREATE TABLE public.gamification_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  required_months integer NOT NULL,
  benefit_type text NOT NULL DEFAULT 'reward',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gamification_benefits ENABLE ROW LEVEL SECURITY;

-- Everyone can read active benefits
CREATE POLICY "Anyone can view active benefits"
  ON public.gamification_benefits FOR SELECT
  USING (active = true);

-- Admins manage benefits
CREATE POLICY "Admins manage benefits"
  ON public.gamification_benefits FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Client unlocked benefits tracking
CREATE TABLE public.client_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  benefit_id uuid NOT NULL REFERENCES public.gamification_benefits(id),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  redeemed boolean NOT NULL DEFAULT false,
  UNIQUE(client_id, benefit_id)
);

ALTER TABLE public.client_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own benefits"
  ON public.client_benefits FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM client_profiles cp WHERE cp.id = client_benefits.client_id AND cp.user_id = auth.uid()
  ));

CREATE POLICY "Admins manage client benefits"
  ON public.client_benefits FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Monthly challenges
CREATE TABLE public.monthly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  required_usage_days integer NOT NULL DEFAULT 25,
  reward_description text NOT NULL,
  reward_consistency_bonus integer NOT NULL DEFAULT 10,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.monthly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON public.monthly_challenges FOR SELECT
  USING (active = true);

CREATE POLICY "Admins manage challenges"
  ON public.monthly_challenges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. Client challenge progress
CREATE TABLE public.client_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.client_profiles(id),
  challenge_id uuid NOT NULL REFERENCES public.monthly_challenges(id),
  usage_days integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, challenge_id)
);

ALTER TABLE public.client_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own challenge progress"
  ON public.client_challenge_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM client_profiles cp WHERE cp.id = client_challenge_progress.client_id AND cp.user_id = auth.uid()
  ));

CREATE POLICY "Admins manage challenge progress"
  ON public.client_challenge_progress FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. Insert default benefits
INSERT INTO public.gamification_benefits (title, description, required_months, benefit_type) VALUES
  ('Frete Reduzido', 'Frete reduzido permanente em todos os envios', 3, 'shipping'),
  ('Brinde Exclusivo', 'Brinde exclusivo de edição limitada no próximo envio', 6, 'gift'),
  ('Desconto Progressivo', '10% de desconto progressivo no próximo ciclo', 9, 'discount'),
  ('Benefício Premium', 'Acesso a produtos premium e atendimento prioritário', 12, 'premium');

-- 10. Insert default challenge for current month
INSERT INTO public.monthly_challenges (title, description, month, year, required_usage_days, reward_description, reward_consistency_bonus) VALUES
  ('Desafio 30 Dias de Proteção Visual', 'Use seu produto Vision Lift por pelo menos 25 dias este mês', 2, 2026, 25, 'Badge exclusivo + 10 pontos de consistência', 10);

-- 11. Trigger for updated_at on gamification_benefits
CREATE TRIGGER update_gamification_benefits_updated_at
  BEFORE UPDATE ON public.gamification_benefits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
