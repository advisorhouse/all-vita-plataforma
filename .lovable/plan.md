# Análise: Arquitetura de Pagamento + Integração (All Vita)

## Resumo executivo

O prompt descreve uma arquitetura onde a All Vita é **orquestradora** (não processadora) de pagamentos, com Pagar.me cuidando do split financeiro e Shopify cuidando da logística. **Boa notícia: cerca de 60% disso já está implementado** na sua plataforma. O que falta é principalmente: **subcontas/split**, **integração Shopify de saída** (hoje só recebemos webhook de entrada), e **rastreabilidade financeira granular** (tabelas `payment_transactions` e `payment_splits`).

---

## 1. O que JÁ ESTÁ FEITO (alinhado ao prompt)

### Arquitetura conceitual
- All Vita já é orquestradora (não processa cartão) — confirmado em `mem://integration/ecommerce-and-payments`
- Separação de responsabilidades já existe: edge functions atuam como API Gateway
- Pagar.me já é o gateway escolhido (memória `pagarme-webhook` + tabela `payment_integrations`)

### Tabelas existentes
| Prompt pede | Já existe? | Tabela atual |
|---|---|---|
| `orders` | ✅ Sim | `orders` (id, tenant_id, client_id, product_id, amount, status, payment_status, external_id, subscription_cycle) |
| `order_items` | ❌ Não | — (orders tem só `product_id` único) |
| `payment_transactions` | ⚠️ Parcial | Dados ficam dentro de `orders.metadata.pagarme_data` |
| `payment_splits` | ❌ Não | — |
| `tenant_gateway_accounts` | ❌ Não | `payment_integrations` guarda só credencial, não subconta |
| Comissões | ✅ Sim | `commissions`, `mt_commissions`, `commission_rules` |
| Vitacoins | ✅ Sim | `vitacoins_wallet`, `vitacoin_transactions`, `commission_to_coin_rules` |

### Edge functions existentes
- `pagarme-api` — cria orders/customers via API Pagar.me
- `pagarme-webhook` — recebe `order.paid`, `order.payment_failed`, `subscription.*`
- `webhook-receiver` — receptor genérico (Stripe-like)
- `process-commission` — calcula comissão pós-pagamento (lê afiliado, nível, ciclo)
- `commission-engine-v2` + `commission-simulator`
- `gamification-engine` — Vitacoins
- `process-attribution` — vincula cliente↔parceiro

### Fluxo já funcional
```text
Pagar.me webhook → pagarme-webhook → atualiza orders.payment_status='paid'
                                  → chama process-commission
                                  → calcula comissão por nível
                                  → (gamification-engine gera Vitacoins)
```

---

## 2. O que FALTA (gaps reais)

### Gap A — Subcontas e Split (CRÍTICO)
Hoje a plataforma assume **uma conta Pagar.me global ou uma por tenant** (toggle em `GatewaysPanel`), mas **não há split**: o dinheiro cai inteiro numa conta e a comissão é só registro contábil interno. O prompt pede que o split aconteça **no próprio Pagar.me**, ou seja:
- Cada tenant precisa ter `recipient_id` (subconta) no Pagar.me
- Cada transação precisa enviar array `split` com: tenant + All Vita (fee SaaS) + parceiro (se houver comissão paga via gateway)

### Gap B — Tabelas de rastreabilidade financeira
- `payment_transactions` — hoje só temos `orders` com metadata. Para auditoria fiscal e relatórios financeiros precisos, transação ≠ pedido (1 pedido pode ter N tentativas, refunds, chargebacks).
- `payment_splits` — registro de quanto cada recebedor pegou em cada transação.
- `tenant_gateway_accounts` — mapping tenant ↔ recipient_id Pagar.me, status KYC, dados bancários.

### Gap C — Integração Shopify de SAÍDA
Hoje a plataforma **recebe webhook do Shopify** (memória menciona ingestão read-only), mas o prompt pede o inverso: **All Vita cria pedido no Shopify** após pagamento aprovado. Não existe `/integrations/shopify` para criar order via Admin API.

### Gap D — Order items
`orders` atual tem `product_id` único (modelo de assinatura). Para e-commerce real (carrinho com múltiplos itens) precisa de `order_items`.

### Gap E — Validação de assinatura de webhook
`pagarme-webhook/index.ts` **não valida assinatura HMAC** do Pagar.me. Hoje qualquer um pode chamar o endpoint e marcar order como paga. Risco crítico.

### Gap F — Criptografia de credenciais
`payment_integrations.api_key_encrypted` — o nome diz "encrypted" mas o código de `pagarme-api` lê `config.api_key_encrypted` e usa direto como Bearer. Não está criptografado de fato.

