import { useMemberships } from "@/hooks/useMemberships";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useSubdomainTenant } from "@/hooks/useSubdomainTenant";

/**
 * Invisible component that bootstraps tenant context:
 * - Fetches memberships when user is logged in
 * - Applies tenant branding CSS variables
 * - Detects subdomain and auto-selects tenant
 */
const AppBootstrap: React.FC = () => {
  useMemberships();
  useTenantBranding();
  useSubdomainTenant();
  return null;
};

export default AppBootstrap;
