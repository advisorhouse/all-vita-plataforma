-- Fix RLS for tenant logo replacement (upsert requires UPDATE permission on storage.objects)
DROP POLICY IF EXISTS "Super admins update tenant logos" ON storage.objects;
CREATE POLICY "Super admins update tenant logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'tenant-logos'
    AND is_super_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'tenant-logos'
    AND is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Tenant admins update own logos" ON storage.objects;
CREATE POLICY "Tenant admins update own logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'tenant-logos'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND has_role(auth.uid(), ((storage.foldername(name))[1])::uuid, 'admin')
  )
  WITH CHECK (
    bucket_id = 'tenant-logos'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND has_role(auth.uid(), ((storage.foldername(name))[1])::uuid, 'admin')
  );