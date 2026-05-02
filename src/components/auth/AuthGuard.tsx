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
    isLoading: tenantLoading,
    isInitialized
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
      // If we are currently loading tenant info, wait for it
      if (!isInitialized) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("must_change_password, onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("[AuthGuard] Error fetching profile:", error);
          setOnboardingChecked(true);
          return;
        }

        if (profile) {
          const hasNonComplete = profile.must_change_password || !profile.onboarding_completed;
          console.log("[AuthGuard] Profile check:", { 
            id: user.id, 
            must_change_password: profile.must_change_password, 
            onboarding_completed: profile.onboarding_completed,
            needsOnboarding: hasNonComplete
          });
          setNeedsOnboarding(!!hasNonComplete);
        } else {
          console.warn("[AuthGuard] No profile found for user:", user.id);
        }
      } catch (err) {
        console.error("[AuthGuard] Unexpected error checking profile:", err);
      } finally {
        setOnboardingChecked(true);
      }
    };

    checkOnboarding();
  }, [user, location.pathname, isInitialized]);

  // user && tenantLoading logic: 
  // If we HAVE a user, we MUST wait for the tenant info to be loaded (memberships/bootstrap) 
  // to avoid flashing empty states or incorrect redirects.
  if (authLoading || (user && !isInitialized) || !onboardingChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground mx-auto" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">Sincronizando ambiente</p>
        </div>
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
    
    // If we are on a subdomain, we stay on /auth/login ON THIS DOMAIN
    const isActuallySubdomain = typeof window !== "undefined" && 
                               window.location.hostname !== "app.allvita.com.br" && 
                               window.location.hostname !== "all-vita-plataforma.lovable.app" &&
                               (window.location.hostname.endsWith(".allvita.com.br") || 
                                window.location.hostname.endsWith(".lovable.app") ||
                                window.location.hostname.endsWith(".lovableproject.com"));
    
    const loginPath = isActuallySubdomain ? "/auth/login" : (activeSlug ? `/${activeSlug}/auth/login` : "/auth/login");
    
    console.log("[AuthGuard] Not logged in. Host:", window.location.hostname, "isActuallySubdomain:", isActuallySubdomain, "Redirecting to:", loginPath);
    return <Navigate to={`${loginPath}${search}`} state={{ from: location }} replace />;
  }

  // Redirect to onboarding if needed (but not if already on onboarding page)
  if (needsOnboarding && !location.pathname.endsWith("/onboarding")) {
    const onboardingPath = isSubdomainAccess ? "/onboarding" : (activeSlug ? `/${activeSlug}/onboarding` : "/onboarding");
    console.log("[AuthGuard] Redirecting to onboarding:", onboardingPath, "Current location:", location.pathname);
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground mx-auto" />
          <h1 className="text-xl font-semibold">Validando acesso...</h1>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto verificamos suas permissões.
          </p>
        </div>
      </div>
    );
  }

  // 1. Super admin protection for /admin
  if (location.pathname.startsWith("/admin")) {
    if (isSuperAdmin || platformRole === 'super_admin' || platformRole === 'admin') {
      return <>{children}</>;
    }
    const fallback = isSubdomainAccess ? "/core" : (activeSlug ? `/${activeSlug}/core` : "/core");
    return <Navigate to={fallback} replace />;
  }

  // 2. Prevent staff from entering /core if they have no tenant context
  if (location.pathname.includes("/core") && (isSuperAdmin || platformRole) && !currentTenant && !activeSlug) {
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
      const onboardingPath = isSubdomainAccess ? "/onboarding" : (activeSlug ? `/${activeSlug}/onboarding` : "/onboarding");
      return <Navigate to={onboardingPath} replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
