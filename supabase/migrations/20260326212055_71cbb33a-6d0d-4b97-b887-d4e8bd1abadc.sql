-- tenant_staff: internal team members per tenant with granular permissions
CREATE TABLE IF NOT EXISTS public.tenant_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'support',
  permissions jsonb NOT NULL DEFAULT '{"can_view_dashboard":true,"can_manage_users":false,"can_view_financial":false,"can_manage_commissions":false,"can_manage_integrations":false,"can_view_partners":false,"can_manage_content":false}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

ALTER TABLE public.tenant_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view own record" ON public.tenant_staff
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Tenant admins manage staff" ON public.tenant_staff
  FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));

CREATE POLICY "Super admins manage all tenant_staff" ON public.tenant_staff
  FOR ALL TO authenticated USING (is_super_admin(auth.uid()));

CREATE INDEX idx_tenant_staff_tenant ON public.tenant_staff(tenant_id);
CREATE INDEX idx_tenant_staff_user ON public.tenant_staff(user_id);