/**
 * Tenant routing utilities.
 *
 * Strategy: path-based tenant identification.
 * - Production app is hosted at `app.allvita.com.br`.
 * - Tenant is identified by the FIRST path segment (e.g. `/lumyss/club`).
 * - Lovable does NOT support wildcard custom domains, so subdomain-per-tenant
 *   is no longer the default. Subdomain detection remains as fallback for
 *   tenants that may someday have a custom domain registered manually.
 */

/**
 * Hosts where path-based tenant detection is active.
 * On other hosts (lovable.app preview, localhost) we fall back to subdomain
 * or ?tenant= query param.
 */
export const PATH_BASED_HOSTS = [
  "app.allvita.com.br",
];

/**
 * Reserved first-segment paths that are NEVER tenant slugs.
 * Keep this list in sync with the routes declared in src/App.tsx.
 */
export const RESERVED_PATH_SEGMENTS = new Set<string>([
  "admin",
  "auth",
  "quiz",
  "club",
  "core",
  "partner",
  "activate",
  "invite",
  "notifications",
  "profile",
  "onboarding",
  "proposta",
  "proposta-site",
  "terms",
  "privacy",
  "assets",
  "favicon.ico",
  "robots.txt",
  "placeholder.svg",
]);

export function isPathBasedHost(hostname: string): boolean {
  return PATH_BASED_HOSTS.includes(hostname);
}

/**
 * Extracts a candidate tenant slug from the first path segment if present
 * and not reserved. Returns null otherwise.
 */
export function extractSlugFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const first = segments[0].toLowerCase();
  if (RESERVED_PATH_SEGMENTS.has(first)) return null;
  // Only treat as slug if it matches slug-ish chars
  if (!/^[a-z0-9][a-z0-9-]*$/.test(first)) return null;
  return first;
}

/**
 * Builds the full external URL for a tenant page (used in invitations,
 * referral links, share buttons, etc.).
 */
export function buildTenantUrl(slug: string, path: string = "/", params?: Record<string, string>): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // ALWAYS use path-based URLs (app.allvita.com.br/slug/path) 
  // because Lovable redirects all other subdomains to the primary domain.
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://app.allvita.com.br";
  
  // If we are already on a tenant-specific URL or a custom domain that is NOT the primary app, 
  // we might want to preserve that, but for now, path-based on primary is safest.
  const baseUrl = currentOrigin.includes("lovable.app") || currentOrigin.includes("allvita.com.br") 
    ? currentOrigin 
    : "https://app.allvita.com.br";

  const finalPath = `/${slug}${cleanPath}`;
  const url = new URL(finalPath, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}
