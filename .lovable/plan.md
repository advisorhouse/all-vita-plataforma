# Integração Pagar.me v5 — Marketplace + Checkout Transparente

## Visão geral

A All Vita opera como **conta master/marketplace** no Pagar.me. Cada tenant é cadastrado como **Recipient** (`rp_...`) dentro dessa conta master, com seus próprios dados bancários e CNPJ. Toda venda passa pela API da master, com **split automático** entre o recipient do tenant e o recipient da All Vita (fee).

Como o marketplace ainda não está habilitado, o desenvolvimento será 100% em **Sandbox**. O modelo de split fica codificado e pronto; quando você liberar o marketplace em produção, basta trocar as chaves.

```text
Cliente paga R$100
   ↓ POST /orders (Secret Key da All Vita)
[Pagar.me]
   ├─ split → Recipient Tenant (ex: 90%)  → R$90
   └─ split → Recipient All Vita (10% fee) → R$10
        ↓ webhook
[Edge Function payment-webhook] → atualiza orders + dispara comissões
```

## 1. Schema do banco

**Migrations necessárias:**

- **`tenants.settings.pagarme`** — passa a guardar apenas configurações não sensíveis (env, eventos de webhook). Chaves API saem daqui.
- **`payment_integrations`** já existe. Vamos usá-la:
  - `provider = 'pagarme'`
  - `api_key_encrypted` → Secret Key da All Vita (única, salva pelo super admin)
  - `webhook_secret` → segredo HMAC do Pagar.me
  - `recipient_id` → `rp_...` do tenant (um registro por tenant)
  - `metadata` → `{ env, public_key, fee_percentage, bank_account, document }`
- **Nova tabela `tenant_pagarme_recipients`** (para a All Vita master ter UM registro especial com `tenant_id IS NULL`):
  - já cabe em `payment_integrations` com `tenant_id = NULL` representando a master
- **`orders`** já tem `all_vita_fee` e `tenant_amount`. Vamos popular esses campos no momento da criação.
- **Nova tabela `payment_transactions`** para logar todas chamadas/respostas do Pagar.me (charges, status, refunds), facilitando auditoria e reconciliação.

```sql
CREATE TABLE payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  order_id uuid,
  pagarme_order_id text,
  pagarme_charge_id text,
  status text NOT NULL,
  amount numeric NOT NULL,
  payment_method text,           -- credit_card | pix | boleto
  installments int,
  raw_request jsonb,
  raw_response jsonb,
  created_at timestamptz DEFAULT now()
);
-- RLS: super admin ALL; tenant admins SELECT por tenant_id
```

## 2. Secrets

Adicionar via `add_secret` (não vão ao banco):
- `PAGARME_SECRET_KEY` (sk_test_... em Sandbox)
- `PAGARME_WEBHOOK_SECRET`

A **Public Key** é pública e pode viver em `payment_integrations.metadata.public_key` para o frontend tokenizar cartão.

## 3. Edge Functions (todas com `verify_jwt = false`, validação interna)

### a) `pagarme-create-recipient` (POST, autenticado)
Chamado pela tela "Configurações > Pagamentos" do tenant. Recebe CNPJ, banco, agência, conta, titular. Faz `POST /recipients` na API do Pagar.me e salva `recipient_id` em `payment_integrations` para o `tenant_id` do chamador.

### b) `pagarme-create-order` (POST, autenticado)
Recebe `{ order_id, payment_method, card_token?, installments?, customer, billing_address }`.
1. Lê `orders.amount` e `tenant_id`.
2. Busca `recipient_id` do tenant + `fee_percentage` (de `payment_integrations.metadata`).
3. Calcula split: `tenant_amount = total * (1 - fee%)`, `all_vita_fee = total * fee%`.
4. Monta payload Pagar.me com `splits: [{recipient_id: tenant_rp, amount: tenant_amount}, {recipient_id: master_rp, amount: fee, charge_processing_fee: true}]`.
5. `POST /orders` no Pagar.me com `payments: [{ payment_method, credit_card|pix|boleto: {...} }]`.
6. Atualiza `orders` com `external_id`, `all_vita_fee`, `tenant_amount`, `payment_status`.
7. Loga em `payment_transactions`.
8. Retorna ao frontend: status, qr_code (PIX), boleto_url, ou approved (cartão).

