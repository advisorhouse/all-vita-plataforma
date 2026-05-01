import { useEffect, useState, useRef, useCallback } from "react";
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
      const sub = hostname.slice(0, hostname.length - base.length - 1);
      if (sub && !sub.includes(".") && !RESERVED_SUBDOMAINS.includes(sub)) {
        return { mode: "subdomain", slug: sub };
      }
    }
  }

  // 2) Path-based detection (for app.allvita.com.br and previews)
  const isActuallyPathBased = hostname === "app.allvita.com.br" || 
                             hostname === "all-vita-plataforma.lovable.app" ||
                             hostname.includes("lovable.app") || 
                             hostname === "localhost";
                             
  if (isActuallyPathBased) {
    const cached = (window as any).__tenantSlug as string | undefined;
    if (cached) return { mode: "path", slug: cached };
    const slug = extractSlugFromPath(pathname);
    if (slug) return { mode: "path", slug };
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
    hostname !== "allvita.com.br" &&
    hostname !== "app.allvita.com.br"
  ) {
    return { mode: "custom-domain", hostname };
  }

  return null;
};

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
  const fetchingRef = useRef<string | null>(null);

  useEffect(() => {
    const detected = detectTenant(window.location.hostname, window.location.pathname);
    setTenantMode(detected ? detected.mode : null);

    if (!detected) {
      setChecked(true);
      setIsLoading(false);
      setIsSubdomainAccess(false);
      return;
    }

    setIsSubdomainAccess(detected.mode === "subdomain" || detected.mode === "custom-domain");
    console.log("[useSubdomainTenant] Detected:", detected);

    // Prevent duplicate fetches for the same target
    const fetchKey = detected.mode === "custom-domain" ? detected.hostname : (detected as any).slug;
    if (fetchingRef.current === fetchKey && currentTenant) {
      console.log("[useSubdomainTenant] Already fetched for:", fetchKey);
      return;
    }
    fetchingRef.current = fetchKey;

    const loadTenant = async () => {
      setIsLoading(true);
      try {
        if (detected.mode === "custom-domain") {
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
        } else {
          const slug = (detected as any).slug;
          setTenantSlug(slug);
          const normalizedSlug = slug.replace(/-/g, "").toLowerCase();
          
          console.log("[useSubdomainTenant] Querying DB for slug:", slug);
          let { data, error } = await supabase
            .from("tenants")
            .select("id, name, trade_name, slug, logo_url, favicon_url, primary_color, secondary_color, domain, active, settings")
            .eq("slug", slug)
            .eq("active", true)
            .maybeSingle();

          if (!data && normalizedSlug !== slug) {
            console.log("[useSubdomainTenant] Slug not found, trying normalized:", normalizedSlug);
            const res = await supabase
              .from("tenants")
              .select("id, name, trade_name, slug, logo_url, favicon_url, primary_color, secondary_color, domain, active, settings")
              .eq("slug", normalizedSlug)
              .eq("active", true)
              .maybeSingle();
            data = res.data;
          }

          if (data) {
            console.log("[useSubdomainTenant] Tenant loaded from DB:", data.slug);
            setCurrentTenant(data as Tenant);
          } else {
            console.log("[useSubdomainTenant] No tenant found for slug in DB:", slug);
            if (error) console.error("[useSubdomainTenant] DB Error:", error);
          }
        }
      } catch (err) {
        console.error("[useSubdomainTenant] Unexpected error:", err);
      } finally {
        setChecked(true);
        setIsLoading(false);
      }
    };

    loadTenant();
  }, [tenantQueryParam, setIsLoading, setCurrentTenant, setIsSubdomainAccess, setTenantMode, currentTenant]);

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
