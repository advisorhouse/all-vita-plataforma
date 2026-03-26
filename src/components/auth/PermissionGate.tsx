import React from "react";
import { usePermissions } from "@/hooks/usePermissions";

type Resource = "tenants" | "memberships" | "clients" | "partners" | "content" | "commissions" | "gamification" | "referrals";
type Action = "read" | "create" | "update" | "delete";

interface PermissionGateProps {
  resource: Resource;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the user's permission.
 * Use for UI gating — actual enforcement is always via RLS on the backend.
 *
 * Usage:
 *   <PermissionGate resource="partners" action="delete">
 *     <DeleteButton />
 *   </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  resource,
  action,
  children,
  fallback = null,
}) => {
  const { can } = usePermissions();

  if (!can(action, resource)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
