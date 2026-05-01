import { useEffect } from "react";
import { useMemberships } from "@/hooks/useMemberships";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useSubdomainTenant } from "@/hooks/useSubdomainTenant";
import { usePartnerTracking } from "@/hooks/usePartnerTracking";
import { useTenant } from "@/contexts/TenantContext";

/**
 * Invisible component that bootstraps tenant context:
 * - Fetches memberships when user is logged in
 * - Applies tenant branding CSS variables
 * - Detects subdomain and auto-selects tenant
 * - Captures partner referral codes
 */
const AppBootstrap = () => {
  const { loading: membershipsLoading } = useMemberships();
  const { loading: tenantLoading } = useSubdomainTenant();
  const { setInitialized } = useTenant();
  
  useTenantBranding();
  usePartnerTracking();

  useEffect(() => {
    // Both critical boot hooks must be finished before we mark the app as initialized
    if (!membershipsLoading && !tenantLoading) {
      console.log("[AppBootstrap] Context initialized.");
      setInitialized(true);
    }
  }, [membershipsLoading, tenantLoading, setInitialized]);

  return null;
};

export default AppBootstrap;
