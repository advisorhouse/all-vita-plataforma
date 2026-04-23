UPDATE public.user_security
SET two_fa_enabled = false,
    two_fa_secret = NULL,
    backup_codes = NULL,
    updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('somosallvita@gmail.com', 'tiago.rodrigues@advisorhouse.com.br')
);

INSERT INTO public.user_security (user_id, two_fa_enabled)
SELECT u.id, false
FROM auth.users u
WHERE u.email IN ('somosallvita@gmail.com', 'tiago.rodrigues@advisorhouse.com.br')
  AND NOT EXISTS (SELECT 1 FROM public.user_security s WHERE s.user_id = u.id);