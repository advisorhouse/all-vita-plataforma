import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isPathBasedHost, extractSlugFromPath } from "@/lib/tenant-routing";

/**
 * Path-based tenant URL rewrite (must run BEFORE React Router mounts).
 *
 * On `app.allvita.com.br/<slug>/<route>`, strip `<slug>` from the pathname so
 * the router sees `/<route>`. The slug is then re-detected by `useSubdomainTenant`
 * to load tenant context. We persist the slug on `window.__tenantSlug` so
 * the hook doesn't need to read it from a URL that no longer contains it.
 */
(function rewriteTenantPath() {
  if (typeof window === "undefined") return;
  
  const hostname = window.location.hostname;
  const isPathBased = isPathBasedHost(hostname);
  const pathname = window.location.pathname;

  // Se o hostname for app.allvita.com.br, mantemos a lógica de path-based para compatibilidade/legado
  // Mas se for qualquer outro subdomínio de allvita.com.br (incluindo lumyss.allvita.com.br),
  // desativamos QUALQUER reescrita ou extração de slug da URL.
  const isAllVitaBase = hostname === "allvita.com.br" || hostname === "app.allvita.com.br";
  const isSubdomain = !isAllVitaBase && (hostname.endsWith(".allvita.com.br") || hostname.endsWith(".lovable.app"));

  console.log("[rewriteTenantPath] Hostname:", hostname, "isSubdomain:", isSubdomain, "isPathBased:", isPathBased);

  if (isSubdomain) {
    console.log("[rewriteTenantPath] Subdomain detected. Disabling all path-based logic.");
    return;
  }

  // Apenas extraímos slug se estivermos no host principal que suporta path-based
  if (isPathBased) {
    const slug = extractSlugFromPath(pathname);
    console.log("[rewriteTenantPath] Slug from path:", slug);
    if (slug) {
      (window as any).__tenantSlug = slug;
    }
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
