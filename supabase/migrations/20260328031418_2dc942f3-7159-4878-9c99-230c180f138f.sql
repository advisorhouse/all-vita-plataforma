-- Fix: Add WITH CHECK to super admin policy on tenants
DROP POLICY IF EXISTS "Super admins manage all tenants" ON public.tenants;
CREATE POLICY "Super admins manage all tenants"
  ON public.tenants
  FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));