import React from "react";
import logoAllVita from "@/assets/logo-allvita.png";
import { Loader2 } from "lucide-react";

interface OnboardingHeaderProps {
  logoUrl?: string;
  tradeName?: string;
  loading?: boolean;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ 
  logoUrl, 
  tradeName, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center mb-8 relative min-h-[64px] items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="flex justify-center mb-8 relative min-h-[64px] items-center">
      <img
        src={logoUrl || logoAllVita}
        alt={tradeName || "All Vita"}
        className="h-16 w-auto object-contain transition-opacity duration-300"
      />
    </div>
  );
};

interface OnboardingFooterProps {
  tenantName?: string;
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({ tenantName }) => {
  return (
    <footer className="mt-12 pt-8 border-t border-muted text-center text-sm text-muted-foreground w-full max-w-md">
      <p>© 2026 MAXIMA VITA HUMAN HEALTH LTDA | CNPJ: 60.410.363/0001-27</p>
      <div className="mt-2 flex flex-col items-center gap-1">
        <p className="italic">All Vita - A Plataforma de Longevidade e Bem-estar</p>
        {tenantName && (
          <p className="text-[10px] opacity-70">
            Parceiro: <span className="font-semibold">{tenantName}</span>
          </p>
        )}
      </div>
    </footer>
  );
};
