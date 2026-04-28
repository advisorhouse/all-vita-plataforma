import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./TenantContext";

type Resource = "tenants" | "memberships" | "clients" | "partners" | "content" | "commissions" | "gamification" | "referrals" | "permissions" | "financials" | "staff" | "audit" | "vitacoins";
type Action = "read" | "create" | "update" | "delete";

interface PermissionsContextValue {
  can: (action: Action, resource: Resource) => boolean;
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTenant, isSuperAdmin, platformRole, userRole } = useTenant();

  // Fetch all permissions for the current tenant or platform
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['active-permissions', currentTenant?.id, platformRole, userRole],
    queryFn: async () => {
      // If Super Admin, we don't even need to fetch, but we'll fetch for completeness 
      // or just return a full-access object
      if (isSuperAdmin) return null;

      if (platformRole) {
        // Fetch platform permissions for this role
        const { data } = await supabase
          .from('platform_role_permissions')
          .select('resource, action, allowed')
          .eq('role', platformRole as any);
        return data || [];
      }

      if (currentTenant && userRole) {
        // Fetch tenant permissions (defaults + overrides)
        // We can call the RPC for each check, but it's better to fetch the whole matrix for the role
        const { data } = await supabase
          .from('tenant_role_permissions')
          .select('resource, action, allowed, tenant_id')
          .eq('role', userRole as any)
          .or(`tenant_id.is.null,tenant_id.eq.${currentTenant.id}`);
        
        // Merge overrides: if a resource/action has a non-null tenant_id, it wins
        const merged: any[] = [];
        const map = new Map();
        
        (data || []).forEach(p => {
          const key = `${p.resource}:${p.action}`;
          if (!map.has(key) || p.tenant_id) {
            map.set(key, p.allowed);
          }
        });

        map.forEach((allowed, key) => {
          const [resource, action] = key.split(':');
          merged.push({ resource, action, allowed });
        });

        return merged;
      }

      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const can = (action: Action, resource: Resource): boolean => {
    if (isSuperAdmin) return true;
    if (isLoading || !permissions) return false;
    
    const perm = permissions.find(p => p.resource === resource && p.action === action);
    return perm ? perm.allowed : false;
  };

  const value = useMemo(() => ({ can, isLoading }), [permissions, isLoading, isSuperAdmin]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = () => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissionsContext must be used within PermissionsProvider");
  return ctx;
};
