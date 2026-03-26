
-- ============================================================
-- ADVANCED COMMISSION ENGINE SCHEMA v2.0
-- ============================================================

-- 1. Enhanced commission rules (replaces simple rules with full flexibility)
ALTER TABLE public.commission_rules
  ADD COLUMN IF NOT EXISTS rule_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fixed_bonus_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_active_months integer,
  ADD COLUMN IF NOT EXISTS affiliate_level_required text,
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS age_segment text,
  ADD COLUMN IF NOT EXISTS campaign_id uuid,
  ADD COLUMN IF NOT EXISTS priority_order integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS allow_stack boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_commission_per_client numeric,
  ADD COLUMN IF NOT EXISTS description text DEFAULT '';

-- 2. Affiliate campaigns (custom links with time-bound rules)
CREATE TABLE public.affiliate_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id),
  campaign_name text NOT NULL,
  custom_percentage numeric NOT NULL DEFAULT 0,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  active boolean NOT NULL DEFAULT true,
  total_conversions integer NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage campaigns"
  ON public.affiliate_campaigns FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Affiliates view own campaigns"
  ON public.affiliate_campaigns FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM affiliates a WHERE a.id = affiliate_campaigns.affiliate_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "Affiliates create own campaigns"
  ON public.affiliate_campaigns FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM affiliates a WHERE a.id = affiliate_campaigns.affiliate_id AND a.user_id = auth.uid()
  ));

-- 3. Margin protection rules
CREATE TABLE public.margin_protection_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  max_commission_percentage numeric NOT NULL DEFAULT 30,
  margin_alert_threshold numeric NOT NULL DEFAULT 20,
  margin_block_threshold numeric NOT NULL DEFAULT 10,
  max_commission_per_client numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.margin_protection_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage margin rules"
  ON public.margin_protection_rules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Commission audit log (immutable)
CREATE TABLE public.commission_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id uuid REFERENCES public.commissions(id),
  order_id uuid NOT NULL,
  affiliate_id uuid NOT NULL,
  client_id uuid NOT NULL,
  rule_id uuid,
  rule_name text NOT NULL,
  commission_type text NOT NULL,
  order_amount numeric NOT NULL,
  percentage_applied numeric NOT NULL,
  fixed_bonus numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL,
  cumulative_total numeric NOT NULL DEFAULT 0,
  was_stacked boolean NOT NULL DEFAULT false,
  margin_check_passed boolean NOT NULL DEFAULT true,
  margin_percentage numeric,
  reason text NOT NULL,
  simulation_base jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit log"
  ON public.commission_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Immutable trigger
CREATE OR REPLACE FUNCTION public.prevent_commission_audit_modification()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  RAISE EXCEPTION 'Commission audit logs are immutable.';
  RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_commission_audit_update
  BEFORE UPDATE OR DELETE ON public.commission_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_commission_audit_modification();

-- 5. Commission templates (for quick rule swap)
CREATE TABLE public.commission_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  rules jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage templates"
  ON public.commission_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Insert default margin protection
INSERT INTO public.margin_protection_rules (rule_name, max_commission_percentage, margin_alert_threshold, margin_block_threshold, max_commission_per_client)
VALUES ('Proteção Padrão', 30, 20, 10, 500);

-- 7. Update existing commission_rules with names
UPDATE public.commission_rules SET rule_name = 'Comissão Inicial' WHERE commission_type = 'initial' AND rule_name = '';
UPDATE public.commission_rules SET rule_name = 'Comissão Recorrente' WHERE commission_type = 'recurring' AND rule_name = '';
UPDATE public.commission_rules SET rule_name = 'Bônus 6 Meses' WHERE commission_type = 'bonus_6m' AND rule_name = '';
UPDATE public.commission_rules SET rule_name = 'Bônus 12 Meses' WHERE commission_type = 'bonus_12m' AND rule_name = '';

-- 8. Triggers for updated_at
CREATE TRIGGER update_affiliate_campaigns_updated_at
  BEFORE UPDATE ON public.affiliate_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_margin_protection_updated_at
  BEFORE UPDATE ON public.margin_protection_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commission_templates_updated_at
  BEFORE UPDATE ON public.commission_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Indexes
CREATE INDEX idx_commission_rules_priority ON public.commission_rules (priority_order, active);
CREATE INDEX idx_commission_audit_affiliate ON public.commission_audit_log (affiliate_id, created_at DESC);
CREATE INDEX idx_commission_audit_client ON public.commission_audit_log (client_id, created_at DESC);
CREATE INDEX idx_affiliate_campaigns_affiliate ON public.affiliate_campaigns (affiliate_id, active);
