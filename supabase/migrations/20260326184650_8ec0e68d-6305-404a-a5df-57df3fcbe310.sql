
-- ============================================================
-- MULTI-TENANT v2: Full data model rewrite
-- ============================================================

-- 1. DROP old tables and types from v1
DROP POLICY IF EXISTS "Platform admins can manage all tenant users" ON public.tenant_users;
DROP POLICY IF EXISTS "Tenant admins can view their tenant users" ON public.tenant_users;
DROP POLICY IF EXISTS "Tenant owners can manage their tenant users" ON public.tenant_users;
DROP POLICY IF EXISTS "Platform admins can manage all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Tenant members can view their tenant" ON public.tenants;
DROP POLICY IF EXISTS "Platform admins can manage platform users" ON public.platform_users;
DROP POLICY IF EXISTS "Users can see their own platform role" ON public.platform_users;

DROP TABLE IF EXISTS public.tenant_users CASCADE;
DROP TABLE IF EXISTS public.platform_users CASCADE;

DROP FUNCTION IF EXISTS public.is_tenant_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.has_tenant_role(uuid, uuid, tenant_role);
DROP FUNCTION IF EXISTS public.is_platform_admin(uuid);
DROP FUNCTION IF EXISTS public.get_user_tenant_ids(uuid);

DROP TYPE IF EXISTS public.tenant_role;
DROP TYPE IF EXISTS public.platform_role;

-- 2. ENUM for membership roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'partner', 'client');

-- 3. MEMBERSHIPS table (replaces tenant_users + platform_users)
CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'client',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id, role)
);
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- 4. CLIENTS table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id)
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 5. PARTNERS table (with hierarchy)
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  parent_partner_id uuid REFERENCES public.partners(id),
  referral_code text NOT NULL,
  level text DEFAULT 'bronze',
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id),
  UNIQUE (referral_code, tenant_id)
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- 6. CONTENT table
CREATE TABLE public.content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  content_type text DEFAULT 'article',
  published boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- 7. COMMISSIONS table (tenant-scoped)
CREATE TABLE public.mt_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  source_type text,
  source_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mt_commissions ENABLE ROW LEVEL SECURITY;

-- 8. REFERRALS table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 9. GAMIFICATION table
CREATE TABLE public.gamification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  level text DEFAULT 'beginner',
  metadata jsonb DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================================

-- Check if user has a role in a tenant (or is super_admin)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _tenant_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id
      AND active = true
      AND (
        (role = _role AND tenant_id = _tenant_id)
        OR role = 'super_admin'
      )
  )
$$;

-- Check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id AND role = 'super_admin' AND tenant_id IS NULL AND active = true
  )
$$;

-- Check if user belongs to a tenant (any role)
CREATE OR REPLACE FUNCTION public.belongs_to_tenant(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id AND active = true
      AND (tenant_id = _tenant_id OR role = 'super_admin')
  )
$$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- TENANTS
DROP POLICY IF EXISTS "Allow anonymous inserts with valid tenant" ON public.quiz_submissions;

CREATE POLICY "Super admins manage all tenants"
  ON public.tenants FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Members view own tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (public.belongs_to_tenant(auth.uid(), id));

-- MEMBERSHIPS
CREATE POLICY "Super admins manage all memberships"
  ON public.memberships FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users view own memberships"
  ON public.memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage tenant memberships"
  ON public.memberships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'admin'));

-- CLIENTS
CREATE POLICY "Super admins manage all clients"
  ON public.clients FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins manage clients"
  ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'admin'));

CREATE POLICY "Clients view own record"
  ON public.clients FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- PARTNERS
CREATE POLICY "Super admins manage all partners"
  ON public.partners FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins manage partners"
  ON public.partners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'admin'));

CREATE POLICY "Partners view own record"
  ON public.partners FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- CONTENT
CREATE POLICY "Super admins manage all content"
  ON public.content FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins manage content"
  ON public.content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'admin'));

CREATE POLICY "Tenant members view published content"
  ON public.content FOR SELECT TO authenticated
  USING (published = true AND public.belongs_to_tenant(auth.uid(), tenant_id));

-- MT_COMMISSIONS
CREATE POLICY "Super admins manage all commissions"
  ON public.mt_commissions FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view commissions"
  ON public.mt_commissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'admin'));

CREATE POLICY "Partners view own commissions"
  ON public.mt_commissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = partner_id AND p.user_id = auth.uid()
    )
  );

-- REFERRALS
CREATE POLICY "Super admins manage all referrals"
  ON public.referrals FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'admin'));

CREATE POLICY "Partners view own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = partner_id AND p.user_id = auth.uid()
    )
  );

-- GAMIFICATION
CREATE POLICY "Super admins manage all gamification"
  ON public.gamification FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view gamification"
  ON public.gamification FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), tenant_id, 'admin'));

CREATE POLICY "Users view own gamification"
  ON public.gamification FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- QUIZ_SUBMISSIONS (re-add anon insert)
CREATE POLICY "Anon can insert quiz submissions"
  ON public.quiz_submissions FOR INSERT TO anon
  WITH CHECK (true);
