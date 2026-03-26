import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import TenantSelectScreen from "@/components/tenant/TenantSelectScreen";

interface AuthGuardProps {
  children: React.ReactNode;
  requireTenant?: boolean;
}

/**
 * Guards routes requiring authentication.
 * - Redirects to /auth/login if not authenticated
 * - Shows tenant selection if user has multiple tenants
 * - Passes through if authenticated + tenant selected (or not required)
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireTenant = true }) => {
  const { user, loading } = useAuth();
  const { currentTenant, availableTenants, isSuperAdmin, memberships } = useTenant();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Super admin without tenant context goes to admin
  if (isSuperAdmin && !currentTenant && location.pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  // Need tenant but none selected + multiple available
  if (requireTenant && !currentTenant && availableTenants.length > 1) {
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

  return <>{children}</>;
};

export default AuthGuard;
