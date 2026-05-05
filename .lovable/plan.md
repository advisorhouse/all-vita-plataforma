## Problema

O parceiro `juridico@advisorhouse.com.br` recebeu um e-mail de convite cujo botão não funciona. O link aponta para `/auth/verify?type=invite&redirect_to=...set-password`, mas esse token já foi consumido (ou expirou), e o fluxo da página de set-password/reset-password não estava completo para convites novos. Além disso, a edge function `manage-users` ficou com diversos resíduos das tentativas anteriores que precisam ser estabilizados antes de tentar reenviar.

## Causa raiz

1. A edge function `manage-users` está com a lógica de autorização quebrada (várias edições incompletas) e a estrutura `try/switch` desalinhada — por isso até o reenvio via API falha com `Unauthorized`.
2. A página `/auth/reset-password` só ativava o formulário quando detectava `type=recovery` no hash; convites (`type=invite`) eram rejeitados como "link inválido".
3. O botão do e-mail antigo aponta para um token de uso único que já foi consumido (ou expirou em 24h). Mesmo com o fluxo arrumado, é necessário gerar um link novo e enviá-lo de novo.

## O que será feito

### 1. Estabilizar a edge function `manage-users`

Reorganizar o início do arquivo para que a função volte a funcionar corretamente:

- Restaurar o bloco `try { ... switch(action) { ... } } catch` de forma íntegra (hoje o `switch` ficou fora do `try` por uma edição parcial, o que faz qualquer chamada retornar erro).
- Manter a checagem de `service role key` por header `Authorization: Bearer <serviceKey>` ou `apikey: <serviceKey>` para permitir reenvios administrativos.
- Reabilitar a checagem de permissões via RBAC (`can()`) para chamadas de usuários comuns (admin do tenant), removendo o bypass temporário.
- Garantir que as ações `create`, `resend-invite` e `invite_user` sempre gerem links com `redirectTo = https://<slug>.allvita.com.br/auth/reset-password` (subdomínio do tenant).

### 2. Garantir que o link do e-mail funcione na chegada

- Página `/auth/reset-password` (já parcialmente ajustada) precisa:
  - Aceitar `type=recovery`, `type=invite` e `type=signup` no hash da URL.
  - Tratar o caso em que o Supabase devolve `error_code=otp_expired` na URL — exibindo botão "Solicitar novo convite" em vez de erro genérico.
- Adicionar a rota `/auth/set-password` redirecionando para `/auth/reset-password` (para compatibilidade com e-mails antigos já enviados — a parte de Vite/React Router já foi mexida, validar que está deployada).
- Reaproveitar `useTenantNavigation` para preservar o subdomínio quando o usuário concluir a definição de senha.

### 3. Reenviar o e-mail de convite para `juridico@advisorhouse.com.br`

Após a função estar saudável, reenviar via `manage-users/resend-invite` (ou `invite_user`) usando service role:

- `userId`: `c7ee4e1b-78f9-430d-8607-8cdd3329f769`
- `tenant_id`: `6a1818ae-5225-4a38-8f95-6c254dec0580` (Lumyss)
- `email`: `juridico@advisorhouse.com.br`
- `full_name`: `Dr. Tiago Parceiro Lumyss`
- `redirectTo`: `https://lumyss.allvita.com.br/auth/reset-password`

A edge function chama `auth.admin.inviteUserByEmail` (que dispara o `auth-email-hook`), gerando um novo token válido por 24h e enviando o e-mail de boas-vindas branded da Lumyss via Resend.

### 4. Validar de ponta a ponta

- Conferir nos logs do `auth-email-hook` que o e-mail saiu (status 200 do Resend).
- Confirmar via `supabase--analytics_query` em `auth_logs` que o token não foi marcado como `One-time token not found` no envio.
- Abrir o link em janela anônima e verificar que carrega o formulário de "Definir nova senha" no domínio `lumyss.allvita.com.br`.

## Detalhes técnicos

```text
auth-email-hook (Supabase Auth Hook)
   │
   ├─ Recebe evento INVITE com email_data.token_hash + redirect_to
   ├─ Resolve tenant pelo redirect_to (lumyss → branding Lumyss)
   └─ Envia e-mail via Resend com botão:
        https://fmkcxsyudgtimpbjwcjv.supabase.co/auth/v1/verify
          ?token=<hash>&type=invite
          &redirect_to=https://lumyss.allvita.com.br/auth/reset-password

Usuário clica → Supabase valida token → redirect 303 →
   https://lumyss.allvita.com.br/auth/reset-password#access_token=...&type=invite
        │
        └─ ResetPasswordPage detecta type=invite, mostra form, chama
           supabase.auth.updateUser({ password }) → sucesso → /auth/login
```

## Arquivos afetados

- `supabase/functions/manage-users/index.ts` — restaurar estrutura `try/switch`, reativar RBAC, padronizar `redirectTo`
- `src/pages/auth/ResetPasswordPage.tsx` — aceitar `type=invite/signup`, tratar `otp_expired`
- `src/App.tsx` — confirmar rota de fallback `/auth/set-password → /auth/reset-password` (já parcialmente feito)

## Ações de runtime (após o deploy)

1. `supabase--deploy_edge_functions ["manage-users"]`
2. `supabase--curl_edge_functions POST /manage-users/invite_user` com o payload acima usando service role key
3. Validar logs e analítica do `auth_logs` para confirmar entrega
