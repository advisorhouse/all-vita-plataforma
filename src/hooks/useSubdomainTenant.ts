import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, type Tenant } from "@/contexts/TenantContext";
import {
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
  "lovableproject.com",
];

const RESERVED_SUBDOMAINS = ["www", "app", "api", "admin", "all-vita-plataforma", "id-preview", "preview"];

type DetectedTenant =
  | { mode: "path"; slug: string }
  | { mode: "subdomain"; slug: string }
  | { mode: "custom-domain"; hostname: string }
  | { mode: "query"; slug: string }
  | null;

const detectTenant = (hostname: string, pathname: string): DetectedTenant => {
  // 1) Explicit Subdomain detection (high priority)
  for (const base of BASE_DOMAINS) {
    if (hostname.endsWith(`.${base}`) && hostname !== `app.${base}`) {
      const sub = hostname.split('.')[0];
      if (sub && !RESERVED_SUBDOMAINS.includes(sub)) {
        return { mode: "subdomain", slug: sub };
      }
    }
  }

  // 2) Path-based detection
  const isActuallyPathBased = hostname === "app.allvita.com.br" || 
                             hostname === "all-vita-plataforma.lovable.app" ||
                             hostname.includes(".lovable.app") || 
                             hostname.includes(".lovableproject.com") ||
                             hostname === "localhost";
                             
  if (isActuallyPathBased) {
    const slug = extractSlugFromPath(pathname);
    if (slug) return { mode: "path", slug };
    
    // Explicit check for /lumyss style paths
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    if (firstSegment && !RESERVED_PATH_SEGMENTS.has(firstSegment)) {
      return { mode: "path", slug: firstSegment };
    }
  }

  // Fallback: ?tenant= query param
  const tenantParam = new URLSearchParams(window.location.search).get("tenant");
  if (tenantParam) return { mode: "query", slug: tenantParam };

  // Fallback: Custom domain
  if (
    hostname !== "localhost" &&
    !/^\d+\.\d+\.\d+\.\d+$/.test(hostname) &&
    !hostname.endsWith(".allvita.com.br") &&
    !hostname.endsWith(".lovable.app") &&
    !hostname.endsWith(".lovableproject.com") &&
    hostname !== "allvita.com.br" &&
    hostname !== "app.allvita.com.br"
  ) {
    return { mode: "custom-domain", hostname };
  }

  return null;
};

/**
 * Detects tenant slug from URL and auto-selects the corresponding tenant in TenantContext.
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
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef<string | null>(null);

  useEffect(() => {
    const detected = detectTenant(window.location.hostname, window.location.pathname);
    setTenantMode(detected ? detected.mode : null);
    
    if (!detected) {
      setChecked(true);
      setIsLoading(false);
      setLoading(false);
      setIsSubdomainAccess(false);
      return;
    }

    setIsSubdomainAccess(detected.mode === "subdomain" || detected.mode === "custom-domain");

    // Prevent duplicate fetches for the same target
    const fetchKey = detected.mode === "custom-domain" ? detected.hostname : (detected as any).slug;
    if (fetchingRef.current === fetchKey && currentTenant) {
      setLoading(false);
      return;
    }
    fetchingRef.current = fetchKey;

    const loadTenant = async () => {
      setIsLoading(true);
      setLoading(true);
      try {
        if (detected.mode === "custom-domain") {
          const { data, error } = await supabase
            .from("tenants")
            .select("id, name, trade_name, slug, logo_url, isotipo_url, favicon_url, primary_color, secondary_color, domain, active, settings")
            .eq("domain", detected.hostname)
            .eq("active", true)
            .maybeSingle();
          
          if (data) {
            setTenantSlug(data.slug);
            setCurrentTenant(data as Tenant);
          }
        } else {
          const slug = (detected as any).slug;
          setTenantSlug(slug);
          const normalizedSlug = slug.replace(/-/g, "").toLowerCase();
          
          let { data } = await supabase
            .from("tenants")
            .select("id, name, trade_name, slug, logo_url, favicon_url, primary_color, secondary_color, domain, active, settings")
            .eq("slug", slug)
            .eq("active", true)
            .maybeSingle();

          if (!data && normalizedSlug !== slug) {
            const res = await supabase
              .from("tenants")
              .select("id, name, trade_name, slug, logo_url, favicon_url, primary_color, secondary_color, domain, active, settings")
              .eq("slug", normalizedSlug)
              .eq("active", true)
              .maybeSingle();
            data = res.data;
          }

          if (data) {
            setCurrentTenant(data as Tenant);
          }
        }
      } catch (err) {
        console.error("[useSubdomainTenant] Unexpected error:", err);
      } finally {
        setChecked(true);
        setIsLoading(false);
        setLoading(false);
      }
    };

    loadTenant();
  }, [tenantQueryParam, setIsLoading, setCurrentTenant, setIsSubdomainAccess, setTenantMode, currentTenant]);

  // Auto-select from memberships when they load
  useEffect(() => {
    if (!tenantSlug || availableTenants.length === 0 || currentTenant) return;
    
    const match = availableTenants.find((t) => 
      t.slug.toLowerCase() === tenantSlug.toLowerCase() || 
      t.slug.replace(/-/g, "").toLowerCase() === tenantSlug.replace(/-/g, "").toLowerCase()
    );
    
    if (match) {
      setCurrentTenant(match);
    }
  }, [tenantSlug, availableTenants, currentTenant, setCurrentTenant]);

  return { subdomainSlug: tenantSlug, checked, loading };
}
