import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, ChevronsLeft, ChevronsRight, Star } from "lucide-react";
import logoAllVita from "@/assets/logo-allvita.png";
import iconAllVita from "@/assets/icon-allvita.png";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AppSidebarProps {
  title: string;
  subtitle: string;
  links: SidebarLink[];
  accentLabel?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ title, subtitle, links, accentLabel, header, footer, collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <TooltipProvider delayDuration={100}>
      <motion.aside
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar overflow-hidden"
      >
        {/* Brand + Toggle */}
        <div className={cn("relative flex items-center border-b border-border transition-all duration-300", collapsed ? "h-20 flex-col justify-center py-2" : "h-16")}>
          {/* Toggle button */}
          <button
            onClick={onToggle}
            className={cn(
              "z-20 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors transition-all duration-300",
              collapsed ? "order-2 mt-1" : "absolute right-2 top-2"
            )}
            aria-label={collapsed ? "Expandir menu" : "Minimizar menu"}
          >
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18 }}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </motion.div>
          </button>

          {/* Brand area */}
          <div className={cn("flex items-center overflow-hidden transition-all duration-300", collapsed ? "order-1 justify-center px-0 h-9" : "flex-1 h-full pl-3 pr-10 gap-3")}>
            <AnimatePresence initial={false} mode="wait">
              {collapsed ? (
                <motion.img
                  key="icon"
                  src={iconAllVita}
                  alt="All Vita"
                  className="h-8 w-8 object-contain shrink-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <motion.div
                  key="logo"
                  className="flex items-center gap-3 min-w-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="h-7 w-[118px] shrink-0">
                    <img src={logoAllVita} alt="All Vita" className="h-7 w-full object-contain object-left" />
                  </div>
                  {subtitle && (
                    <span className="text-caption text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                      {subtitle}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Header slot */}
        <AnimatePresence>
          {!collapsed && header && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="px-4 py-3">{header}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-1 overflow-y-auto py-4 transition-all duration-300", collapsed ? "px-2" : "px-3")}>
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            const Icon = link.icon;
            const linkContent = (
              <NavLink
                to={link.href}
                className={cn(
                  "group relative flex items-center rounded-xl text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-secondary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      className="relative z-10 whitespace-nowrap"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="text-[11px]">{link.label}</TooltipContent>
                </Tooltip>
              );
            }
            return <React.Fragment key={link.href}>{linkContent}</React.Fragment>;
          })}
        </nav>

        {/* Footer */}
        <AnimatePresence>
          {!collapsed && footer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="px-4 py-4">{footer}</div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="border-t border-border py-3 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/partner/network")}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-warning hover:bg-secondary/60 transition-colors"
                  aria-label="Minha Rede"
                >
                  <Star className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[11px]">Nível de Progressão</TooltipContent>
            </Tooltip>
          </div>
        )}
      </motion.aside>
    </TooltipProvider>
  );
};

export default AppSidebar;
