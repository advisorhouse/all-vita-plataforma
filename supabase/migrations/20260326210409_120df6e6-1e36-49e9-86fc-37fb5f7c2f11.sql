-- 1. Add new columns to tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS trade_name text,
  ADD COLUMN IF NOT EXISTS cnpj text UNIQUE,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_tenants_cnpj ON public.tenants(cnpj);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- 2. Tenant addresses
CREATE TABLE public.tenant_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  cep text,
  street text,
  number text,
  complement text,
  district text,
  city text,
  state text,
  country text NOT NULL DEFAULT 'BR',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all addresses"
  ON public.tenant_addresses FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view own address"
  ON public.tenant_addresses FOR SELECT TO authenticated
  USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));

-- 3. Tenant owners
CREATE TABLE public.tenant_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  cpf text,
  rg text,
  email text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'socio',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all owners"
  ON public.tenant_owners FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view own owners"
  ON public.tenant_owners FOR SELECT TO authenticated
  USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));

-- 4. User consents
CREATE TABLE public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip text,
  UNIQUE (user_id, type)
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consents"
  ON public.user_consents FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own consents"
  ON public.user_consents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins view all consents"
  ON public.user_consents FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE INDEX idx_user_consents_user ON public.user_consents(user_id);

-- 5. Add onboarding_completed and must_change_password to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;