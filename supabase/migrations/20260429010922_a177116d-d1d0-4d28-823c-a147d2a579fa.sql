CREATE OR REPLACE FUNCTION public.accept_staff_invitation(invitation_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    v_invitation RECORD;
    v_user_id UUID;
    v_error_msg TEXT;
BEGIN
    -- Obter o ID do usuário logado
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
    END IF;

    -- Buscar o convite
    BEGIN
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

        -- Inserir no staff com casting explícito para staff_role
        INSERT INTO public.all_vita_staff (user_id, role, is_active)
        VALUES (v_user_id, v_invitation.role::staff_role, true);

        -- Atualizar perfil se o nome estiver presente no convite
        IF v_invitation.full_name IS NOT NULL AND v_invitation.full_name != '' THEN
            UPDATE public.profiles
            SET first_name = split_part(v_invitation.full_name, ' ', 1),
                last_name = CASE 
                    WHEN position(' ' in v_invitation.full_name) > 0 
                    THEN substring(v_invitation.full_name from position(' ' in v_invitation.full_name) + 1)
                    ELSE NULL 
                END
            WHERE id = v_user_id
            AND (first_name IS NULL OR first_name = '');
        END IF;

        -- Atualizar status do convite
        UPDATE public.staff_invitations
        SET status = 'accepted',
            confirmed_at = now()
        WHERE id = v_invitation.id;

        RETURN jsonb_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error_msg = MESSAGE_TEXT;
        RETURN jsonb_build_object('success', false, 'error', 'Database error: ' || v_error_msg);
    END;
END;
$function$;