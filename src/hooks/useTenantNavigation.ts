import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback } from "react";

/**
 * A wrapper around useNavigate that automatically preserves the ?tenant= query parameter.
 */
export function useTenantNavigation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantParam = searchParams.get("tenant");

  const tenantNavigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      let finalPath = path;
      const [basePath, existingQuery] = path.split("?");
      const params = new URLSearchParams(existingQuery || "");

      // If we are in a tenant context and the path doesn't start with a slash and a slug, prepend it
      // However, React Router with :slug will handle it if we just provide the path relative to root
      // or if we use absolute paths.
      
      // For now, focus on preserving the tenant query param as a fallback
      if (tenantParam && !params.has("tenant")) {
        params.set("tenant", tenantParam);
      }

      const qs = params.toString();
      navigate(`${basePath}${qs ? `?${qs}` : ""}`, options);
    },
    [navigate, tenantParam]
  );

  /** Build a path string with tenant param preserved (for Link `to` props) */
  const tenantPath = useCallback(
    (path: string) => {
      const [basePath, existingQuery] = path.split("?");
      const params = new URLSearchParams(existingQuery || "");
      
      if (tenantParam && !params.has("tenant")) {
        params.set("tenant", tenantParam);
      }
      
      const qs = params.toString();
      return `${basePath}${qs ? `?${qs}` : ""}`;
    },
    [tenantParam]
  );

  return { navigate: tenantNavigate, tenantPath, tenantParam };
}
