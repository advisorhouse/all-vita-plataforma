import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, TestTube, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export interface PaymentGateway {
  id: string;
  tenant_name: string;
  provider: string;
  active: boolean;
  updated_at: string;
}

interface GatewaysPanelProps {
  gateways: PaymentGateway[];
  tenants: { id: string; name: string }[];
  onConnect: (data: { tenant_id: string; provider: string; api_key: string; webhook_secret: string }) => void;
  onDisconnect: (id: string) => void;
  onTest: (id: string) => void;
}

const GatewaysPanel: React.FC<GatewaysPanelProps> = ({ gateways, tenants, onConnect, onDisconnect, onTest }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tenant_id: "global", provider: "pagarme", api_key: "", webhook_secret: "" });

  const handleSubmit = () => {
    if (!form.api_key) { 
      toast.error("A API Key é obrigatória"); 
      return; 
    }
    onConnect(form);
    setOpen(false);
    setForm({ tenant_id: "global", provider: "pagarme", api_key: "", webhook_secret: "" });
  };

  const webhookUrl = `${window.location.origin.replace(".lovable.app", ".supabase.co")}/functions/v1/pagarme-webhook`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Gateways de Pagamento
            </CardTitle>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Conectar Gateway</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Conectar Gateway de Pagamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Contexto de Uso</Label>
                  <Select value={form.tenant_id} onValueChange={(v) => setForm((p) => ({ ...p, tenant_id: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o contexto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global (Toda a Plataforma All Vita)</SelectItem>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Selecione "Global" para usar esta conta em todos os tenants que não possuem conta própria.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Provedor</Label>
                  <Select value={form.provider} onValueChange={(v) => setForm((p) => ({ ...p, provider: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pagarme">Pagar.me (V5)</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                      <SelectItem value="asaas">Asaas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>API Key (Secret Key)</Label>
                  <Input 
                    type="password" 
                    placeholder="sk_..."
                    value={form.api_key} 
                    onChange={(e) => setForm((p) => ({ ...p, api_key: e.target.value }))} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Webhook Secret (Opcional)</Label>
                  <Input 
                    type="password" 
                    value={form.webhook_secret} 
                    onChange={(e) => setForm((p) => ({ ...p, webhook_secret: e.target.value }))} 
                  />
                </div>
                
                <div className="p-3 bg-muted rounded-md space-y-2">
                  <Label className="text-xs">URL de Webhook para configurar no Pagar.me:</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={webhookUrl} className="text-xs h-8" />
                    <Button variant="outline" size="sm" className="h-8" onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      toast.success("Copiado!");
                    }}>Copiar</Button>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">Conectar e Ativar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Provedor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Sync</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gateways.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhum gateway conectado</TableCell></TableRow>}
            {gateways.map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.tenant_name}</TableCell>
                <TableCell className="capitalize font-medium">{g.provider}</TableCell>
                <TableCell><Badge variant={g.active ? "default" : "destructive"}>{g.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{format(new Date(g.updated_at), "dd/MM/yy HH:mm")}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onTest(g.id)}><TestTube className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDisconnect(g.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GatewaysPanel;
