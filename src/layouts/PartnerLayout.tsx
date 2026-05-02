import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import {
  Home, ShoppingBag, GraduationCap, Target,
  CheckSquare, HelpCircle, Star, UserPlus,
  Users, ClipboardList, Trophy, Network,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useTenant } from "@/contexts/TenantContext";
import PartnerOnboardingTour from "@/components/partner/PartnerOnboardingTour";
import { usePartnerOnboarding } from "@/hooks/usePartnerOnboarding";

const partnerLinks = [
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

const SidebarFooterContent: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <button
        onClick={() => navigate("/partner/levels")}
        className="w-full rounded-xl border border-warning/30 bg-gradient-to-br from-warning/10 via-warning/5 to-transparent p-3 space-y-2 text-left hover:from-warning/20 hover:via-warning/10 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Nível de Progressão</p>
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-warning/15">
            <Star className="h-3.5 w-3.5 text-warning" />
          </div>
        </div>
        <p className="text-lg font-bold text-warning">OURO</p>
        <Progress value={75} className="h-1.5 [&>div]:bg-warning" />
        <p className="text-[10px] text-warning/70">Ver detalhes →</p>
      </button>
      <p className="text-[10px] text-muted-foreground text-center">
        Powered by <span className="font-medium">All Vita</span>
      </p>
    </div>
  );
};

const PartnerLayout: React.FC = () => {
  const { currentTenant } = useTenant();
  const tenantName = currentTenant?.trade_name || currentTenant?.name || "Partner";
  const { shouldShow, markAsSeen } = usePartnerOnboarding();

  return (
    <>
      <AppShell
        sidebarTitle={tenantName}
        sidebarSubtitle="Partner"
        sidebarLinks={partnerLinks}
        sidebarFooter={<SidebarFooterContent />}
      >
        <Outlet />
      </AppShell>
      {shouldShow && <PartnerOnboardingTour onClose={markAsSeen} />}
    </>
  );
};

export default PartnerLayout;
