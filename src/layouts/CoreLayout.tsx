import React from "react";
import AppShell from "@/components/layout/AppShell";
import { Home, Users, Package, DollarSign, BarChart3, Settings, Shield, Handshake, Percent, Brain, Gift, Bell, ShoppingBag } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

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

const CoreLayout: React.FC = () => {
  const location = useLocation();
  const headerTitle = pageTitles[location.pathname] || "Vision Core";

  return (
    <AppShell
      sidebarTitle="Vision Lift"
      sidebarSubtitle="Core"
      sidebarLinks={coreLinks}
      sidebarAccentLabel="Admin"
      headerTitle={headerTitle}
    >
      <Outlet />
    </AppShell>
  );
};

export default CoreLayout;
