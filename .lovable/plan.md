
# RBAC: Plataforma All Vita vs Tenant — Plano de reestruturação

## Diagnóstico

**Sim, faz total sentido separar**. Hoje tudo vive em uma única tabela (`memberships`) e um único enum (`app_role`), o que gera três problemas concretos já observados no projeto:

1. O conceito de "Staff All Vita" foi sendo emulado com `tenant_id IS NULL` em `memberships` — frágil e contraintuitivo (gerou o bug recente em que `tiagorsantos.br@gmail.com` não enxergava tenants).
2. Já existe um enum `staff_role` e a tabela `all_vita_staff`, mas estão **órfãos** — ninguém os usa. A intenção de separar já estava no banco, só não foi concluída.
3. A tabela `role_permissions` existe, mas é **estática e global** (sem coluna `tenant_id` nem `scope`), então o Super Admin não consegue de fato "pré-setar o que cada role pode fazer", e cada Admin de Tenant também não consegue customizar nada.

A separação proposta abaixo resolve os três pontos.

## Arquitetura alvo

Dois domínios independentes, cada um com sua tabela de vínculo, seu enum de roles e sua matriz de permissões editável.

```text
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│  DOMÍNIO PLATAFORMA (All Vita)  │    │      DOMÍNIO TENANT             │
│                                 │    │                                 │
│  Tabela: all_vita_staff         │    │  Tabela: memberships            │
│  Enum:   platform_role          │    │  Enum:   tenant_role            │
│   - super_admin (dono)          │    │   - admin                       │
│   - admin                       │    │   - manager                     │
│   - manager                     │    │   - colaborador  (NOVO)         │
│   - colaborador                 │    │   - partner                     │
│                                 │    │   - client                      │
│  Permissões:                    │    │                                 │
│   platform_role_permissions     │    │  Permissões:                    │
│   (editável pelo Super Admin)   │    │   tenant_role_permissions       │
│                                 │    │   (default global + override    │
│  Acessa: /admin/*               │    │    por tenant, editável pelo    │
│                                 │    │    Admin do tenant)             │
└─────────────────────────────────┘    │                                 │
                                       │  Acessa:                        │
                                       │   admin/manager/colab → /core/* │
                                       │   partner             → /partner│
                                       │   client              → /club   │
                                       └─────────────────────────────────┘
```

Pontos-chave:
- `super_admin` deixa de existir em `app_role` (tenant) — passa a viver **só** no domínio plataforma. Acabam os `tenant_id IS NULL` espalhados.
- `colaborador` é uma role nova para o staff do tenant com permissões mais restritas que `manager` por padrão.
- Permissões deixam de ser uma matriz hardcoded em código (`src/hooks/usePermissions.ts`) e passam a ser **dados editáveis no banco**, lidos por hook.

## Mudanças no banco

1. **Renomear/criar enums**
   - Reaproveitar `staff_role` → renomear para `platform_role` com valores: `super_admin`, `admin`, `manager`, `colaborador`.
   - Criar `tenant_role` com: `admin`, `manager`, `colaborador`, `partner`, `client`. (`app_role` antigo é mantido temporariamente para compatibilidade e migrado.)

2. **Tabela `all_vita_staff`** (já existe) — usar de verdade. Migrar os registros atuais de `memberships` que têm `role IN ('super_admin','admin') AND tenant_id IS NULL` para cá.

3. **Tabela `memberships`** — passar a aceitar **só** roles de tenant (drop dos registros com `tenant_id IS NULL` após migração). `tenant_id` vira `NOT NULL`.

4. **Permissões editáveis** — duas tabelas novas:
   - `platform_role_permissions(role, resource, action, allowed)` — editável só pelo `super_admin` da plataforma.
   - `tenant_role_permissions(tenant_id NULL, role, resource, action, allowed)` — `tenant_id NULL` = default global definido pelo Super Admin; linha com `tenant_id` preenchido = override que o Admin daquele tenant criou. Lookup faz fallback do override para o default.

5. **Funções security-definer** — atualizar:
   - `is_super_admin(uuid)` → consulta `all_vita_staff` (role `super_admin`, ativo).
   - `is_platform_staff(uuid, platform_role)` → nova.
   - `has_tenant_role(uuid, tenant_id, tenant_role)` → renomeada/atualizada.
   - `can(uuid, resource, action, tenant_id NULL)` → nova, faz a leitura unificada das duas matrizes.
   - Todas as policies RLS (~80 policies) são atualizadas para usar essas funções. Risco controlado: as funções mantêm a mesma assinatura semântica.

