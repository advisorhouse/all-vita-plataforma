import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Info, Shield, Server, Globe, Lock, CheckCircle2, AlertTriangle, Terminal, Code2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminCloudflareSetup = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Código copiado para a área de transferência");
  };

  const workerCode = `// allvita-tenant-proxy/src/index.js
const ORIGIN_HOST = "app.allvita.com.br";
const ROOT_DOMAIN = "allvita.com.br";

// Subdomínios que NÃO são tenants (passam direto pra origem)
const RESERVED = new Set(["www", "app", "api", "admin", "preview", "id-preview"]);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;

    // 1) Extrair slug do hostname
    if (!host.endsWith(\`.\${ROOT_DOMAIN}\`)) {
      return fetch(request); // não é nosso domínio, passthrough
    }
    const sub = host.slice(0, host.length - ROOT_DOMAIN.length - 1);

    // 2) Se for subdomínio reservado ou app, não reescreve path
    if (RESERVED.has(sub) || sub === "app") {
      return proxyTo(request, ORIGIN_HOST, url.pathname, sub);
    }

    // 3) Slug válido → prefixar pathname com /<slug>
    const slug = sub.toLowerCase();
    const newPath = \`/\${slug}\${url.pathname === "/" ? "" : url.pathname}\`;
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

  // Reescrever cookies para o domínio do template
  const newHeaders = new Headers(originRes.headers);
  const setCookies = (originRes.headers as any).getSetCookie?.() || [];
  if (setCookies.length > 0) {
    newHeaders.delete("set-cookie");
    for (const cookie of setCookies) {
      // Remove Domain= antigo e força Domain=.allvita.com.br
      const rewritten = cookie
        .replace(/;\\s*Domain=[^;]+/i, "")
        .concat(\`; Domain=.allvita.com.br\`);
      newHeaders.append("set-cookie", rewritten);
    }
  }

  // Reescrever redirects 30x para manter o subdomínio
  if ([301, 302, 303, 307, 308].includes(originRes.status)) {
    const loc = originRes.headers.get("location");
    if (loc) {
      try {
        const locUrl = new URL(loc, \`https://\${originHost}\`);
        if (locUrl.hostname === originHost) {
          // Strip leading /<slug>/ se presente
          let p = locUrl.pathname;
          if (slug && p.startsWith(\`/\${slug}\`)) {
            p = p.slice(slug.length + 1) || "/";
          }
          newHeaders.set("location", \`https://\${slug}.\${ROOT_DOMAIN}\${p}\${locUrl.search}\`);
        }
      } catch {}
    }
  }

  return new Response(originRes.body, {
    status: originRes.status,
    statusText: originRes.statusText,
    headers: newHeaders,
  });
}`;

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Configuração de Subdomínios White-Label</h1>
        </div>
        <p className="text-muted-foreground">
          Guia operacional para habilitar subdomínios personalizados (ex: <code className="bg-muted px-1 rounded">lumyss.allvita.com.br</code>) 
          mantendo o app hospedado na Lovable.
        </p>
      </div>

      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertTitle>Como funciona</AlertTitle>
        <AlertDescription>
          O browser vê <code className="font-bold">slug.allvita.com.br</code>. A Cloudflare intercepta a requisição via Worker e 
          "traduz" para <code className="font-bold">app.allvita.com.br/slug</code>. Para o usuário, o subdomínio nunca muda.
        </AlertDescription>
      </Alert>

      {/* Step 1 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="h-6 w-6 flex items-center justify-center rounded-full p-0">1</Badge>
          <h2 className="text-xl font-semibold">DNS Cloudflare</h2>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>Mova os nameservers do <strong>Registro.br</strong> para a Cloudflare:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>Adicione o site <code className="bg-muted px-1 rounded">allvita.com.br</code> no painel Cloudflare.</li>
              <li>Mantenha os registros <code className="bg-muted px-1 rounded">A @</code> e <code className="bg-muted px-1 rounded">A app</code> apontando para <code className="bg-muted px-1 rounded">185.158.133.1</code>.</li>
              <li>Adicione um registro <strong>Wildcard</strong>: <Badge variant="outline">A * → 185.158.133.1</Badge> com o Proxy (Nuvem Laranja) ativado.</li>
            </ul>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer">
                  Abrir Cloudflare <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Step 2 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="h-6 w-6 flex items-center justify-center rounded-full p-0">2</Badge>
          <h2 className="text-xl font-semibold">Segurança SSL/TLS</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" /> Modo Full (Strict)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">Isso é crítico para evitar loops de redirecionamento infinivos:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-3 space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Encryption Mode</p>
                <p className="font-medium">Full (strict)</p>
              </div>
              <div className="border rounded-md p-3 space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Edge Certificates</p>
                <ul className="text-xs space-y-1">
                  <li className="flex items-center gap-1 text-green-600 font-medium">✓ Always Use HTTPS</li>
                  <li className="flex items-center gap-1 text-green-600 font-medium">✓ Automatic HTTPS Rewrites</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Step 3 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="h-6 w-6 flex items-center justify-center rounded-full p-0">3</Badge>
          <h2 className="text-xl font-semibold">Cloudflare Worker</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Code2 className="h-4 w-4" /> Script do Proxy
            </CardTitle>
            <CardDescription>
              Crie um novo Worker chamado <code className="bg-muted px-1">allvita-tenant-proxy</code> e use o código abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative group">
              <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-[400px]">
                {workerCode}
              </pre>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(workerCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-semibold">Configuração da Rota do Worker:</p>
              <div className="bg-muted p-3 rounded flex items-center justify-between">
                <code className="text-sm">*.allvita.com.br/*</code>
                <Badge>Zone: allvita.com.br</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Step 4 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="h-6 w-6 flex items-center justify-center rounded-full p-0">4</Badge>
          <h2 className="text-xl font-semibold">Supabase Auth</h2>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm">Adicione as URLs de redirecionamento permitidas no Supabase:</p>
            <div className="bg-zinc-900 text-zinc-100 p-4 rounded-md space-y-1 font-mono text-sm">
              <p className="text-green-400"># Authentication &gt; URL Configuration &gt; Redirect URLs</p>
              <p>https://app.allvita.com.br/**</p>
              <p className="text-yellow-400">https://*.allvita.com.br/**</p>
              <p>http://localhost:5173/**</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* QA Checklist */}
      <section className="space-y-4 pt-8 border-t">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold">Checklist de Verificação (QA)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Conectividade & Auth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Subdomínio carrega via HTTPS sem erros",
                "Login funciona no subdomínio",
                "Refresh de página mantém a sessão",
                "Logout redireciona corretamente",
                "Reset de senha usa link com subdomínio"
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Checkbox id={`qa1-${i}`} />
                  <label htmlFor={`qa1-${i}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{item}</label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Branding & Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Logo do tenant aparece corretamente",
                "Cores do tenant aplicadas no login",
                "CSS e JS carregam com status 200",
                "Imagens do storage carregam via proxy",
                "Subdomínio inválido cai em 404 amigável"
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Checkbox id={`qa2-${i}`} />
                  <label htmlFor={`qa2-${i}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{item}</label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rollback Plan */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Plano de Rollback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            Se algo der errado, vá no DNS da Cloudflare e mude o registro <code className="bg-white px-1">A *</code> para 
            <strong> DNS Only (nuvem cinza)</strong>. Os subdomínios pararão de funcionar, mas o app principal em 
            <code className="bg-white px-1">app.allvita.com.br</code> continuará operando normalmente via path-based.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCloudflareSetup;
