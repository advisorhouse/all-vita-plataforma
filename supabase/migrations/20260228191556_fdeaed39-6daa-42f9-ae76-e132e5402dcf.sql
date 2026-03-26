
-- ============================================================
-- API LAYER SCHEMA v1.0
-- webhook_logs, api_keys, rate_limit_logs
-- ============================================================

-- 1. API Keys for external partners
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  role text NOT NULL DEFAULT 'partner_api',
  permissions text[] NOT NULL DEFAULT '{}',
  rate_limit_per_minute integer NOT NULL DEFAULT 60,
  active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage api keys"
  ON public.api_keys FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Webhook logs (immutable audit trail)
CREATE TABLE public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'received',
  response_status integer,
  response_body text,
  retry_count integer NOT NULL DEFAULT 0,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view webhook logs"
  ON public.webhook_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Immutable: no update/delete from client
CREATE OR REPLACE FUNCTION public.prevent_webhook_log_modification()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  RAISE EXCEPTION 'Webhook logs are immutable. Updates and deletes are not allowed.';
  RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_webhook_log_update
  BEFORE UPDATE OR DELETE ON public.webhook_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_webhook_log_modification();

-- 3. API request logs for rate limiting and monitoring
CREATE TABLE public.api_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES public.api_keys(id),
  user_id uuid,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer NOT NULL,
  ip_address text,
  user_agent text,
  response_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view api logs"
  ON public.api_request_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Trigger for updated_at on api_keys
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Index for rate limiting queries
CREATE INDEX idx_api_request_logs_key_created ON public.api_request_logs (api_key_id, created_at DESC);
CREATE INDEX idx_api_request_logs_user_created ON public.api_request_logs (user_id, created_at DESC);
CREATE INDEX idx_webhook_logs_source_created ON public.webhook_logs (source, created_at DESC);
