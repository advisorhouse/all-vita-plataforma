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

    const tenantName = currentTenant?.trade_name || currentTenant?.name || slugToName(tenantParam);
    const tenantLogo = currentTenant?.logo_url || logoVisionLift;
    const tenantQuery = `tenant=${encodeURIComponent(tenantParam)}`;

    const PORTALS = [
      {
        icon: Users,
        title: `${tenantName} Club`,
        desc: "Área do assinante. Jornada, assinatura, conteúdo e acompanhamento.",
        cta: "Explorar experiência",
        href: `/club/start?${tenantQuery}`,
      },
      {
        icon: Handshake,
        title: `${tenantName} Partner`,
        desc: "Área do parceiro. Formação, catálogo, comissões e crescimento recorrente.",
        cta: "Explorar experiência",
        href: `/partner/start?${tenantQuery}`,
      },
      {
        icon: Settings,
        title: `${tenantName} Core`,
        desc: "Administração. Gestão completa da operação, dados e estratégia.",
        cta: "Acessar administração",
        href: `/core/select-role?${tenantQuery}`,
      },
    ];

    return (
      <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl flex flex-col items-center text-center">
          {/* Logo */}
          <img
            src={tenantLogo}
            alt={tenantName}
            className="h-10 w-auto object-contain mb-8"
          />

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {tenantName} Platform
          </h1>

          {/* Description */}
          <p className="mt-5 text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
            {tenantName} Platform é o ecossistema digital que conecta clientes, parceiros e administração em uma única infraestrutura inteligente. A plataforma organiza a jornada de longevidade visual dos assinantes, estrutura o crescimento recorrente dos parceiros e oferece à gestão uma visão completa de dados, retenção e performance.
          </p>

          {/* Subtitle */}
          <p className="mt-6 text-sm text-muted-foreground">
            Selecione o ambiente para continuar.
          </p>

          {/* Portal Cards */}
          <div className="mt-10 grid gap-5 sm:grid-cols-3 w-full">
            {PORTALS.map((portal) => {
              const Icon = portal.icon;
              return (
                <Card
                  key={portal.title}
                  className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">{portal.title}</h2>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {portal.desc}
                    </p>
                    <Button asChild variant="outline" className="w-full mt-auto">
                      <Link to={portal.href}>{portal.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          <p className="mt-12 text-xs text-muted-foreground/60">
            Powered by <span className="font-medium">All Vita</span>
          </p>
        </div>
      </div>
    );
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
