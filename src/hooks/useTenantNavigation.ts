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
      // Parse existing params from the path
      const [basePath, existingQuery] = path.split("?");
      const params = new URLSearchParams(existingQuery || "");

      // Preserve tenant param
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
      if (!tenantParam) return path;
      const [basePath, existingQuery] = path.split("?");
      const params = new URLSearchParams(existingQuery || "");
      if (!params.has("tenant")) {
        params.set("tenant", tenantParam);
      }
      const qs = params.toString();
      return `${basePath}${qs ? `?${qs}` : ""}`;
    },
    [tenantParam]
  );

  return { navigate: tenantNavigate, tenantPath, tenantParam };
}
