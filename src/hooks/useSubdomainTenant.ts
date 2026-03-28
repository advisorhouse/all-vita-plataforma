import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, type Tenant } from "@/contexts/TenantContext";

/**
 * Base domains where the app is hosted.
 * Subdomains of these are treated as tenant slugs.
 */
const BASE_DOMAINS = [
  "allvita.com.br",
  "lovable.app",
  "lovable.dev",
];

const RESERVED_SUBDOMAINS = ["www", "app", "api", "admin", "all-vita-plataforma", "id-preview"];

function extractTenantSlug(): string | null {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  for (const base of BASE_DOMAINS) {
    if (hostname.endsWith(`.${base}`)) {
      const sub = hostname.slice(0, hostname.length - base.length - 1);
      if (!sub || sub.includes("--") || sub.includes(".")) return null;
      if (RESERVED_SUBDOMAINS.some((r) => sub.startsWith(r))) return null;
      return sub;
    }
  }

  // Fallback: ?tenant=slug query parameter (dev/preview simulation)
  const tenantParam = new URLSearchParams(window.location.search).get("tenant");
  if (tenantParam) return tenantParam;

  return null;
}

/**
 * Detects tenant slug from subdomain or custom domain and auto-selects tenant.
 */
export function useSubdomainTenant() {
  const { setCurrentTenant, currentTenant, availableTenants, setIsSubdomainAccess } = useTenant();
  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const slug = extractTenantSlug();
    const hostname = window.location.hostname;

    if (slug) {
      setSubdomainSlug(slug);
      setIsSubdomainAccess(true);
      setChecked(true);
      return;
    }

    // Check custom domain
    if (
      hostname !== "localhost" &&
      !/^\d+\.\d+\.\d+\.\d+$/.test(hostname) &&
      !BASE_DOMAINS.some((d) => hostname.endsWith(`.${d}`) || hostname === d)
    ) {
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
        setChecked(true);
      };
      lookupCustomDomain();
    } else {
      setChecked(true);
    }
  }, []);

  // Fetch tenant branding by slug immediately (even before login/memberships)
  useEffect(() => {
    if (!subdomainSlug || currentTenant) return;

    const fetchTenantBySlug = async () => {
      const { data } = await (supabase.from as any)("tenants")
        .select("id, name, slug, logo_url, primary_color, secondary_color, domain, active, settings")
        .eq("slug", subdomainSlug)
        .eq("active", true)
        .single();

      if (data) {
        setCurrentTenant(data as Tenant);
      }
    };
    fetchTenantBySlug();
  }, [subdomainSlug, currentTenant, setCurrentTenant]);

  // Auto-select from memberships when they load
  useEffect(() => {
    if (!subdomainSlug || availableTenants.length === 0 || currentTenant) return;

    const match = availableTenants.find((t) => t.slug === subdomainSlug);
    if (match) {
      setCurrentTenant(match);
    }
  }, [subdomainSlug, availableTenants, currentTenant, setCurrentTenant]);

  return { subdomainSlug, checked };
}
