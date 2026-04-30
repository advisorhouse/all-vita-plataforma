## Contexto

A migração para subdomínios está 80% pronta, mas a última edição quebrou o roteamento (`<ClubRoutes>` usado como filho direto de `<Routes>`, o que React Router não permite). O preview está bloqueado por esse erro. Além disso, precisamos finalizar a limpeza para a empresa "Lumyss" ser recadastrada do zero usando o novo fluxo.

## Etapas

### 1. Corrigir o bug de roteamento (urgente — desbloqueia preview)

Em `src/App.tsx`, transformar `ClubRoutes`, `PartnerRoutes` e `CoreRoutes` de **componentes** em **fragmentos JSX constantes** que podem ser interpolados diretamente dentro de `<Route>...</Route>`.

```text
ANTES (quebrado):
  <Route path="/club" element={...}>
    <ClubRoutes />          ← React Router rejeita
  </Route>

DEPOIS:
  const clubChildren = <><Route index .../><Route path="..." .../></>;
  
  <Route path="/club" element={...}>
    {clubChildren}          ← fragmento, funciona
  </Route>
  <Route path="/:slug/club" element={...}>
    {clubChildren}
  </Route>
```

Aplicar o mesmo padrão para Partner e Core.

### 2. Excluir o tenant "Lumyss" atual do banco

Criar migração SQL para deletar o tenant `slug='lumyss'` e dependências (memberships, partners, clients vinculados). Deixa o terreno limpo para o novo cadastro.

### 3. Adicionar painel de status de subdomínio em `/admin/tenants/[id]`

Nova seção na aba Overview do tenant mostrando:
- URL esperada: `{slug}.allvita.com.br`
- Status DNS (resolvido? aponta pro IP correto?)
- Status SSL (ativo? pendente?)
- Botão "Copiar instruções DNS" com os valores prontos pra colar no Registro.br
- Aviso: "Conecte o subdomínio no Lovable em Project Settings → Domains"

### 4. Remover prefixo `/lumyss/` legado

Como ninguém ainda usou path-based, remover as rotas duplicadas `/:slug/club`, `/:slug/partner`, `/:slug/core` do `App.tsx`. O app passa a usar exclusivamente subdomínio (mais query param `?tenant=` para dev local). Simplifica o `useTenantNavigation` (remove toda a lógica de injetar slug no path).

### 5. Atualizar `tenant-routing.ts` e remover `main.tsx` rewrite

- Remover `extractSlugFromPath`, `PATH_BASED_HOSTS`, `RESERVED_PATH_SEGMENTS`
- Remover o IIFE de rewrite em `main.tsx`
- `useSubdomainTenant` passa a detectar **só** subdomínio + custom domain + query param
- `buildTenantUrl(slug, path)` retorna `https://{slug}.allvita.com.br{path}`

### 6. Documentação inline no admin

Adicionar tooltip/help no formulário de criação de tenant explicando os 2 passos manuais (Lovable Domains + Registro.br DNS) com o IP `185.158.133.1`.

## Aspectos técnicos

- **Detecção de tenant**: `window.location.hostname` → extrai primeiro segmento se domínio é `*.allvita.com.br` e não é reservado (`app`, `www`, `api`, `admin`)
- **Reservados**: `app.allvita.com.br` continua sendo o admin global (super admin); subdomínios como `lumyss.allvita.com.br` são tenants
- **Branding**: já corrigido na conversa anterior — cor 1 → `--background` + `--sidebar-background`, cor 2 → `--primary` + `--accent`, com cálculo automático de contraste pro texto
- **Dev local**: continuar suportando `?tenant=lumyss` via query param (já implementado)
- **SSL**: Lovable provisiona via Let's Encrypt automaticamente após DNS resolver — sem ação manual

## Fora de escopo

- Wildcard DNS (`*.allvita.com.br`) — Lovable não suporta, então cada tenant exige conexão manual no painel Lovable. Como serão só 2-3 tenants, isso é aceitável.
- Self-service onboarding (cliente cria tenant sozinho) — não faz sentido com fluxo manual de DNS. Cadastro de tenant continua sendo prerrogativa do super admin.

## O que VOCÊ precisará fazer depois que eu implementar

Para cada nova empresa (incluindo recadastrar a Lumyss):

1. Criar a empresa em `app.allvita.com.br/admin/tenants` (~2 min)
2. Conectar o subdomínio em **Lovable → Project Settings → Domains** (~1 min)
3. Adicionar 1 registro DNS tipo A no Registro.br (~2 min)
4. Aguardar propagação e SSL (~15 min a 4h, sem ação sua)

Total: **~5 minutos de trabalho ativo por empresa**, uma única vez na vida.
