# Cloudflare Worker — Subdomínios White-Label All Vita

> Guia operacional para habilitar `<slug>.allvita.com.br` (ex: `lumyss.allvita.com.br`)
> mantendo o app hospedado na Lovable em `app.allvita.com.br`.

---

## 1. Visão geral da arquitetura

```
Browser  ──►  https://lumyss.allvita.com.br/club
                │
                ▼
        Cloudflare DNS (proxied ☁️)
                │
                ▼
        Cloudflare Worker (route: *.allvita.com.br/*)
                │  reescreve hostname → app.allvita.com.br
                │  reescreve path     → /lumyss/club
                │
                ▼
        Origem Lovable (185.158.133.1) responde
                │
                ▼
        Worker reescreve cookies (Domain=.allvita.com.br)
                │
                ▼
        Browser recebe HTML como se viesse de lumyss.allvita.com.br
```

**Princípio:** o browser sempre vê `lumyss.allvita.com.br`. A Lovable sempre vê
`app.allvita.com.br/lumyss/...`. O Worker é o tradutor invisível entre os dois.

---

## 2. Pré-requisitos

| Item | Status esperado |
|---|---|
| Domínio `allvita.com.br` registrado | ✅ Registro.br |
| Conta Cloudflare (Free serve) | ✅ criar se não tiver |
| Lovable conectado a `app.allvita.com.br` | ✅ já configurado |
| Código já suporta detecção de subdomínio | ✅ `useSubdomainTenant.ts` |
| Plano Cloudflare Workers | Free (100k req/dia) ou Paid ($5/mês, 10M req) |

---

## 3. Passo a passo de implementação

### Etapa 1 — Mover DNS para Cloudflare (15 min + propagação)

1. Criar conta em https://dash.cloudflare.com
2. **Add Site** → digitar `allvita.com.br` → escolher plano **Free**
3. Cloudflare vai escanear seus DNS atuais. Confira se aparecem:
   - `A @ → 185.158.133.1` (Lovable)
   - `A app → 185.158.133.1` (Lovable)
   - Registros de email (MX, SPF, DKIM) se houver
4. Cloudflare mostra **2 nameservers** (ex: `ada.ns.cloudflare.com`)
5. No **Registro.br** → painel do domínio → **Servidores DNS** → substituir os atuais pelos da Cloudflare
6. Aguardar propagação (15min a 4h). Status fica "Active" no painel Cloudflare

> ⚠️ **Não delete o A `app`** durante a migração — o `app.allvita.com.br` precisa continuar funcionando.

### Etapa 2 — Configurar SSL na Cloudflare

1. Painel Cloudflare → **SSL/TLS** → **Overview**
2. Modo: **Full (strict)** ← obrigatório, evita loop de redirect com Lovable
3. **SSL/TLS → Edge Certificates**:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Minimum TLS Version: 1.2

### Etapa 3 — Criar registro DNS wildcard

1. Painel Cloudflare → **DNS → Records** → **Add record**
2. Tipo: `A` | Nome: `*` | IPv4: `185.158.133.1` | Proxy: **🟠 Proxied** | TTL: Auto
3. Salvar. Agora `qualquercoisa.allvita.com.br` resolve para o IP da Lovable
   (mas vai dar erro 404 — o Worker resolve isso na próxima etapa)

### Etapa 4 — Criar o Worker

1. Painel Cloudflare → **Workers & Pages** → **Create** → **Create Worker**
2. Nome: `allvita-tenant-proxy`
3. **Deploy** com código padrão para criar
4. **Edit code** → colar o script abaixo → **Save and Deploy**

