-- Update the function to be SECURITY DEFINER so it can bypass RLS for the update operations
-- and ensure it has proper search path
CREATE OR REPLACE FUNCTION public.accept_staff_invitation(invitation_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: allows the function to bypass RLS for the tables it modifies
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

    -- Verificar se o usuário já é staff
    IF EXISTS (SELECT 1 FROM public.all_vita_staff WHERE user_id = v_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Você já faz parte do staff desta plataforma.');
    END IF;

    -- Inserir no staff
    INSERT INTO public.all_vita_staff (user_id, role, is_active)
    VALUES (v_user_id, v_invitation.role, true);

    -- Atualizar status do convite
    UPDATE public.staff_invitations
    SET status = 'accepted',
        confirmed_at = now()
    WHERE id = v_invitation.id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.accept_staff_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_staff_invitation(text) TO anon;
