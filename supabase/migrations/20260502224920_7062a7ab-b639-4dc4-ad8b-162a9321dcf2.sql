-- Create AI Personas table
CREATE TABLE public.ai_personas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Atendente Virtual',
    avatar_url TEXT,
    system_prompt TEXT,
    tone_of_voice TEXT DEFAULT 'professional',
    use_emojis BOOLEAN DEFAULT true,
    knowledge_base TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.ai_personas ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can view personas (needed for public chat)
CREATE POLICY "Personas are viewable by everyone" 
ON public.ai_personas FOR SELECT 
USING (true);

-- Only service role or authenticated admins (if we had a role check) can update
-- For now, allowing update if user is authenticated (can be refined later)
CREATE POLICY "Admins can manage their tenant personas" 
ON public.ai_personas FOR ALL
USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_ai_personas_updated_at
BEFORE UPDATE ON public.ai_personas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
