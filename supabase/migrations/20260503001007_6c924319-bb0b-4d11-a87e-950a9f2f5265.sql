-- Add active column if missing
ALTER TABLE public.ai_personas ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Ensure we have a default persona configuration
INSERT INTO public.ai_personas (tenant_id, name, system_prompt, tone_of_voice, use_emojis, active)
SELECT id, 'Dra. Marina', 'Você é a Dra. Marina, uma assistente virtual prestativa da All Vita. Você é especialista em saúde ocular e seu tom de voz deve ser acolhedor, profissional e educativo. Seu objetivo é guiar o usuário através de um diagnóstico rápido para identificar necessidades de proteção visual.', 'friendly', true, true
FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;
