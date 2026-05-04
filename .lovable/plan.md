
# Fluxo Pagar.me — Marketplace All Vita

## Conceito (resumo das decisões)

- **Tenant** = vira Recipient no Pagar.me (recebe o dinheiro da venda).
- **All Vita** = Recipient master (recebe a fee de plataforma).
- **Partner** = NÃO vira Recipient. Apenas divulga o link e ganha comissão paga **manualmente via PIX** pelo tenant (saldo aparece no painel do partner e do tenant).
- **Produto** = cadastrado no banco local + espelhado no Pagar.me (`/products`) para gerar checkout transparente vinculado.
- **Cliente final** = compra pelo `/club` (ou direto pelo link do partner) via checkout transparente.

## Fluxo end-to-end

```text
Admin cria Tenant (modal: dados + branding + dados bancários/CNPJ)
   ↓ tenant-signup chama pagarme-create-recipient
Pagar.me processa KYC (1-3 dias)
   ↓ webhook recipient.status_changed
Notificação in-app + email para Admin e para o Tenant ("Pagamentos liberados")
   ↓
Tenant cadastra produto em /core/products (modal com campos Pagar.me)
   ↓ pagarme-sync-product cria/atualiza no Pagar.me
Produto fica disponível com link público de checkout transparente
   ↓
Tenant cadastra Partner (apenas dados pessoais + chave PIX, SEM KYC)
   ↓ partner recebe seu referral_code e link /q/CODIGO
Partner divulga link → cliente final faz quiz → vê produto recomendado
   ↓ botão "Comprar" leva para /core/checkout/:productId?ref=CODIGO
Checkout transparente: cartão (tokenizado) | PIX | Boleto
   ↓ pagarme-create-order com split: tenant 90% + All Vita 10%
Pagar.me processa → webhook order.paid
   ↓ payment-webhook
1. Atualiza orders.payment_status = paid
2. process-commission credita comissão do partner em commissions (status=pending)
3. Atualiza saldo do partner (somatório de commissions pending)
   ↓
Tenant entra em /core/commissions, vê lista de comissões pendentes por partner
   ↓ clica "Marcar como pago" após pagar PIX manualmente fora da plataforma
commissions.paid_status = paid + audit log
```

## 1. Banco de dados (migrations)

**products** — adicionar colunas Pagar.me:
- `pagarme_product_id text`
- `pagarme_sync_status text default 'pending'` (pending | synced | error)
- `pagarme_last_sync_at timestamptz`
- `pagarme_sync_error text`
- `checkout_url text` (link público gerado)

**partners** — adicionar dados bancários (apenas para PIX manual):
- `pix_key text`, `pix_key_type text` (cpf|cnpj|email|phone|random)
- `bank_holder_name text`, `bank_holder_document text`

**tenants** — adicionar dados para Recipient:
- `legal_name text`, `legal_document text` (CNPJ), `legal_document_type text`
- `bank_code text`, `bank_agency text`, `bank_account text`, `bank_account_type text`, `bank_holder_name text`
- `pagarme_recipient_status text` (pending|registration|affiliation|active|refused)
- `pagarme_recipient_created_at timestamptz`

**commissions** já existe — apenas garantir que tenha `paid_status`, `paid_at`, `payment_method`, `payment_proof_url`.

**Nova tabela `pagarme_webhook_events`** (já existe `payment_transactions`; reaproveitar adicionando coluna `event_type` se faltar para registrar `recipient.*`, `order.*`, `charge.*`).

## 2. Edge Functions

**Novas:**
- `pagarme-create-recipient` (chamada pelo `tenant-signup` após criar tenant). Lê dados bancários do tenant, cria Recipient, salva `recipient_id` em `payment_integrations` + atualiza `tenants.pagarme_recipient_status`.
- `pagarme-sync-product` (chamada ao salvar produto). Cria/atualiza no `/products` do Pagar.me e devolve URL de checkout. Salva em `products.pagarme_product_id` + `checkout_url`.

**Reescrever:**
- `pagarme-webhook` — adicionar handlers para `recipient.status_changed` (dispara notificação + email). Manter handlers de `order.paid`, `order.payment_failed`, `charge.refunded`, `order.canceled`.
- `payment-webhook` ou `process-commission` — após `order.paid`, criar registros em `commissions` (status=pending) com base em `commission_rules` do tenant + cadeia de upline do partner.

**Manter:**
- `pagarme-api` — gateway genérico já existente.

## 3. Frontend

**a) `src/components/admin/tenants/CreateTenantDialog`** (modal de criação)
Adicionar **Step "Dados Bancários e Fiscais"** antes do submit:
- CNPJ, Razão Social, Banco (select), Agência, Conta, Tipo (corrente/poupança), Titular.
- Aviso: "O Pagar.me leva 1-3 dias úteis para aprovar a conta. Você será notificado."
Após criar tenant, chama `pagarme-create-recipient`.

