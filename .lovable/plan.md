
# Plano: documento PDF "Multi-tenant por subdomínio na All Vita — alternativas e caminho recomendado"

## O que vou entregar

Um arquivo PDF salvo em `/mnt/documents/allvita-multitenant-subdominio.pdf`, em português, escrito para você (não-técnico), com diagramas em ASCII, matriz comparativa e uma recomendação clara. Nada no código será alterado nesta etapa — só a geração do documento.

## Por que um documento (e não código agora)

Você pediu para **mapear as possibilidades** antes de decidir. O código atual já tem dois modos coexistindo (subdomínio real + path-based como fallback no `app.allvita.com.br`), então qualquer mudança de infra muda só DNS/proxy + algumas linhas em `tenant-routing.ts` e nos templates de e-mail. A decisão de infra é a parte cara — é ela que precisa virar documento primeiro.

## Estrutura do PDF (≈ 10–12 páginas)

### 1. Resumo executivo (1 pág.)
- O problema em 3 linhas: Lovable redireciona qualquer domínio secundário para o "primary domain" do projeto. Por isso `lumyss.allvita.com.br` cai em `app.allvita.com.br/auth/login`.
- A causa não é o seu DNS nem o seu código — é uma regra da hospedagem da Lovable confirmada na documentação oficial: "Lovable does not currently support wildcard subdomains or different content per subdomain".
- Recomendação antecipada (com 1 linha de justificativa).

### 2. Diagnóstico técnico do que está acontecendo hoje (2 pág.)
- Fluxo atual ilustrado:
  ```text
  Browser → lumyss.allvita.com.br
         → DNS A 185.158.133.1 (Lovable edge)
         → Edge identifica domínio secundário do projeto
         → 301 para https://app.allvita.com.br/auth/login   ← aqui mora o bug percebido
  ```
- Por que mover o "primary domain" no painel da Lovable não resolve: o redirect é sempre para o primary, então só inverte o problema (`app` passaria a redirecionar para `lumyss`).
- O que o código já suporta hoje (path-based + subdomain), trecho relevante de `useSubdomainTenant.ts` e `tenant-routing.ts`.

### 3. As 4 alternativas viáveis (4–5 pág., 1 página por alternativa)

Cada alternativa traz: diagrama, o que muda no DNS, o que muda no código, custo mensal estimado, esforço de implementação, prós e contras, riscos.

**Alternativa A — Manter path-based (`app.allvita.com.br/lumyss/core`)**
- Sem infra nova. Sem Cloudflare. Sem custo.
- Trabalho: remover `lumyss.allvita.com.br` do painel, ajustar `buildTenantUrl` para sempre retornar path, atualizar templates de e-mail (`invite-staff`, `tenant-onboarding`).
- Contras: marca menos "white-label" (URL mostra `app.allvita.com.br`), cookies compartilhados entre tenants (precisa ter cuidado com isolamento client-side).

**Alternativa B — Cloudflare Worker como reverse proxy (subdomínio "verdadeiro")**
- Mover NS de `allvita.com.br` do Registro.br para Cloudflare (gratuito).
- Wildcard `*.allvita.com.br` CNAME → Lovable + Worker que reescreve `Host` header e domínio dos cookies.
- URL final: `https://lumyss.allvita.com.br/core` permanece na barra.
- Custo: Cloudflare Free + Workers Free (100k req/dia grátis). Acima disso, US$ 5/mês.
- Contras: dependência adicional, exige um pouco de manutenção do script do Worker, precisa adicionar `*.allvita.com.br` nas Redirect URLs do Supabase Auth.

**Alternativa C — Cadastrar cada subdomínio manualmente no painel Lovable (status atual)**
- Modelo "1 domínio = 1 entrada manual" no painel + 1 registro DNS por tenant.
- Por que NÃO funciona como você quer: a Lovable trata tudo como "domínio secundário do mesmo projeto" e força o redirect ao primary. Mesmo cadastrando 100 subdomínios, todos cairiam em `app.allvita.com.br`.
- Útil só se cada tenant virar um **projeto Lovable separado** (inviável para SaaS multi-tenant com base de dados única).

