-- Create table for tenant segments
CREATE TABLE IF NOT EXISTS public.tenant_segments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenant_segments ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read segments
CREATE POLICY "Segments are viewable by everyone" 
ON public.tenant_segments 
FOR SELECT 
USING (true);

-- Insert initial segments
INSERT INTO public.tenant_segments (name) VALUES 
('Oftalmológico'),
('Emagrecimento'),
('Longevidade'),
('Performance'),
('Nutrição'),
('Estética'),
('Bem-estar'),
('Medicina Preventiva'),
('Varejo'),
('Serviços'),
('Educação'),
('Tecnologia')
ON CONFLICT (name) DO NOTHING;
