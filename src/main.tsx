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

  // CRITICAL FIX: If we are on a subdomain like lumyss.allvita.com.br, 
  // and the browser is trying to go to app.allvita.com.br, something in our
  // logic is triggering a full-page redirect. 
  // Let's check if we are on a subdomain and if the pathname is / or /auth/login
  const isSubdomain = hostname !== "app.allvita.com.br" && 
                     (hostname.endsWith("allvita.com.br") || hostname.endsWith("lovable.app"));

  console.log("[rewriteTenantPath] Hostname:", hostname, "isSubdomain:", isSubdomain, "isPathBased:", isPathBased);
  
  const slug = extractSlugFromPath(pathname);
  console.log("[rewriteTenantPath] Slug from path:", slug);

  if (isSubdomain) {
    console.log("[rewriteTenantPath] Subdomain detected. Ensuring no cross-domain redirects.");
    // No-op for path rewrite on subdomains
    return;
  }

  if (!slug) return;

  if (!isPathBased) {
    console.log("[rewriteTenantPath] Skipping path rewrite on non-path host, but found slug:", slug);
    return;
  }

  (window as any).__tenantSlug = slug;
})();

createRoot(document.getElementById("root")!).render(<App />);
