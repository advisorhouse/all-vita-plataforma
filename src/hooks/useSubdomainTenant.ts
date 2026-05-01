import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, type Tenant } from "@/contexts/TenantContext";
import {
  isPathBasedHost,
  extractSlugFromPath,
  RESERVED_PATH_SEGMENTS,
} from "@/lib/tenant-routing";

/**
 * Base domains where the app is hosted.
 * Subdomains of these are treated as tenant slugs (legacy fallback).
 */
const BASE_DOMAINS = [
  "allvita.com.br",
  "lovable.app",
  "lovable.dev",
];

const RESERVED_SUBDOMAINS = ["www", "app", "api", "admin", "all-vita-plataforma", "id-preview", "preview"];

type DetectedTenant =
  | { mode: "path"; slug: string }
  | { mode: "subdomain"; slug: string }
  | { mode: "custom-domain"; hostname: string }
  | { mode: "query"; slug: string }
  | null;

function detectTenant(): DetectedTenant {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // 1) Path-based detection (primary strategy on app.allvita.com.br).
  if (isPathBasedHost(hostname)) {
    const cached = (window as any).__tenantSlug as string | undefined;
    if (cached) return { mode: "path", slug: cached };
    const slug = extractSlugFromPath(pathname);
    if (slug) return { mode: "path", slug };
  }

  // 2) Subdomain detection
  if (hostname !== "localhost" && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    for (const base of BASE_DOMAINS) {
      if (hostname.endsWith(`.${base}`)) {
        const sub = hostname.slice(0, hostname.length - base.length - 1);
        if (!sub || sub.includes("--") || sub.includes(".")) continue;
        if (RESERVED_SUBDOMAINS.some((r) => sub === r)) continue;
        return { mode: "subdomain", slug: sub };
      }
    }
  }

  // 3) ?tenant= query param (dev/preview)
  const tenantParam = new URLSearchParams(window.location.search).get("tenant");
  if (tenantParam) return { mode: "query", slug: tenantParam };

  // 4) Custom domain
  if (
    hostname !== "localhost" &&
    !/^\d+\.\d+\.\d+\.\d+$/.test(hostname) &&
    !BASE_DOMAINS.some((d) => hostname.endsWith(`.${d}`) || hostname === d)
  ) {
    return { mode: "custom-domain", hostname };
  }

  return null;
}

/**
 * Detects tenant slug from URL (path / subdomain / custom domain / query)
 * and auto-selects the corresponding tenant in TenantContext.
 *
 * For path-based mode, it also rewrites the URL to strip the slug from the
 * pathname BEFORE React Router processes it. This means the rest of the app
 * (routes, links) doesn't need to know about the slug — `app.allvita.com.br/lumyss/club`
 * is internally treated as `/club` with tenant=lumyss in context.
 */
export function useSubdomainTenant() {
  const { 
    setCurrentTenant, 
    currentTenant, 
    availableTenants, 
    setIsSubdomainAccess, 
    setIsLoading,
    setTenantMode 
  } = useTenant();
  const [searchParams] = useSearchParams();
  const tenantQueryParam = searchParams.get("tenant");
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const detected = detectTenant();
    setTenantMode(detected ? detected.mode : null);

    if (!detected) {
      setChecked(true);
      setIsLoading(false);
      setIsSubdomainAccess(false);
      return;
    }

    setIsSubdomainAccess(detected.mode === "subdomain" || detected.mode === "custom-domain");
    console.log("[useSubdomainTenant] Detected:", detected);

    // Custom-domain lookup needs to query by `domain` field
    if (detected.mode === "custom-domain") {
      (async () => {
        setIsLoading(true);
        console.log("[useSubdomainTenant] Querying DB for custom domain:", detected.hostname);
        const { data, error } = await supabase
          .from("tenants")
          .select("id, name, trade_name, slug, logo_url, favicon_url, primary_color, secondary_color, domain, active, settings")
          .eq("domain", detected.hostname)
          .eq("active", true)
          .maybeSingle();
        
        if (data) {
          console.log("[useSubdomainTenant] Custom domain tenant found:", data.slug);
          setTenantSlug(data.slug);
          setCurrentTenant(data as Tenant);
        } else if (error) {
          console.error("[useSubdomainTenant] Error fetching custom domain tenant:", error);
        }
        setChecked(true);
        setIsLoading(false);
      })();
      return;
    }

    // Slug-based modes (path / subdomain / query)
    const slug = detected.slug;
    setTenantSlug(slug);
    const normalizedSlug = slug.replace(/-/g, "").toLowerCase();

    (async () => {
      setIsLoading(true);
      let { data } = await (supabase.from as any)("tenants")
        .select("id, name, trade_name, slug, logo_url, favicon_url, primary_color, secondary_color, domain, active, settings")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (!data && normalizedSlug !== slug) {
        const res = await (supabase.from as any)("tenants")
          .select("id, name, trade_name, slug, logo_url, favicon_url, primary_color, secondary_color, domain, active, settings")
          .eq("slug", normalizedSlug)
          .eq("active", true)
          .single();
        data = res.data;
      }

      if (data) {
        console.log("[useSubdomainTenant] Tenant loaded:", data.slug);
        setCurrentTenant(data as Tenant);
      } else {
        console.log("[useSubdomainTenant] No tenant found for slug:", slug);
      }
      setChecked(true);
      setIsLoading(false);
    })();
  }, [tenantQueryParam, setIsLoading, setCurrentTenant, setIsSubdomainAccess]);

  // Auto-select from memberships when they load
  useEffect(() => {
    if (!tenantSlug || availableTenants.length === 0 || currentTenant) return;
    
    // Normalize slug comparison
    const match = availableTenants.find((t) => 
      t.slug.toLowerCase() === tenantSlug.toLowerCase() || 
      t.slug.replace(/-/g, "").toLowerCase() === tenantSlug.replace(/-/g, "").toLowerCase()
    );
    
    if (match) {
      console.log("[useSubdomainTenant] Auto-selected from memberships:", match.slug);
      setCurrentTenant(match);
    }
  }, [tenantSlug, availableTenants, currentTenant, setCurrentTenant]);

  return { subdomainSlug: tenantSlug, checked };
}
