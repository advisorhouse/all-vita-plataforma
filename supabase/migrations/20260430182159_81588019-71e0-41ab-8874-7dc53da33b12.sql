-- Add columns to track registration status
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN ('pending', 'dns_ready', 'completed'));
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS pending_registration_notification BOOLEAN DEFAULT false;

-- Add index for dashboard widget performance
CREATE INDEX IF NOT EXISTS idx_tenants_registration_status ON public.tenants(registration_status);

-- Update existing tenants to 'completed' (assuming they are already set up)
UPDATE public.tenants SET registration_status = 'completed' WHERE registration_status IS NULL;