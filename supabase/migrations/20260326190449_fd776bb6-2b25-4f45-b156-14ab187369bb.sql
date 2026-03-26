
-- =============================================
-- ALVITA BUSINESS LAYER - COMPLETE MIGRATION
-- =============================================

-- 1. STAFF (funcionários internos da empresa)
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'support',
  permissions jsonb DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all staff" ON public.staff FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage staff" ON public.staff FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Staff view own record" ON public.staff FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Managers view tenant staff" ON public.staff FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 2. PRODUCTS (catálogo por tenant)
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'one-time',
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all products" ON public.products FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage products" ON public.products FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view active products" ON public.products FOR SELECT TO authenticated USING (active = true AND belongs_to_tenant(auth.uid(), tenant_id));
CREATE POLICY "Managers manage products" ON public.products FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 3. SUBSCRIPTIONS (assinaturas de clientes)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  start_date timestamptz NOT NULL DEFAULT now(),
  renewal_date timestamptz,
  cancelled_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Clients view own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.user_id = auth.uid()));
CREATE POLICY "Managers view tenant subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 4. AFFILIATE LINKS (tracking de parceiros)
CREATE TABLE public.affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  code text NOT NULL,
  url text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all links" ON public.affiliate_links FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage links" ON public.affiliate_links FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Partners manage own links" ON public.affiliate_links FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.user_id = auth.uid()));
CREATE POLICY "Managers view tenant links" ON public.affiliate_links FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 5. CLICKS (tracking de cliques)
CREATE TABLE public.clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  ip text,
  user_agent text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view all clicks" ON public.clicks FOR SELECT TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Link owners view clicks" ON public.clicks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.affiliate_links al JOIN public.partners p ON p.id = al.partner_id WHERE al.id = link_id AND p.user_id = auth.uid()));
CREATE POLICY "Anon can insert clicks" ON public.clicks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can insert clicks" ON public.clicks FOR INSERT TO authenticated WITH CHECK (true);

-- 6. COMMISSION RULES (regras multinível por tenant)
CREATE TABLE public.commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  level integer NOT NULL DEFAULT 1,
  type text NOT NULL DEFAULT 'initial',
  percentage numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all rules" ON public.commission_rules FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage rules" ON public.commission_rules FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view tenant rules" ON public.commission_rules FOR SELECT TO authenticated USING (belongs_to_tenant(auth.uid(), tenant_id));

-- 7. UPDATE mt_commissions (add level + source)
ALTER TABLE public.mt_commissions
  ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'sale';

-- 8. UPDATE referrals (add source_link_id + attribution_type)
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS source_link_id uuid REFERENCES public.affiliate_links(id),
  ADD COLUMN IF NOT EXISTS attribution_type text DEFAULT 'direct';

-- 9. LEVELS (gamificação - definição de níveis)
CREATE TABLE public.levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_points integer NOT NULL DEFAULT 0,
  requirements jsonb DEFAULT '{}'::jsonb,
  benefits jsonb DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all levels" ON public.levels FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage levels" ON public.levels FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view tenant levels" ON public.levels FOR SELECT TO authenticated USING (belongs_to_tenant(auth.uid(), tenant_id));

-- 10. USER PROGRESS (progresso individual)
CREATE TABLE public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  level_id uuid REFERENCES public.levels(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all progress" ON public.user_progress FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view progress" ON public.user_progress FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Users view own progress" ON public.user_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own progress" ON public.user_progress FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Managers view tenant progress" ON public.user_progress FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 11. REWARDS (recompensas)
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'badge',
  name text NOT NULL,
  description text,
  points_required integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all rewards" ON public.rewards FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage rewards" ON public.rewards FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view tenant rewards" ON public.rewards FOR SELECT TO authenticated USING (belongs_to_tenant(auth.uid(), tenant_id));

-- 12. COURSES (formação)
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all courses" ON public.courses FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage courses" ON public.courses FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view published courses" ON public.courses FOR SELECT TO authenticated USING (published = true AND belongs_to_tenant(auth.uid(), tenant_id));
CREATE POLICY "Managers manage courses" ON public.courses FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 13. LESSONS (aulas)
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  video_url text,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all lessons" ON public.lessons FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Course members view lessons" ON public.lessons FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.published = true AND belongs_to_tenant(auth.uid(), c.tenant_id)));
CREATE POLICY "Tenant admins manage lessons" ON public.lessons FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND has_role(auth.uid(), c.tenant_id, 'admin'::app_role)));

-- 14. ASSETS (materiais de marketing)
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'image',
  name text NOT NULL,
  url text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all assets" ON public.assets FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage assets" ON public.assets FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view tenant assets" ON public.assets FOR SELECT TO authenticated USING (belongs_to_tenant(auth.uid(), tenant_id));

-- 15. RANKINGS (rankings por tenant)
CREATE TABLE public.rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  position integer,
  period text NOT NULL DEFAULT 'monthly',
  metadata jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id, period)
);
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all rankings" ON public.rankings FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage rankings" ON public.rankings FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view tenant rankings" ON public.rankings FOR SELECT TO authenticated USING (belongs_to_tenant(auth.uid(), tenant_id));

-- 16. AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text,
  resource_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view all logs" ON public.audit_logs FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view tenant logs" ON public.audit_logs FOR SELECT TO authenticated USING (tenant_id IS NOT NULL AND has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Service role insert logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 17. INTEGRATIONS (integrações externas)
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'webhook',
  name text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all integrations" ON public.integrations FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage integrations" ON public.integrations FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));

-- 18. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_staff_tenant ON public.staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_user ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON public.subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_tenant ON public.affiliate_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_partner ON public.affiliate_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_clicks_link ON public.clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_commission_rules_tenant ON public.commission_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_levels_tenant ON public.levels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_tenant ON public.user_progress(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rewards_tenant ON public.rewards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_courses_tenant ON public.courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_assets_tenant ON public.assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rankings_tenant ON public.rankings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_tenant ON public.integrations(tenant_id);
