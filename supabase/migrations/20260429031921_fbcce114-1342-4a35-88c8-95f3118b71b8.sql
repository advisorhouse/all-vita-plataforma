ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS resend_domain_id TEXT,
  ADD COLUMN IF NOT EXISTS dns_records JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS email_dns_status TEXT DEFAULT 'pending';