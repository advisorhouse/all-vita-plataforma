import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, type Tenant } from "@/contexts/TenantContext";

/**
 * Base domains where the app is hosted.
 * Subdomains of these are treated as tenant slugs.
 * E.g. vision-lift.allvita.com.br → slug = "vision-lift"
 */
const BASE_DOMAINS = [
  "allvita.com.br",
  "lovable.app",
  "lovable.dev",
];

/**
 * Reserved subdomains that should NOT trigger tenant routing.
 */
const RESERVED_SUBDOMAINS = ["www", "app", "api", "admin", "all-vita-plataforma"];

function extractTenantSlug(): string | null {
  const hostname = window.location.hostname;

  // localhost or IP — no subdomain routing
  if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  for (const base of BASE_DOMAINS) {
    if (hostname.endsWith(`.${base}`)) {
      const sub = hostname.slice(0, hostname.length - base.length - 1);
      // Could be nested: "id-preview--abc.lovable.app" — skip those
      if (!sub || sub.includes("--") || sub.includes(".")) return null;
      if (RESERVED_SUBDOMAINS.includes(sub)) return null;
      return sub;
    }
  }

  // Custom domain — check against tenant domains
  return null;
}

/**
 * Detects tenant slug from the current subdomain and auto-selects
 * the tenant in context. Also handles custom domain lookup.
 */
export function useSubdomainTenant() {
  const { setCurrentTenant, currentTenant, availableTenants } = useTenant();
  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null);
  const [isSubdomainAccess, setIsSubdomainAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = extractTenantSlug();
    const hostname = window.location.hostname;

    if (slug) {
      setSubdomainSlug(slug);
      setIsSubdomainAccess(true);
      setLoading(false);
      return;
    }

    // No slug found — check if it's a custom domain
    if (
      hostname !== "localhost" &&
      !/^\d+\.\d+\.\d+\.\d+$/.test(hostname) &&
      !BASE_DOMAINS.some((d) => hostname.endsWith(`.${d}`) || hostname === d)
    ) {
      // This might be a custom domain — look up tenant
      const lookupCustomDomain = async () => {
        const { data } = await (supabase.from as any)("tenants")
          .select("id, name, slug, logo_url, primary_color, secondary_color, domain, active, settings")
          .eq("domain", hostname)
          .eq("active", true)
          .single();

        if (data) {
          setSubdomainSlug(data.slug);
          setIsSubdomainAccess(true);
          setCurrentTenant(data as Tenant);
        }
        setLoading(false);
      };
      lookupCustomDomain();
    } else {
      setLoading(false);
    }
  }, []);

  // When slug is detected and availableTenants are loaded, auto-select
  useEffect(() => {
    if (!subdomainSlug || availableTenants.length === 0 || currentTenant) return;

    const match = availableTenants.find((t) => t.slug === subdomainSlug);
    if (match) {
      setCurrentTenant(match);
    }
  }, [subdomainSlug, availableTenants, currentTenant, setCurrentTenant]);

  return { isSubdomainAccess, subdomainSlug, loading };
}
