import { useMemo, useCallback } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { usePermissionsContext } from "@/contexts/PermissionsContext";

type Resource = "tenants" | "memberships" | "clients" | "partners" | "content" | "commissions" | "gamification" | "referrals" | "permissions" | "financials" | "staff" | "audit" | "vitacoins";
type Action = "read" | "create" | "update" | "delete";

export function usePermissions() {
  const { userRole, isSuperAdmin, currentTenant } = useTenant();
  const { can: contextCan, isLoading } = usePermissionsContext();

  const can = useCallback(
    (action: Action, resource: Resource): boolean => {
      // Use the context-provided RBAC logic (data-driven)
      return contextCan(action, resource);
    },
    [contextCan]
  );

  const canRead = useCallback((resource: Resource) => can("read", resource), [can]);
  const canCreate = useCallback((resource: Resource) => can("create", resource), [can]);
  const canUpdate = useCallback((resource: Resource) => can("update", resource), [can]);
  const canDelete = useCallback((resource: Resource) => can("delete", resource), [can]);

  const permissions = useMemo(
    () => ({
      can,
      canRead,
      canCreate,
      canUpdate,
      canDelete,
      role: userRole,
      isSuperAdmin,
      isLoading,
      hasTenant: !!currentTenant,
    }),
    [can, canRead, canCreate, canUpdate, canDelete, userRole, isSuperAdmin, currentTenant, isLoading]
  );

  return permissions;
}
