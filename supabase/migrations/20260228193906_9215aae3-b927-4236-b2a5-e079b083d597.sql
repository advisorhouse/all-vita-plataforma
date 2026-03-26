
-- Activation status tracking for 7-day flow
CREATE TABLE public.client_activation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  day_counter INTEGER NOT NULL DEFAULT 0,
  activation_completed BOOLEAN NOT NULL DEFAULT false,
  days_marked INTEGER[] NOT NULL DEFAULT '{}',
  logins_count INTEGER NOT NULL DEFAULT 0,
  content_consumed INTEGER NOT NULL DEFAULT 0,
  activation_score INTEGER NOT NULL DEFAULT 0,
  early_risk_flag BOOLEAN NOT NULL DEFAULT false,
  badge_first_week BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ DEFAULT now(),
  welcome_modal_seen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.client_activation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activation" ON public.client_activation
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own activation" ON public.client_activation
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activation" ON public.client_activation
  FOR INSERT WITH CHECK (auth.uid() = user_id);
