import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";

const DEFAULT_TITLE = "All Vita | Plataforma";
const DEFAULT_FAVICON = "/favicon.ico";

/**
 * Helper to convert hex to HSL space-separated string for shadcn variables
 */
function hexToHslVariables(hex: string): string {
  if (!hex) return "";
  
  // Remove # if present
  hex = hex.replace("#", "");
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Applies tenant branding: CSS colors, document title, and favicon.
 * Re-runs on every route change to ensure branding persists across navigation.
 * Falls back to defaults when no tenant is active.
 */
export function useTenantBranding() {
  const { currentTenant } = useTenant();
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;

    if (currentTenant) {
      // Direct hex variables for custom use
      root.style.setProperty("--tenant-primary", currentTenant.primary_color);
      root.style.setProperty("--tenant-secondary", currentTenant.secondary_color);
      
      // Override shadcn theme variables
      // User said Cor 1 (primary) = Background, Cor 2 (secondary) = Buttons
      if (currentTenant.primary_color) {
        const primaryHsl = hexToHslVariables(currentTenant.primary_color);
        root.style.setProperty("--sidebar-background", primaryHsl);
      }
      
      if (currentTenant.secondary_color) {
        const secondaryHsl = hexToHslVariables(currentTenant.secondary_color);
        root.style.setProperty("--accent", secondaryHsl);
        root.style.setProperty("--ring", secondaryHsl);
      }

      root.dataset.tenant = currentTenant.slug;

      const displayName = currentTenant.trade_name || currentTenant.name;
      document.title = `${displayName} | Plataforma`;

      // Dynamic favicon (fall back to default if tenant has none)
      setFavicon(currentTenant.favicon_url || DEFAULT_FAVICON);
    } else {
      root.style.removeProperty("--tenant-primary");
      root.style.removeProperty("--tenant-secondary");
      root.style.removeProperty("--sidebar-background");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--ring");
      delete root.dataset.tenant;
      document.title = DEFAULT_TITLE;
      setFavicon(DEFAULT_FAVICON);
    }

    return () => {
      // Keep cleaning up
      root.style.removeProperty("--tenant-primary");
      root.style.removeProperty("--tenant-secondary");
      root.style.removeProperty("--sidebar-background");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--ring");
      delete root.dataset.tenant;
      document.title = DEFAULT_TITLE;
      setFavicon(DEFAULT_FAVICON);
    };
  }, [currentTenant?.id, currentTenant?.trade_name, currentTenant?.name, currentTenant?.favicon_url, pathname]);
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
