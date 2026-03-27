
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('tenant-logos', 'tenant-logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('partner-materials', 'partner-materials', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'video/mp4']);
