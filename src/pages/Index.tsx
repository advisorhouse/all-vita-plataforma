import { Navigate, Link, useSearchParams } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const slugToName = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const Index = () => {
  const { user, loading } = useAuth();
  const { isSuperAdmin, memberships, currentTenant, userRole, availableTenants } = useTenant();
  const [searchParams] = useSearchParams();
  const tenantParam = searchParams.get("tenant");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    );
  }

  if (!user) {
    if (!tenantParam) {
      const search = window.location.search;
      return <Navigate to={`/auth/login${search}`} replace />;
    }

    const tenantName = currentTenant?.name || slugToName(tenantParam);
    const tenantQuery = `tenant=${encodeURIComponent(tenantParam)}`;

    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{tenantName} Platform</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
              {tenantName} Platform é o ecossistema digital que conecta clientes, parceiros e administração em uma única infraestrutura inteligente. A plataforma organiza a jornada de longevidade visual dos assinantes, estrutura o crescimento recorrente dos parceiros e oferece à gestão uma visão completa de dados, retenção e performance.
            </p>
            <p className="text-sm font-medium text-foreground">Selecione o ambiente para continuar.</p>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-border">
              <CardContent className="space-y-3 p-5">
                <h2 className="text-lg font-semibold text-foreground">{tenantName} Club</h2>
                <p className="text-sm text-muted-foreground">Área do assinante. Jornada, assinatura, conteúdo e acompanhamento.</p>
                <Button asChild className="w-full">
                  <Link to={`/club/start?${tenantQuery}`}>Explorar experiência</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="space-y-3 p-5">
                <h2 className="text-lg font-semibold text-foreground">{tenantName} Partner</h2>
                <p className="text-sm text-muted-foreground">Área do parceiro. Formação, catálogo, comissões e crescimento recorrente.</p>
                <Button asChild className="w-full">
                  <Link to={`/partner/start?${tenantQuery}`}>Explorar experiência</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="space-y-3 p-5">
                <h2 className="text-lg font-semibold text-foreground">{tenantName} Core</h2>
                <p className="text-sm text-muted-foreground">Administração. Gestão completa da operação, dados e estratégia.</p>
                <Button asChild className="w-full">
                  <Link to={`/core/select-role?${tenantQuery}`}>Acessar administração</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    );
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
