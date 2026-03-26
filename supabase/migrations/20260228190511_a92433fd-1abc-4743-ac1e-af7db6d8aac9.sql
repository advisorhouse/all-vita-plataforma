
-- Add risk_level to client_profiles
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS risk_level TEXT NOT NULL DEFAULT 'low';

-- Add retention_score to affiliates
ALTER TABLE public.affiliates
  ADD COLUMN IF NOT EXISTS retention_score NUMERIC(5,2) NOT NULL DEFAULT 0;

-- AI Model Logs (audit trail for engine runs)
CREATE TABLE public.ai_model_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT NOT NULL DEFAULT 'v1.0',
  model_type TEXT NOT NULL, -- 'churn', 'ltv', 'engagement', 'affiliate_score'
  processed_clients INTEGER NOT NULL DEFAULT 0,
  processing_time_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_model_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view ai logs" ON public.ai_model_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System insert ai logs" ON public.ai_model_logs FOR INSERT WITH CHECK (true);

-- AI Alerts
CREATE TABLE public.ai_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_role app_role NOT NULL, -- who should see this alert
  target_user_id UUID, -- specific user (null = all of that role)
  alert_type TEXT NOT NULL, -- 'churn_spike', 'low_retention_affiliate', 'segment_insight', 'client_at_risk', 'incentive_trigger'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  metadata JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  actioned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_alerts ENABLE ROW LEVEL SECURITY;

-- Alerts: users see their own or role-based alerts
CREATE POLICY "Users view own alerts" ON public.ai_alerts FOR SELECT USING (
  target_user_id = auth.uid()
  OR (target_user_id IS NULL AND (
    (target_role = 'admin' AND public.has_role(auth.uid(), 'admin'))
    OR (target_role = 'affiliate' AND public.has_role(auth.uid(), 'affiliate'))
    OR (target_role = 'client' AND public.has_role(auth.uid(), 'client'))
  ))
);
CREATE POLICY "Users update own alerts" ON public.ai_alerts FOR UPDATE USING (
  target_user_id = auth.uid()
  OR (target_user_id IS NULL AND public.has_role(auth.uid(), 'admin'))
);
CREATE POLICY "Admins manage all alerts" ON public.ai_alerts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Client usage tracking table (for engagement/churn calculation)
CREATE TABLE public.client_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id),
  event_type TEXT NOT NULL, -- 'login', 'usage_mark', 'content_view', 'profile_update', 'benefit_interaction'
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_client_usage_logs_client ON public.client_usage_logs(client_id, created_at DESC);
CREATE INDEX idx_client_usage_logs_type ON public.client_usage_logs(event_type, created_at DESC);

CREATE POLICY "Clients insert own logs" ON public.client_usage_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.client_profiles cp WHERE cp.id = client_usage_logs.client_id AND cp.user_id = auth.uid())
);
CREATE POLICY "Clients view own logs" ON public.client_usage_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.client_profiles cp WHERE cp.id = client_usage_logs.client_id AND cp.user_id = auth.uid())
);
CREATE POLICY "Admins manage usage logs" ON public.client_usage_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime on ai_alerts for live notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_alerts;
