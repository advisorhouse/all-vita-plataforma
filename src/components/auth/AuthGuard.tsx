import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import TenantSelectScreen from "@/components/tenant/TenantSelectScreen";

interface AuthGuardProps {
  children: React.ReactNode;
  requireTenant?: boolean;
  requiredRole?: 'super_admin' | 'admin' | 'manager' | 'partner' | 'client';
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireTenant = true,
  requiredRole
}) => {
  const { user, loading } = useAuth();
  const { currentTenant, availableTenants, isSuperAdmin, platformRole, memberships, isSubdomainAccess } = useTenant();
  const location = useLocation();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!user || location.pathname === "/onboarding") {
      setOnboardingChecked(true);
      return;
    }

    const checkOnboarding = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile && (profile.must_change_password || !profile.onboarding_completed)) {
        // Check if user has any non-super_admin memberships (tenant users need onboarding)
        const hasNonComplete = profile.must_change_password || !profile.onboarding_completed;
        setNeedsOnboarding(hasNonComplete);
      }
      setOnboardingChecked(true);
    };

    checkOnboarding();
  }, [user, location.pathname]);

  if (loading || !onboardingChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    );
  }

  if (!user) {
    const tenantParam = new URLSearchParams(location.search).get("tenant");
    const publicTenantPaths = ["/", "/club/start", "/partner/start", "/core/select-role"];
    if (tenantParam && publicTenantPaths.includes(location.pathname)) {
      return <>{children}</>;
    }

    const search = location.search || window.location.search;
    return <Navigate to={`/auth/login${search}`} state={{ from: location }} replace />;
  }

  // Redirect to onboarding if needed (but not if already on onboarding page)
  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // Super admin without tenant context goes to admin
  if (isSuperAdmin && !currentTenant && location.pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  // Need tenant but none selected + multiple available (skip if subdomain access — will auto-select)
  if (requireTenant && !currentTenant && availableTenants.length > 1 && !isSubdomainAccess) {
    return <TenantSelectScreen />;
  }

  // Need tenant but none available (no memberships yet)
  if (requireTenant && !currentTenant && availableTenants.length === 0 && memberships.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold">Sem acesso</h1>
          <p className="text-sm text-muted-foreground">
            Você ainda não foi vinculado a nenhuma empresa. Contate o administrador.
          </p>
        </div>
      </div>
    );
  }

  // 1. Super admin protection for /admin
  if (location.pathname.startsWith("/admin") && !isSuperAdmin && !platformRole) {
    return <Navigate to="/core" replace />;
  }

  // 2. Prevent staff from entering /core if they have no tenant context
  if (location.pathname.startsWith("/core") && isSuperAdmin && !currentTenant) {
    return <Navigate to="/admin" replace />;
  }

  // 3. Granular Role validation if specified in Route
  if (requiredRole) {
    // If we have memberships, check if user has the required role for the current context
    const hasRole = memberships.some(m => 
      m.active && 
      (m.role === (requiredRole as any) || m.role === 'super_admin') &&
      (requireTenant ? m.tenant_id === currentTenant?.id : true)
    );

    if (!hasRole && !isSuperAdmin) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
