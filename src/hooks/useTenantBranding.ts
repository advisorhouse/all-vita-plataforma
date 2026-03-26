import { useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";

/**
 * Applies tenant branding (colors) as CSS custom properties on :root.
 * Falls back to defaults when no tenant is active.
 */
export function useTenantBranding() {
  const { currentTenant } = useTenant();

  useEffect(() => {
    const root = document.documentElement;

    if (currentTenant) {
      root.style.setProperty("--tenant-primary", currentTenant.primary_color);
      root.style.setProperty("--tenant-secondary", currentTenant.secondary_color);
      root.dataset.tenant = currentTenant.slug;
    } else {
      root.style.removeProperty("--tenant-primary");
      root.style.removeProperty("--tenant-secondary");
      delete root.dataset.tenant;
    }

    return () => {
      root.style.removeProperty("--tenant-primary");
      root.style.removeProperty("--tenant-secondary");
      delete root.dataset.tenant;
    };
  }, [currentTenant]);
}
