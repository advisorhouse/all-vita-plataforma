
-- ============================================================
-- PERMISSIONS v2: Granular RBAC + Partner Hierarchy RLS
-- ============================================================

-- 1. PERMISSIONS TABLE (action-level permissions per role)
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  resource text NOT NULL,           -- e.g. 'clients', 'partners', 'content', 'commissions'
  action text NOT NULL,             -- 'read', 'create', 'update', 'delete'
  allowed boolean NOT NULL DEFAULT false,
  conditions jsonb DEFAULT '{}',    -- optional conditions like 'own_only', 'own_network'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, resource, action)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read permissions (they're config, not sensitive)
CREATE POLICY "Authenticated users can read permissions"
  ON public.role_permissions FOR SELECT TO authenticated
  USING (true);

-- Only super admins can manage permissions
CREATE POLICY "Super admins manage permissions"
  ON public.role_permissions FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- 2. SEED DEFAULT PERMISSIONS
INSERT INTO public.role_permissions (role, resource, action, allowed, conditions) VALUES
  -- super_admin: full access to everything
  ('super_admin', 'tenants',      'read',   true, '{}'),
  ('super_admin', 'tenants',      'create', true, '{}'),
  ('super_admin', 'tenants',      'update', true, '{}'),
  ('super_admin', 'tenants',      'delete', true, '{}'),
  ('super_admin', 'memberships',  'read',   true, '{}'),
  ('super_admin', 'memberships',  'create', true, '{}'),
  ('super_admin', 'memberships',  'update', true, '{}'),
  ('super_admin', 'memberships',  'delete', true, '{}'),
  ('super_admin', 'clients',      'read',   true, '{}'),
  ('super_admin', 'clients',      'create', true, '{}'),
  ('super_admin', 'clients',      'update', true, '{}'),
  ('super_admin', 'clients',      'delete', true, '{}'),
  ('super_admin', 'partners',     'read',   true, '{}'),
  ('super_admin', 'partners',     'create', true, '{}'),
  ('super_admin', 'partners',     'update', true, '{}'),
  ('super_admin', 'partners',     'delete', true, '{}'),
  ('super_admin', 'content',      'read',   true, '{}'),
  ('super_admin', 'content',      'create', true, '{}'),
  ('super_admin', 'content',      'update', true, '{}'),
  ('super_admin', 'content',      'delete', true, '{}'),
  ('super_admin', 'commissions',  'read',   true, '{}'),
  ('super_admin', 'commissions',  'create', true, '{}'),
  ('super_admin', 'commissions',  'update', true, '{}'),
  ('super_admin', 'commissions',  'delete', true, '{}'),
  ('super_admin', 'gamification', 'read',   true, '{}'),
  ('super_admin', 'gamification', 'create', true, '{}'),
  ('super_admin', 'gamification', 'update', true, '{}'),
  ('super_admin', 'gamification', 'delete', true, '{}'),
  ('super_admin', 'referrals',    'read',   true, '{}'),
  ('super_admin', 'referrals',    'create', true, '{}'),
  ('super_admin', 'referrals',    'update', true, '{}'),
  ('super_admin', 'referrals',    'delete', true, '{}'),

  -- admin: full CRUD within tenant
  ('admin', 'clients',      'read',   true, '{}'),
  ('admin', 'clients',      'create', true, '{}'),
  ('admin', 'clients',      'update', true, '{}'),
  ('admin', 'clients',      'delete', true, '{}'),
  ('admin', 'partners',     'read',   true, '{}'),
  ('admin', 'partners',     'create', true, '{}'),
  ('admin', 'partners',     'update', true, '{}'),
  ('admin', 'partners',     'delete', true, '{}'),
  ('admin', 'content',      'read',   true, '{}'),
  ('admin', 'content',      'create', true, '{}'),
  ('admin', 'content',      'update', true, '{}'),
  ('admin', 'content',      'delete', true, '{}'),
  ('admin', 'commissions',  'read',   true, '{}'),
  ('admin', 'commissions',  'create', true, '{}'),
  ('admin', 'commissions',  'update', true, '{}'),
  ('admin', 'commissions',  'delete', true, '{}'),
  ('admin', 'memberships',  'read',   true, '{}'),
  ('admin', 'memberships',  'create', true, '{}'),
  ('admin', 'memberships',  'update', true, '{}'),
  ('admin', 'memberships',  'delete', true, '{}'),
  ('admin', 'gamification', 'read',   true, '{}'),
  ('admin', 'gamification', 'create', true, '{}'),
  ('admin', 'gamification', 'update', true, '{}'),
  ('admin', 'gamification', 'delete', true, '{}'),
  ('admin', 'referrals',    'read',   true, '{}'),
  ('admin', 'referrals',    'create', true, '{}'),
  ('admin', 'referrals',    'update', true, '{}'),
  ('admin', 'referrals',    'delete', true, '{}'),

  -- manager: read + limited create/update, no delete on critical resources
  ('manager', 'clients',      'read',   true, '{}'),
  ('manager', 'clients',      'create', true, '{}'),
  ('manager', 'clients',      'update', true, '{}'),
  ('manager', 'clients',      'delete', false, '{}'),
  ('manager', 'partners',     'read',   true, '{}'),
  ('manager', 'partners',     'create', false, '{}'),
  ('manager', 'partners',     'update', false, '{}'),
  ('manager', 'partners',     'delete', false, '{}'),
  ('manager', 'content',      'read',   true, '{}'),
  ('manager', 'content',      'create', true, '{}'),
  ('manager', 'content',      'update', true, '{}'),
  ('manager', 'content',      'delete', false, '{}'),
  ('manager', 'commissions',  'read',   true, '{}'),
  ('manager', 'commissions',  'create', false, '{}'),
  ('manager', 'commissions',  'update', false, '{}'),
  ('manager', 'commissions',  'delete', false, '{}'),
  ('manager', 'memberships',  'read',   true, '{}'),
  ('manager', 'memberships',  'create', false, '{}'),
  ('manager', 'memberships',  'update', false, '{}'),
  ('manager', 'memberships',  'delete', false, '{}'),
  ('manager', 'gamification', 'read',   true, '{}'),
  ('manager', 'gamification', 'create', false, '{}'),
  ('manager', 'gamification', 'update', false, '{}'),
  ('manager', 'gamification', 'delete', false, '{}'),
  ('manager', 'referrals',    'read',   true, '{}'),
  ('manager', 'referrals',    'create', false, '{}'),
  ('manager', 'referrals',    'update', false, '{}'),
  ('manager', 'referrals',    'delete', false, '{}'),

  -- partner: own data + network hierarchy
  ('partner', 'clients',      'read',   true, '{"scope":"own_network"}'),
  ('partner', 'clients',      'create', false, '{}'),
  ('partner', 'clients',      'update', false, '{}'),
  ('partner', 'clients',      'delete', false, '{}'),
  ('partner', 'partners',     'read',   true, '{"scope":"own_downline"}'),
  ('partner', 'partners',     'create', false, '{}'),
  ('partner', 'partners',     'update', false, '{}'),
  ('partner', 'partners',     'delete', false, '{}'),
  ('partner', 'content',      'read',   true, '{"scope":"published"}'),
  ('partner', 'content',      'create', false, '{}'),
  ('partner', 'content',      'update', false, '{}'),
  ('partner', 'content',      'delete', false, '{}'),
  ('partner', 'commissions',  'read',   true, '{"scope":"own_only"}'),
  ('partner', 'commissions',  'create', false, '{}'),
  ('partner', 'commissions',  'update', false, '{}'),
  ('partner', 'commissions',  'delete', false, '{}'),
  ('partner', 'referrals',    'read',   true, '{"scope":"own_only"}'),
  ('partner', 'referrals',    'create', true, '{}'),
  ('partner', 'referrals',    'update', false, '{}'),
  ('partner', 'referrals',    'delete', false, '{}'),
  ('partner', 'gamification', 'read',   true, '{"scope":"own_only"}'),
  ('partner', 'gamification', 'create', false, '{}'),
  ('partner', 'gamification', 'update', false, '{}'),
  ('partner', 'gamification', 'delete', false, '{}'),

  -- client: own data only
  ('client', 'clients',      'read',   true, '{"scope":"own_only"}'),
  ('client', 'clients',      'create', false, '{}'),
  ('client', 'clients',      'update', true, '{"scope":"own_only"}'),
  ('client', 'clients',      'delete', false, '{}'),
  ('client', 'content',      'read',   true, '{"scope":"published"}'),
  ('client', 'content',      'create', false, '{}'),
  ('client', 'content',      'update', false, '{}'),
  ('client', 'content',      'delete', false, '{}'),
  ('client', 'gamification', 'read',   true, '{"scope":"own_only"}'),
  ('client', 'gamification', 'create', false, '{}'),
  ('client', 'gamification', 'update', false, '{}'),
  ('client', 'gamification', 'delete', false, '{}');

-- 3. PARTNER HIERARCHY FUNCTION (recursive downline check)
CREATE OR REPLACE FUNCTION public.is_in_partner_downline(
  _parent_partner_id uuid,
  _child_partner_id uuid
)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE downline AS (
    SELECT id, parent_partner_id, tenant_id
    FROM public.partners
    WHERE id = _parent_partner_id
    UNION ALL
    SELECT p.id, p.parent_partner_id, p.tenant_id
    FROM public.partners p
    INNER JOIN downline d ON p.parent_partner_id = d.id
  )
  SELECT EXISTS (
    SELECT 1 FROM downline WHERE id = _child_partner_id
  )
$$;

-- Get partner ID for a user in a specific tenant
CREATE OR REPLACE FUNCTION public.get_partner_id(_user_id uuid, _tenant_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.partners
  WHERE user_id = _user_id AND tenant_id = _tenant_id AND active = true
  LIMIT 1
$$;

-- Check permission for a role on a resource+action
CREATE OR REPLACE FUNCTION public.check_permission(
  _role public.app_role,
  _resource text,
  _action text
)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT allowed FROM public.role_permissions
     WHERE role = _role AND resource = _resource AND action = _action),
    false
  )
