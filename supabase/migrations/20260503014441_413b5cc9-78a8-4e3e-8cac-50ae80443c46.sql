-- Adiciona chaves estrangeiras que podem estar faltando para melhorar o suporte do PostgREST
ALTER TABLE public.partners
DROP CONSTRAINT IF EXISTS partners_user_id_fkey,
ADD CONSTRAINT partners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Garante que o join com profiles funcione corretamente (profiles.id deve ser auth.users.id)
-- Note: profiles já deve ter uma FK para auth.users.id se seguir o padrão

-- Habilita acesso público para consulta de parceiros (apenas ativos)
CREATE POLICY "Public can view active partners"
ON public.partners
FOR SELECT
USING (active = true);

-- Habilita acesso público para consulta de perfis vinculados a parceiros
CREATE POLICY "Public can view partner profiles"
ON public.profiles
FOR SELECT
USING (
  id IN (
    SELECT user_id 
    FROM public.partners 
    WHERE active = true
  )
);
