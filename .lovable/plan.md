## Objetivo

Substituir o placeholder `(chave completa)` por chaves DKIM reais geradas pela API do Resend para cada tenant durante o onboarding, e exibir os registros DNS corretos na tela de Configuração de DNS.

## Como funciona hoje

- A tela "Configuração de DNS" mostra um texto fixo `v=DKIM1; k=rsa; p=MIGfMA0G... (chave completa)` — não é uma chave real, apenas um exemplo visual.
- Não existe nenhuma chamada à API do Resend para registrar o subdomínio do tenant.
- O tenant é criado pela edge function `tenant-onboarding`, que retorna apenas o registro A genérico.

## Solução proposta

### 1. Backend — Nova edge function `resend-domain-setup`

Função que recebe um `tenantId` e:
1. Lê o slug do tenant.
2. Chama `POST https://api.resend.com/domains` com `{ name: "<slug>.allvita.com.br", region: "sa-east-1" }` usando o secret `RESEND_API_KEY` (já existe no projeto).
3. Recebe da Resend a lista completa de registros DNS necessários (SPF, DKIM com chave RSA real, DMARC, MX opcional).
4. Salva esses registros em uma nova coluna `dns_records` (JSONB) na tabela `tenants` para reuso.
5. Retorna os registros para o frontend.

Endpoints adicionais:
- `GET /resend-domain-setup?tenantId=...` → retorna registros já salvos (evita recriar).
- `POST /resend-domain-setup/verify` → chama `POST /domains/:id/verify` na Resend para acionar verificação.

### 2. Banco de dados — Migration

Adicionar à tabela `tenants`:
- `resend_domain_id` (text) — ID do domínio na Resend.
- `dns_records` (jsonb) — array com os registros retornados.
- `email_dns_status` (text) — `pending` | `verified` | `failed`.

### 3. Frontend — `CreateTenantDialog.tsx`

Na transição para o passo "DNS":
- Após criar o tenant, invocar `resend-domain-setup` automaticamente.
- Armazenar `dnsRecords` em estado e renderizar dinamicamente cada linha (Tipo, Nome, Valor) com botão de copiar funcional para o valor REAL.
- Manter o registro A do subdomínio (`185.158.133.1`) como linha fixa de "Apontamento da aplicação".
- Substituir os blocos hardcoded de SPF/DKIM pelo `dnsRecords.map(...)`.
- Layout em coluna única dentro de cards (não mais grid de 3 colunas apertado), garantindo que valores longos como a chave DKIM apareçam por completo com `break-all` e `whitespace-pre-wrap`.

### 4. Tratamento de erro

Se a chamada à Resend falhar (ex.: domínio já cadastrado, rate limit), exibir banner amarelo informando que apenas o registro A deve ser configurado por enquanto e mostrar o erro técnico para o admin.

## Considerações

- O secret `RESEND_API_KEY` já está configurado.
- A API da Resend aceita até 100 domínios por conta — verificar limite ao escalar.
- DNS Delegation do Lovable Emails NÃO se aplica aqui: estamos usando Resend diretamente, sem o sistema interno de Lovable Emails.
- Os registros DKIM da Resend usam o nome `resend._domainkey.<slug>` (não `allvita._domainkey`).