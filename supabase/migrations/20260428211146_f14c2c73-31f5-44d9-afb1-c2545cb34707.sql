CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id 
      AND role IN ('super_admin', 'admin') 
      AND tenant_id IS NULL 
      AND active = true
  )
$function$;