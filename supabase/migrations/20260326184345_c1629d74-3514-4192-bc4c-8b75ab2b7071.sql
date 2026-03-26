
-- ============================================================
-- MULTI-TENANT ARCHITECTURE FOR ALL VITA
-- ============================================================

-- 1. ENUM for tenant user roles
CREATE TYPE public.tenant_role AS ENUM ('owner', 'admin', 'manager', 'member');

-- 2. ENUM for platform-level roles (All Vita super admin)
CREATE TYPE public.platform_role AS ENUM ('super_admin', 'support', 'viewer');

-- 3. TENANTS table (each company registered in All Vita)
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#6366f1',
  secondary_color text DEFAULT '#8b5cf6',
  domain text,
  active boolean NOT NULL DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 4. TENANT_USERS table (maps auth users to tenants with roles)
CREATE TABLE public.tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role tenant_role NOT NULL DEFAULT 'member',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- 5. PLATFORM_USERS table (All Vita super admins)
CREATE TABLE public.platform_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role platform_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_users ENABLE ROW LEVEL SECURITY;

-- 6. Add tenant_id to quiz_submissions for future tenant scoping
ALTER TABLE public.quiz_submissions ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

-- ============================================================
-- SECURITY DEFINER FUNCTIONS (prevent RLS recursion)
-- ============================================================

-- Check if user belongs to a tenant
CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_users
    WHERE user_id = _user_id AND tenant_id = _tenant_id AND active = true
  )
$$;

-- Check if user has a specific role in a tenant
CREATE OR REPLACE FUNCTION public.has_tenant_role(_user_id uuid, _tenant_id uuid, _role tenant_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_users
    WHERE user_id = _user_id AND tenant_id = _tenant_id AND role = _role AND active = true
  )
$$;

-- Check if user is a platform super admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Get all tenant IDs for a user
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.tenant_users
  WHERE user_id = _user_id AND active = true
$$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- TENANTS: platform admins see all, tenant members see their own
CREATE POLICY "Platform admins can manage all tenants"
  ON public.tenants FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Tenant members can view their tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (public.is_tenant_member(auth.uid(), id));

-- TENANT_USERS: platform admins see all, tenant admins/owners manage their own
CREATE POLICY "Platform admins can manage all tenant users"
  ON public.tenant_users FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins can view their tenant users"
  ON public.tenant_users FOR SELECT TO authenticated
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant owners can manage their tenant users"
  ON public.tenant_users FOR ALL TO authenticated
  USING (
    public.has_tenant_role(auth.uid(), tenant_id, 'owner')
    OR public.has_tenant_role(auth.uid(), tenant_id, 'admin')
  );

-- PLATFORM_USERS: only platform admins
CREATE POLICY "Platform admins can manage platform users"
  ON public.platform_users FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Users can see their own platform role"
  ON public.platform_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- SEED: Insert Vision Lift as first tenant
-- ============================================================
INSERT INTO public.tenants (name, slug, primary_color, secondary_color)
VALUES ('Vision Lift', 'vision-lift', '#6366f1', '#8b5cf6');
