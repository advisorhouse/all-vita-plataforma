import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import TenantSelectScreen from "@/components/tenant/TenantSelectScreen";
import { extractSlugFromPath } from "@/lib/tenant-routing";

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
  const { user, loading: authLoading } = useAuth();
  const { 
    currentTenant, 
    availableTenants, 
    isSuperAdmin, 
    platformRole, 
    memberships, 
    isSubdomainAccess,
    isLoading: tenantLoading
  } = useTenant();
  const location = useLocation();
  const params = useParams();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Determine active tenant slug from route params, context, or URL fallback
  const activeSlug = (params as any).slug 
    || currentTenant?.slug 
    || extractSlugFromPath(location.pathname);

  useEffect(() => {
    if (!user || location.pathname.endsWith("/onboarding")) {
      setOnboardingChecked(true);
      return;
    }

    const checkOnboarding = async () => {
      // Small delay to let TenantContext/Memberships settle if we just logged in
      if (tenantLoading) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile) {
        const hasNonComplete = profile.must_change_password || !profile.onboarding_completed;
        
        // If they need onboarding, double check if they are actually a tenant user or just a super admin
        // Super admins might not need onboarding if they don't have tenant-specific duties, 
        // but typically all users created via tenant-onboarding get these flags.
        if (hasNonComplete) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      }
      setOnboardingChecked(true);
    };

    checkOnboarding();
  }, [user, location.pathname, tenantLoading]);

  if (authLoading || tenantLoading || !onboardingChecked) {
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
    const loginPath = activeSlug && !isSubdomainAccess ? `/${activeSlug}/auth/login` : "/auth/login";
    return <Navigate to={`${loginPath}${search}`} state={{ from: location }} replace />;
  }

  // Redirect to onboarding if needed (but not if already on onboarding page)
  if (needsOnboarding && !location.pathname.endsWith("/onboarding")) {
    const onboardingPath = activeSlug && !isSubdomainAccess ? `/${activeSlug}/onboarding` : "/onboarding";
    return <Navigate to={onboardingPath} replace />;
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
    const fallback = activeSlug && !isSubdomainAccess ? `/${activeSlug}/core` : "/core";
    return <Navigate to={fallback} replace />;
  }

  // 2. Prevent staff from entering /core if they have no tenant context
  if (location.pathname.includes("/core") && isSuperAdmin && !currentTenant && !activeSlug) {
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

    if (!hasRole && !isSuperAdmin && !(location.pathname.startsWith("/admin") && platformRole)) {
      const onboardingPath = activeSlug ? `/${activeSlug}/onboarding` : "/onboarding";
      return <Navigate to={onboardingPath} replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
