# Plano: Implementar subdomínios verdadeiros para tenants (`lumyss.allvita.com.br`)

## O problema, em uma frase

O Lovable hospeda o app em **um único domínio primário** (`app.allvita.com.br`). Qualquer outro domínio/subdomínio adicionado em **Settings → Domains** é tratado como **alias com redirect 301 → primário**. Não existe configuração para desligar esse redirect, e o Lovable **não suporta wildcard** (`*.allvita.com.br`). Ou seja: a limitação é de infraestrutura, não de código.

Portanto, para ter `lumyss.allvita.com.br` funcionando como portal isolado, precisamos de **uma camada externa** entre o usuário e o Lovable.

---

## As 4 opções analisadas

### Opção A — Path-based (já implementado hoje)
URLs ficam `app.allvita.com.br/lumyss/core`.

- **Prós:** zero infra extra, custo zero, já funciona, SSL automático.
- **Contras:** URL não é white-label de verdade (cliente vê "app.allvita"); cookies/localStorage compartilhados entre tenants.
- **Quando faz sentido:** se o objetivo é apenas isolamento lógico e branding visual.

### Opção B — Cloudflare Worker como reverse proxy (RECOMENDADO)
Wildcard `*.allvita.com.br` aponta pro Cloudflare. Um Worker recebe `lumyss.allvita.com.br`, busca o HTML/assets de `app.allvita.com.br/lumyss/...` no Lovable e devolve pro navegador **sem redirect**, mantendo a barra do navegador em `lumyss.allvita.com.br`.

- **Prós:**
  - URL real white-label (`lumyss.allvita.com.br/core`).
  - **Wildcard automático**: cada tenant novo funciona sem mexer em DNS nem no painel Lovable.
  - Cookies/sessão isolados por subdomínio (segurança real entre tenants).
  - SSL automático (Cloudflare Universal SSL no wildcard).
  - Custo: Cloudflare Workers free tier cobre 100k req/dia; depois ~US$5/mês para 10M req.
- **Contras:**
  - Requer Cloudflare gerenciando o DNS de `allvita.com.br` (mover nameservers do Registro.br pro Cloudflare — operação de 10 min, sem downtime se feito direito).
  - Precisamos escrever ~40 linhas de Worker.
  - Latência extra de ~20-50 ms (Cloudflare é edge, costuma compensar com cache).

### Opção C — Cloudflare "Proxy Mode" nativo do Lovable
Lovable tem opção "Domain uses Cloudflare or a similar proxy" (CNAME-based).

- **Prós:** suporte oficial.
- **Contras:** **continua sendo 1 domínio por vez**, ainda sujeito ao redirect-to-primary. Não resolve wildcard nem o redirect. **Não serve pro nosso caso.**

### Opção D — Self-hosting / sair do Lovable hosting
Buildar e hospedar em Vercel/Netlify/Cloudflare Pages, que suportam wildcards nativamente.

- **Prós:** controle total.
- **Contras:** perde o ciclo de preview do Lovable, exige CI/CD próprio, deploys manuais.

---

## Recomendação: **Opção B (Cloudflare Worker)**

É a única que entrega **subdomínio verdadeiro + wildcard + zero trabalho operacional por novo tenant**, mantendo o Lovable como hosting principal.

---

## Arquitetura proposta

```text
              ┌─────────────────────────────────┐
              │  Usuário: lumyss.allvita.com.br │
              └──────────────┬──────────────────┘
                             │ DNS wildcard *.allvita.com.br → Cloudflare
                             ▼
              ┌─────────────────────────────────┐
              │  Cloudflare Worker (proxy)      │
              │  - extrai "lumyss" do hostname  │
              │  - injeta header X-Tenant-Slug  │
              │  - busca app.allvita.com.br/... │
              │  - reescreve cookies p/ subdom. │
              └──────────────┬──────────────────┘
                             │ origin fetch
                             ▼
              ┌─────────────────────────────────┐
              │  Lovable hosting                │
              │  app.allvita.com.br (primário)  │
              └─────────────────────────────────┘
```

O React detecta o tenant via `window.location.hostname` (código já existe em `useSubdomainTenant.ts`, branch "subdomain") — **nada precisa mudar no app**.

---

## Etapas de implementação

### Fase 1 — Infra Cloudflare (manual, fora do código)
1. Criar conta Cloudflare gratuita.
2. Adicionar zona `allvita.com.br`.
3. No Registro.br, trocar nameservers pelos da Cloudflare (sem downtime: TTL antigo ainda responde).
4. No Cloudflare DNS, recriar registros existentes:
   - `app.allvita.com.br` → A `185.158.133.1` (DNS only, **sem proxy**, p/ Lovable continuar emitindo SSL).
   - MX/SPF/DKIM de e-mail (se houver).
