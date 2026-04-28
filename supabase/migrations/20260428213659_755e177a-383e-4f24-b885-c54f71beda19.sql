
-- =========================================================
-- FASE 1.1: RBAC — estrutura principal
-- =========================================================

-- 1) Migrar staff antigos (memberships com tenant_id NULL) para all_vita_staff
INSERT INTO public.all_vita_staff (user_id, role, is_active, permissions)
SELECT DISTINCT m.user_id,
  CASE
    WHEN m.role::text = 'super_admin' THEN 'super_admin'::public.staff_role
    WHEN m.role::text = 'admin' THEN 'admin'::public.staff_role
    WHEN m.role::text = 'manager' THEN 'manager'::public.staff_role
    ELSE 'staff'::public.staff_role
  END,
  true,
  '{"can_view_logs": true, "can_manage_users": true, "can_manage_tenants": true, "can_view_financials": true, "can_manage_integrations": true}'::jsonb
FROM public.memberships m
WHERE m.tenant_id IS NULL
  AND m.active = true
  AND m.role::text IN ('super_admin', 'admin')
  AND NOT EXISTS (
    SELECT 1 FROM public.all_vita_staff s WHERE s.user_id = m.user_id
  );

-- 2) Garantir tiagorsantos.br@gmail.com como super_admin
INSERT INTO public.all_vita_staff (user_id, role, is_active, permissions)
SELECT p.id, 'super_admin'::public.staff_role, true,
  '{"can_view_logs": true, "can_manage_users": true, "can_manage_tenants": true, "can_view_financials": true, "can_manage_integrations": true}'::jsonb
FROM public.profiles p
WHERE p.email = 'tiagorsantos.br@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.all_vita_staff s WHERE s.user_id = p.id);

UPDATE public.all_vita_staff
SET role = 'super_admin', is_active = true
WHERE user_id IN (SELECT id FROM public.profiles WHERE email = 'tiagorsantos.br@gmail.com');

-- 3) Atualizar is_super_admin para consultar all_vita_staff
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.all_vita_staff
    WHERE user_id = _user_id
      AND role = 'super_admin'
      AND is_active = true
  )
  OR EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id
      AND role::text IN ('super_admin', 'admin')
      AND tenant_id IS NULL
      AND active = true
  )
$$;

-- 4) Nova função: is_platform_staff
CREATE OR REPLACE FUNCTION public.is_platform_staff(_user_id uuid, _role public.staff_role DEFAULT NULL)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.all_vita_staff
    WHERE user_id = _user_id
      AND is_active = true
      AND (_role IS NULL OR role = _role OR role = 'super_admin')
  )
$$;

-- =========================================================
-- 5) Tabela platform_role_permissions
-- =========================================================
CREATE TABLE IF NOT EXISTS public.platform_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.staff_role NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, resource, action)
);

ALTER TABLE public.platform_role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform staff view permissions"
  ON public.platform_role_permissions FOR SELECT
  TO authenticated
  USING (public.is_platform_staff(auth.uid(), NULL));

CREATE POLICY "Super admin manages platform permissions"
  ON public.platform_role_permissions FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