### Gap G — Onboarding de subconta (KYC)
Não existe fluxo no portal `/core` para o tenant submeter dados bancários + documentos para criar a subconta no Pagar.me.

---

## 3. O que o prompt MELHORA vs hoje

| Aspecto | Hoje | Com a proposta |
|---|---|---|
| Split financeiro | Manual/contábil | Automático no gateway (dinheiro vai direto pro tenant) |
| Risco de inadimplência da All Vita | Alto (ela recebe tudo e repassa) | Zero (cada um recebe sua parte) |
| Compliance fiscal | All Vita aparece como recebedora de tudo | Cada tenant emite NF do que recebe |
| Auditoria | `orders.metadata` JSON | Tabelas estruturadas |
| Logística | Cada tenant cuida manual | Centralizada via Shopify |
| Multi-gateway futuro | Acoplado | `tenant_gateway_accounts` permite Stripe/MP/Asaas |

## 4. O que o prompt PIORA / RISCOS

- **Complexidade operacional**: KYC de subconta Pagar.me leva dias e exige CNPJ ativo de cada tenant. Tenants pequenos podem não conseguir abrir subconta.
- **Dependência de Shopify**: o prompt diz "não depender de Shopify para pagamento" mas cria forte dependência para logística. Tenants sem produto físico (ex: serviços, assinatura digital) não precisam de Shopify — a arquitetura precisa tornar Shopify **opcional por tenant**.
- **Ciclo de assinatura**: o modelo atual de `subscription_cycle` em `orders` é mais simples e funciona bem para Vision Lift/recorrência. Migrar para `orders` + `order_items` precisa preservar esse caso.
- **Hardcode Vision Lift**: o prompt cita evitar isso, mas hoje boa parte da lógica de comissão (`commission-engine-v2`) já é genérica via `commission_rules` por tenant. Não é um problema real.

---

## 5. Roadmap sugerido (fases)

### Fase 1 — Segurança e fundação (1-2 dias)
1. Implementar validação HMAC no `pagarme-webhook` (header `X-Hub-Signature`)
2. Criptografar de fato `api_key_encrypted` (usar Supabase Vault ou pgcrypto)
3. Criar tabela `payment_transactions` (separada de `orders`) e migrar metadata existente
4. Criar tabela `payment_splits`

### Fase 2 — Subcontas Pagar.me (3-5 dias)
1. Criar tabela `tenant_gateway_accounts`
2. Edge function `pagarme-create-recipient` (cria subconta via API)
3. UI no `/core/settings/financeiro`: formulário KYC (CNPJ, dados bancários, sócios)
4. Edge function `pagarme-recipient-status` (polling KYC)
5. Notificação ao admin All Vita quando KYC aprovado/recusado

### Fase 3 — Split em transações (2-3 dias)
1. Atualizar `pagarme-api` para incluir `split` array em cada `create_order`
2. Lógica de split: tenant (X%) + All Vita fee SaaS (Y%) + parceiro (Z% se aplicável e configurado)
3. Configuração de fee All Vita por plano em `subscription_plans`
4. Dashboard de splits no `/admin/finance`

### Fase 4 — Shopify de saída (3-4 dias)
1. Tabela `tenant_shopify_config` (loja URL + admin token por tenant, opcional)
2. Edge function `shopify-create-order` (chamada após `payment.paid`)
3. Tabela `order_items` + migração
4. Sync de status (fulfilled, shipped) via webhook Shopify → `orders.fulfillment_status`
5. Tornar Shopify **opt-in** por tenant (flag em `tenants`)

### Fase 5 — Rastreabilidade e relatórios (2 dias)
1. View `financial_traceability`: transação → split → recebedor → comissão → vitacoins
2. Relatório de repasses por tenant
3. Reconciliação automática Pagar.me ↔ All Vita

---

## 6. Recomendação

**Aprovar Fase 1 imediatamente** (gaps de segurança são críticos — hoje qualquer pessoa pode forjar um webhook de pagamento aprovado). 

**Fases 2-3 (split)** são o coração do prompt e o maior diferencial — recomendo seguir.

**Fase 4 (Shopify)** só faz sentido se você confirmar que tenants vão vender produtos físicos. Para Vision Lift hoje (assinatura), **não é prioridade**.

**Decisões que preciso de você antes de codar:**
1. Todos os tenants vão obrigatoriamente abrir subconta Pagar.me, ou aceitamos modelo híbrido (subconta opcional + conta global da All Vita como fallback)?
2. Shopify é obrigatório para todos os tenants ou opt-in?
3. Fee SaaS da All Vita é fixo (%) por plano, ou configurável por tenant?
4. Comissão de parceiro vai pelo split do Pagar.me (parceiro recebe direto) ou continua como hoje (registro interno + repasse manual)?
