-- 1. Create profiles table (extends auth.users with app-level data)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  cpf_encrypted text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Super admins manage all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view member profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m1
      WHERE m1.user_id = auth.uid()
        AND m1.active = true
        AND m1.role IN ('admin', 'manager')
        AND EXISTS (
          SELECT 1 FROM public.memberships m2
          WHERE m2.user_id = profiles.id
            AND m2.tenant_id = m1.tenant_id
            AND m2.active = true
        )
    )
  );

CREATE INDEX idx_profiles_email ON public.profiles(email);

-- 2. Create staff_role enum
CREATE TYPE public.staff_role AS ENUM ('super_admin', 'ops', 'finance', 'support', 'growth');

-- 3. Create all_vita_staff table
CREATE TABLE public.all_vita_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role public.staff_role NOT NULL DEFAULT 'support',
  permissions jsonb NOT NULL DEFAULT '{"can_manage_tenants":false,"can_view_financials":false,"can_manage_users":false,"can_view_logs":false,"can_manage_integrations":false}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.all_vita_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view own record"
  ON public.all_vita_staff FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins manage all staff records"
  ON public.all_vita_staff FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE INDEX idx_all_vita_staff_user ON public.all_vita_staff(user_id);

-- 4. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();