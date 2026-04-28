-- Identificando o ID do usuário: be1416e4-8082-4c87-9e2d-c2df0c117779
-- Deletando o perfil (a deleção do auth.users deve ser feita via API ou se houver trigger, mas aqui deletamos os dados da tabela profiles)
DELETE FROM public.profiles WHERE id = 'be1416e4-8082-4c87-9e2d-c2df0c117779';

-- Nota: Para excluir permanentemente o acesso (auth.users), isso geralmente requer exclusão manual no painel Supabase ou via Edge Function com service_role. 
-- Como agente, posso realizar a limpeza dos dados da aplicação.