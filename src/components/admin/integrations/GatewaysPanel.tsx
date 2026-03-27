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
  const [form, setForm] = useState({ tenant_id: "", provider: "pagarme", api_key: "", webhook_secret: "" });

  const handleSubmit = () => {
    if (!form.tenant_id || !form.api_key) { toast.error("Preencha os campos obrigatórios"); return; }
    onConnect(form);
    setOpen(false);
    setForm({ tenant_id: "", provider: "pagarme", api_key: "", webhook_secret: "" });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-5 w-5" /> Gateways de Pagamento</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Conectar Gateway</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Conectar Gateway de Pagamento</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Empresa</Label>
                  <Select value={form.tenant_id} onValueChange={(v) => setForm((p) => ({ ...p, tenant_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                    <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Provedor</Label>
                  <Select value={form.provider} onValueChange={(v) => setForm((p) => ({ ...p, provider: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pagarme">Pagar.me</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                      <SelectItem value="asaas">Asaas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>API Key</Label>
                  <Input type="password" value={form.api_key} onChange={(e) => setForm((p) => ({ ...p, api_key: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Webhook Secret</Label>
                  <Input type="password" value={form.webhook_secret} onChange={(e) => setForm((p) => ({ ...p, webhook_secret: e.target.value }))} />
                </div>
                <Button onClick={handleSubmit} className="w-full">Conectar</Button>
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
