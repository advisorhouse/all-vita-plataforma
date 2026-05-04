import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw, CreditCard, Loader2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const PagarmeWebhooksPanel: React.FC = () => {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [targetTenantId, setTargetTenantId] = React.useState<string>("global");

  const { data: tenants = [] } = useQuery({
    queryKey: ["admin-tenants-simple"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name").eq("active", true);
      return data || [];
    },
  });

  const { data: webhooks = [], isLoading, refetch } = useQuery({
    queryKey: ["pagarme-webhooks-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .ilike("action", "pagarme_webhook_%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const getStatusColor = (action: string) => {
    if (action.includes("paid")) return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20";
    if (action.includes("failed") || action.includes("canceled")) return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20";
    return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
  };

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      // 1. Create a dummy order if target is a tenant
      let orderId = `test_uuid_${Math.random().toString(36).slice(2, 7)}`;
      
      if (targetTenantId !== "global") {
        const { data: newOrder, error: orderErr } = await supabase
          .from("orders")
          .insert({
            tenant_id: targetTenantId,
            amount: 199.90,
            payment_status: "pending",
            status: "pending",
            metadata: { simulation: true, all_vita_fee_percentage: 10 }
          })
          .select()
          .single();
        
        if (orderErr) throw orderErr;
        orderId = newOrder.id;
      }

      // 2. Simulate the webhook call
      const { error } = await supabase.functions.invoke("pagarme-webhook", {
        body: {
          id: `sim_${Math.random().toString(36).slice(2, 9)}`,
          type: "order.paid",
          data: {
            id: `or_${Math.random().toString(36).slice(2, 9)}`,
            code: orderId,
            amount: 19990, // R$ 199,90 em centavos
            status: "paid",
            payment_method: "credit_card"
          }
        }
      });

      if (error) throw error;
      
      toast.success(targetTenantId === "global" 
        ? "Simulação enviada! (Log registrado)" 
        : `Simulação concluída para ${tenants.find(t => t.id === targetTenantId)?.name}!`);
      
      setTimeout(() => refetch(), 1000);
    } catch (error: any) {
      toast.error("Erro na simulação: " + error.message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Eventos do Pagar.me</h3>
          <p className="text-xs text-muted-foreground">Últimos logs recebidos via webhook</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={targetTenantId} onValueChange={setTargetTenantId}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="Selecione a Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Simulação Global</SelectItem>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSimulatePayment} 
            disabled={isSimulating}
            className="border-dashed"
          >
            {isSimulating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
            Disparar Webhook
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Order ID (Code)</TableHead>
              <TableHead>Status Pagar.me</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum evento do Pagar.me recebido ainda.
                </TableCell>
              </TableRow>
            ) : (
              webhooks.map((log) => {
                const details = log.details as any;
                const eventType = log.action.replace("pagarme_webhook_", "");
                
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      {format(new Date(log.created_at), "dd/MM/yy HH:mm:ss", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(log.action)}>
                        {eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {details?.data?.code || "-"}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{details?.data?.status || "N/A"}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto font-mono text-xs">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Webhook: {eventType}</DialogTitle>
                          </DialogHeader>
                          <pre className="bg-muted p-4 rounded-md mt-4 overflow-x-auto whitespace-pre-wrap text-[10px]">
                            {JSON.stringify(details, null, 2)}
                          </pre>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PagarmeWebhooksPanel;