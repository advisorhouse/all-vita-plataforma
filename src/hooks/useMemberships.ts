import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant, type Membership, type Tenant } from "@/contexts/TenantContext";

/**
 * Fetches user memberships from Supabase and populates TenantContext.
 * Should be rendered once near the app root.
 */
export function useMemberships() {
  const { user, loading: authLoading } = useAuth();
  const { setMemberships, setIsLoading, setIsSuperAdmin, setPlatformRole } = useTenant();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setMemberships([]);
      setIsLoading(false);
      return;
    }

    const fetchMemberships = async () => {
      setIsLoading(true);
      
      // Fetch both memberships and platform staff status in parallel
      const [membershipsRes, platformStaffRes] = await Promise.all([
        supabase
          .from("memberships")
          .select("id, user_id, tenant_id, role, active, tenants:tenant_id (id, name, trade_name, slug, logo_url, favicon_url, primary_color, secondary_color, domain, active, settings)")
          .eq("user_id", user.id)
          .eq("active", true),
        supabase
          .from("all_vita_staff")
          .select("role, is_active")
          .eq("user_id", user.id)
          .single()
      ]);

      if (membershipsRes.error) {
        console.error("Error fetching memberships:", membershipsRes.error);
      } else {
        const memberships: Membership[] = (membershipsRes.data || []).map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          tenant_id: m.tenant_id,
          role: m.role,
          active: m.active,
          tenant: m.tenants as Tenant | undefined,
        }));
        setMemberships(memberships);
      }

      if (!platformStaffRes.error && platformStaffRes.data?.is_active) {
        setPlatformRole(platformStaffRes.data.role);
        setIsSuperAdmin(platformStaffRes.data.role === 'super_admin' || platformStaffRes.data.role === 'admin');
      } else {
        setPlatformRole(null);
        setIsSuperAdmin(false);
      }

      setIsLoading(false);
    };

    fetchMemberships();
  }, [user, setMemberships, setIsLoading]);
}
