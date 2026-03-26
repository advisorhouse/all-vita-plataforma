import { useMemo, useCallback } from "react";
import { useTenant } from "@/contexts/TenantContext";

type Resource = "tenants" | "memberships" | "clients" | "partners" | "content" | "commissions" | "gamification" | "referrals";
type Action = "read" | "create" | "update" | "delete";

/**
 * Permission matrix defining what each role can do.
 * Mirrors the role_permissions table in the database.
 * Frontend uses this for UI gating; actual enforcement is via RLS.
 */
const PERMISSION_MATRIX: Record<string, Record<Resource, Record<Action, boolean>>> = {
  super_admin: {
    tenants:      { read: true, create: true, update: true, delete: true },
    memberships:  { read: true, create: true, update: true, delete: true },
    clients:      { read: true, create: true, update: true, delete: true },
    partners:     { read: true, create: true, update: true, delete: true },
    content:      { read: true, create: true, update: true, delete: true },
    commissions:  { read: true, create: true, update: true, delete: true },
    gamification: { read: true, create: true, update: true, delete: true },
    referrals:    { read: true, create: true, update: true, delete: true },
  },
  admin: {
    tenants:      { read: false, create: false, update: false, delete: false },
    memberships:  { read: true, create: true, update: true, delete: true },
    clients:      { read: true, create: true, update: true, delete: true },
    partners:     { read: true, create: true, update: true, delete: true },
    content:      { read: true, create: true, update: true, delete: true },
    commissions:  { read: true, create: true, update: true, delete: true },
    gamification: { read: true, create: true, update: true, delete: true },
    referrals:    { read: true, create: true, update: true, delete: true },
  },
  manager: {
    tenants:      { read: false, create: false, update: false, delete: false },
    memberships:  { read: true, create: false, update: false, delete: false },
    clients:      { read: true, create: true, update: true, delete: false },
    partners:     { read: true, create: false, update: false, delete: false },
    content:      { read: true, create: true, update: true, delete: false },
    commissions:  { read: true, create: false, update: false, delete: false },
    gamification: { read: true, create: false, update: false, delete: false },
    referrals:    { read: true, create: false, update: false, delete: false },
  },
  partner: {
    tenants:      { read: false, create: false, update: false, delete: false },
    memberships:  { read: false, create: false, update: false, delete: false },
    clients:      { read: true, create: false, update: false, delete: false },
    partners:     { read: true, create: false, update: false, delete: false },
    content:      { read: true, create: false, update: false, delete: false },
    commissions:  { read: true, create: false, update: false, delete: false },
    gamification: { read: true, create: false, update: false, delete: false },
    referrals:    { read: true, create: true, update: false, delete: false },
  },
  client: {
    tenants:      { read: false, create: false, update: false, delete: false },
    memberships:  { read: false, create: false, update: false, delete: false },
    clients:      { read: true, create: false, update: true, delete: false },
    partners:     { read: false, create: false, update: false, delete: false },
    content:      { read: true, create: false, update: false, delete: false },
    commissions:  { read: false, create: false, update: false, delete: false },
    gamification: { read: true, create: false, update: false, delete: false },
    referrals:    { read: false, create: false, update: false, delete: false },
  },
};

export function usePermissions() {
  const { userRole, isSuperAdmin, currentTenant } = useTenant();

  const can = useCallback(
    (action: Action, resource: Resource): boolean => {
      if (isSuperAdmin) return true;
      if (!userRole) return false;
      return PERMISSION_MATRIX[userRole]?.[resource]?.[action] ?? false;
    },
    [userRole, isSuperAdmin]
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
      hasTenant: !!currentTenant,
    }),
    [can, canRead, canCreate, canUpdate, canDelete, userRole, isSuperAdmin, currentTenant]
  );

  return permissions;
}
