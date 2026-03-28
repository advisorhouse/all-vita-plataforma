import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant, type Membership, type Tenant } from "@/contexts/TenantContext";

/**
 * Fetches user memberships from Supabase and populates TenantContext.
 * Should be rendered once near the app root.
 */
export function useMemberships() {
  const { user } = useAuth();
  const { setMemberships } = useTenant();

  useEffect(() => {
    if (!user) {
      setMemberships([]);
      return;
    }

    const fetchMemberships = async () => {
      // Fetch memberships with tenant data
      const { data, error } = await (supabase.from as any)("memberships")
        .select("id, user_id, tenant_id, role, active, tenants:tenant_id (id, name, slug, logo_url, favicon_url, primary_color, secondary_color, domain, active, settings)")
        .eq("user_id", user.id)
        .eq("active", true);

      if (error) {
        console.error("Error fetching memberships:", error);
        return;
      }

      const memberships: Membership[] = (data || []).map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        tenant_id: m.tenant_id,
        role: m.role,
        active: m.active,
        tenant: m.tenants as Tenant | undefined,
      }));

      setMemberships(memberships);
    };

    fetchMemberships();
  }, [user, setMemberships]);
}
