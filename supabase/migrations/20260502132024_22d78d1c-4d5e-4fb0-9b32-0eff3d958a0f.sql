-- We can't easily trigger a password reset for another user from SQL without internal functions
-- But we can update their password and set must_change_password
UPDATE auth.users 
SET encrypted_password = crypt('Lumyss2026!', gen_salt('bf'))
WHERE email = 'tecnologia@advisorhouse.com.br';

UPDATE public.profiles
SET must_change_password = true
WHERE email = 'tecnologia@advisorhouse.com.br';