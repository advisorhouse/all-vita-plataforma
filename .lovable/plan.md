## Problema
O modal de cadastro/edição de produto em `/core/products` exibe um card **"Automações Integradas"** com switches para Bling, eNotas e Melhor Envio. Esses toggles não persistem nada e duplicam responsabilidade — credenciais de API são configuração **da loja**, não de cada produto.

A página correta para isso já existe: **`/core/integrations`** (`CoreIntegrations.tsx`), que lista Bling ERP, eNotas e Melhor Envio entre os providers, mas hoje é uma tela genérica sem o fluxo dedicado de "Loja / E-commerce".

## Mudanças

### 1. `src/pages/core/CoreProducts.tsx` — modal de produto
- Remover o card **"Automações Integradas"** (linhas ~532-589) com os 3 switches.
- Substituir por um **bloco compacto somente-leitura** mostrando o status atual das 3 integrações da loja (lido de `integrations` ou `payment_integrations` filtrado pelo `tenant_id`):
  - Badge verde "Conectado" ou cinza "Desconectado" para Bling / eNotas / Melhor Envio.
  - Link "Configurar em Integrações da Loja →" que navega para `/core/integrations?tab=ecommerce`.
- Manter o card "Preços e Recompensas" como está.

### 2. `src/pages/core/CoreIntegrations.tsx` — destacar a seção de Loja
- Adicionar uma aba/seção dedicada **"Loja & E-commerce"** agrupando: Bling ERP, eNotas, Melhor Envio, Shopify, Pagar.me.
- Para cada provider, manter o fluxo já existente de cadastrar:
  - API Key / Token
  - Webhook secret (quando aplicável)
  - Ambiente (sandbox/produção)
  - Switch ativo/inativo
- Persistir em `integrations` (type = `bling` | `enotas` | `melhor_envio`) no padrão já em uso pelo `CoreFinance.tsx`.

### 3. Settings gerais do tenant (`CoreSettings.tsx`)
- **Não** duplicar campos de API aqui. Adicionar apenas um atalho: card "Integrações da Loja" com botão "Gerenciar →" apontando para `/core/integrations`.
- Settings gerais permanece com: dados cadastrais, branding, fuso horário, módulos ativos.

### 4. Backend
- Nenhuma mudança de schema. As tabelas `integrations`, `payment_integrations` e `product_integrations` já cobrem o caso.
- O hook de criação de produto em `CoreProducts` continua chamando o sync — mas o sync passa a ler as credenciais a partir da loja (já é o comportamento esperado, pois a edge function lê `integrations` por `tenant_id`).

## Resultado
- **Loja**: configura Bling / eNotas / Melhor Envio uma única vez em `/core/integrations`.
- **Produto**: foca em dados do SKU (nome, preço, estoque, fotos, variações) e mostra apenas o status agregado das integrações.
- Sem duplicação, sem switches "fantasma", e o operador sabe exatamente onde colar tokens.
