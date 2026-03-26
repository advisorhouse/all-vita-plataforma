
-- Fix: scope quiz_submissions insert to require valid tenant_id when provided
-- The existing policy is intentionally permissive for public quizzes, but we can tighten it slightly
-- by ensuring the tenant_id references a valid active tenant if provided

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.quiz_submissions;

CREATE POLICY "Allow anonymous inserts with valid tenant"
  ON public.quiz_submissions FOR INSERT TO anon
  WITH CHECK (
    tenant_id IS NULL 
    OR EXISTS (SELECT 1 FROM public.tenants WHERE id = tenant_id AND active = true)
  );
