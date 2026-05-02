-- Reseta o onboarding para todos os usuários que têm memberships como partner
UPDATE public.profiles 
SET partner_onboarding_seen = false 
WHERE id IN (
    SELECT user_id 
    FROM public.memberships 
    WHERE role = 'partner'
);