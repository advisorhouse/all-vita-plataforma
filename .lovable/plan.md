## Diagnóstico do que existe hoje

| Item | Status |
|---|---|
| `partners.referral_code` | Gerado **só** quando o partner se cadastra via `tenant-signup` (formato `SLUG-XXXXXX`). Partners criados por convite admin **não recebem código**. |
| Tabela `affiliate_links` | Existe (com `code`, `url`, `partner_id`, `tenant_id`) mas **nunca é populada automaticamente**. |
| `PartnerLinksPage` | O arquivo existe mas seu conteúdo é da página "Campanhas" (mock). **Não há UI real de links**. |
| `usePartnerTracking` | Captura `?ref=` e `?partner=` no localStorage, mas **nenhum fluxo lê esse valor** para vincular parceiro novo (parent) ou cliente novo. |
| `parent_partner_id` na tabela `partners` | Coluna existe; `tenant-signup` lê de `metadata.parent_partner_id` mas isso nunca é preenchido pelo frontend. |
| `process-attribution` edge function | **Quebrada** — referencia tabelas inexistentes (`client_profiles`, `affiliates`, `attribution_logs`, `fraud_alerts`). |
| Rota pública `/r/:code` ou `/p/:code` | **Não existe**. |
| Webhook → comissão | `webhook-receiver` registra, `commission-engine-v2` calcula — mas a venda chega sem `partner_id` resolvido a partir de `referral_code`. |

## O que vamos construir

Dois links únicos por parceiro, gerados automaticamente assim que o partner é criado:

1. **Link de RECRUTAMENTO de rede** (vira downline): `https://<slug>.allvita.com.br/r/<code>` → leva à landing pública de cadastro de novo partner já com `parent_partner_id` travado.
2. **Link de VENDA do produto** (vira cliente): `https://<slug>.allvita.com.br/q/<code>` → leva ao quiz/checkout público com `partner_id` atribuído à venda.

Mesmo `referral_code` resolve ambos os contextos (a rota define a intenção: `/r` rede, `/q` venda).

---

## Plano de implementação

### 1) Banco de dados (migrations)

a) **Backfill + trigger de `referral_code`**: garantir que toda linha em `partners` tenha um código único.
- Trigger `BEFORE INSERT` na tabela `partners`: se `referral_code IS NULL`, gera `<SLUG_TENANT>-<6_HEX_DO_USER>`.
- Backfill: UPDATE em todos partners existentes sem código.
- Constraint `UNIQUE (tenant_id, referral_code)` se ainda não houver.

b) **Trigger para auto-criar membership "partner" + linha em `partners`** quando admin convida usuário com `role=partner` (já é feito em alguns fluxos, mas vamos centralizar via trigger em `memberships AFTER INSERT WHEN role='partner'`).

c) **Função RPC `resolve_referral(code, tenant_id)`** SECURITY DEFINER, retorna `{ partner_id, parent_partner_id_for_new_recruits, tenant_id, partner_name, partner_avatar }`. Permite SELECT público (anon) somente desse RPC, sem expor a tabela `partners`.

d) **Função RPC `attribute_sale(order_id, referral_code)`** SECURITY DEFINER: cria linha em `referrals` + `conversions`, e dispara `commission-engine-v2` via `pg_net` (ou apenas marca pendente para o webhook chamar).

### 2) Edge functions

a) **Reescrever `process-attribution`** para usar as tabelas reais (`partners`, `referrals`, `conversions`, `clients`, `mt_commissions`):
- Entrada: `{ tenant_id, client_id, referral_code, source: 'sale'|'recruit', order_id?, ip, user_agent }`.
- Resolve partner pelo `referral_code`.
- Anti-fraude: bloqueia self-referral (mesmo `user_id`), e (opcional) trava cliente já atribuído.
- Cria `referrals` + (se sale) `conversions` ligada a `order_id`.
- Chama `commission-engine-v2` em background para gerar `mt_commissions` em todos os níveis upline.

b) **Atualizar `tenant-signup`** para, quando `role=partner`, ler `metadata.parent_referral_code`, resolver via `resolve_referral` e setar `parent_partner_id` automaticamente. Já roda no fluxo público.

c) **Atualizar `webhook-receiver`** (Shopify/Pagar.me): quando o pedido vier com `metadata.referral_code` (ou cookie/query persistido no checkout), chamar `process-attribution` após criar o `order`.

### 3) Frontend — captura e propagação do `ref`

a) `usePartnerTracking` já salva `localStorage.allvita_partner_ref`. Vamos:
- Estender para também salvar `allvita_partner_source` (`recruit` ou `sale`) baseado na rota.
- Limpar após uso bem-sucedido.

b) **Cadastro de novo partner (`SignupPage` / `tenant-signup`)**: ao chamar `tenant-signup` com `role=partner`, ler `localStorage.allvita_partner_ref` e enviar como `metadata.parent_referral_code`.

