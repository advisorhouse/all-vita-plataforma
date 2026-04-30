-- Adicionar recipient_id para Pagar.me
ALTER TABLE public.payment_integrations 
ADD COLUMN IF NOT EXISTS recipient_id TEXT;

-- Adicionar taxa de transação nos planos
ALTER TABLE public.saas_plans 
ADD COLUMN IF NOT EXISTS transaction_fee_percentage NUMERIC DEFAULT 0;

-- Adicionar taxa customizada no tenant (sobrescreve o plano)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS custom_transaction_fee NUMERIC;

-- Adicionar campos de split na tabela de orders para transparência
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS all_vita_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tenant_amount NUMERIC DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN public.payment_integrations.recipient_id IS 'ID do recebedor (subconta) no Pagar.me para split';
COMMENT ON COLUMN public.saas_plans.transaction_fee_percentage IS 'Porcentagem de taxa que a All Vita cobra por transação neste plano';
COMMENT ON COLUMN public.tenants.custom_transaction_fee IS 'Taxa customizada da All Vita para este tenant específico (sobrescreve o plano)';
