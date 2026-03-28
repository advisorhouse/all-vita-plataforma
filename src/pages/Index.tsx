import { Navigate } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const { isSuperAdmin, memberships, currentTenant, userRole, availableTenants } = useTenant();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    );
  }

  if (!user) {
    const search = window.location.search;
    return <Navigate to={`/auth/login${search}`} replace />;
  }

  // Wait for memberships to load
  if (memberships.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    );
  }

  // Super admin → admin panel
  if (isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // If tenant is selected, redirect by role
  if (currentTenant && userRole) {
    switch (userRole) {
      case "admin":
      case "manager":
        return <Navigate to="/core" replace />;
      case "partner":
        return <Navigate to="/partner" replace />;
      case "client":
        return <Navigate to="/club" replace />;
      default:
        return <Navigate to="/core" replace />;
    }
  }

  // Multiple tenants, no selection yet — AuthGuard will handle tenant selection
  if (availableTenants.length > 1 && !currentTenant) {
    return <Navigate to="/core" replace />;
  }

  // Single tenant, auto-selected
  if (availableTenants.length === 1) {
    const role = memberships.find((m) => m.tenant_id === availableTenants[0].id)?.role;
    switch (role) {
      case "admin":
      case "manager":
        return <Navigate to="/core" replace />;
      case "partner":
        return <Navigate to="/partner" replace />;
      case "client":
        return <Navigate to="/club" replace />;
      default:
        return <Navigate to="/core" replace />;
    }
  }

  // Fallback
  return <Navigate to="/auth/login" replace />;
};

export default Index;
