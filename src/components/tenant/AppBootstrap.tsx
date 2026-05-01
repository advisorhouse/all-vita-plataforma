import React, { useState, useEffect } from "react";
import { useMemberships } from "@/hooks/useMemberships";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useSubdomainTenant } from "@/hooks/useSubdomainTenant";
import { usePartnerTracking } from "@/hooks/usePartnerTracking";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";

/**
 * Invisible component that bootstraps tenant context:
 * - Fetches memberships when user is logged in
 * - Applies tenant branding CSS variables
 * - Detects subdomain and auto-selects tenant
 * - Captures partner referral codes
 */
const AppBootstrap: React.FC = () => {
  const { user } = useAuth();
  const { currentTenant, isLoading: tenantLoading } = useTenant();
  const [showSplash, setShowSplash] = useState(false);

  useMemberships();
  useTenantBranding();
  useSubdomainTenant();
  usePartnerTracking();

  // Show splash screen only if we have a user but are still resolving the tenant context
  // to avoid flashing the All Vita default branding.
  useEffect(() => {
    if (user && tenantLoading && !currentTenant) {
      const timer = setTimeout(() => setShowSplash(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, [user, tenantLoading, currentTenant]);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground mx-auto" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">Sincronizando</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AppBootstrap;
