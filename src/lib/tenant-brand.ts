import logoAllVita from "@/assets/logo-allvita.png";

/**
 * Returns normalized tenant brand info, always prioritizing trade_name over name.
 */
export function getTenantBrand(tenant?: {
  trade_name?: string | null;
  name?: string | null;
  logo_url?: string | null;
} | null) {
  return {
    displayName: tenant?.trade_name?.trim() || tenant?.name?.trim() || "All Vita",
    logoUrl: tenant?.logo_url?.trim() || logoAllVita,
  };
}
