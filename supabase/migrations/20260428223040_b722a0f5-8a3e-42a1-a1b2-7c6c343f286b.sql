-- Create table for communication templates
CREATE TABLE IF NOT EXISTS public.communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'in_app')),
    subject TEXT,
    content TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

-- Policies for communication_templates
CREATE POLICY "Public templates are viewable by authenticated users"
ON public.communication_templates FOR SELECT
TO authenticated
USING (active = true);

-- Seed basic templates
INSERT INTO public.communication_templates (name, slug, type, subject, content)
VALUES 
('Boas-vindas (Novo Tenant)', 'welcome-tenant', 'email', 'Bem-vindo à All Vita!', '<h1>Olá {{name}}!</h1><p>Sua plataforma está pronta.</p>'),
('Convite de Usuário', 'user-invite', 'email', 'Você foi convidado para a All Vita', '<p>Você foi convidado para participar da plataforma All Vita. Clique no link abaixo para ativar sua conta.</p>'),
('Recuperação de Senha', 'password-reset', 'email', 'Recuperação de Senha - All Vita', '<p>Recebemos uma solicitação para redefinir sua senha.</p>'),
('Notificação de Comissão', 'commission-alert', 'in_app', 'Nova Comissão!', 'Você recebeu uma nova comissão de {{amount}}.')
ON CONFLICT (slug) DO NOTHING;

-- Function to handle notification creation from triggers or manually
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_tenant_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_action_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, tenant_id, title, message, type, action_url)
    VALUES (p_user_id, p_tenant_id, p_title, p_message, p_type, p_action_url)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
