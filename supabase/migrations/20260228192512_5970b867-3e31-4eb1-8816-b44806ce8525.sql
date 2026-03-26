
-- ============================================================
-- DATA WAREHOUSE LOGICAL LAYER
-- Analytical views on top of operational tables
-- ============================================================

-- DIM_TIME helper view
CREATE OR REPLACE VIEW public.dim_time AS
SELECT
  d::date AS date_key,
  EXTRACT(YEAR FROM d)::int AS year,
  EXTRACT(MONTH FROM d)::int AS month,
  EXTRACT(DOW FROM d)::int AS day_of_week,
  TO_CHAR(d, 'YYYY-MM') AS year_month,
  TO_CHAR(d, 'Mon YYYY') AS month_label
FROM generate_series('2024-01-01'::date, CURRENT_DATE + INTERVAL '1 year', '1 day') AS d;

-- DIM_CLIENT
CREATE OR REPLACE VIEW public.dim_client AS
SELECT
  cp.id AS client_key,
  cp.user_id,
  cp.level,
  cp.age_segment,
  cp.subscription_status,
  cp.risk_level,
  cp.affiliate_id,
  cp.created_at AS acquisition_date,
  TO_CHAR(cp.created_at, 'YYYY-MM') AS acquisition_cohort,
  EXTRACT(EPOCH FROM (NOW() - cp.created_at)) / (30*24*3600) AS months_active,
  cp.ltv_prediction,
  cp.churn_probability,
  cp.consistency_score,
  cp.engagement_score,
  cp.behavioral_score
FROM public.client_profiles cp;

-- DIM_AFFILIATE
CREATE OR REPLACE VIEW public.dim_affiliate AS
SELECT
  a.id AS affiliate_key,
  a.user_id,
  a.affiliate_level,
  a.level,
  a.status,
  a.active_clients,
  a.total_clients,
  a.retention_rate,
  a.retention_score,
  a.recurring_revenue,
  a.total_commission_paid,
  a.created_at
FROM public.affiliates a;

-- FACT_REVENUE
CREATE OR REPLACE VIEW public.fact_revenue AS
SELECT
  o.id AS order_key,
  o.client_id,
  o.amount,
  o.payment_status,
  o.subscription_cycle,
  o.created_at,
  TO_CHAR(o.created_at, 'YYYY-MM') AS revenue_month,
  cp.age_segment,
  cp.level AS client_level,
  cp.affiliate_id
FROM public.orders o
LEFT JOIN public.client_profiles cp ON cp.id = o.client_id;

-- FACT_COMMISSIONS
CREATE OR REPLACE VIEW public.fact_commissions AS
SELECT
  c.id AS commission_key,
  c.affiliate_id,
  c.client_id,
  c.order_id,
  c.amount,
  c.percentage_applied,
  c.commission_type,
  c.paid_status,
  c.created_at,
  TO_CHAR(c.created_at, 'YYYY-MM') AS commission_month,
  a.affiliate_level,
  cp.age_segment,
  cp.level AS client_level
FROM public.commissions c
LEFT JOIN public.affiliates a ON a.id = c.affiliate_id
LEFT JOIN public.client_profiles cp ON cp.id = c.client_id;

-- FACT_CHURN (clients that left)
CREATE OR REPLACE VIEW public.fact_churn AS
SELECT
  cp.id AS client_key,
  cp.subscription_status,
  cp.churn_probability,
  cp.risk_level,
  cp.age_segment,
  cp.level,
  cp.affiliate_id,
  cp.created_at AS acquisition_date,
  TO_CHAR(cp.created_at, 'YYYY-MM') AS acquisition_cohort,
  cp.updated_at AS status_change_date,
  EXTRACT(EPOCH FROM (cp.updated_at - cp.created_at)) / (30*24*3600) AS months_before_churn
FROM public.client_profiles cp
WHERE cp.subscription_status IN ('cancelled', 'paused');

-- FACT_RETENTION (active clients with tenure)
CREATE OR REPLACE VIEW public.fact_retention AS
SELECT
  cp.id AS client_key,
  cp.user_id,
  cp.subscription_status,
  cp.level,
  cp.age_segment,
  cp.affiliate_id,
  cp.created_at AS acquisition_date,
  TO_CHAR(cp.created_at, 'YYYY-MM') AS acquisition_cohort,
  EXTRACT(EPOCH FROM (NOW() - cp.created_at)) / (30*24*3600) AS months_active,
  cp.consistency_score,
  cp.engagement_score,
  cp.ltv_prediction,
  CASE
    WHEN cp.subscription_status = 'active' THEN true
    ELSE false
  END AS is_retained
FROM public.client_profiles cp;

-- FACT_AFFILIATE_PERFORMANCE
CREATE OR REPLACE VIEW public.fact_affiliate_performance AS
SELECT
  a.id AS affiliate_key,
  a.affiliate_level,
  a.level,
  a.active_clients,
  a.total_clients,
  a.retention_rate,
  a.retention_score,
  a.recurring_revenue,
  a.total_commission_paid,
  a.status,
  CASE WHEN a.total_clients > 0 THEN
    ROUND(a.active_clients::numeric / a.total_clients * 100, 1)
  ELSE 0 END AS client_retention_pct,
  CASE WHEN a.active_clients > 0 THEN
    ROUND(a.recurring_revenue / a.active_clients, 2)
  ELSE 0 END AS revenue_per_client,
  a.created_at
FROM public.affiliates a;

-- Report access log for governance
CREATE TABLE IF NOT EXISTS public.report_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_name text NOT NULL,
  parameters jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.report_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage report logs"
ON public.report_access_logs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own logs"
ON public.report_access_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);
