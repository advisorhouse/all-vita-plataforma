
-- 1. Melhorar commission_rules para suportar MLM e Stack
ALTER TABLE public.commission_rules 
ADD COLUMN IF NOT EXISTS priority_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS allow_stack BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mlm_depth INTEGER DEFAULT 0, -- 0 = direto, 1 = upline 1, etc.
ADD COLUMN IF NOT EXISTS min_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_active_months INTEGER;

-- 2. Criar log de auditoria de comissão real (substituindo o antigo mock)
CREATE TABLE IF NOT EXISTS public.commission_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.commission_rules(id),
    amount_calculated NUMERIC(10,2) NOT NULL,
    percentage_applied NUMERIC(5,2),
    status TEXT DEFAULT 'processed',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.commission_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants see their own audit logs" ON public.commission_audit_log FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid() AND active = true LIMIT 1));

-- 3. Ajustar rewards_catalog para ser visível aos usuários do tenant
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view rewards catalog of their tenant" ON public.rewards_catalog FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid() AND active = true LIMIT 1));

-- 4. Garantir que vitacoin_settings tenha entradas para tenants
CREATE TABLE IF NOT EXISTS public.vitacoin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
    points_per_currency NUMERIC(10,2) DEFAULT 1.0, -- Ex: 1 real = 1 ponto
    min_redemption_points INTEGER DEFAULT 100,
    active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vitacoin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants manage their settings" ON public.vitacoin_settings FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.memberships WHERE user_id = auth.uid() AND active = true LIMIT 1));