### c) `payment-webhook` (POST, público)
Substituir o atual. Recebe webhook do Pagar.me. Valida assinatura HMAC com `PAGARME_WEBHOOK_SECRET`. Mapeia eventos:
- `order.paid` / `charge.paid` → `payment_status='paid'`, dispara `process-commission`
- `order.payment_failed` / `charge.payment_failed` → `payment_status='failed'`
- `charge.refunded` → `payment_status='refunded'`
- `charge.chargeback_*` → marca `chargeback`

### d) `pagarme-tokenize-card` (não precisa) — tokenização vai direto do browser para o endpoint público do Pagar.me usando a Public Key.

## 4. Frontend

### a) `src/pages/core/CoreSettings.tsx` — aba "Pagamentos"
Remover campos de chave API. Substituir por:
- Status: "Conta Pagar.me da All Vita: conectada (Sandbox)" (read-only, vem do super admin).
- **Formulário de Recipient** (se ainda não criado): Razão social, CNPJ, banco, agência, conta, dígito, tipo, titular. Botão "Criar conta de recebimento" → chama `pagarme-create-recipient`.
- Após criado: mostra `recipient_id`, status (registration: pending/affiliated), dados bancários mascarados, botão "Editar".
- **Fee da All Vita** (apenas super admin enxerga editar; tenant vê read-only): % por tenant, salvo em `payment_integrations.metadata.fee_percentage`.
- URL do webhook (já existe).

### b) `src/pages/admin/...` — nova tela super admin
Listar todos `payment_integrations`, ver fee por tenant, status do recipient, log de transações.

### c) Componente `<PagarmeCheckout />`
Usado em telas onde o cliente compra produto. Fluxo:
1. Tabs: Cartão | PIX | Boleto.
2. **Cartão**: campos número, validade, CVV, nome. Ao submeter, chama `https://api.pagar.me/core/v5/tokens?appId=PUBLIC_KEY` direto do browser → recebe `card_token`. Em seguida chama `pagarme-create-order` com o token. Trata 3DS quando necessário.
3. **PIX**: chama `pagarme-create-order` direto, exibe QR code + copia-cola, faz polling de `orders.payment_status` (Realtime).
4. **Boleto**: chama `pagarme-create-order`, exibe link/linha digitável.

### d) Página de checkout
Nova rota `/core/checkout/:orderId` (ou modal a partir do produto) que carrega o pedido pendente e renderiza `<PagarmeCheckout />`.

## 5. Fluxo de comissões (já existente)
`process-commission` continua sendo disparado pelo webhook em `order.paid`. Ele já lê `orders.tenant_amount` para distribuir entre partners — então passa a refletir corretamente o valor líquido recebido pelo tenant.

## 6. Roadmap de entrega

```text
Etapa 1 — Backend & schema
  • Migration: payment_transactions + RLS
  • add_secret: PAGARME_SECRET_KEY, PAGARME_WEBHOOK_SECRET (Sandbox)
  • Edge Functions: pagarme-create-recipient, pagarme-create-order
  • Reescrita: payment-webhook (Pagar.me v5)

Etapa 2 — UI Tenant
  • CoreSettings → aba Pagamentos refatorada
  • Formulário cadastro de recipient
  • Configuração de fee% (read-only ao tenant)

Etapa 3 — UI Super Admin
  • Tela /admin/pagamentos: lista recipients + fees + transações

Etapa 4 — Checkout
  • <PagarmeCheckout /> (Cartão+PIX+Boleto)
  • Rota /core/checkout/:orderId
  • Realtime para confirmação PIX
```

## Observações importantes

1. **Sandbox primeiro**: tudo será testado com `sk_test_...`. Quando você confirmar marketplace em produção, basta trocar o secret e o env.
2. **KYC do recipient**: cada recipient passa por análise do Pagar.me (1–3 dias). Antes de afiliar, vendas até dão erro — vou sinalizar status na UI.
3. **Fee por tenant**: super admin define no momento de criar/editar a integração de cada tenant. Default sugerido: 10%.
4. **Boleto e PIX** entram no split igual ao cartão — não muda a lógica.
5. **Não armazenar dados de cartão** no nosso banco. Sempre tokenizar no Pagar.me.

Após sua aprovação, começo pela Etapa 1 (schema + edge functions). Vou pedir as chaves Sandbox no momento certo.
