import React from "react";
import AppShell from "@/components/layout/AppShell";
import { Home, Building2, Users, Settings } from "lucide-react";
import { Outlet } from "react-router-dom";

const adminLinks = [
  { label: "Visão Geral", href: "/admin", icon: Home },
  { label: "Empresas", href: "/admin/tenants", icon: Building2 },
  { label: "Usuários", href: "/admin/users", icon: Users },
  { label: "Configurações", href: "/admin/settings", icon: Settings },
];

const AdminLayout: React.FC = () => {
  return (
    <AppShell
      sidebarTitle="All Vita"
      sidebarSubtitle="Platform"
      sidebarLinks={adminLinks}
      sidebarAccentLabel="Super Admin"
    >
      <Outlet />
    </AppShell>
  );
};

export default AdminLayout;