INSERT INTO public.platform_role_permissions (role, resource, action, allowed) VALUES
  ('super_admin','tenants','read',true), ('super_admin','tenants','create',true), ('super_admin','tenants','update',true), ('super_admin','tenants','delete',true),
  ('super_admin','users','read',true),   ('super_admin','users','create',true),   ('super_admin','users','update',true),   ('super_admin','users','delete',true),
  ('super_admin','staff','read',true),   ('super_admin','staff','create',true),   ('super_admin','staff','update',true),   ('super_admin','staff','delete',true),
  ('super_admin','financials','read',true), ('super_admin','financials','create',true), ('super_admin','financials','update',true), ('super_admin','financials','delete',true),
  ('super_admin','integrations','read',true), ('super_admin','integrations','create',true), ('super_admin','integrations','update',true), ('super_admin','integrations','delete',true),
  ('super_admin','audit','read',true),
  ('super_admin','vitacoins','read',true), ('super_admin','vitacoins','create',true), ('super_admin','vitacoins','update',true), ('super_admin','vitacoins','delete',true),
  ('super_admin','permissions','read',true), ('super_admin','permissions','update',true),

  ('admin','tenants','read',true), ('admin','tenants','create',true), ('admin','tenants','update',true), ('admin','tenants','delete',false),
  ('admin','users','read',true),   ('admin','users','create',true),   ('admin','users','update',true),   ('admin','users','delete',false),
  ('admin','staff','read',true),   ('admin','staff','create',false),  ('admin','staff','update',false),  ('admin','staff','delete',false),
  ('admin','financials','read',true), ('admin','financials','create',true), ('admin','financials','update',true), ('admin','financials','delete',false),
  ('admin','integrations','read',true), ('admin','integrations','create',true), ('admin','integrations','update',true), ('admin','integrations','delete',false),
  ('admin','audit','read',true),
  ('admin','vitacoins','read',true), ('admin','vitacoins','create',true), ('admin','vitacoins','update',true), ('admin','vitacoins','delete',false),
  ('admin','permissions','read',true), ('admin','permissions','update',false),

  ('manager','tenants','read',true), ('manager','tenants','update',true),
  ('manager','users','read',true),   ('manager','users','update',true),
  ('manager','staff','read',true),
  ('manager','financials','read',true),
  ('manager','integrations','read',true), ('manager','integrations','update',true),
  ('manager','audit','read',true),
  ('manager','vitacoins','read',true), ('manager','vitacoins','update',true),
  ('manager','permissions','read',true),

  ('staff','tenants','read',true),
  ('staff','users','read',true),
  ('staff','financials','read',true),
  ('staff','integrations','read',true),
  ('staff','audit','read',true),
  ('staff','vitacoins','read',true),
  ('staff','permissions','read',true)
ON CONFLICT (role, resource, action) DO NOTHING;

-- =========================================================
-- 6) Tabela tenant_role_permissions
-- =========================================================
CREATE TABLE IF NOT EXISTS public.tenant_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NULL,
  role public.app_role NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_role_perm_default_uidx
  ON public.tenant_role_permissions (role, resource, action)
  WHERE tenant_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS tenant_role_perm_override_uidx
  ON public.tenant_role_permissions (tenant_id, role, resource, action)
  WHERE tenant_id IS NOT NULL;