**Alternativa D — Sair da hospedagem da Lovable (Vercel/Netlify/Cloudflare Pages) mantendo o código**
- Build do mesmo repo em outra hospedagem que suporta wildcard nativo.
- Custo: Vercel Hobby grátis até certo tráfego, ou ~US$ 20/mês no Pro; Cloudflare Pages grátis.
- Contras: perde o preview integrado da Lovable, deploy passa a ser via GitHub→Vercel, exige configurar SSL wildcard (automático no Cloudflare/Vercel).

### 4. Matriz comparativa (1 pág., tabela)

| Critério | A. Path-based | B. Cloudflare Worker | C. Painel Lovable | D. Outra hospedagem |
|---|---|---|---|---|
| URL white-label real | ❌ | ✅ | ❌ | ✅ |
| Custo mensal | R$ 0 | R$ 0 a ~R$ 30 | R$ 0 | R$ 0 a ~R$ 110 |
| Esforço inicial | Baixo (2 h) | Médio (1 dia) | — (já tentado, não resolve) | Alto (2–3 dias) |
| Manutenção contínua | Nenhuma | Baixa (Worker estável) | Alta (1 entrada manual por tenant) | Baixa |
| Isolamento de cookies | Compartilhado | Por subdomínio | — | Por subdomínio |
| Dependências externas | Nenhuma | Cloudflare | Lovable | Vercel/Netlify/CF |
| Reversibilidade | Total | Total (basta apontar DNS de volta) | — | Média |

### 5. Recomendação (1 pág.)

**Caminho sugerido: B (Cloudflare Worker)**, com A como plano B imediato.

Justificativa em bullets:
- Mantém o produto na Lovable (você não perde o fluxo de edição que já usa).
- Resolve o problema de marca (`lumyss.allvita.com.br` continua na barra).
- Custo praticamente zero no início.
- 100% reversível: se um dia sair da Lovable, é só repontar DNS.

Plano B (A) entra se você quiser ir ao ar essa semana sem mexer em DNS: muda 3 arquivos e pronto, com a contrapartida estética do path.

### 6. Próximos passos concretos (1 pág.)

Passo a passo prático para o caminho B:
1. Criar conta Cloudflare (grátis) e adicionar zona `allvita.com.br`.
2. Trocar nameservers no Registro.br para os da Cloudflare (propaga em até 24 h).
3. Recriar registros existentes (A para `app`, MX, SPF, DKIM se houver).
4. Adicionar CNAME `*` → `app.allvita.com.br` (proxied, nuvenzinha laranja).
5. Publicar Worker com script de proxy (snippet incluso no anexo).
6. Adicionar `https://*.allvita.com.br` em **Supabase → Authentication → URL Configuration → Redirect URLs**.
7. Testar `lumyss.allvita.com.br/core` → deve carregar sem 301 para `app`.
8. Em build mode, eu ajusto `buildTenantUrl` (já está pronto pra subdomínio em prod) e os templates de e-mail.

### 7. Anexo técnico (1–2 pág.)
- Script completo do Cloudflare Worker (≈ 40 linhas) com comentários linha a linha.
- Lista de arquivos da plataforma que mudam quando a decisão for tomada (`src/lib/tenant-routing.ts`, `supabase/functions/invite-staff`, `supabase/functions/tenant-onboarding`).
- Checklist de QA pós-deploy (login, cookies, e-mail de convite, link de quiz público).

## Como vou gerar o PDF

- ReportLab (Platypus) com tipografia limpa, paleta da All Vita (preto `#1A1A1A` + verde `#6B8E23`) só nos títulos de seção, corpo em cinza-escuro.
- Tabelas com `WidthType` fixo, sem emojis no PDF (vou usar "Sim/Não/Parcial" no lugar dos ✅/❌ pra evitar caixas pretas em fontes sem suporte).
- Diagramas em monoespaçado (Courier) dentro de blocos cinza claro.
- QA: converto cada página em JPG e inspeciono antes de te entregar.

## O que NÃO faço neste plano

- Não troco nada em produção.
- Não mexo em DNS no Registro.br.
- Não publico nada no Cloudflare.
- Não removo `lumyss.allvita.com.br` do painel Lovable.

Tudo isso fica para a próxima etapa, depois que você ler o PDF e me disser qual caminho seguir.
