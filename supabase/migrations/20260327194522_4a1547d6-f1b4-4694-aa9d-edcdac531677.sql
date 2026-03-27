
-- tenant-logos: public read
CREATE POLICY "Public read tenant logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-logos');

-- tenant-logos: super admins upload
CREATE POLICY "Super admins upload tenant logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tenant-logos' AND public.is_super_admin(auth.uid()));

-- tenant-logos: tenant admins upload own
CREATE POLICY "Tenant admins upload own logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenant-logos'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND public.has_role(auth.uid(), ((storage.foldername(name))[1])::uuid, 'admin'::public.app_role)
);

-- tenant-logos: super admins delete
CREATE POLICY "Super admins delete tenant logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tenant-logos' AND public.is_super_admin(auth.uid()));

-- avatars: public read
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- avatars: users manage own
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- partner-materials: tenant members read
CREATE POLICY "Tenant members read partner materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'partner-materials'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND public.belongs_to_tenant(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

-- partner-materials: tenant admins manage
CREATE POLICY "Tenant admins upload partner materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'partner-materials'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND public.has_role(auth.uid(), ((storage.foldername(name))[1])::uuid, 'admin'::public.app_role)
);

CREATE POLICY "Tenant admins delete partner materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'partner-materials'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND public.has_role(auth.uid(), ((storage.foldername(name))[1])::uuid, 'admin'::public.app_role)
);

-- partner-materials: super admins full access
CREATE POLICY "Super admins manage all materials"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'partner-materials' AND public.is_super_admin(auth.uid()));
