-- Tabela de convites para staff da plataforma
CREATE TABLE public.staff_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice único parcial para permitir apenas um convite pendente por email
CREATE UNIQUE INDEX idx_staff_invitations_email_pending ON public.staff_invitations (email) WHERE status = 'pending';

-- Habilitar RLS
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Apenas super_admin e admin do staff podem ver e criar convites
CREATE POLICY "Staff admins can manage invitations"
ON public.staff_invitations
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.all_vita_staff
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin')
        AND is_active = true
    )
);

-- Permitir que qualquer pessoa verifique um convite pelo token (para o fluxo de aceite)
CREATE POLICY "Anyone can view invitation by token"
ON public.staff_invitations
FOR SELECT
USING (true);

-- Função para aceitar convite (será chamada via RPC)
CREATE OR REPLACE FUNCTION public.accept_staff_invitation(invitation_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation RECORD;
    v_user_id UUID;
BEGIN
    -- Obter o ID do usuário logado
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
    END IF;

    -- Buscar o convite
    SELECT * INTO v_invitation
    FROM public.staff_invitations
    WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > now()
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Convite inválido ou expirado');
    END IF;

    -- Verificar se o usuário já é staff (opcional se quiser permitir troca de role, mas melhor travar)
    IF EXISTS (SELECT 1 FROM public.all_vita_staff WHERE user_id = v_user_id) THEN
        -- Se já é staff, apenas marca o convite como aceito para limpar? 
        -- Ou retorna erro. Melhor retornar erro para evitar confusão.
        RETURN jsonb_build_object('success', false, 'error', 'Você já faz parte do staff desta plataforma.');
    END IF;

    -- Inserir no staff
    INSERT INTO public.all_vita_staff (user_id, role, is_active)
    VALUES (v_user_id, v_invitation.role, true);

    -- Atualizar status do convite
    UPDATE public.staff_invitations
    SET status = 'accepted'
    WHERE id = v_invitation.id;

    RETURN jsonb_build_object('success', true);
END;
$$;
