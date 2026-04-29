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
  if (!isPathBasedHost(window.location.hostname)) return;
  const slug = extractSlugFromPath(window.location.pathname);
  if (!slug) return;

  (window as any).__tenantSlug = slug;
  const segments = window.location.pathname.split("/").filter(Boolean);
  const rewritten = "/" + segments.slice(1).join("/");
  const finalPath = rewritten === "/" ? "/" : rewritten;
  window.history.replaceState(
    null,
    "",
    `${finalPath}${window.location.search}${window.location.hash}`
  );
})();

createRoot(document.getElementById("root")!).render(<App />);
