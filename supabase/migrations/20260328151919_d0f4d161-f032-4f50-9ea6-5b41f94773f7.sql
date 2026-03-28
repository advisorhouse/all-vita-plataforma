CREATE POLICY "Anon can read active tenant branding"
  ON public.tenants
  FOR SELECT
  TO anon
  USING (active = true);