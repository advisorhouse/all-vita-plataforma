
-- TENANTS: dados para criar Recipient no Pagar.me
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS legal_name text,
  ADD COLUMN IF NOT EXISTS legal_document text,
  ADD COLUMN IF NOT EXISTS legal_document_type text DEFAULT 'cnpj',
  ADD COLUMN IF NOT EXISTS bank_code text,
  ADD COLUMN IF NOT EXISTS bank_agency text,
  ADD COLUMN IF NOT EXISTS bank_agency_dv text,
  ADD COLUMN IF NOT EXISTS bank_account text,
  ADD COLUMN IF NOT EXISTS bank_account_dv text,
  ADD COLUMN IF NOT EXISTS bank_account_type text DEFAULT 'checking',
  ADD COLUMN IF NOT EXISTS bank_holder_name text,
  ADD COLUMN IF NOT EXISTS bank_holder_document text,
  ADD COLUMN IF NOT EXISTS pagarme_recipient_status text DEFAULT 'not_created',
  ADD COLUMN IF NOT EXISTS pagarme_recipient_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS pagarme_recipient_status_reason text;

-- PARTNERS: chave PIX para comissão manual
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS pix_key text,
  ADD COLUMN IF NOT EXISTS pix_key_type text,
  ADD COLUMN IF NOT EXISTS bank_holder_name text,
  ADD COLUMN IF NOT EXISTS bank_holder_document text;

-- PRODUCTS: sincronização com Pagar.me + checkout
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pagarme_product_id text,
  ADD COLUMN IF NOT EXISTS pagarme_sync_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pagarme_last_sync_at timestamptz,
  ADD COLUMN IF NOT EXISTS pagarme_sync_error text,
  ADD COLUMN IF NOT EXISTS checkout_url text,
  ADD COLUMN IF NOT EXISTS billing_type text DEFAULT 'one_time',
  ADD COLUMN IF NOT EXISTS subscription_interval text,
  ADD COLUMN IF NOT EXISTS subscription_interval_count integer,
  ADD COLUMN IF NOT EXISTS max_installments integer DEFAULT 12,
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS width_cm numeric,
  ADD COLUMN IF NOT EXISTS length_cm numeric;

-- COMMISSIONS: dados de pagamento PIX manual
ALTER TABLE public.commissions
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_proof_url text,
  ADD COLUMN IF NOT EXISTS payment_notes text,
  ADD COLUMN IF NOT EXISTS paid_by uuid;

-- WEBHOOK EVENTS: log completo de eventos Pagar.me
CREATE TABLE IF NOT EXISTS public.pagarme_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE,
  event_type text NOT NULL,
  resource_type text,
  resource_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  signature text,
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  process_error text,
  retry_count integer NOT NULL DEFAULT 0,
  tenant_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagarme_events_type ON public.pagarme_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_pagarme_events_processed ON public.pagarme_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_pagarme_events_created ON public.pagarme_webhook_events(created_at DESC);

ALTER TABLE public.pagarme_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage pagarme events"
  ON public.pagarme_webhook_events FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view tenant pagarme events"
  ON public.pagarme_webhook_events FOR SELECT TO authenticated
  USING (tenant_id IS NOT NULL AND has_role(auth.uid(), tenant_id, 'admin'::app_role));
