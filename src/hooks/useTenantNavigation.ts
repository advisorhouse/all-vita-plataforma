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
  const { currentTenant, isSubdomainAccess } = useTenant();
  const [searchParams] = useSearchParams();
  const tenantQueryParam = searchParams.get("tenant");
  
  // Use slug from URL if present, otherwise from context
  const activeSlug = routeSlug || currentTenant?.slug;

  const tenantNavigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      const [basePath, existingQuery] = path.split("?");
      const params = new URLSearchParams(existingQuery || "");

      let finalBasePath = basePath;
      const tenantAwareRoots = ["/core", "/club", "/partner", "/auth", "/onboarding"];
      const needsSlug = tenantAwareRoots.some(p => basePath === p || basePath.startsWith(`${p}/`));
      
      if (activeSlug && needsSlug && !isSubdomainAccess && !basePath.startsWith(`/${activeSlug}/`) && basePath !== `/${activeSlug}`) {
        finalBasePath = `/${activeSlug}${basePath}`;
        console.log("[useTenantNavigation] Path rewrite applied:", finalBasePath);
      } else if (isSubdomainAccess) {
        console.log("[useTenantNavigation] Subdomain access, skipping path slug rewrite");
      }

      if (tenantQueryParam && !params.has("tenant")) {
        params.set("tenant", tenantQueryParam);
      }

      const qs = params.toString();
      navigate(`${finalBasePath}${qs ? `?${qs}` : ""}`, options);
    },
    [navigate, activeSlug, tenantQueryParam]
  );

  /** Build a path string with tenant slug/param preserved (for Link `to` props) */
  const tenantPath = useCallback(
    (path: string) => {
      const [basePath, existingQuery] = path.split("?");
      const params = new URLSearchParams(existingQuery || "");
      
      let finalBasePath = basePath;
      const tenantAwareRoots = ["/core", "/club", "/partner", "/auth", "/onboarding"];
      const needsSlug = tenantAwareRoots.some(p => basePath === p || basePath.startsWith(`${p}/`));

      if (activeSlug && needsSlug && !isSubdomainAccess && !basePath.startsWith(`/${activeSlug}/`) && basePath !== `/${activeSlug}`) {
        finalBasePath = `/${activeSlug}${basePath}`;
      }

      if (tenantQueryParam && !params.has("tenant")) {
        params.set("tenant", tenantQueryParam);
      }
      
      const qs = params.toString();
      return `${finalBasePath}${qs ? `?${qs}` : ""}`;
    },
    [activeSlug, tenantQueryParam]
  );

  return { 
    navigate: tenantNavigate, 
    tenantPath, 
    tenantParam: tenantQueryParam,
    activeSlug 
  };
}
