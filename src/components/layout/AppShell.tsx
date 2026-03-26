import React, { useState } from "react";
import { motion } from "framer-motion";
import AppSidebar, { SidebarLink } from "./AppSidebar";
import TopBarActions from "./TopBarActions";

interface AppShellProps {
  sidebarTitle: string;
  sidebarSubtitle: string;
  sidebarLinks: SidebarLink[];
  sidebarAccentLabel?: string;
  sidebarHeader?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  headerTitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({
  sidebarTitle,
  sidebarSubtitle,
  sidebarLinks,
  sidebarAccentLabel,
  sidebarHeader,
  sidebarFooter,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        links={sidebarLinks}
        accentLabel={sidebarAccentLabel}
        header={sidebarHeader}
        footer={sidebarFooter}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <TopBarActions />
      <motion.div
        animate={{ paddingLeft: collapsed ? 68 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <main className="animate-fade-in p-8">{children}</main>
      </motion.div>
    </div>
  );
};

export default AppShell;
