-- 1. user_security: 2FA settings per user
CREATE TABLE public.user_security (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  two_fa_enabled boolean NOT NULL DEFAULT false,
  two_fa_secret text, -- encrypted TOTP secret
  backup_codes jsonb DEFAULT '[]'::jsonb,
  last_2fa_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own security" ON public.user_security
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users update own security" ON public.user_security
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users insert own security" ON public.user_security
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins manage all security" ON public.user_security
  FOR ALL TO authenticated USING (is_super_admin(auth.uid()));

-- 2. security_events: fraud detection & suspicious activity
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL, -- login_fail, suspicious_access, brute_force, 2fa_fail, account_locked
  ip text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view all security_events" ON public.security_events
  FOR ALL TO authenticated USING (is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view tenant events" ON public.security_events
  FOR SELECT TO authenticated USING (
    user_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM memberships m1
      WHERE m1.user_id = auth.uid() AND m1.active = true
        AND m1.role IN ('admin'::app_role, 'manager'::app_role)
        AND EXISTS (
          SELECT 1 FROM memberships m2
          WHERE m2.user_id = security_events.user_id
            AND m2.tenant_id = m1.tenant_id AND m2.active = true
        )
    )
  );

CREATE INDEX idx_security_events_user ON public.security_events(user_id);
CREATE INDEX idx_security_events_type ON public.security_events(type);
CREATE INDEX idx_security_events_created ON public.security_events(created_at DESC);

-- 3. access_logs: detailed access tracking
CREATE TABLE public.access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  action text NOT NULL, -- login, logout, password_change, module_access, 2fa_setup
  ip text,
  device text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own access_logs" ON public.access_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Super admins view all access_logs" ON public.access_logs
  FOR ALL TO authenticated USING (is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view tenant access_logs" ON public.access_logs
  FOR SELECT TO authenticated USING (
    tenant_id IS NOT NULL AND has_role(auth.uid(), tenant_id, 'admin'::app_role)
  );

-- Allow authenticated users to insert their own logs
CREATE POLICY "Users insert own access_logs" ON public.access_logs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_access_logs_user ON public.access_logs(user_id);
CREATE INDEX idx_access_logs_tenant ON public.access_logs(tenant_id);
CREATE INDEX idx_access_logs_created ON public.access_logs(created_at DESC);

-- 4. rate_limits: track request counts for rate limiting
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL, -- e.g., "login:ip:192.168.1.1" or "api:user:uuid"
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes')
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.rate_limits
  FOR ALL TO authenticated USING (is_super_admin(auth.uid()));

CREATE INDEX idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX idx_rate_limits_expires ON public.rate_limits(expires_at);

-- 5. Function to check and increment rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _key text,
  _max_count integer DEFAULT 10,
  _window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  -- Clean expired entries
  DELETE FROM public.rate_limits WHERE expires_at < now();
  
  -- Get current count
  SELECT count INTO current_count
  FROM public.rate_limits
  WHERE key = _key AND expires_at > now();
  
  IF current_count IS NULL THEN
    -- First request in window
    INSERT INTO public.rate_limits (key, count, window_start, expires_at)
    VALUES (_key, 1, now(), now() + (_window_minutes || ' minutes')::interval);
    RETURN true;
  ELSIF current_count >= _max_count THEN
    RETURN false; -- Rate limited
  ELSE
    UPDATE public.rate_limits
    SET count = count + 1
    WHERE key = _key AND expires_at > now();
    RETURN true;
  END IF;
END;
$$;

-- 6. Function to log security events (callable from edge functions)
CREATE OR REPLACE FUNCTION public.log_security_event(
  _user_id uuid,
  _type text,
  _ip text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (user_id, type, ip, metadata)
  VALUES (_user_id, _type, _ip, _metadata);
  
  -- Auto-lock after 5 failed login attempts in 15 minutes
  IF _type = 'login_fail' THEN
    IF (
      SELECT count(*) FROM public.security_events
      WHERE user_id = _user_id
        AND type = 'login_fail'
        AND created_at > now() - interval '15 minutes'
    ) >= 5 THEN
      INSERT INTO public.security_events (user_id, type, ip, metadata)
      VALUES (_user_id, 'account_locked', _ip, '{"reason":"brute_force","duration":"30m"}'::jsonb);
    END IF;
  END IF;
END;
$$;