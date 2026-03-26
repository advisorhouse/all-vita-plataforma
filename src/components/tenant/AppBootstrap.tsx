import { useMemberships } from "@/hooks/useMemberships";
import { useTenantBranding } from "@/hooks/useTenantBranding";

/**
 * Invisible component that bootstraps tenant context:
 * - Fetches memberships when user is logged in
 * - Applies tenant branding CSS variables
 */
const AppBootstrap: React.FC = () => {
  useMemberships();
  useTenantBranding();
  return null;
};

export default AppBootstrap;
