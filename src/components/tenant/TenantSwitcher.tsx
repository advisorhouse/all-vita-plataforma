import React from "react";
import { useTenant } from "@/contexts/TenantContext";
import { Building2, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const TenantSwitcher: React.FC = () => {
  const { currentTenant, availableTenants, switchTenant, isSuperAdmin } = useTenant();

  // Only show if user has multiple tenants or is super admin
  if (availableTenants.length <= 1 && !isSuperAdmin) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[140px] truncate">
            {currentTenant?.name || "Selecionar empresa"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {availableTenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => switchTenant(tenant.id)}
            className="flex items-center justify-between"
          >
            <span>{tenant.name}</span>
            {currentTenant?.id === tenant.id && (
              <Check className="h-4 w-4 text-accent" />
            )}
          </DropdownMenuItem>
        ))}
        {isSuperAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => window.location.href = "/admin"}
              className="text-muted-foreground"
            >
              Painel All Vita
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TenantSwitcher;
