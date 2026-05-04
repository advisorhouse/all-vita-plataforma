-- Add email and document to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS document TEXT;

-- Add partner_id to orders to track which partner made the sale
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id);

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON public.orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_document ON public.clients(document);