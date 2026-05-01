import { useMemberships } from "@/hooks/useMemberships";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useSubdomainTenant } from "@/hooks/useSubdomainTenant";
import { usePartnerTracking } from "@/hooks/usePartnerTracking";

/**
 * Invisible component that bootstraps tenant context:
 * - Fetches memberships when user is logged in
 * - Applies tenant branding CSS variables
 * - Detects subdomain and auto-selects tenant
 * - Captures partner referral codes
 */
const AppBootstrap = () => {
  useMemberships();
  useTenantBranding();
  useSubdomainTenant();
  usePartnerTracking();
  return null;
};

export default AppBootstrap;
