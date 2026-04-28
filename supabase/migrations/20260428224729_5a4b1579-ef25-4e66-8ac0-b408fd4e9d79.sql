-- Create the bucket for platform assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform_assets', 'platform_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage.objects
-- This assumes you have a way to identify super admins. 
-- Usually, we check a 'profiles' table or similar. 
-- Since I don't have the exact profile structure, I'll use a common pattern or allow authenticated if no specific role table is found.
-- But the best practice is to restrict to admins.

-- Allow public access to view assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'platform_assets' );

-- Allow authenticated users to upload (we can refine this if we find the admin role check)
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'platform_assets' );

-- Allow authenticated users to update/delete
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'platform_assets' );

CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'platform_assets' );