## Mudanças no frontend

- **`TenantContext`** deixa de derivar `isSuperAdmin` de `memberships` e passa a consultar `all_vita_staff` (novo hook `usePlatformStaff`).
- **`usePermissions`** vira data-driven: busca `tenant_role_permissions` resolvido (override + default) para o tenant ativo, ou `platform_role_permissions` quando em `/admin`.
- **`AuthGuard`** ganha checagem de `requiredPlatformRole` separada de `requiredTenantRole`.
- **Roteamento por role**:
  - `platform_role` qualquer → `/admin`
  - `tenant_role` admin/manager/colaborador → `/core`
  - `tenant_role` partner → `/partner`
  - `tenant_role` client → `/club`

## Telas novas

1. **`/admin/settings/permissions`** — Matriz da Plataforma
   - Tabela editável: linhas = recursos (tenants, users, financials, integrations, audit, vitacoins…), colunas = ações (read/create/update/delete), agrupada por `platform_role` (admin, manager, colaborador). Super Admin não aparece (acesso total implícito).
   - Botões "Salvar" e "Restaurar padrão".

2. **`/admin/staff`** — Gestão do Staff All Vita
   - Lista de membros de `all_vita_staff` com role, status, último acesso.
   - Convidar novo staff (envia e-mail via `send-email` edge function), alterar role, desativar.

3. **`/core/settings/permissions`** — Matriz do Tenant
   - Mesmo padrão da matriz da plataforma, mas escopo no tenant atual e só para roles `admin`, `manager`, `colaborador`.
   - Mostra os defaults globais (definidos pelo Super Admin) com badge "padrão" e permite override por tenant.
   - Acessível apenas por quem tem `tenant_role = admin` no tenant.

4. **Atualização de `/core/permissions`** — hoje é placeholder; passa a listar membros do tenant com suas roles e link para a matriz acima.

## Migração de dados (segura)

```text
1. Criar novos enums e tabelas, popular defaults em platform_role_permissions
   e tenant_role_permissions (a partir da matriz hoje em usePermissions.ts).
2. INSERT em all_vita_staff a partir de memberships WHERE tenant_id IS NULL
   AND role IN ('super_admin','admin').
3. Rodar novas funções e policies em paralelo com as antigas (feature flag
   no frontend) para validar.
4. DELETE em memberships WHERE tenant_id IS NULL.
5. ALTER memberships.tenant_id SET NOT NULL.
6. Drop das funções/policies antigas.
```

## Detalhes técnicos relevantes

- Manter `app_role` como alias/cast para `tenant_role` durante a migração para não quebrar edge functions (`api-gateway`, `tenant-api`, `manage-users` etc.) de uma vez. Atualizar uma a uma.
- `role_permissions` atual é dropada ao final (substituída pelas duas tabelas novas).
- RLS das duas tabelas de permissões: SELECT liberado para autenticados (precisa pra UI), UPDATE/INSERT/DELETE só via `is_super_admin` (plataforma) ou `has_tenant_role(_,_,'admin')` (tenant — e só na linha do próprio tenant).
- Audit log automático em toda alteração de permissão (já temos `create_audit_log`).

## Entregáveis em ordem

1. Migração SQL (enums, tabelas, funções, policies, seed dos defaults, migração de dados).
2. Atualizar `TenantContext`, `usePermissions`, `AuthGuard` e hooks correlatos.
3. Tela `/admin/settings/permissions` (matriz da plataforma).
4. Tela `/admin/staff` (gestão de staff All Vita).
5. Tela `/core/settings/permissions` (matriz do tenant com override).
6. Refatorar edge functions para usar as novas funções `can()` / `is_platform_staff()`.
7. Drop das estruturas legadas (`app_role` super_admin, `role_permissions`).

## Pontos para você confirmar antes de eu implementar

1. **Nome da role nova**: prefere `colaborador` (PT) ou `staff` (EN, alinhado com o resto do código)?
2. **Override de permissões no tenant**: o Admin do tenant pode **afrouxar** o default do Super Admin, ou só **restringir** mais? (Recomendo: só restringir — mais seguro.)
3. **Migração do usuário atual** `tiagorsantos.br@gmail.com`: ele vira `super_admin` em `all_vita_staff`. Confirma?
4. **Escopo agora**: faço tudo (1→7) numa tacada, ou prefere fatiar em 2 entregas (banco + matriz da plataforma primeiro; staff + matriz do tenant depois)?
