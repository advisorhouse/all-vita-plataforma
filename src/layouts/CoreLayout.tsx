import React from "react";
import AppShell from "@/components/layout/AppShell";
import { Home, Users, Package, DollarSign, BarChart3, Settings, Shield, Handshake, Percent, Brain, Gift, ShoppingBag, Plug } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";
import TenantSwitcher from "@/components/tenant/TenantSwitcher";

const coreLinks = [
  { label: "Dashboard", href: "/core", icon: Home },
  { label: "Assinaturas", href: "/core/subscriptions", icon: Package },
  { label: "Clientes", href: "/core/customers", icon: Users },
  { label: "Partners", href: "/core/partners", icon: Handshake },
  { label: "Financeiro", href: "/core/finance", icon: DollarSign },
  { label: "Comissões", href: "/core/commissions", icon: Percent },
  { label: "Insights & BI", href: "/core/reports", icon: Brain },
  { label: "Gamificação", href: "/core/gamification", icon: Gift },
  { label: "Produtos", href: "/core/products", icon: ShoppingBag },
  { label: "Integrações", href: "/core/integrations", icon: Plug },
  { label: "Permissões", href: "/core/permissions", icon: Shield },
  { label: "Configurações", href: "/core/settings", icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/core": "Dashboard",
  "/core/customers": "Clientes",
  "/core/partners": "Gestão de Partners",
  "/core/subscriptions": "Assinaturas",
  "/core/commissions": "Comissões",
  "/core/finance": "Financeiro",
  "/core/reports": "Insights & BI",
  "/core/gamification": "Gamificação",
  "/core/products": "Catálogo de Produtos",
  "/core/permissions": "Permissões",
  "/core/settings": "Configurações",
};

const PoweredByFooter: React.FC = () => (
  <p className="text-[10px] text-muted-foreground text-center py-2">
    Powered by <span className="font-medium">All Vita</span>
  </p>
);

const CoreLayout: React.FC = () => {
  const location = useLocation();
  const { currentTenant } = useTenant();
  const headerTitle = pageTitles[location.pathname] || "Admin";
  const tenantName = currentTenant?.name || "Vision Lift";

  return (
    <AppShell
      sidebarTitle={tenantName}
      sidebarSubtitle="Core"
      sidebarLinks={coreLinks}
      sidebarAccentLabel="Admin"
      sidebarHeader={<TenantSwitcher />}
      sidebarFooter={<PoweredByFooter />}
      headerTitle={headerTitle}
    >
      <Outlet />
    </AppShell>
  );
};

export default CoreLayout;
