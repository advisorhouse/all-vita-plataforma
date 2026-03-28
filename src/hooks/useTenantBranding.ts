import { useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";

const DEFAULT_TITLE = "All Vita | Plataforma";
const DEFAULT_FAVICON = "/favicon.ico";

/**
 * Applies tenant branding: CSS colors, document title, and favicon.
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

      const displayName = currentTenant.trade_name || currentTenant.name;
      document.title = `${displayName} | Plataforma`;

      // Dynamic favicon
      if (currentTenant.favicon_url) {
        setFavicon(currentTenant.favicon_url);
      }
    } else {
      root.style.removeProperty("--tenant-primary");
      root.style.removeProperty("--tenant-secondary");
      delete root.dataset.tenant;
      document.title = DEFAULT_TITLE;
      setFavicon(DEFAULT_FAVICON);
    }

    return () => {
      root.style.removeProperty("--tenant-primary");
      root.style.removeProperty("--tenant-secondary");
      delete root.dataset.tenant;
      document.title = DEFAULT_TITLE;
      setFavicon(DEFAULT_FAVICON);
    };
  }, [currentTenant]);
}

function setFavicon(url: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}
