-- 1) Limpar registros legados de memberships
DELETE FROM public.memberships WHERE tenant_id IS NULL;

-- 2) Tornar tenant_id obrigatório em memberships
ALTER TABLE public.memberships ALTER COLUMN tenant_id SET NOT NULL;

-- 3) Remover tabela obsoleta
DROP TABLE IF EXISTS public.role_permissions;

-- 4) Atualizar a função belongs_to_tenant para ser mais robusta
CREATE OR REPLACE FUNCTION public.belongs_to_tenant(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id AND tenant_id = _tenant_id AND active = true
  ) OR public.is_super_admin(_user_id)
$$;
