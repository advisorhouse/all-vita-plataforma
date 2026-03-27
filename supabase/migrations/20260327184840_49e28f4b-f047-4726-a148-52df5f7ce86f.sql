
-- ============================================================
-- 1. ORDERS TABLE
-- ============================================================
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  subscription_cycle integer NOT NULL DEFAULT 1,
  external_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all orders" ON public.orders FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage orders" ON public.orders FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Managers view tenant orders" ON public.orders FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));
CREATE POLICY "Clients view own orders" ON public.orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM clients c WHERE c.id = orders.client_id AND c.user_id = auth.uid()));

-- ============================================================
-- 2. COMMISSIONS TABLE (used by edge functions)
-- ============================================================
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  affiliate_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id),
  order_id uuid REFERENCES public.orders(id),
  commission_type text NOT NULL DEFAULT 'initial',
  percentage_applied numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  paid_status text NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all commissions" ON public.commissions FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view commissions" ON public.commissions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Managers view tenant commissions" ON public.commissions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));
CREATE POLICY "Partners view own commissions" ON public.commissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM partners p WHERE p.id = commissions.affiliate_id AND p.user_id = auth.uid()));

-- ============================================================
-- 3. VITACOINS_WALLET TABLE
-- ============================================================
CREATE TABLE public.vitacoins_wallet (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  total_redeemed numeric NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

ALTER TABLE public.vitacoins_wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all wallets" ON public.vitacoins_wallet FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view wallets" ON public.vitacoins_wallet FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Users view own wallet" ON public.vitacoins_wallet FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own wallet" ON public.vitacoins_wallet FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 4. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all notifications" ON public.notifications FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage tenant notifications" ON public.notifications FOR ALL TO authenticated USING (tenant_id IS NOT NULL AND has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 5. QUIZ_RESPONSES TABLE
-- ============================================================
CREATE TABLE public.quiz_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES public.quiz_submissions(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners(id),
  status text NOT NULL DEFAULT 'pending',
  notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all quiz_responses" ON public.quiz_responses FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage quiz_responses" ON public.quiz_responses FOR ALL TO authenticated USING (tenant_id IS NOT NULL AND has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Partners view own quiz_responses" ON public.quiz_responses FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM partners p WHERE p.id = quiz_responses.partner_id AND p.user_id = auth.uid()));
