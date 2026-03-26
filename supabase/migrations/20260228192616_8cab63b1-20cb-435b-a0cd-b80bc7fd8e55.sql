
-- Fix security definer views by setting security_invoker = true
ALTER VIEW public.dim_time SET (security_invoker = true);
ALTER VIEW public.dim_client SET (security_invoker = true);
ALTER VIEW public.dim_affiliate SET (security_invoker = true);
ALTER VIEW public.fact_revenue SET (security_invoker = true);
ALTER VIEW public.fact_commissions SET (security_invoker = true);
ALTER VIEW public.fact_churn SET (security_invoker = true);
ALTER VIEW public.fact_retention SET (security_invoker = true);
ALTER VIEW public.fact_affiliate_performance SET (security_invoker = true);
