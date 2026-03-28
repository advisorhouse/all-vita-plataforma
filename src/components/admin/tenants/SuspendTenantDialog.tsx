import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SuspendTenantDialogProps {
  tenant: any;
  open: boolean;
  onClose: () => void;
}

const SuspendTenantDialog: React.FC<SuspendTenantDialogProps> = ({ tenant, open, onClose }) => {
  const queryClient = useQueryClient();
  const isActive = tenant.status === "active" || tenant.active !== false;

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tenants")
        .update({
          active: !isActive,
          status: isActive ? "suspended" : "active",
        })
        .eq("id", tenant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tenant", tenant.id] });
      toast.success(isActive ? "Empresa suspensa com sucesso" : "Empresa reativada com sucesso");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao alterar status");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? "Suspender empresa" : "Reativar empresa"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? `Tem certeza que deseja suspender "${tenant.trade_name || tenant.name}"? Os usuários perderão acesso ao sistema enquanto a empresa estiver suspensa. Os dados serão mantidos.`
              : `Deseja reativar "${tenant.trade_name || tenant.name}"? Todos os acessos serão restaurados.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            disabled={mutation.isPending}
            className={isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isActive ? "Suspender" : "Reativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuspendTenantDialog;
