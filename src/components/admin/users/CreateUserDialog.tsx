import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Loader2, Mail, ChevronRight, ChevronLeft, Building2, User as UserIcon, Phone, Eye } from "lucide-react";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    user_type: "tenant" as "staff" | "tenant",
    tenant_id: "", role: "manager",
    staff_role: "admin",
  });

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const isPhoneValid = (phone: string) => {
    if (!phone) return true; // Phone is optional
    return phone.length === 11; // 2 (DDD) + 9 (Number)
  };

  const canNext = () => {
    if (step === 0) {
      if (form.user_type === "staff") return true;
      return form.tenant_id && form.role;
    }
    if (step === 1) {
      const basicInfo = form.full_name && form.email && form.email.includes("@");
      return basicInfo && isPhoneValid(form.phone);
    }
    return true;
  };

  const fetchPreview = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-users/preview-email", {
        body: {
          full_name: form.full_name,
          is_staff: form.user_type === "staff",
          tenant_id: form.tenant_id,
        },
      });
      if (error) throw error;
      setPreviewHtml(data.html);
    } catch (e) {
      console.error("Erro ao carregar preview:", e);
    }
  };

  useEffect(() => {
    if (step === 2) {
      fetchPreview();
    }
  }, [step, form.tenant_id, form.user_type]);

  const handleSubmit = async () => {
    setLoading(true);
    // Ensure phone has DDI 55
    const formattedPhone = form.phone ? `55${form.phone}` : "";
    
    try {
      if (form.user_type === "staff") {
        const res = await supabase.functions.invoke("manage-users/create", {
          body: {
            email: form.email,
            full_name: form.full_name,
            phone: formattedPhone,
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
            phone: formattedPhone,
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
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${form.phone && !isPhoneValid(form.phone) ? "border-destructive" : ""}`}
              />
              {form.phone && !isPhoneValid(form.phone) && (
                <p className="text-[10px] text-destructive">Telefone deve conter DDD + 9 dígitos</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="data">Dados</TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5" /> E-mail
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="data" className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Resumo do Cadastro</p>
                <div className="bg-secondary/30 border rounded-lg p-4 space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Nome:</span> <strong>{form.full_name || "Não informado"}</strong></p>
                  <p><span className="text-muted-foreground">Email:</span> <strong>{form.email || "Não informado"}</strong></p>
                  {form.phone && <p><span className="text-muted-foreground">Tel:</span> <strong>{form.phone}</strong></p>}
                  <p><span className="text-muted-foreground">Vínculo:</span> <strong>{form.user_type === "staff" ? "Staff All Vita" : "Empresa Parceira"}</strong></p>
                  {form.user_type === "tenant" && (
                    <>
                      <p><span className="text-muted-foreground">Empresa:</span> <strong>{tenants.find(t => t.id === form.tenant_id)?.name}</strong></p>
                      <p><span className="text-muted-foreground">Papel:</span> <strong>{form.role}</strong></p>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="border rounded-lg overflow-hidden bg-[#f4f4f4] p-4 min-h-[300px] flex items-center justify-center">
                  {previewHtml ? (
                    <div 
                      className="bg-white shadow-sm w-full transform scale-[0.85] origin-top"
                      dangerouslySetInnerHTML={{ __html: previewHtml }} 
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <p className="text-xs">Gerando pré-visualização...</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <p className="text-[10px] text-muted-foreground bg-primary/5 p-2 rounded border border-primary/10">
              ℹ️ O e-mail acima será enviado para <strong>{form.email}</strong> contendo a senha provisória gerada automaticamente.
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
