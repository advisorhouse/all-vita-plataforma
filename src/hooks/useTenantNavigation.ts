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
  const { currentTenant } = useTenant();
  const [searchParams] = useSearchParams();
  const tenantQueryParam = searchParams.get("tenant");
  
  // Use slug from URL if present, otherwise from context
  const activeSlug = routeSlug || currentTenant?.slug;

  const tenantNavigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      const [basePath, existingQuery] = path.split("?");
      const params = new URLSearchParams(existingQuery || "");

      // If we have an active slug and the path doesn't already start with a slug-like segment
      // (and it's a tenant-aware route like /core, /club, /partner), we should prepend the slug.
      let finalBasePath = basePath;
      const needsSlug = ["/core", "/club", "/partner"].some(p => basePath.startsWith(p));
      
      if (activeSlug && needsSlug && !basePath.startsWith(`/${activeSlug}`)) {
        finalBasePath = `/${activeSlug}${basePath}`;
      }

      // Fallback for dev: preserve ?tenant=
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
      const needsSlug = ["/core", "/club", "/partner"].some(p => basePath.startsWith(p));

      if (activeSlug && needsSlug && !basePath.startsWith(`/${activeSlug}`)) {
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
