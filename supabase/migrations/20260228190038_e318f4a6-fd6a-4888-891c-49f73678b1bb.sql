
-- Fix permissive INSERT policy on attribution_logs
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "System can insert attribution logs" ON public.attribution_logs;

-- Replace with a policy that only allows authenticated service-level inserts
-- Attribution logs should only be inserted by backend functions (service role bypasses RLS)
-- No client-side INSERT policy needed since service_role bypasses RLS
-- Keep only the admin SELECT policy which is already in place

-- Also fix: the public SELECT on affiliate_links is intentional for link resolution
-- but let's tighten the INSERT on attribution_logs by removing client-side access entirely
