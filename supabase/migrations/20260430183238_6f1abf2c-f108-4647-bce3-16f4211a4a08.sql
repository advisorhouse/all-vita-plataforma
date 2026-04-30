-- Add Pagar.me specific fields to tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS pagarme_customer_id TEXT;

-- Add external ID to track subscriptions in Pagar.me
ALTER TABLE public.tenant_subscriptions ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE public.tenant_subscriptions ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Allow global payment integrations (where tenant_id is NULL)
ALTER TABLE public.payment_integrations ALTER COLUMN tenant_id DROP NOT NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenants_pagarme_customer_id ON public.tenants(pagarme_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_external_id ON public.tenant_subscriptions(external_id);

-- Ensure we can have only one active global integration per provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_global_payment_integration_unique_provider 
ON public.payment_integrations (provider) 
WHERE (tenant_id IS NULL AND active = true);