
-- ============================================================
-- A5: AUDITORIA COMPLETA + LGPD-READY
-- ============================================================

-- 1. EXPAND audit_logs with actor_type, entity tracking, old/new data, user_agent
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_type text DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id uuid,
  ADD COLUMN IF NOT EXISTS old_data jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS new_data jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS user_agent text;

-- Make audit_logs append-only: drop existing UPDATE/DELETE policies, block updates/deletes
DROP POLICY IF EXISTS "Service role insert logs" ON public.audit_logs;

CREATE POLICY "Anyone insert audit_logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Block UPDATE on audit_logs
CREATE POLICY "Block update audit_logs"
  ON public.audit_logs FOR UPDATE TO authenticated
  USING (false);

-- Block DELETE on audit_logs
CREATE POLICY "Block delete audit_logs"
  ON public.audit_logs FOR DELETE TO authenticated
  USING (false);

-- 2. CREATE entity_versions table
CREATE TABLE IF NOT EXISTS public.entity_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  version integer NOT NULL DEFAULT 1,
  data_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.entity_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view all versions"
  ON public.entity_versions FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Authenticated insert versions"
  ON public.entity_versions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Block update versions"
  ON public.entity_versions FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "Block delete versions"
  ON public.entity_versions FOR DELETE TO authenticated
  USING (false);

CREATE INDEX IF NOT EXISTS idx_entity_versions_lookup
  ON public.entity_versions (entity_type, entity_id, version);

-- 3. EXPAND access_logs with module and location
ALTER TABLE public.access_logs
  ADD COLUMN IF NOT EXISTS module text,
  ADD COLUMN IF NOT EXISTS location text;

-- 4. EXPAND security_events with severity
ALTER TABLE public.security_events
  ADD COLUMN IF NOT EXISTS severity text DEFAULT 'medium';

-- Ensure security_events are append-only
CREATE POLICY "Authenticated insert security_events"
  ON public.security_events FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Block update security_events"
  ON public.security_events FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "Block delete security_events"
  ON public.security_events FOR DELETE TO authenticated
  USING (false);

-- 5. DB function: create_audit_log (convenience)
CREATE OR REPLACE FUNCTION public.create_audit_log(
  _user_id uuid,
  _tenant_id uuid,
  _actor_type text,
  _action text,
  _entity_type text DEFAULT NULL,
  _entity_id uuid DEFAULT NULL,
  _old_data jsonb DEFAULT '{}'::jsonb,
  _new_data jsonb DEFAULT '{}'::jsonb,
  _ip text DEFAULT NULL,
  _user_agent text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, tenant_id, actor_type, action, entity_type, entity_id,
    old_data, new_data, ip, user_agent, details
  ) VALUES (
    _user_id, _tenant_id, _actor_type, _action, _entity_type, _entity_id,
    _old_data, _new_data, _ip, _user_agent, _metadata
  )
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

-- 6. DB function: create_entity_version
CREATE OR REPLACE FUNCTION public.create_entity_version(
  _entity_type text,
  _entity_id uuid,
  _data_snapshot jsonb,
  _changed_by uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version integer;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM public.entity_versions
  WHERE entity_type = _entity_type AND entity_id = _entity_id;

  INSERT INTO public.entity_versions (entity_type, entity_id, version, data_snapshot, changed_by)
  VALUES (_entity_type, _entity_id, next_version, _data_snapshot, _changed_by);

  RETURN next_version;
END;
$$;

-- 7. DB function: anonymize_user_data (LGPD right to be forgotten)
CREATE OR REPLACE FUNCTION public.anonymize_user_data(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Anonymize profile
  UPDATE public.profiles SET
    first_name = 'ANONIMIZADO',
    last_name = NULL,
    phone = NULL,
    cpf_encrypted = NULL,
    avatar_url = NULL,
    email = 'anon_' || _user_id::text || '@removed.local',
    is_active = false
  WHERE id = _user_id;

  -- Anonymize client records
  UPDATE public.clients SET
    full_name = 'ANONIMIZADO',
    phone = NULL,
    metadata = '{}'::jsonb
  WHERE user_id = _user_id;

  -- Log the anonymization
  PERFORM create_audit_log(
    _user_id, NULL, 'system', 'lgpd_anonymization',
    'user', _user_id, '{}'::jsonb, '{"status":"anonymized"}'::jsonb
  );
END;
$$;

-- 8. Cleanup: ensure access_logs also block update/delete
CREATE POLICY "Block update access_logs"
  ON public.access_logs FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "Block delete access_logs"
  ON public.access_logs FOR DELETE TO authenticated
  USING (false);
