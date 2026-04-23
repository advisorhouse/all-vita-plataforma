DELETE FROM auth.mfa_factors
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('somosallvita@gmail.com', 'tiago.rodrigues@advisorhouse.com.br')
);