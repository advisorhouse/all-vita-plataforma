-- Insert audit logs for demonstration
INSERT INTO public.audit_logs (user_id, action, entity_type, ip, created_at, details)
SELECT 
  id, 
  'LOGIN_SUCCESS', 
  'AUTH', 
  '189.120.45.10', 
  now() - interval '1 hour',
  '{"method": "password"}'::jsonb
FROM public.profiles
LIMIT 10;

INSERT INTO public.audit_logs (user_id, action, entity_type, ip, created_at, details)
SELECT 
  id, 
  'PROFILE_UPDATE', 
  'USER', 
  '189.120.45.10', 
  now() - interval '2 days',
  '{"changes": {"phone": "updated"}}'::jsonb
FROM public.profiles
LIMIT 10;

INSERT INTO public.audit_logs (user_id, action, entity_type, ip, created_at, details)
SELECT 
  id, 
  'PASSWORD_RESET_REQUEST', 
  'AUTH', 
  '189.120.45.10', 
  now() - interval '5 days',
  '{"channel": "email"}'::jsonb
FROM public.profiles
LIMIT 10;

-- Insert security events for demonstration
INSERT INTO public.security_events (user_id, type, severity, ip, created_at)
SELECT 
  id, 
  'MFA_ENABLED', 
  'low', 
  '189.120.45.10', 
  now() - interval '10 days'
FROM public.profiles
LIMIT 10;

INSERT INTO public.security_events (user_id, type, severity, ip, created_at)
SELECT 
  id, 
  'LOGIN_ATTEMPT_BLOCKED', 
  'medium', 
  '45.230.10.5', 
  now() - interval '12 days'
FROM public.profiles
LIMIT 10;