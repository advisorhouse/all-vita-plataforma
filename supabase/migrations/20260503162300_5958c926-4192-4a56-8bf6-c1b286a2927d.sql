-- Create a bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for products bucket (using IF NOT EXISTS logic where possible or dropping first)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
CREATE POLICY "Authenticated users can update product images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
CREATE POLICY "Authenticated users can delete product images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'products');

-- Fix product_images RLS
DROP POLICY IF EXISTS "Tenant owners can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Managers can manage product images" ON public.product_images;

CREATE POLICY "Managers can manage product images"
ON public.product_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.memberships m ON m.tenant_id = p.tenant_id
    WHERE p.id = product_images.product_id
    AND m.user_id = auth.uid()
    AND m.role IN ('admin', 'manager')
  )
);

-- Fix product_integrations RLS
DROP POLICY IF EXISTS "Tenant owners can view product integrations" ON public.product_integrations;
DROP POLICY IF EXISTS "Managers can manage product integrations" ON public.product_integrations;

CREATE POLICY "Managers can manage product integrations"
ON public.product_integrations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.memberships m ON m.tenant_id = p.tenant_id
    WHERE p.id = product_integrations.product_id
    AND m.user_id = auth.uid()
    AND m.role IN ('admin', 'manager')
  )
);
