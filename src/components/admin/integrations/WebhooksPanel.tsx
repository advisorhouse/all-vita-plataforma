import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Webhook, Plus, Send } from "lucide-react";
import { toast } from "sonner";

export interface WebhookRow {
  id: string;
  name: string;
  tenant_name: string;
  type: string;
  active: boolean;
  config: { event?: string; url?: string; method?: string; retry?: boolean } | null;
}

interface WebhooksPanelProps {
  webhooks: WebhookRow[];
  tenants: { id: string; name: string }[];
  onAdd: (data: { tenant_id: string; name: string; config: object }) => void;
  onToggle: (id: string, active: boolean) => void;
  onResend: (id: string) => void;
}

const EVENTS = [
  "payment.approved", "payment.declined", "order.created", "client.created",
  "partner.created", "redemption.requested", "subscription.cancelled",
];

const WebhooksPanel: React.FC<WebhooksPanelProps> = ({ webhooks, tenants, onAdd, onToggle, onResend }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tenant_id: "", event: "payment.approved", url: "", method: "POST", retry: true });

  const handleSubmit = () => {
    if (!form.tenant_id || !form.url) { toast.error("Preencha os campos"); return; }
    onAdd({ tenant_id: form.tenant_id, name: `Webhook: ${form.event}`, config: { event: form.event, url: form.url, method: form.method, retry: form.retry } });
    setOpen(false);
    setForm({ tenant_id: "", event: "payment.approved", url: "", method: "POST", retry: true });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Webhook className="h-5 w-5" /> Webhooks</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Criar Webhook</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Webhook</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Empresa</Label>
                  <Select value={form.tenant_id} onValueChange={(v) => setForm((p) => ({ ...p, tenant_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Evento</Label>
                  <Select value={form.event} onValueChange={(v) => setForm((p) => ({ ...p, event: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{EVENTS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>URL Destino</Label><Input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://..." /></div>
                <div className="flex items-center gap-4">
                  <div className="space-y-1.5 flex-1">
                    <Label>Método</Label>
                    <Select value={form.method} onValueChange={(v) => setForm((p) => ({ ...p, method: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="POST">POST</SelectItem><SelectItem value="PUT">PUT</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-5"><Switch checked={form.retry} onCheckedChange={(v) => setForm((p) => ({ ...p, retry: v }))} /><span className="text-sm">Retry</span></div>
                </div>
                <Button onClick={handleSubmit} className="w-full">Criar Webhook</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhum webhook</TableCell></TableRow>}
            {webhooks.map((w) => {
              const cfg = w.config || {};
              return (
                <TableRow key={w.id}>
                  <TableCell className="font-medium font-mono text-xs">{cfg.event || w.name}</TableCell>
                  <TableCell>{w.tenant_name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{cfg.url || "—"}</TableCell>
                  <TableCell><Switch checked={w.active} onCheckedChange={(v) => onToggle(w.id, v)} /></TableCell>
                  <TableCell><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onResend(w.id)}><Send className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WebhooksPanel;