**b) `src/pages/admin/AdminTenantDetail`**
Bloco "Status Pagar.me" mostrando: Recipient ID, status (badge: pendente/aprovado/recusado), botão "Reenviar dados" se recusado.

**c) `src/pages/core/CoreProducts`** — modal "Gerenciar Produto"
Adicionar campos Pagar.me obrigatórios para checkout:
- Tipo de cobrança (única / assinatura → frequência)
- Quantidade de parcelas máximas
- Frete (se físico): peso, dimensões
- Imagens (já existe via `product_images`)
- Categoria fiscal (NCM, CFOP) — opcional inicial
Ao salvar, chamar `pagarme-sync-product`. Mostrar badge: Sincronizado/Pendente/Erro + botão "Copiar link de checkout".

**d) `src/pages/core/CorePartners`** — modal de cadastro de partner
Manter simples — adicionar **só** seção "Dados para recebimento de comissão (PIX)":
- Tipo de chave PIX + chave + titular + CPF/CNPJ do titular.
- Aviso: "Você receberá suas comissões via PIX manual do tenant após aprovação."

**e) Novo `src/pages/core/CoreCommissions`** (já existe — refatorar)
Tabela de comissões agrupadas por partner:
- Colunas: Partner | Total a pagar | Nº comissões | PIX | Última venda | Ações
- Botão "Marcar como pago" (abre modal: confirma valor, anexa comprovante opcional, chave PIX exibida).
- Filtros: pendente / pago / período.

**f) Novo `src/pages/partner/PartnerRevenue`** (já existe — atualizar)
Mostrar saldo a receber, histórico de pagamentos recebidos, chave PIX cadastrada (com botão editar).

**g) Novo `src/pages/core/CoreCheckout` (`/core/checkout/:productId`)**
Componente `<PagarmeCheckout />`:
- Tabs: Cartão | PIX | Boleto
- Cartão: tokeniza no browser via Public Key → chama `pagarme-api` (action `create_order`)
- PIX: gera QR code + polling Realtime em `orders.payment_status`
- Boleto: link/linha digitável
- Persiste `?ref=CODIGO` para atribuição ao partner

**h) `src/components/quiz/QuizStepCheckout`**
Substituir botão "Finalizar e Assinar" por redirect para `/core/checkout/:productId?ref=CODIGO_PARTNER` com produto recomendado pré-carregado e foto.

## 4. Notificações & emails

- `recipient.status_changed → active`: notificação in-app + email "Pagamentos liberados" para Admin do tenant + super admin.
- `recipient.status_changed → refused`: notificação + email "Ajuste necessário" com motivo.
- `order.paid`: notificação para tenant ("Nova venda R$X via Partner Y").
- Comissão registrada: notificação para partner ("Você ganhou R$X — saldo a receber: R$Y").
- Comissão paga: notificação para partner ("Tenant pagou R$X via PIX").

## 5. Detalhes técnicos

- **Tokenização cartão**: feita no browser direto ao endpoint `https://api.pagar.me/core/v5/tokens?appId=PUBLIC_KEY`. Public Key fica em `payment_integrations.metadata.public_key` (master).
- **Split**: já implementado no `pagarme-api`. Mantém percentual da fee All Vita por tenant (custom ou plano).
- **Idempotência webhook**: usar `payment_transactions.pagarme_charge_id` como chave única.
- **RLS commissions**: partner vê só as próprias; tenant admin vê todas do tenant; manter já existente.
- **Comissão multi-nível**: `process-commission` lê `partners.parent_partner_id` recursivamente e aplica `commission_rules` por nível.

## 6. Roadmap de entrega

```text
Etapa 1 — Schema + Recipients
  • Migration tenants/partners/products
  • Edge: pagarme-create-recipient
  • Atualizar tenant-signup para disparar
  • Modal Admin: step dados bancários
  • Webhook recipient.status_changed + notificações

Etapa 2 — Produtos no Pagar.me
  • Edge: pagarme-sync-product
  • Modal CoreProducts com campos Pagar.me
  • Badge sync + link checkout

Etapa 3 — Checkout transparente
  • CoreCheckout + PagarmeCheckout component
  • QuizStepCheckout redirect com ref
  • Realtime PIX

Etapa 4 — Comissões PIX manual
  • Modal partner: chave PIX
  • CoreCommissions: agrupado por partner + Marcar como pago
  • PartnerRevenue: saldo + histórico
  • Notificações
```

## Pendências que vou pedir no momento certo

- Confirmar se `PAGARME_SECRET_KEY` atual é Sandbox ou Live (se Live, recomendo trocar por Sandbox até validar).
- Public Key do Pagar.me da conta master (necessária para tokenização no browser).

Após aprovar, começo pela Etapa 1.
