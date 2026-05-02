import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export function useCurrentPartner() {
  const { currentTenant, activeMembership } = useTenant();

  return useQuery({
    queryKey: ["current-partner", currentTenant?.id, activeMembership?.user_id],
    queryFn: async () => {
      if (!currentTenant?.id || !activeMembership?.user_id) return null;

      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", activeMembership.user_id)
        .eq("tenant_id", currentTenant.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id && !!activeMembership?.user_id,
  });
}
