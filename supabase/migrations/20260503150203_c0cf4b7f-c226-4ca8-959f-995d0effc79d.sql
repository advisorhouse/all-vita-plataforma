-- Robust Products Enhancement
ALTER TABLE public.products 
ADD COLUMN sku TEXT,
ADD COLUMN category TEXT,
ADD COLUMN stock_quantity INTEGER DEFAULT 0,
ADD COLUMN weight NUMERIC, -- in kg
ADD COLUMN brand TEXT,
ADD COLUMN barcodes JSONB; -- array of EAN/GTIN

-- Product Images (Shopify-like)
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owners can manage product images"
    ON public.product_images FOR ALL
    USING (product_id IN (SELECT id FROM public.products WHERE tenant_id IN (
        SELECT id FROM public.tenants WHERE id = (auth.jwt()->>'tenant_id')::uuid
        OR id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    )));

-- Product Integration Sync
CREATE TABLE public.product_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    integration_type TEXT NOT NULL, -- 'bling', 'enotas', 'melhor_envio'
    external_id TEXT,
    sync_status TEXT DEFAULT 'pending',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(product_id, integration_type)
);

ALTER TABLE public.product_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owners can view product integrations"
    ON public.product_integrations FOR SELECT
    USING (product_id IN (SELECT id FROM public.products WHERE tenant_id IN (
        SELECT id FROM public.tenants WHERE id = (auth.jwt()->>'tenant_id')::uuid
        OR id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    )));

-- Ensure standard integration types exist
-- This logic would be part of a setup script or handled in UI
