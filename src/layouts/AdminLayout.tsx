import React from "react";
import AppShell from "@/components/layout/AppShell";
import { Home, Building2, Users, FileText, ShieldCheck, Settings, DollarSign, Coins, Plug, BarChart3 } from "lucide-react";
import { Outlet } from "react-router-dom";

const adminLinks = [
  { label: "Visão Geral", href: "/admin", icon: Home },
  { label: "Empresas", href: "/admin/tenants", icon: Building2 },
  { label: "Usuários", href: "/admin/users", icon: Users },
  { label: "Financeiro", href: "/admin/finance", icon: DollarSign },
  { label: "Vitacoins", href: "/admin/vitacoins", icon: Coins },
  { label: "Integrações", href: "/admin/integrations", icon: Plug },
  { label: "Auditoria", href: "/admin/audit", icon: FileText },
  { label: "Segurança", href: "/admin/security", icon: ShieldCheck },
  { label: "Configurações", href: "/admin/settings", icon: Settings },
];

const AdminLayout: React.FC = () => {
  return (
    <AppShell
      sidebarTitle="All Vita"
      sidebarSubtitle=""
      sidebarLinks={adminLinks}
      sidebarAccentLabel="Super Admin"
    >
      <Outlet />
    </AppShell>
  );
};

export default AdminLayout;
