## Objetivo

Eliminar o conflito visual e de roteamento que ocorre quando um usuário não autenticado acessa uma rota de tenant (ex: `/lumyss/core`) e é redirecionado para `/auth/login` — perdendo o slug da URL, mas mantendo o branding do tenant em memória.

## Por que não migrar para subdomínios?

A Lovable **não suporta wildcard DNS** (`*.allvita.com.br`). Cada subdomínio precisaria ser cadastrado manualmente no painel da Lovable, inviabilizando o cadastro automatizado de novas empresas via `/admin/tenants`. O modelo path-based é a única abordagem que escala automaticamente nesta plataforma.

A solução é tornar o path-based **100% consistente** — o slug deve viajar junto em TODAS as rotas, inclusive auth.

## O que será feito

### 1. Tornar as rotas de Auth conscientes do tenant

Adicionar variantes de rotas com slug em `App.tsx`:
- `/:slug/auth/login`
- `/:slug/auth/signup`
- `/:slug/auth/forgot-password`
- `/:slug/auth/reset-password`
- `/:slug/onboarding`

As rotas globais sem slug (`/auth/login`) continuam existindo apenas para super-admins acessando `/admin`.

### 2. AuthGuard preserva o slug ao redirecionar

Quando o `AuthGuard` detectar usuário não autenticado tentando acessar uma rota de tenant, redirecionar para `/<slug>/auth/login?redirect=<rota_original>` em vez de `/auth/login`.

### 3. Após o login, redirect respeita o slug

A `LoginPage` já usa `useTenantNavigation`. Garantir que o `redirect` da query string e o `currentTenant.slug` sejam combinados corretamente para devolver o usuário ao portal certo (`/<slug>/core`, `/<slug>/club`, etc).

### 4. Onboarding também respeita o slug

O fluxo de troca de senha (`/onboarding`) deve, quando o usuário pertence a um tenant, redirecionar ao final para `/<slug>/core` (ou `/<slug>/club`/`/<slug>/partner` conforme o role).

### 5. Documentar o modelo

Atualizar a memória de roteamento (`mem://architecture/tenant-routing-logic`) para deixar explícito que **todas** as rotas que vivem dentro do contexto de um tenant devem aceitar o prefixo `/:slug`, incluindo auth e onboarding.

## Resultado esperado

- Acessar `app.allvita.com.br/lumyss/core` sem login → redireciona para `app.allvita.com.br/lumyss/auth/login` (branding e URL coerentes).
- Após login → volta para `app.allvita.com.br/lumyss/core`.
- Branding nunca mais "vaza" entre contextos: se a URL mostra `/lumyss/...`, o branding é da Lumyss; se mostra apenas `/auth/login` (sem slug), o branding é o All Vita global.
- Modelo escalável: adicionar 1.000 tenants não exige nenhuma configuração de DNS ou Lovable adicional.

## Detalhes técnicos

- `App.tsx`: duplicar blocos de rotas auth/onboarding sob `/:slug/...`.
- `AuthGuard.tsx`: ler `useParams().slug` (ou `currentTenant.slug` como fallback) e construir o caminho de redirect com prefixo.
- `useTenantNavigation.ts`: já está preparado para prefixar slug — estender a lista de rotas tenant-aware para incluir `/auth` e `/onboarding`.
- `LoginPage.tsx`: ao fazer redirect pós-login, usar `tenantPath()` em vez de path absoluto.
- `AdminOnboarding.tsx`: aplicar o mesmo padrão no destino final (`window.location.href = tenantPath('/core')`).
