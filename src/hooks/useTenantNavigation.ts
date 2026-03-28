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
      if (tenantParam && !path.includes("tenant=")) {
        const separator = path.includes("?") ? "&" : "?";
        navigate(`${path}${separator}tenant=${encodeURIComponent(tenantParam)}`, options);
      } else {
        navigate(path, options);
      }
    },
    [navigate, tenantParam]
  );

  /** Build a path string with tenant param preserved (for Link `to` props) */
  const tenantPath = useCallback(
    (path: string) => {
      if (tenantParam && !path.includes("tenant=")) {
        const separator = path.includes("?") ? "&" : "?";
        return `${path}${separator}tenant=${encodeURIComponent(tenantParam)}`;
      }
      return path;
    },
    [tenantParam]
  );

  return { navigate: tenantNavigate, tenantPath, tenantParam };
}
