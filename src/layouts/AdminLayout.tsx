import React from "react";
import AppShell from "@/components/layout/AppShell";
import { Home, Building2, Users, FileText, ShieldCheck, Settings } from "lucide-react";
import { Outlet } from "react-router-dom";

const adminLinks = [
  { label: "Visão Geral", href: "/admin", icon: Home },
  { label: "Empresas", href: "/admin/tenants", icon: Building2 },
  { label: "Usuários", href: "/admin/users", icon: Users },
  { label: "Auditoria", href: "/admin/audit", icon: FileText },
  { label: "Segurança", href: "/admin/security", icon: ShieldCheck },
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
