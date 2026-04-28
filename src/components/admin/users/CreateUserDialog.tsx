import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Loader2, Mail, ChevronRight, ChevronLeft, Building2, User as UserIcon } from "lucide-react";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Tenant { id: string; name: string }

interface Props {
  tenants: Tenant[];
  onSuccess: () => void;
}

const STEPS = ["Empresa & Vínculo", "Dados Básicos", "Confirmar"];

const CreateUserDialog: React.FC<Props> = ({ tenants, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    user_type: "tenant" as "staff" | "tenant",
    tenant_id: "", role: "manager",
  });

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const canNext = () => {
    if (step === 0) {
      if (form.user_type === "staff") return true;
      return form.tenant_id && form.role;
    }
    if (step === 1) return form.full_name && form.email;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (form.user_type === "staff") {
        // Create via manage-users with a special staff flow
        const res = await supabase.functions.invoke("manage-users/create", {
          body: {
            email: form.email,
            full_name: form.full_name,
            phone: form.phone,
            role: "super_admin",
            is_staff: true,
          },
        });
        if (res.error) throw new Error(res.error.message);
        if (res.data?.error) throw new Error(res.data.error);
      } else {
        const res = await supabase.functions.invoke("manage-users/create", {
          headers: { "X-Tenant-Id": form.tenant_id },
          body: {
            email: form.email,
            full_name: form.full_name,
            phone: form.phone,
            role: form.role,
          },
        });
        if (res.error) throw new Error(res.error.message);
        if (res.data?.error) throw new Error(res.data.error);
      }
      toast.success("Usuário criado e convite enviado!");
      setOpen(false);
      setStep(0);
      setForm({ full_name: "", email: "", phone: "", user_type: "tenant", tenant_id: "", role: "manager" });
      onSuccess();
    } catch (e: any) {
      toast.error("Erro ao criar usuário", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><UserPlus className="h-4 w-4 mr-2" /> Criar Usuário</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Usuário — {STEPS[step]}</DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex gap-1 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Tipo de Vínculo *
              </Label>
              <Select value={form.user_type} onValueChange={(v) => set("user_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff All Vita (Global)</SelectItem>
                  <SelectItem value="tenant">Empresa Parceira (Tenant)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.user_type === "tenant" && (
              <>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label>Selecione a Empresa *</Label>
                  <Select value={form.tenant_id} onValueChange={(v) => set("tenant_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label>Papel na Empresa *</Label>
                  <Select value={form.role} onValueChange={(v) => set("role", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="partner">Parceiro</SelectItem>
                      <SelectItem value="client">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Nome Completo *
              </Label>
              <Input 
                placeholder="Ex: João Silva"
                value={form.full_name} 
                onChange={(e) => set("full_name", e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> E-mail *
              </Label>
              <Input 
                type="email" 
                placeholder="joao@exemplo.com"
                value={form.email} 
                onChange={(e) => set("email", e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Telefone
              </Label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={form.phone}
                unmask={true}
                onAccept={(value) => set("phone", value)}
                placeholder="(00) 00000-0000"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">Confirme os dados antes de criar:</p>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p><span className="text-muted-foreground">Nome:</span> <strong>{form.full_name}</strong></p>
              <p><span className="text-muted-foreground">Email:</span> <strong>{form.email}</strong></p>
              {form.phone && <p><span className="text-muted-foreground">Tel:</span> <strong>{form.phone}</strong></p>}
              <p><span className="text-muted-foreground">Tipo:</span> <strong>{form.user_type === "staff" ? "Staff All Vita" : "Empresa"}</strong></p>
              {form.user_type === "tenant" && (
                <>
                  <p><span className="text-muted-foreground">Empresa:</span> <strong>{tenants.find(t => t.id === form.tenant_id)?.name}</strong></p>
                  <p><span className="text-muted-foreground">Papel:</span> <strong>{form.role}</strong></p>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Um e-mail de convite com senha provisória será enviado automaticamente.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Mail className="h-4 w-4 mr-2" /> Criar e Enviar Convite
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