5. Adicionar wildcard: `*` → A `192.0.2.1` (IP placeholder) **com proxy laranja ON**. O IP é irrelevante pq o Worker intercepta.

### Fase 2 — Cloudflare Worker
1. Criar Worker `allvita-tenant-proxy`.
2. Lógica (~40 linhas JS):
   - Extrair slug do hostname (`lumyss.allvita.com.br` → `lumyss`).
   - Reescrever URL para `https://app.allvita.com.br/${slug}${pathname}`.
   - `fetch()` no origin com header `Host: app.allvita.com.br`.
   - Reescrever `Set-Cookie` trocando `Domain=app.allvita.com.br` por `Domain=lumyss.allvita.com.br`.
   - Devolver response intacta (HTML/JS/CSS — Lovable já serve SPA fallback).
3. Route binding: `*.allvita.com.br/*` → Worker (excluindo `app.` e `www.`).

### Fase 3 — Ajustes no código do app
1. **`src/lib/tenant-routing.ts`**: atualizar `buildTenantUrl()` para gerar `https://${slug}.allvita.com.br${path}` quando estamos em produção (em vez de `/${slug}/${path}`). Manter fallback path-based para preview lovable.app e localhost.
2. **`src/hooks/useSubdomainTenant.ts`**: já detecta subdomain corretamente. Apenas confirmar prioridade subdomain > path.
3. **E-mails de onboarding/convite**: revisar templates de edge functions (`tenant-signup`, `send-invite`, etc.) para usar `buildTenantUrl()` atualizado.
4. **Supabase Auth → URL Configuration**: adicionar `https://*.allvita.com.br/**` em "Redirect URLs" para que magic links e OAuth funcionem em qualquer subdomínio.
5. **CORS de edge functions**: revisar se há whitelist de origin; trocar para regex `^https://[a-z0-9-]+\.allvita\.com\.br$`.

### Fase 4 — Onboarding de tenant simplificado
Hoje o fluxo de criar tenant exige passo manual no painel Lovable + DNS no Registro.br. Com wildcard, **isso desaparece**: criar o tenant no banco já libera `<slug>.allvita.com.br` automaticamente. Atualizar UI de criação de tenant removendo o passo "configurar DNS".

---

## Detalhes técnicos (para referência)

**Worker — esqueleto:**
```js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const sub = url.hostname.split('.')[0];
    if (['app', 'www'].includes(sub)) return fetch(request);

    const target = new URL(url.pathname + url.search, 'https://app.allvita.com.br');
    target.pathname = `/${sub}${url.pathname}`;

    const proxied = new Request(target, request);
    proxied.headers.set('Host', 'app.allvita.com.br');
    proxied.headers.set('X-Tenant-Slug', sub);

    const res = await fetch(proxied);
    const newRes = new Response(res.body, res);
    // Rewrite Set-Cookie domain
    const cookies = res.headers.getSetCookie?.() ?? [];
    newRes.headers.delete('Set-Cookie');
    cookies.forEach(c => newRes.headers.append('Set-Cookie',
      c.replace(/Domain=[^;]+/i, `Domain=${url.hostname}`)));
    return newRes;
  }
}
```

**Pontos de atenção:**
- SSL: Cloudflare Universal SSL cobre wildcard de 1 nível (`*.allvita.com.br`) automaticamente. Não cobre `*.*.allvita.com.br`.
- Lovable continuará emitindo cert para `app.allvita.com.br` (registro DNS-only, sem proxy CF).
- Não use proxy do Cloudflare em `app.allvita.com.br` — isso quebraria a emissão de SSL pelo Lovable.
- Reescrita de cookies é essencial pra sessão Supabase funcionar isolada por subdomínio.

---

## Custo & risco

- **Cloudflare:** Free plan + Workers Free (100k req/dia). Para o estágio atual: **R$ 0/mês**.
- **Risco operacional:** trocar nameservers no Registro.br tem janela de propagação de até 24h. Mitigação: copiar TODOS os registros DNS atuais antes de trocar, e manter ambos os NS válidos durante a transição.
- **Reversibilidade:** total. Voltar pro path-based é só apontar DNS de volta pro Lovable.

---

## O que preciso de você antes de começar a implementação

1. Confirmar que pode (e quer) mover os nameservers de `allvita.com.br` do Registro.br pro Cloudflare.
2. Confirmar que a Opção B é o caminho (vs. ficar no path-based atual da Opção A, que não custa nada).

Após aprovação, eu executo as **Fases 3 e 4** (código). As **Fases 1 e 2** (Cloudflare) eu te entrego um passo-a-passo + código pronto do Worker para você colar — não tenho acesso à conta Cloudflare nem ao Registro.br.