ALTER TABLE public.tenant_role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read tenant permissions"
  ON public.tenant_role_permissions FOR SELECT
  TO authenticated
  USING (
    tenant_id IS NULL
    OR public.belongs_to_tenant(auth.uid(), tenant_id)
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "Super admin manages tenant permission defaults"
  ON public.tenant_role_permissions FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant admin manages own overrides"
  ON public.tenant_role_permissions FOR ALL
  TO authenticated
  USING (
    tenant_id IS NOT NULL
    AND public.has_role(auth.uid(), tenant_id, 'admin'::public.app_role)
  )
  WITH CHECK (
    tenant_id IS NOT NULL
    AND public.has_role(auth.uid(), tenant_id, 'admin'::public.app_role)
  );

-- Trigger: override só pode restringir
CREATE OR REPLACE FUNCTION public.enforce_tenant_override_restrictive()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_allowed boolean;
BEGIN
  IF public.is_super_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF NEW.tenant_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT allowed INTO default_allowed
  FROM public.tenant_role_permissions
  WHERE tenant_id IS NULL
    AND role = NEW.role
    AND resource = NEW.resource
    AND action = NEW.action;

  IF NEW.allowed = true AND COALESCE(default_allowed, false) = false THEN
    RAISE EXCEPTION 'Override não pode liberar permissão que o default global bloqueia';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_tenant_override_restrictive ON public.tenant_role_permissions;
CREATE TRIGGER trg_enforce_tenant_override_restrictive
  BEFORE INSERT OR UPDATE ON public.tenant_role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_override_restrictive();

-- Seed dos defaults do tenant
INSERT INTO public.tenant_role_permissions (tenant_id, role, resource, action, allowed) VALUES
  (NULL,'admin','memberships','read',true),  (NULL,'admin','memberships','create',true),  (NULL,'admin','memberships','update',true),  (NULL,'admin','memberships','delete',true),
  (NULL,'admin','clients','read',true),       (NULL,'admin','clients','create',true),       (NULL,'admin','clients','update',true),       (NULL,'admin','clients','delete',true),
  (NULL,'admin','partners','read',true),      (NULL,'admin','partners','create',true),      (NULL,'admin','partners','update',true),      (NULL,'admin','partners','delete',true),
  (NULL,'admin','content','read',true),       (NULL,'admin','content','create',true),       (NULL,'admin','content','update',true),       (NULL,'admin','content','delete',true),
  (NULL,'admin','commissions','read',true),   (NULL,'admin','commissions','create',true),   (NULL,'admin','commissions','update',true),   (NULL,'admin','commissions','delete',true),
  (NULL,'admin','gamification','read',true),  (NULL,'admin','gamification','create',true),  (NULL,'admin','gamification','update',true),  (NULL,'admin','gamification','delete',true),
  (NULL,'admin','referrals','read',true),     (NULL,'admin','referrals','create',true),     (NULL,'admin','referrals','update',true),     (NULL,'admin','referrals','delete',true),
  (NULL,'admin','permissions','read',true),   (NULL,'admin','permissions','update',true),

  (NULL,'manager','memberships','read',true),
  (NULL,'manager','clients','read',true),    (NULL,'manager','clients','create',true), (NULL,'manager','clients','update',true),
  (NULL,'manager','partners','read',true),
  (NULL,'manager','content','read',true),    (NULL,'manager','content','create',true), (NULL,'manager','content','update',true),
  (NULL,'manager','commissions','read',true),
  (NULL,'manager','gamification','read',true),
  (NULL,'manager','referrals','read',true),
  (NULL,'manager','permissions','read',true),

  (NULL,'staff','clients','read',true),
  (NULL,'staff','partners','read',true),
  (NULL,'staff','content','read',true),
  (NULL,'staff','commissions','read',true),
  (NULL,'staff','gamification','read',true),
  (NULL,'staff','referrals','read',true),

  (NULL,'partner','clients','read',true),
  (NULL,'partner','partners','read',true),
  (NULL,'partner','content','read',true),
  (NULL,'partner','commissions','read',true),
  (NULL,'partner','gamification','read',true),
  (NULL,'partner','referrals','read',true),  (NULL,'partner','referrals','create',true),

  (NULL,'client','clients','read',true),     (NULL,'client','clients','update',true),
  (NULL,'client','content','read',true),
  (NULL,'client','gamification','read',true)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 7) Função unificada can()
-- =========================================================
CREATE OR REPLACE FUNCTION public.can(_user_id uuid, _resource text, _action text, _tenant_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_allowed boolean;
  v_staff_role public.staff_role;
  v_tenant_role public.app_role;
BEGIN
  IF public.is_super_admin(_user_id) THEN
    RETURN true;
  END IF;

  IF _tenant_id IS NULL THEN
    SELECT role INTO v_staff_role
    FROM public.all_vita_staff
    WHERE user_id = _user_id AND is_active = true
    LIMIT 1;

    IF v_staff_role IS NULL THEN
      RETURN false;
    END IF;

    SELECT allowed INTO v_allowed
    FROM public.platform_role_permissions
    WHERE role = v_staff_role AND resource = _resource AND action = _action;

    RETURN COALESCE(v_allowed, false);
  END IF;

  SELECT role INTO v_tenant_role
  FROM public.memberships
  WHERE user_id = _user_id AND tenant_id = _tenant_id AND active = true
  LIMIT 1;

  IF v_tenant_role IS NULL THEN
    RETURN false;
  END IF;

  SELECT allowed INTO v_allowed
  FROM public.tenant_role_permissions
  WHERE tenant_id = _tenant_id AND role = v_tenant_role AND resource = _resource AND action = _action;

  IF v_allowed IS NOT NULL THEN
    RETURN v_allowed;
  END IF;

  SELECT allowed INTO v_allowed
  FROM public.tenant_role_permissions
  WHERE tenant_id IS NULL AND role = v_tenant_role AND resource = _resource AND action = _action;

  RETURN COALESCE(v_allowed, false);
END;
$$;
