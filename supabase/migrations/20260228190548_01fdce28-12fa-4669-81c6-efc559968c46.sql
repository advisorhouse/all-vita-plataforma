
-- Remove permissive INSERT on ai_model_logs (service_role bypasses RLS for engine inserts)
DROP POLICY IF EXISTS "System insert ai logs" ON public.ai_model_logs;
