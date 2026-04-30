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
  
  if (!isPathBased) return;
  
  const pathname = window.location.pathname;
  const slug = extractSlugFromPath(pathname);
  if (!slug) return;

  (window as any).__tenantSlug = slug;
  
  // NOTE: We used to use window.history.replaceState here to strip the slug from the URL.
  // This caused the URL in the browser to appear as just /core instead of /lumyss/core.
  // We've disabled this rewrite to ensure the URL accurately reflects the tenant path.
  // The useSubdomainTenant hook and React Router are being adjusted to handle the slug
  // as part of the routing structure where necessary.
})();

createRoot(document.getElementById("root")!).render(<App />);
