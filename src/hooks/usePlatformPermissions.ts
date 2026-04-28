import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlatformRole = "super_admin" | "admin" | "manager" | "staff";
export type PermissionAction = "read" | "create" | "update" | "delete";

export interface PlatformPermissionRow {
  id: string;
  role: PlatformRole;
  resource: string;
  action: PermissionAction;
  allowed: boolean;
}

/**
 * Loads (and lets you mutate) the platform-level permission matrix
 * stored in `platform_role_permissions`. Only super_admin can write.
 */
export function usePlatformPermissions() {
  const [rows, setRows] = useState<PlatformPermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.from as any)("platform_role_permissions")
      .select("id, role, resource, action, allowed")
      .order("role")
      .order("resource")
      .order("action");
    if (!error && data) setRows(data as PlatformPermissionRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setAllowed = useCallback(
    async (id: string, allowed: boolean) => {
      setSaving(true);
      // Optimistic update
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, allowed } : r)));
      const { error } = await (supabase.from as any)("platform_role_permissions")
        .update({ allowed, updated_at: new Date().toISOString() })
        .eq("id", id);
      setSaving(false);
      if (error) {
        // Revert
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, allowed: !allowed } : r)));
        throw error;
      }
    },
    []
  );

  return { rows, loading, saving, reload: load, setAllowed };
}
