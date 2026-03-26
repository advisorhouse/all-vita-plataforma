
-- =============================================
-- VISION LIFT PLATFORM — COMPLETE DATABASE SCHEMA
-- =============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('client', 'affiliate', 'admin');
CREATE TYPE public.subscription_status AS ENUM ('active', 'paused', 'cancelled', 'pending');
CREATE TYPE public.commission_type AS ENUM ('initial', 'recurring', 'bonus_6m', 'bonus_12m');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'failed', 'refunded');
CREATE TYPE public.partner_level AS ENUM ('basic', 'premium', 'elite');
CREATE TYPE public.fraud_risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- 2. PROFILES TABLE (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'client',
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. USER_ROLES TABLE (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. SECURITY DEFINER FUNCTION for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. CLIENT_PROFILES
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  cpf_hash TEXT NOT NULL,
  cpf_encrypted TEXT NOT NULL,
  birth_date DATE,
  age_segment TEXT,
  subscription_status subscription_status NOT NULL DEFAULT 'pending',
  affiliate_id UUID,
  affiliate_locked BOOLEAN NOT NULL DEFAULT false,
  -- AI fields (future)
  churn_probability NUMERIC(5,2),
  ltv_prediction NUMERIC(12,2),
  behavioral_score NUMERIC(5,2),
  engagement_score NUMERIC(5,2),
  consistency_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Index for CPF hash lookups
CREATE INDEX idx_client_profiles_cpf_hash ON public.client_profiles(cpf_hash);

-- 6. AFFILIATES
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  level partner_level NOT NULL DEFAULT 'basic',
  status TEXT NOT NULL DEFAULT 'active',
  total_clients INTEGER NOT NULL DEFAULT 0,
  active_clients INTEGER NOT NULL DEFAULT 0,
  retention_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  recurring_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_commission_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- 7. ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  subscription_cycle INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. COMMISSIONS
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  commission_type commission_type NOT NULL,
  percentage_applied NUMERIC(5,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  paid_status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- 9. AFFILIATE_LINKS
CREATE TABLE public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id),
  unique_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

-- Index for token lookups
CREATE INDEX idx_affiliate_links_token ON public.affiliate_links(unique_token);

-- 10. ATTRIBUTION_LOGS (IMMUTABLE)
CREATE TABLE public.attribution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id),
  ip_address INET,
  user_agent TEXT,
  attribution_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attribution_logs ENABLE ROW LEVEL SECURITY;

-- 11. FRAUD_ALERTS
CREATE TABLE public.fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.client_profiles(id),
  affiliate_id UUID REFERENCES public.affiliates(id),
  risk_level fraud_risk_level NOT NULL DEFAULT 'low',
  reason TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;

-- 12. COMMISSION_RULES (parametrizable via admin)
CREATE TABLE public.commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level partner_level NOT NULL,
  commission_type commission_type NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  min_months INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

-- Seed default commission rules
INSERT INTO public.commission_rules (level, commission_type, percentage, min_months) VALUES
  ('basic', 'initial', 10.00, 0),
  ('basic', 'recurring', 10.00, 0),
  ('basic', 'bonus_6m', 2.00, 6),
  ('basic', 'bonus_12m', 3.00, 12),
  ('premium', 'initial', 12.00, 0),
  ('premium', 'recurring', 12.00, 0),
  ('premium', 'bonus_6m', 3.00, 6),
  ('premium', 'bonus_12m', 5.00, 12),
  ('elite', 'initial', 15.00, 0),
  ('elite', 'recurring', 15.00, 0),
  ('elite', 'bonus_6m', 5.00, 6),
  ('elite', 'bonus_12m', 7.00, 12);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_commission_rules_updated_at BEFORE UPDATE ON public.commission_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- IMMUTABLE TRIGGER: prevent updates/deletes on attribution_logs
CREATE OR REPLACE FUNCTION public.prevent_attribution_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Attribution logs are immutable. Updates and deletes are not allowed.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER prevent_attribution_update BEFORE UPDATE ON public.attribution_logs FOR EACH ROW EXECUTE FUNCTION public.prevent_attribution_modification();
CREATE TRIGGER prevent_attribution_delete BEFORE DELETE ON public.attribution_logs FOR EACH ROW EXECUTE FUNCTION public.prevent_attribution_modification();

-- AFFILIATE LOCK TRIGGER: prevent unlocking affiliate_locked
CREATE OR REPLACE FUNCTION public.prevent_affiliate_unlock()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.affiliate_locked = true AND NEW.affiliate_locked = false THEN
    RAISE EXCEPTION 'Cannot unlock affiliate attribution. This binding is permanent.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER prevent_affiliate_unlock BEFORE UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_affiliate_unlock();

-- AUTO-CREATE PROFILE on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles: users see own, admins see all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User Roles: only admins can manage
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Client Profiles: own data or admin
CREATE POLICY "Clients view own profile" ON public.client_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Clients update own profile" ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage client profiles" ON public.client_profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Affiliates: own data or admin
CREATE POLICY "Affiliates view own data" ON public.affiliates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Affiliates update own data" ON public.affiliates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage affiliates" ON public.affiliates FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Orders: clients see own orders, admins see all
CREATE POLICY "Clients view own orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.client_profiles cp WHERE cp.id = orders.client_id AND cp.user_id = auth.uid())
);
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Commissions: affiliates see own, admins see all
CREATE POLICY "Affiliates view own commissions" ON public.commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = commissions.affiliate_id AND a.user_id = auth.uid())
);
CREATE POLICY "Admins manage commissions" ON public.commissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Affiliate Links: own links or admin
CREATE POLICY "Affiliates view own links" ON public.affiliate_links FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_links.affiliate_id AND a.user_id = auth.uid())
);
CREATE POLICY "Affiliates manage own links" ON public.affiliate_links FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_links.affiliate_id AND a.user_id = auth.uid())
);
CREATE POLICY "Admins manage affiliate links" ON public.affiliate_links FOR ALL USING (public.has_role(auth.uid(), 'admin'));
-- Public read for link resolution
CREATE POLICY "Public can resolve affiliate links" ON public.affiliate_links FOR SELECT USING (true);

-- Attribution Logs: admin only read
CREATE POLICY "Admins view attribution logs" ON public.attribution_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert attribution logs" ON public.attribution_logs FOR INSERT WITH CHECK (true);

-- Fraud Alerts: admin only
CREATE POLICY "Admins manage fraud alerts" ON public.fraud_alerts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Commission Rules: admins manage, affiliates read active
CREATE POLICY "Anyone can read active rules" ON public.commission_rules FOR SELECT USING (active = true);
CREATE POLICY "Admins manage commission rules" ON public.commission_rules FOR ALL USING (public.has_role(auth.uid(), 'admin'));
