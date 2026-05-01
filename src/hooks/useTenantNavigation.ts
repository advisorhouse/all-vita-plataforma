import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useCallback } from "react";
import { useTenant } from "@/contexts/TenantContext";

/**
 * A wrapper around useNavigate that automatically handles tenant paths (/:slug/...)
 * or preserves the ?tenant= query parameter in dev environments.
 */
export function useTenantNavigation() {
  const navigate = useNavigate();
  const { slug: routeSlug } = useParams();
  const { currentTenant, isSubdomainAccess, tenantMode } = useTenant();
  const [searchParams] = useSearchParams();
  const tenantQueryParam = searchParams.get("tenant");
  
  // CRITICAL: If we are in subdomain mode, NEVER use routeSlug or currentTenant.slug as a path prefix
  const activeSlug = (isSubdomainAccess || tenantMode === "subdomain") ? null : (routeSlug || currentTenant?.slug);

  const tenantNavigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      const [basePath, existingQuery] = path.split("?");
      const params = new URLSearchParams(existingQuery || "");

      let finalBasePath = basePath;
      const tenantAwareRoots = ["/core", "/club", "/partner", "/auth", "/onboarding"];
      const needsSlug = tenantAwareRoots.some(p => basePath === p || basePath.startsWith(`${p}/`));
      
      // CRITICAL: NEVER include the slug in the path if we are on a subdomain (checked via isSubdomainAccess)
      if (activeSlug && needsSlug && !isSubdomainAccess && !basePath.startsWith(`/${activeSlug}/`) && basePath !== `/${activeSlug}`) {
        finalBasePath = `/${activeSlug}${basePath}`;
        console.log("[useTenantNavigation] Path rewrite applied (PATH MODE):", finalBasePath);
      }

      if (tenantQueryParam && !params.has("tenant")) {
        params.set("tenant", tenantQueryParam);
      }

      const qs = params.toString();
      const finalUrl = `${finalBasePath}${qs ? `?${qs}` : ""}`;
      
      // Ensure we don't accidentally redirect to app.allvita.com.br
      if (isSubdomainAccess && finalUrl.startsWith("http") && !finalUrl.includes(window.location.hostname)) {
        console.warn("[useTenantNavigation] Preventing cross-domain redirect to:", finalUrl);
        return;
      }

      navigate(finalUrl, options);
    },
    [navigate, activeSlug, tenantQueryParam, isSubdomainAccess]
  );

  /** Build a path string with tenant slug/param preserved (for Link `to` props) */
  const tenantPath = useCallback(
    (path: string) => {
      const [basePath, existingQuery] = path.split("?");
      const params = new URLSearchParams(existingQuery || "");
      
      let finalBasePath = basePath;
      const tenantAwareRoots = ["/core", "/club", "/partner", "/auth", "/onboarding"];
      const needsSlug = tenantAwareRoots.some(p => basePath === p || basePath.startsWith(`${p}/`));

      // CRITICAL: NEVER include the slug in the path if we are on a subdomain (checked via isSubdomainAccess)
      if (activeSlug && needsSlug && !isSubdomainAccess && !basePath.startsWith(`/${activeSlug}/`) && basePath !== `/${activeSlug}`) {
        finalBasePath = `/${activeSlug}${basePath}`;
      }

      if (tenantQueryParam && !params.has("tenant")) {
        params.set("tenant", tenantQueryParam);
      }
      
      const qs = params.toString();
      return `${finalBasePath}${qs ? `?${qs}` : ""}`;
    },
    [activeSlug, tenantQueryParam, isSubdomainAccess]
  );

  return { 
    navigate: tenantNavigate, 
    tenantPath, 
    tenantParam: tenantQueryParam,
    activeSlug 
  };
}
