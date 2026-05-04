CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  order_id uuid,
  pagarme_order_id text,
  pagarme_charge_id text,
  status text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  installments integer DEFAULT 1,
  raw_request jsonb DEFAULT '{}'::jsonb,
  raw_response jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_transactions_tenant ON public.payment_transactions(tenant_id);
CREATE INDEX idx_payment_transactions_order ON public.payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_pagarme_order ON public.payment_transactions(pagarme_order_id);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage all payment_transactions"
ON public.payment_transactions
FOR ALL
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins view payment_transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));