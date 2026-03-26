import React from "react";
import AppShell from "@/components/layout/AppShell";
import { Home, Package, Gift, BookOpen, Users, Heart, HelpCircle } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const clubLinks = [
  { label: "Início", href: "/club", icon: Home },
  { label: "Minha Assinatura", href: "/club/subscription", icon: Package },
  { label: "Meus Benefícios", href: "/club/benefits", icon: Gift },
  { label: "Aprender Saúde", href: "/club/content", icon: BookOpen },
  { label: "Comunidade", href: "/club/community", icon: Users },
  { label: "Indicações", href: "/club/referrals", icon: Heart },
  { label: "Suporte", href: "/club/support", icon: HelpCircle },
];

const pageTitles: Record<string, string> = {
  "/club": "Início",
  "/club/subscription": "Minha Assinatura",
  "/club/benefits": "Meus Benefícios",
  "/club/content": "Aprender Saúde",
  "/club/community": "Comunidade",
  "/club/referrals": "Indicações",
  "/club/support": "Suporte",
  "/club/settings": "Configurações",
};

const ClubLayout: React.FC = () => {
  const location = useLocation();
  const headerTitle = pageTitles[location.pathname] || "Vision Lift Club";

  const headerActions = (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 sm:flex">
        <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
          Assinatura Ativa
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-caption text-muted-foreground hidden sm:block">Olá, Carlos</span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary text-xs font-medium text-foreground">CA</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );

  return (
    <AppShell
      sidebarTitle="Vision Lift"
      sidebarSubtitle="Club"
      sidebarLinks={clubLinks}
      headerTitle={headerTitle}
      headerActions={headerActions}
    >
      <Outlet />
    </AppShell>
  );
};

export default ClubLayout;
