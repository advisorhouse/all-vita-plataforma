## Objetivo

Migrar identificação de tenant de **subdomínio** (`lumyss.allvita.com.br`) para **path** (`app.allvita.com.br/lumyss`). Resultado: criar tenant volta a ser 1 clique, sem nenhum trabalho de DNS por tenant.

---

## Contexto rápido

- Lovable não suporta wildcard custom domain. Cada hostname precisa ser cadastrado individualmente em Project Settings → Domains com TXT de verificação.
- `app.allvita.com.br` já está cadastrado e ativo na Lovable.
- Hoje `useSubdomainTenant` lê o tenant do subdomínio. Vamos passar a ler do primeiro segmento do path quando o host for `app.allvita.com.br`.

---

## Mudanças

### 1. Detecção de tenant por path (`src/hooks/useSubdomainTenant.ts`)

Adicionar nova lógica que roda **antes** da detecção por subdomínio:

- Se `hostname === "app.allvita.com.br"` (ou é o domínio principal publicado), pegar `pathname.split("/")[1]`.
- Se esse segmento não for uma rota reservada (`admin`, `auth`, `quiz`, `core`, `partner`, `club`, `activate`, `invite`, `notifications`, `proposal`, `profile`, `privacy-policy`, `terms-of-use`), tratá-lo como slug do tenant.
- Resolver tenant por `slug` no Supabase, idêntico ao fluxo atual.
- Manter detecção por subdomínio como fallback (continuará funcionando para tenants que eventualmente tiverem domínio próprio cadastrado manualmente).
- Manter `?tenant=` para preview/dev.

### 2. Reescrita de URLs internas (router/links)

Quando estamos no modo path-based (`isPathBasedTenant === true`), todas as rotas dos portais precisam ser prefixadas com `/<slug>`:

- Criar helper `buildTenantPath(slug, path)` em `src/lib/tenant-brand.ts` (ou novo `src/lib/tenant-routing.ts`).
- Atualizar `useTenantNavigation` para usar esse helper.
- No `App.tsx`, adicionar rotas com prefixo dinâmico `/:tenantSlug/core/*`, `/:tenantSlug/partner/*`, `/:tenantSlug/club/*` em paralelo às rotas existentes.
- Manter rotas atuais (`/core/*`, `/partner/*`, `/club/*`) para retrocompatibilidade (subdomínio + preview).

### 3. Modal de criação de tenant (`CreateTenantDialog.tsx`)

- Remover etapa "Registros DNS" completamente.
- Após criar o tenant, mostrar URL final pronta para copiar: `https://app.allvita.com.br/<slug>`.
- Manter etapa de e-mail (Resend) como está.
- Marcar `dns_status = 'active'` automaticamente para todos os novos tenants (não há mais DNS para validar).

### 4. Edge function `check-subdomain`

- Manter a função (útil se algum dia alguém quiser configurar subdomínio próprio), mas não é mais chamada no fluxo padrão de criação.

### 5. Hub público / landing do tenant

- `TenantPublicHub` e CRM público passam a viver em `/<slug>` ao invés de `<slug>.allvita.com.br`.
- Atualizar componentes que geram links públicos (convites, links de partner, links do quiz) para usar `app.allvita.com.br/<slug>/...`.

### 6. Memórias

Atualizar:
- `mem://architecture/tenant-routing-logic` — nova lógica path-based como padrão.
- `mem://features/tenant-creation-branding-step` — remover passo DNS.
- `mem://core` — adicionar regra "Tenant routing path-based em app.allvita.com.br/<slug>".

---

## Detalhes técnicos

### Estrutura de detecção (pseudocódigo)

```text
hostname = window.location.hostname
pathname = window.location.pathname

1. host === "app.allvita.com.br" OR host ends with ".lovable.app/dev":
   slug = pathname.split("/")[1]
   if slug && !RESERVED_PATHS.includes(slug):
     → load tenant by slug, mark isPathBased=true

2. host é subdomínio de allvita.com.br (fallback legado):
   slug = subdomínio
   → fluxo atual

3. host é domínio custom (lookup por tenants.domain):
   → fluxo atual

4. ?tenant=slug (dev):
   → fluxo atual
```

### Rotas reservadas (não são tenant slugs)

`admin`, `auth`, `quiz`, `notifications`, `profile`, `privacy-policy`, `terms-of-use`, `proposal`, `invite`, `activate`, e qualquer asset (`assets`, `favicon.ico`, etc.).

### Compatibilidade

- Tenant `lumyss` que já foi criado: continuará funcionando via `app.allvita.com.br/lumyss` automaticamente assim que esta mudança for ao ar.
- Subdomínio `lumyss.allvita.com.br` segue quebrado (Cloudflare 1001) — não vamos consertar, apenas comunicar nova URL.

---

## Fora de escopo

- Suporte a domínio próprio do cliente (ex: `clube.lumyss.com.br`). Pode ser adicionado depois como feature opcional via cadastro manual na Lovable + campo `tenants.domain`.
- Cloudflare. Não será usado.
- Wildcard DNS. Não será usado.

---

## Resultado para o usuário

- Criar novo tenant: preenche dados → 1 clique → URL `app.allvita.com.br/<slug>` funciona instantaneamente.
- Zero DNS, zero TXT, zero espera de propagação, zero Cloudflare.
- Tenants existentes acessam via nova URL automaticamente.