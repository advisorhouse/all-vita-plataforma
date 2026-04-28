import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type TenantRole = 'admin' | 'manager' | 'staff' | 'partner' | 'client';

export interface TenantPermission {
  id?: string;
  tenant_id: string | null;
  role: TenantRole;
  resource: string;
  action: string;
  allowed: boolean;
}

export const useTenantPermissions = (tenantId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch both defaults (null tenant_id) and overrides for this tenant
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['tenant-permissions', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_role_permissions')
        .select('*')
        .or(`tenant_id.is.null,tenant_id.eq.${tenantId}`);

      if (error) throw error;
      return data as TenantPermission[];
    },
    enabled: !!tenantId,
  });

  const upsertPermission = useMutation({
    mutationFn: async (permission: Omit<TenantPermission, 'id'>) => {
      // If it's a default (tenant_id null), we shouldn't be editing it from here 
      // unless we are Super Admin. But this hook is for Tenant Admins.
      // Tenant Admins can only upsert with their own tenantId.
      if (!permission.tenant_id) throw new Error("Tenant ID is required for overrides");

      const { data, error } = await supabase
        .from('tenant_role_permissions')
        .upsert(permission)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-permissions', tenantId] });
      toast({
        title: "Permissão atualizada",
        description: "A restrição foi aplicada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível salvar a alteração.",
        variant: "destructive",
      });
    },
  });

  const deleteOverride = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tenant_role_permissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-permissions', tenantId] });
      toast({
        title: "Restrição removida",
        description: "A permissão voltou ao padrão global.",
      });
    },
  });

  return {
    permissions,
    isLoading,
    upsertPermission,
    deleteOverride,
  };
};
