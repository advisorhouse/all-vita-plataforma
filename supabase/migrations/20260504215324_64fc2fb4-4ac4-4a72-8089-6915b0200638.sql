-- 1. Criar plano SaaS
INSERT INTO public.saas_plans (name, description, price_monthly, transaction_fee_percentage, active)
VALUES ('Professional', 'Plano profissional com split', 297.00, 5.0, true)
ON CONFLICT DO NOTHING;

-- 2. Associar tenant ao plano
DO $$
DECLARE
    plan_id UUID;
    tenant_id UUID := '6a1818ae-5225-4a38-8f95-6c254dec0580';
BEGIN
    SELECT id INTO plan_id FROM public.saas_plans WHERE name = 'Professional' LIMIT 1;
    
    INSERT INTO public.tenant_subscriptions (tenant_id, plan_id, status, current_period_start, current_period_end)
    VALUES (tenant_id, plan_id, 'active', now(), now() + interval '1 month')
    ON CONFLICT DO NOTHING;
END $$;

-- 3. Criar produto de teste
INSERT INTO public.products (id, tenant_id, name, description, price, active, type)
VALUES (
    'd8e3b1a2-5c6d-4e7f-8b9a-0c1d2e3f4a5b', 
    '6a1818ae-5225-4a38-8f95-6c254dec0580', 
    'Bio Collagen Repair', 
    'Suplemento premium para pele e articulações', 
    197.00, 
    true, 
    'physical'
)
ON CONFLICT (id) DO UPDATE SET price = 197.00;

-- 4. Criar regra de comissão
INSERT INTO public.commission_rules (tenant_id, name, type, percentage, active)
VALUES ('6a1818ae-5225-4a38-8f95-6c254dec0580', 'Comissão Padrão', 'percentage', 10.0, true)
ON CONFLICT DO NOTHING;

-- 5. Configurar integrações Pagar.me
-- Global (All Vita)
INSERT INTO public.payment_integrations (provider, active, recipient_id)
VALUES ('pagarme', true, 're_all_vita_master_id')
ON CONFLICT DO NOTHING;

-- Tenant (LUMYSS)
INSERT INTO public.payment_integrations (tenant_id, provider, active, recipient_id)
VALUES ('6a1818ae-5225-4a38-8f95-6c254dec0580', 'pagarme', true, 're_tenant_lumyss_id')
ON CONFLICT DO NOTHING;

-- 6. Adicionar Recipient ao Parceiro
UPDATE public.partners 
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{pagarme_recipient_id}', '"re_partner_tiago_id"')
WHERE id = '02241f01-f702-4856-a60f-8bdd2698b503';
