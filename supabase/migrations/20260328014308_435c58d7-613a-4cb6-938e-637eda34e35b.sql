
-- SaaS Plans table
CREATE TABLE public.saas_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  limits jsonb NOT NULL DEFAULT '{"max_partners": 10, "max_clients": 100, "max_products": 5}'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_recommended boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all plans" ON public.saas_plans FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Authenticated view active plans" ON public.saas_plans FOR SELECT TO authenticated USING (active = true);

-- Tenant Subscriptions (SaaS billing)
CREATE TABLE public.tenant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.saas_plans(id),
  status text NOT NULL DEFAULT 'trial',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  trial_ends_at timestamptz,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  cancelled_at timestamptz,
  discount_percent numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all tenant_subscriptions" ON public.tenant_subscriptions FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view own subscription" ON public.tenant_subscriptions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));

-- Invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.tenant_subscriptions(id),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending',
  due_date timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  paid_at timestamptz,
  payment_method text,
  external_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all invoices" ON public.invoices FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view own invoices" ON public.invoices FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
