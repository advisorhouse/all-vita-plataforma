# Decisão: Convite vs Criação direta de Partner

## Diagnóstico do problema atual

Hoje o `RegisterPartnerModal` (Core) chama `manage-users/create`, que internamente usa:

```ts
adminClient.auth.admin.createUser({ email, email_confirm: true, ... })
```

Esse método:
- Cria o usuário **já confirmado**, sem senha
- **NÃO dispara nenhum email** (não passa pelo `auth-email-hook`)
- Resultado: o parceiro fica cadastrado mas nunca recebe nada — exatamente o que aconteceu com `tecnologia@advisorhouse.com.br`

Já o fluxo do **admin do tenant** (criado pela All Vita) usa o caminho de signup/invite que passa pelo hook → por isso o email chega.

## Comparação dos caminhos possíveis

| Critério | A) Criação direta (`createUser`) | B) Convite (`inviteUserByEmail`) | C) Magic Link / generateLink type=invite |
|---|---|---|---|
| Dispara `auth-email-hook` | ❌ Não | ✅ Sim (template `invite`) | ✅ Sim |
| Usuário define própria senha | ❌ (precisa recovery depois) | ✅ Sim, no link de aceite | ✅ Sim |
| UX do parceiro | Confusa (sem email) | Direta: "convite aprovado → defina senha → entrar" | Igual a B |
| Permite reenviar convite | Manual (recovery) | ✅ Nativo | ✅ Nativo |
| Status do user até aceitar | confirmed sem senha | invited (claro) | invited |
| Risco de inconsistência | Alto (user existe, partner pendente) | Baixo | Baixo |
| Suporta metadata custom | ✅ | ✅ (via `data`) | ✅ |

**Recomendação: caminho B — `inviteUserByEmail`.**

Razões:
1. Já temos o template `invite.tsx` com o copy "Seu convite de parceria para a [marca] chegou!" pronto para esse fluxo.
2. É o método semanticamente correto: parceiro nível 1 é convidado pelo tenant, parceiro nível 2+ é convidado por outro parceiro — mesmo mecanismo, templates diferentes via metadata.
3. Não precisa de gambiarra de "criar + recovery" para entregar o email.
4. Reenvio de convite vira um botão simples na lista de parceiros.

## Mudanças propostas

### 1. `supabase/functions/manage-users/index.ts`
Quando `role === "partner"` (ou novo flag `send_invite: true`):
- Substituir `auth.admin.createUser` por `auth.admin.inviteUserByEmail(email, { data: { ...metadata, tenant_id, tenant_slug, tenant_name, partner_level, invited_by_partner_id }, redirectTo: \`https://<slug>.allvita.com.br/auth/set-password\` })`
- Após o invite voltar com user, criar o registro em `partners` com `user_id`, `tenant_id`, `parent_partner_id` (null se nível 1, ou ID do convidante), `level` (1 ou 2+), e demais dados do form (CPF, PIX, endereço, etc.)
- Retornar `{ success: true, partner_id, invited: true }`

### 2. `supabase/functions/auth-email-hook/index.ts`
- Para emails do tipo `invite`, ler `user_metadata.partner_level`:
  - Se `1` (ou ausente) → template atual `invite.tsx` (convite do tenant)
  - Se `>= 2` → novo template `invite-partner-network.tsx` (convite vindo de outro parceiro, mencionando quem convidou)
- Continuar usando `tenant_slug`/`tenant_name`/branding já implementados.

### 3. `supabase/functions/_shared/email-templates/invite-partner-network.tsx` (novo)
Template para parceiros nível 2+:
- Assunto: `[Nome do convidante] te convidou para a rede de parceiros da [Marca]`
- Corpo: contextualiza que ele foi indicado por outro parceiro, mantém pitch de vitacoins/recompensas, CTA "Aceitar convite e criar conta"

### 4. `RegisterPartnerModal.tsx`
- Sem mudança de UX. Apenas o body da chamada ganha:
  - `send_invite: true`
  - `partner_level: 1`
  - dados estruturados de partner (cpf, pix, endereço…) que hoje só ficam no state e somem
- Tela final passa a dizer claramente: "Convite enviado para [email]. O parceiro vai receber um link para definir a senha e ativar a conta."

### 5. Fluxo de convite por outro parceiro (nível 2+)
- No portal `/partner` adicionar ação "Convidar parceiro" em `PartnerReferredPartners` que chama o mesmo endpoint com `partner_level: 2`, `parent_partner_id: <partner_atual>`.
- Backend valida hierarquia via função existente `is_in_partner_downline` para evitar ciclos.

### 6. Reenviar convite
- Endpoint `manage-users/resend-invite` que chama `auth.admin.inviteUserByEmail` de novo (Supabase trata como reenvio se o user ainda não confirmou).
- Botão na listagem de parceiros do Core e do Partner.

### 7. Caso especial: parceiros já existentes sem email recebido
- Para `tecnologia@advisorhouse.com.br` e quaisquer outros nessa situação: rodar uma vez `auth.admin.generateLink({ type: 'recovery' })` ou simplesmente reenviar via `inviteUserByEmail` (ele aceita re-invite enquanto user não tiver senha definida) para regularizar.

## Pontos de atenção técnicos

- `inviteUserByEmail` exige que o domínio do `redirectTo` esteja na allow-list do Supabase Auth (URL Configuration). Hoje já temos `*.allvita.com.br` configurado para o admin — confirmar se inclui subdomínios de tenant.
- A página `/auth/set-password` precisa existir e tratar o token vindo no link (já temos `/auth/reset-password`; podemos reutilizar com copy diferente quando for primeiro acesso, detectado por `user.last_sign_in_at == null`).
- Manter `email_confirm` implícito do invite (Supabase confirma quando o user clica no link).
- `manage-users` precisa continuar idempotente: se o email já existe como user, buscar o id e só criar/atualizar `partners`.

## Resumo executivo

Trocamos `createUser` (silencioso, quebrado) por `inviteUserByEmail` (envia email pelo nosso hook), reaproveitamos o template `invite` atual para nível 1 e criamos um template novo para convites entre parceiros (nível 2+). Isso resolve o caso do `tecnologia@advisorhouse.com.br`, organiza a hierarquia da rede e dá base para o botão "convidar parceiro" no portal do parceiro.
