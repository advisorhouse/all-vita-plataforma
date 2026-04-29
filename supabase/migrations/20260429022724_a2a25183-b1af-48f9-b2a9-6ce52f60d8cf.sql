ALTER TABLE public.tenants 
ADD COLUMN dns_status TEXT DEFAULT 'pending' CHECK (dns_status IN ('pending', 'verified')),
ADD COLUMN dns_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN manual_activation_required BOOLEAN DEFAULT true,
ADD COLUMN activation_email_sent BOOLEAN DEFAULT false;

-- Index for performance on checking pending DNS
CREATE INDEX idx_tenants_dns_status ON public.tenants(dns_status);