$$;

-- 4. UPDATE PARTNER RLS POLICIES to include hierarchy
-- Drop old simple partner policies
DROP POLICY IF EXISTS "Partners view own record" ON public.partners;

-- Partners can see themselves + their downline
CREATE POLICY "Partners view own and downline"
  ON public.partners FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_in_partner_downline(
      public.get_partner_id(auth.uid(), tenant_id),
      id
    )
  );

-- Update referrals: partners see referrals from their network
DROP POLICY IF EXISTS "Partners view own referrals" ON public.referrals;

CREATE POLICY "Partners view own and downline referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = referrals.tenant_id
        AND (
          p.id = partner_id
          OR public.is_in_partner_downline(p.id, partner_id)
        )
    )
  );

-- Partners can create referrals for themselves
CREATE POLICY "Partners can create own referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = partner_id AND p.user_id = auth.uid()
    )
  );

-- Update commissions: partners see commissions from their network
DROP POLICY IF EXISTS "Partners view own commissions" ON public.mt_commissions;

CREATE POLICY "Partners view own and downline commissions"
  ON public.mt_commissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.user_id = auth.uid()
        AND p.tenant_id = mt_commissions.tenant_id
        AND (
          p.id = partner_id
          OR public.is_in_partner_downline(p.id, partner_id)
        )
    )
  );

-- Clients can update their own record
DROP POLICY IF EXISTS "Clients view own record" ON public.clients;

CREATE POLICY "Clients view own record"
  ON public.clients FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Clients update own record"
  ON public.clients FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Manager policies (same as admin for SELECT, restricted for mutations)
CREATE POLICY "Managers view tenant clients"
  ON public.clients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'manager'));

CREATE POLICY "Managers view tenant partners"
  ON public.partners FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'manager'));

CREATE POLICY "Managers view tenant content"
  ON public.content FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'manager'));

CREATE POLICY "Managers view tenant commissions"
  ON public.mt_commissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'manager'));

CREATE POLICY "Managers view tenant referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'manager'));

CREATE POLICY "Managers view tenant gamification"
  ON public.gamification FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'manager'));
