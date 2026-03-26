
-- =============================================
-- VITACOINS + GATEWAY INTEGRATION LAYER
-- =============================================

-- 1. PAYMENT INTEGRATIONS (config de gateways por tenant)
CREATE TABLE public.payment_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider text NOT NULL,
  api_key_encrypted text,
  webhook_secret text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, provider)
);
ALTER TABLE public.payment_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage all payment_integrations" ON public.payment_integrations FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage payment_integrations" ON public.payment_integrations FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));

-- 2. TRANSACTIONS (espelho de dados do gateway)
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  external_id text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending',
  customer_email text,
  customer_name text,
  product_id uuid REFERENCES public.products(id),
  integration_id uuid REFERENCES public.payment_integrations(id),
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, external_id)
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage all transactions" ON public.transactions FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view transactions" ON public.transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Managers view tenant transactions" ON public.transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 3. CONVERSIONS (tracking venda → parceiro)
CREATE TABLE public.conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  link_id uuid REFERENCES public.affiliate_links(id),
  attributed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage all conversions" ON public.conversions FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view conversions" ON public.conversions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Partners view own conversions" ON public.conversions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.user_id = auth.uid()));
CREATE POLICY "Partners view downline conversions" ON public.conversions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.partners p WHERE p.user_id = auth.uid() AND p.tenant_id = tenant_id AND is_in_partner_downline(p.id, partner_id)));
CREATE POLICY "Managers view tenant conversions" ON public.conversions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 4. WALLET (saldo de Vitacoins por usuário/tenant)
CREATE TABLE public.wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);
ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage all wallets" ON public.wallet FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view wallets" ON public.wallet FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Users view own wallet" ON public.wallet FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Managers view tenant wallets" ON public.wallet FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 5. VITACOIN TRANSACTIONS (ledger completo)
CREATE TABLE public.vitacoin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  reference_id uuid,
  reference_type text,
  description text,
  balance_after numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vitacoin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage all vitacoin_tx" ON public.vitacoin_transactions FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins view vitacoin_tx" ON public.vitacoin_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Users view own vitacoin_tx" ON public.vitacoin_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Managers view tenant vitacoin_tx" ON public.vitacoin_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 6. VITACOIN SETTINGS (cotação por tenant)
CREATE TABLE public.vitacoin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversion_rate numeric NOT NULL DEFAULT 1.0,
  min_redemption numeric NOT NULL DEFAULT 10,
  max_redemption_daily numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);
ALTER TABLE public.vitacoin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage all vitacoin_settings" ON public.vitacoin_settings FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage vitacoin_settings" ON public.vitacoin_settings FOR ALL TO authenticated USING (tenant_id IS NOT NULL AND has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view tenant vitacoin_settings" ON public.vitacoin_settings FOR SELECT TO authenticated USING (tenant_id IS NOT NULL AND belongs_to_tenant(auth.uid(), tenant_id));

-- 7. COMMISSION TO COIN RULES (conversão comissão → Vitacoins)
CREATE TABLE public.commission_to_coin_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  level integer NOT NULL DEFAULT 1,
  percentage numeric NOT NULL DEFAULT 100,
  multiplier numeric NOT NULL DEFAULT 1.0,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.commission_to_coin_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage all coin_rules" ON public.commission_to_coin_rules FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage coin_rules" ON public.commission_to_coin_rules FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view tenant coin_rules" ON public.commission_to_coin_rules FOR SELECT TO authenticated USING (belongs_to_tenant(auth.uid(), tenant_id));

-- 8. REDEMPTION REQUESTS (resgate com aprovação)
CREATE TABLE public.redemption_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL DEFAULT 'cash',
  catalog_item_id uuid,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.redemption_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage all redemptions" ON public.redemption_requests FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage redemptions" ON public.redemption_requests FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Users view own redemptions" ON public.redemption_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own redemptions" ON public.redemption_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Managers view tenant redemptions" ON public.redemption_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), tenant_id, 'manager'::app_role));

-- 9. REWARDS CATALOG (produtos resgatáveis com Vitacoins)
CREATE TABLE public.rewards_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'product',
  cost_in_coins numeric NOT NULL,
  stock integer,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage all catalog" ON public.rewards_catalog FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Tenant admins manage catalog" ON public.rewards_catalog FOR ALL TO authenticated USING (has_role(auth.uid(), tenant_id, 'admin'::app_role));
CREATE POLICY "Members view active catalog" ON public.rewards_catalog FOR SELECT TO authenticated USING (active = true AND belongs_to_tenant(auth.uid(), tenant_id));

-- 10. ADD FK from redemption_requests to rewards_catalog
ALTER TABLE public.redemption_requests
  ADD CONSTRAINT redemption_catalog_fk FOREIGN KEY (catalog_item_id) REFERENCES public.rewards_catalog(id);

-- 11. INDEXES
CREATE INDEX idx_payment_integrations_tenant ON public.payment_integrations(tenant_id);
CREATE INDEX idx_transactions_tenant ON public.transactions(tenant_id);
CREATE INDEX idx_transactions_external ON public.transactions(tenant_id, external_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_conversions_tenant ON public.conversions(tenant_id);
CREATE INDEX idx_conversions_partner ON public.conversions(partner_id);
CREATE INDEX idx_conversions_transaction ON public.conversions(transaction_id);
CREATE INDEX idx_wallet_user_tenant ON public.wallet(user_id, tenant_id);
CREATE INDEX idx_vitacoin_tx_user ON public.vitacoin_transactions(user_id);
CREATE INDEX idx_vitacoin_tx_tenant ON public.vitacoin_transactions(tenant_id);
CREATE INDEX idx_vitacoin_tx_created ON public.vitacoin_transactions(created_at);
CREATE INDEX idx_redemption_user ON public.redemption_requests(user_id);
CREATE INDEX idx_redemption_tenant ON public.redemption_requests(tenant_id);
CREATE INDEX idx_redemption_status ON public.redemption_requests(status);
CREATE INDEX idx_rewards_catalog_tenant ON public.rewards_catalog(tenant_id);
CREATE INDEX idx_commission_coin_rules_tenant ON public.commission_to_coin_rules(tenant_id);