c) **Quiz público (`PublicQuizPage`) + Checkout**: incluir `referral_code` no payload da submissão e na criação do pedido (já há `metadata` em `orders` — passa para lá).

### 4) Rotas públicas (novas)

a) `/r/:code` → `RecruitLandingPage`
- Componente novo, white-label (usa `getTenantBrand` por subdomínio).
- Mostra: nome/avatar do partner que está convidando ("João te convidou para fazer parte da rede"), benefícios resumidos, CTA "Cadastrar como Partner" → vai para `SignupPage` com `?role=partner&ref=<code>`.

b) `/q/:code` → redireciona para o quiz público (`/quiz`) preservando `?ref=<code>`. Se o tenant tiver checkout próprio, redireciona pra lá.

c) Adicionar ambas em `App.tsx` **fora** do `AuthGuard`.

### 5) UI do parceiro — Página "Meus Links"

O arquivo `PartnerLinksPage.tsx` hoje contém Campanhas. Vamos:
- Renomear o atual para `PartnerCampaignsPage.tsx` e ajustar o import em `App.tsx` (rota `campaigns` continua igual).
- Criar um **novo** `PartnerLinksPage.tsx` real, mostrando:
  - **Card "Link de Recrutamento"**: URL completa, botão copiar, QR code, contadores (`partners ativos na minha rede`, `vitacoins ganhos com a rede este mês`).
  - **Card "Link de Vendas"**: URL do quiz/produto, botão copiar, QR code, contadores (`vendas atribuídas`, `comissão acumulada`, `vitacoins do mês`).
  - **Sub-link por campanha** (futuro): UTM por produto destacado.
  - Botões "Compartilhar no WhatsApp", "Copiar com mensagem pronta".
- Hook `useCurrentPartner` já existe; estender com campos de stats agregados (rápido via SELECTs em `referrals`/`mt_commissions`).

### 6) Validação ponta a ponta

Após deploy, testar manualmente:
1. Criar Partner A no tenant `lumyss`. Conferir `referral_code` no banco e link na UI.
2. Abrir `/r/<code>` em janela anônima → cadastrar Partner B → conferir `partners.parent_partner_id = A.id`.
3. Abrir `/q/<code>` → preencher quiz → simular pedido (chamar `webhook-receiver` com payload mock contendo `referral_code`) → conferir:
   - `referrals` criada
   - `conversions` criada
   - `mt_commissions` criadas para A (nível 1) e (se houver) upline de A
   - Vitacoins creditados conforme `commission_to_coin_rules` ativo do tenant

---

## Arquivos que serão criados/alterados

**Migrations**
- `supabase/migrations/<timestamp>_partner_referral_codes.sql` (trigger, backfill, RPCs)

**Edge Functions**
- `supabase/functions/process-attribution/index.ts` (reescrita)
- `supabase/functions/tenant-signup/index.ts` (lê `parent_referral_code`)
- `supabase/functions/webhook-receiver/index.ts` (chama process-attribution)

**Frontend**
- `src/App.tsx` (novas rotas `/r/:code`, `/q/:code`)
- `src/pages/invite/RecruitLanding.tsx` (novo)
- `src/pages/invite/SaleRedirect.tsx` (novo, simples)
- `src/pages/partner/PartnerCampaignsPage.tsx` (renomeado a partir do atual `PartnerLinksPage.tsx`)
- `src/pages/partner/PartnerLinksPage.tsx` (novo conteúdo real)
- `src/hooks/usePartnerTracking.ts` (estendido)
- `src/hooks/useCurrentPartner.ts` (stats agregados)
- `src/pages/auth/SignupPage.tsx` (envia `parent_referral_code`)
- `src/pages/quiz/PublicQuizPage.tsx` (envia `referral_code`)

---

## Resposta direta às suas perguntas

> "Quando o partner é cadastrado, precisa ser gerado um link único rastreável..."

Hoje **só é gerado** quando o partner se cadastra pelo fluxo público `tenant-signup`. Vamos garantir via **trigger no banco** que **todo** partner (incluindo convidados pelo admin) receba o código automaticamente, e expor o link na página "Meus Links" do portal do partner.

> "...para indicar outros partners para sua rede, com comissão definida"

Será o link `/r/<code>`. O fluxo grava `parent_partner_id` no novo partner; o `commission-engine-v2` (que já existe e usa `is_in_partner_downline`) calcula comissão multinível automaticamente em cada venda da rede.

> "Tambem precisa ser gerado o link único rastreável para a venda do produto do tenant, isso já esta sendo feito?"

**Não está funcional hoje.** O `usePartnerTracking` captura, mas nada lê esse valor para atribuir a venda. Vamos fechar esse loop com a rota `/q/<code>` + propagação no payload do pedido + reescrita do `process-attribution`.

Posso seguir com a implementação?