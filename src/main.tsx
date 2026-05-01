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

  // CRITICAL: Precise detection of subdomain mode
  const isAllVitaBase = hostname === "allvita.com.br" || hostname === "app.allvita.com.br";
  const isSubdomain = !isAllVitaBase && (hostname.endsWith(".allvita.com.br") || hostname.endsWith(".lovable.app") || hostname.endsWith(".lovable.dev"));

  console.log("[rewriteTenantPath] Hostname:", hostname, "isSubdomain:", isSubdomain, "isPathBased:", isPathBased);

  if (isSubdomain) {
    console.log("[rewriteTenantPath] Subdomain detected. FORCING relative routing, no path slugs allowed.");
    // In subdomain mode, we must NEVER have window.__tenantSlug set from the path
    return;
  }

  // Path-based mode only on specific hosts
  if (isPathBased) {
    const slug = extractSlugFromPath(pathname);
    console.log("[rewriteTenantPath] Slug from path:", slug);
    if (slug) {
      (window as any).__tenantSlug = slug;
    }
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
