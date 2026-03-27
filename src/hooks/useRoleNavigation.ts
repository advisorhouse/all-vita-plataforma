import {
  Home, Package, Gift, BookOpen, Users, Heart, HelpCircle,
  ShoppingBag, GraduationCap, Target, CheckSquare, Star,
  UserPlus, ClipboardList, Trophy, Network, Settings,
  DollarSign, BarChart3, Shield, Handshake, Percent, Brain,
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import type { SidebarLink } from "@/components/layout/AppSidebar";

const clientLinks: SidebarLink[] = [
  { label: "Início", href: "/club", icon: Home },
  { label: "Minha Assinatura", href: "/club/subscription", icon: Package },
  { label: "Meus Benefícios", href: "/club/benefits", icon: Gift },
  { label: "Aprender Saúde", href: "/club/content", icon: BookOpen },
  { label: "Comunidade", href: "/club/community", icon: Users },
  { label: "Indicações", href: "/club/referrals", icon: Heart },
  { label: "Suporte", href: "/club/support", icon: HelpCircle },
];

const partnerLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/partner", icon: Home },
  { label: "Meus Pacientes", href: "/partner/clients", icon: Users },
  { label: "Quiz Pacientes", href: "/partner/referrals", icon: ClipboardList },
  { label: "Minha Rede", href: "/partner/network", icon: Network },
  { label: "Meus Pontos", href: "/partner/revenue", icon: CheckSquare },
  { label: "Ranking", href: "/partner/ranking", icon: Trophy },
  { label: "Parceiros Indicados", href: "/partner/referred-partners", icon: UserPlus },
  { label: "Campanhas", href: "/partner/links", icon: Target },
  { label: "Catálogo", href: "/partner/materials", icon: ShoppingBag },
  { label: "Formação", href: "/partner/formation", icon: GraduationCap },
  { label: "Suporte", href: "/partner/support", icon: HelpCircle },
];

const adminLinks: SidebarLink[] = [
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

const superAdminLinks: SidebarLink[] = [
  { label: "Visão Geral", href: "/admin", icon: Home },
  { label: "Empresas", href: "/admin/tenants", icon: ShoppingBag },
  { label: "Usuários", href: "/admin/users", icon: Users },
  { label: "Auditoria", href: "/admin/audit", icon: ClipboardList },
  { label: "Segurança", href: "/admin/security", icon: Shield },
  { label: "Configurações", href: "/admin/settings", icon: Settings },
];

export function useRoleNavigation() {
  const { userRole, currentTenant, isSuperAdmin } = useTenant();

  const getLinksForRole = () => {
    if (isSuperAdmin && !currentTenant) return superAdminLinks;

    switch (userRole) {
      case "admin":
      case "manager":
        return adminLinks;
      case "partner":
        return partnerLinks;
      case "client":
        return clientLinks;
      case "super_admin":
        return superAdminLinks;
      default:
        return clientLinks;
    }
  };

  const getSidebarTitle = () => {
    if (isSuperAdmin && !currentTenant) return "All Vita";
    return currentTenant?.name || "All Vita";
  };

  const getSidebarSubtitle = () => {
    switch (userRole) {
      case "admin":
      case "manager":
        return "Admin";
      case "partner":
        return "Partner";
      case "client":
        return "Club";
      case "super_admin":
        return "Platform";
      default:
        return "";
    }
  };

  const getBasePath = () => {
    if (isSuperAdmin && !currentTenant) return "/admin";
    switch (userRole) {
      case "admin":
      case "manager":
        return "/core";
      case "partner":
        return "/partner";
      case "client":
        return "/club";
      case "super_admin":
        return "/admin";
      default:
        return "/club";
    }
  };

  return {
    links: getLinksForRole(),
    sidebarTitle: getSidebarTitle(),
    sidebarSubtitle: getSidebarSubtitle(),
    basePath: getBasePath(),
    userRole,
    isSuperAdmin,
  };
}