```javascript
// allvita-tenant-proxy/src/index.js
const ORIGIN_HOST = "app.allvita.com.br";
const ROOT_DOMAIN = "allvita.com.br";

// Subdomínios que NÃO são tenants (passam direto pra origem)
const RESERVED = new Set(["www", "app", "api", "admin", "preview", "id-preview"]);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;

    // 1) Extrair slug do hostname
    if (!host.endsWith(`.${ROOT_DOMAIN}`)) {
      return fetch(request); // não é nosso domínio, passthrough
    }
    const sub = host.slice(0, host.length - ROOT_DOMAIN.length - 1);

    // 2) Se for subdomínio reservado ou app, não reescreve path
    if (RESERVED.has(sub) || sub === "app") {
      return proxyTo(request, ORIGIN_HOST, url.pathname, sub);
    }

    // 3) Slug válido → prefixar pathname com /<slug>
    const slug = sub.toLowerCase();
    const newPath = `/${slug}${url.pathname === "/" ? "" : url.pathname}`;
    return proxyTo(request, ORIGIN_HOST, newPath, slug);
  },
};

async function proxyTo(request, originHost, newPath, slug) {
  const url = new URL(request.url);
  url.hostname = originHost;
  url.pathname = newPath;

  // Reescrever Host header para a origem aceitar
  const headers = new Headers(request.headers);
  headers.set("Host", originHost);
  headers.set("X-Forwarded-Host", request.headers.get("host") || "");
  headers.set("X-Tenant-Slug", slug || "");

  const originReq = new Request(url.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: "manual", // não seguir 301 automaticamente
  });

  const originRes = await fetch(originReq);

  // Reescrever cookies para o domínio do tenant
  const newHeaders = new Headers(originRes.headers);
  const setCookies = originRes.headers.getSetCookie?.() || [];
  if (setCookies.length > 0) {
    newHeaders.delete("set-cookie");
    for (const cookie of setCookies) {
      // Remove Domain= antigo e força Domain=.allvita.com.br
      const rewritten = cookie
        .replace(/;\s*Domain=[^;]+/i, "")
        .concat(`; Domain=.allvita.com.br`);
      newHeaders.append("set-cookie", rewritten);
    }
  }

  // Reescrever redirects 30x para manter o subdomínio
  if ([301, 302, 303, 307, 308].includes(originRes.status)) {
    const loc = originRes.headers.get("location");
    if (loc) {
      try {
        const locUrl = new URL(loc, `https://${originHost}`);
        if (locUrl.hostname === originHost) {
          // Strip leading /<slug>/ se presente
          let p = locUrl.pathname;
          if (slug && p.startsWith(`/${slug}`)) {
            p = p.slice(slug.length + 1) || "/";
          }
          newHeaders.set("location", `https://${slug}.${ROOT_DOMAIN}${p}${locUrl.search}`);
        }
      } catch {}
    }
  }

  return new Response(originRes.body, {
    status: originRes.status,
    statusText: originRes.statusText,
    headers: newHeaders,
  });
}
```

### Etapa 5 — Vincular o Worker ao domínio

1. No Worker → aba **Settings → Triggers → Routes** → **Add route**
2. Route: `*.allvita.com.br/*`
3. Zone: `allvita.com.br`
4. **Save**

> 💡 Não inclua `app.allvita.com.br/*` nem `allvita.com.br/*` na rota — o wildcard `*` cobre só subdomínios.

### Etapa 6 — Configurar Supabase Auth

1. Supabase Dashboard → **Authentication → URL Configuration**
2. **Site URL**: `https://app.allvita.com.br`
3. **Redirect URLs** (adicionar):
   - `https://app.allvita.com.br/**`
   - `https://*.allvita.com.br/**`  ← wildcard crítico
   - `http://localhost:5173/**`
4. **Save**

### Etapa 7 — Ajustes no código (mínimos)

O código já está preparado (`src/lib/tenant-routing.ts → buildTenantUrl`).
Apenas confirmar que `RESERVED_SUBDOMAINS` no `useSubdomainTenant.ts` inclui
`www, app, api, admin, preview, id-preview`. ✅ já está.

---

## 4. Checklist de QA

Execute em ordem após o Worker estar publicado. Use `lumyss` como tenant de teste.

### 🌐 4.1. Conectividade básica

- [ ] `https://lumyss.allvita.com.br` carrega sem erro de SSL
- [ ] `https://lumyss.allvita.com.br/core` exibe portal do tenant
- [ ] `https://app.allvita.com.br/lumyss/core` continua funcionando (fallback path-based)
- [ ] `https://app.allvita.com.br/admin` continua acessível para super admin
- [ ] `https://www.allvita.com.br` redireciona corretamente (ou serve home)
- [ ] Console não mostra erros de CORS, mixed content ou cookie

### 🔐 4.2. Autenticação

- [ ] Login em `lumyss.allvita.com.br/auth/login` funciona
- [ ] Após login, redireciona para `/core` no MESMO subdomínio (não pula pra `app.`)
- [ ] Refresh da página mantém sessão (cookie persistente)
- [ ] Logout limpa sessão e redireciona corretamente
- [ ] **Reset de senha**: email chega com link `https://lumyss.allvita.com.br/auth/reset-password?token=...`
- [ ] Magic link redireciona pro subdomínio correto
- [ ] Sessão NÃO vaza entre tenants (login em `lumyss` não autentica em `outrotenant`)

### 🎨 4.3. Branding e identidade visual

- [ ] Logo do tenant aparece no login
- [ ] Cor primária do tenant aplicada no background
- [ ] Favicon do tenant aparece na aba do browser
- [ ] `<title>` da aba mostra nome do tenant
- [ ] Subdomínio sem tenant válido (ex: `inexistente.allvita.com.br`) cai em tela 404 amigável

### 📦 4.4. Assets e recursos

- [ ] CSS carrega (`/assets/index-*.css` retorna 200)
- [ ] JS carrega (`/assets/index-*.js` retorna 200)
- [ ] Imagens estáticas (`/placeholder.svg`) carregam
- [ ] Uploads do Supabase Storage (logos, avatars) carregam
- [ ] Fontes web não dão erro de CORS

### 🔗 4.5. Navegação interna

- [ ] Links internos (`<Link to="/club">`) mantêm subdomínio
- [ ] `useTenantNavigation()` NÃO injeta slug no path quando em subdomínio
- [ ] Botão "voltar" do browser funciona normalmente
- [ ] Deep link direto (`lumyss.allvita.com.br/club/dashboard`) funciona em aba nova
- [ ] Refresh em rota interna não dá 404

### 🔌 4.6. APIs e Edge Functions

- [ ] Chamadas para `*.supabase.co` continuam funcionando
- [ ] Edge Functions (`api-gateway`, `tenant-api`) recebem requisições
- [ ] Header `X-Tenant-Id` é enviado corretamente
- [ ] Webhooks externos (Shopify, Pagar.me) continuam apontando pra `app.allvita.com.br` (não mudar)

### 📧 4.7. Emails transacionais

- [ ] Email de convite tem link com subdomínio do tenant
- [ ] Email de ativação aponta pro subdomínio correto
- [ ] Reset de senha aponta pro subdomínio correto
- [ ] Notificações por email mantêm contexto de tenant

### 🚦 4.8. Performance e limites

- [ ] TTFB (Time To First Byte) < 500ms
- [ ] Lighthouse Performance ≥ 80
- [ ] Cloudflare Analytics mostra requisições passando pelo Worker
- [ ] Workers Analytics mostra latência média < 50ms (overhead do proxy)
- [ ] Não há erros 5xx no painel Cloudflare nas últimas 24h

### 🛡️ 4.9. Segurança

- [ ] Cookie `sb-access-token` tem `Domain=.allvita.com.br` e `Secure`
- [ ] Headers `X-Frame-Options` e `Content-Security-Policy` preservados
- [ ] Tentativa de acessar tenant A logado em tenant B é bloqueada por RLS
- [ ] HSTS habilitado em todos os subdomínios

---

## 5. Plano de rollback

Se algo der errado e precisar reverter rapidamente:

1. **Cloudflare → DNS → Records** → editar registro `A *` → mudar para **DNS only** (nuvem cinza)
2. Os subdomínios param de ser proxyados; voltam a resolver direto pro IP Lovable (que vai retornar 404 — comportamento neutro)
3. `app.allvita.com.br` continua funcionando normalmente
4. Usuários acessam via path-based: `app.allvita.com.br/lumyss/...` (já suportado no código)

Tempo de rollback: **< 2 minutos**.

---

## 6. Limitações conhecidas

| Limitação | Impacto | Mitigação |
|---|---|---|
| `<meta>` tags no `index.html` são globais | OG image/title fixos por tenant | HTMLRewriter no Worker (fase 2) |
| Workers Free: 100k req/dia | ~3-5k usuários ativos | Upgrade $5/mês = 10M req |
| Mudança de DNS leva até 4h | Janela de propagação | Migrar fora do horário comercial |
| Cookies de terceiros bloqueados | Possível em iframes | Não usamos iframes externos |

---

## 7. Custos

| Item | Custo |
|---|---|
| DNS Cloudflare | Free |
| SSL wildcard | Free (incluso) |
| Workers Free (até 100k req/dia) | Free |
| Workers Paid (10M req/mês) | $5/mês |
| **Total estimado produção** | **$5/mês** |

---

## 8. Próximos passos opcionais (fase 2)

- HTMLRewriter no Worker para injetar `<meta og:image>` por tenant
- Cache de respostas estáticas no Worker (CDN próprio)
- Geo-routing (servir região mais próxima)
- Rate limiting por tenant no Worker
- Logs estruturados para Datadog/Logflare

---

**Última atualização:** 2026-05-01
**Owner técnico:** Time de plataforma All Vita
