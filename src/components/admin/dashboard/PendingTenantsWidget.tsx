import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Clock, CheckCircle2, ArrowRight, Bell } from "lucide-react";
import { toast } from "sonner";

interface PendingTenantsWidgetProps {
  onResume: (tenant: any) => void;
}

const PendingTenantsWidget: React.FC<PendingTenantsWidgetProps> = ({ onResume }) => {
  const queryClient = useQueryClient();

  const { data: pendingTenants, isLoading } = useQuery({
    queryKey: ["pending-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .neq("registration_status", "completed")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Sync every 30s
  });

  const dismissNotification = useMutation({
    mutationFn: async (tenantId: string) => {
      const { error } = await supabase
        .from("tenants")
        .update({ pending_registration_notification: false })
        .eq("id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-tenants"] });
    },
  });

  if (isLoading) return null;
  if (!pendingTenants || pendingTenants.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900">
          <Clock className="h-4 w-4 text-amber-600" />
          Empresas em Configuração
          <Badge variant="outline" className="ml-auto bg-amber-100 border-amber-200 text-amber-700">
            {pendingTenants.length} pendente{pendingTenants.length > 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingTenants.map((tenant) => (
          <div 
            key={tenant.id} 
            className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-white shadow-sm transition-all hover:border-amber-400"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${tenant.registration_status === 'dns_ready' ? 'bg-green-100' : 'bg-amber-100'}`}>
                {tenant.registration_status === 'dns_ready' ? (
                  <Globe className="h-4 w-4 text-green-600 animate-pulse" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{tenant.trade_name || tenant.name}</span>
                  {tenant.pending_registration_notification && (
                    <Badge className="bg-blue-600 h-4 px-1 text-[8px] animate-bounce">NOVO DNS</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{tenant.slug}.allvita.com.br</span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className={`text-[10px] font-medium ${tenant.registration_status === 'dns_ready' ? 'text-green-600' : 'text-amber-600'}`}>
                    {tenant.registration_status === 'dns_ready' ? 'Pronto para ativar' : 'Aguardando DNS'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {tenant.pending_registration_notification && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-blue-600"
                  onClick={() => dismissNotification.mutate(tenant.id)}
                >
                  <Bell className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button 
                variant={tenant.registration_status === 'dns_ready' ? "default" : "outline"}
                size="sm"
                className={`h-8 text-[11px] font-bold ${tenant.registration_status === 'dns_ready' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => onResume(tenant)}
              >
                {tenant.registration_status === 'dns_ready' ? 'Finalizar' : 'Ver Detalhes'}
                <ArrowRight className="h-3 w-3 ml-1.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PendingTenantsWidget;