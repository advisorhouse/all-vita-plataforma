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
import { Plus, Globe, TestTube, Power } from "lucide-react";
import { toast } from "sonner";

export interface ExternalApi {
  id: string;
  name: string;
  tenant_name: string;
  type: string;
  active: boolean;
}

interface ExternalApisPanelProps {
  apis: ExternalApi[];
  tenants: { id: string; name: string }[];
  onAdd: (data: { tenant_id: string; name: string; type: string }) => void;
  onToggle: (id: string, active: boolean) => void;
  onTest: (id: string) => void;
}

const ExternalApisPanel: React.FC<ExternalApisPanelProps> = ({ apis, tenants, onAdd, onToggle, onTest }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tenant_id: "", name: "", type: "crm" });

  const handleSubmit = () => {
    if (!form.tenant_id || !form.name) { toast.error("Preencha os campos"); return; }
    onAdd(form);
    setOpen(false);
    setForm({ tenant_id: "", name: "", type: "crm" });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-5 w-5" /> APIs Externas</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Nova API</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar API Externa</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Empresa</Label>
                  <Select value={form.tenant_id} onValueChange={(v) => setForm((p) => ({ ...p, tenant_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: HubSpot CRM" /></div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crm">CRM</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="ai">IA</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSubmit} className="w-full">Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apis.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhuma API cadastrada</TableCell></TableRow>}
            {apis.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{a.tenant_name}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{a.type}</Badge></TableCell>
                <TableCell><Switch checked={a.active} onCheckedChange={(v) => onToggle(a.id, v)} /></TableCell>
                <TableCell><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onTest(a.id)}><TestTube className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExternalApisPanel;
