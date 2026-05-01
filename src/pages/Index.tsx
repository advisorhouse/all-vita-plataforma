import { Navigate, Link, useSearchParams } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Handshake, Settings } from "lucide-react";
import logoVisionLift from "@/assets/logo-vision-lift.png";

const slugToName = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, memberships, currentTenant, userRole, availableTenants, isLoading: tenantLoading } = useTenant();
  const [searchParams] = useSearchParams();
  const tenantParam = searchParams.get("tenant");

  // Wait for both auth and tenant/memberships/staff status to load
  if (authLoading || tenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    );
  }

  if (!user) {
    const hostname = window.location.hostname;
    const isAllVitaBase = hostname === "allvita.com.br" || hostname === "app.allvita.com.br";
    const isSubdomain = !isAllVitaBase && (hostname.endsWith(".allvita.com.br") || hostname.endsWith(".lovable.app"));

    console.log("[Index] Auth check. User:", !!user, "isSubdomain:", isSubdomain, "Hostname:", hostname);

    if (isSubdomain) {
      console.log("[Index] Subdomain access, STAYING on current domain at /auth/login");
      return <Navigate to="/auth/login" replace />;
    }

    if (!tenantParam) {
      console.log("[Index] No tenant param on main app, going to global login");
      return <Navigate to="/auth/login" replace />;
    }

    console.log("[Index] Redirecting to login with tenant param:", tenantParam);
    return <Navigate to={`/auth/login?tenant=${tenantParam}`} replace />;
  }

  // If no memberships yet and no tenant context, show loader
  if (memberships.length === 0 && !currentTenant && !isSuperAdmin) {
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

  // Multiple tenants, no selection yet
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

  // Fallback if user is logged in but has no access
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Sem acesso</h1>
        <p className="text-sm text-muted-foreground">
          Você está logado mas não possui acesso a nenhuma empresa.
        </p>
      </div>
    </div>
  );
};

export default Index;
