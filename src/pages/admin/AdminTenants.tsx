import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Building2, Globe, Users, Loader2, Upload, X, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface TenantFormData {
  name: string;
  trade_name: string;
  slug: string;
  cnpj: string;
  primary_color: string;
  secondary_color: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_cpf: string;
  address_cep: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_district: string;
  address_city: string;
  address_state: string;
}

const emptyForm: TenantFormData = {
  name: "", trade_name: "", slug: "", cnpj: "",
  primary_color: "#6366f1", secondary_color: "#8b5cf6",
  owner_name: "", owner_email: "", owner_phone: "", owner_cpf: "",
  address_cep: "", address_street: "", address_number: "",
  address_complement: "", address_district: "", address_city: "", address_state: "",
};

const AdminTenants: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TenantFormData>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A logo deve ter no máximo 2MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTenant = useMutation({
    mutationFn: async (formData: TenantFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("tenant-onboarding", {
        body: {
          name: formData.name,
          trade_name: formData.trade_name || undefined,
          slug: formData.slug,
          cnpj: formData.cnpj || undefined,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          owner: {
            full_name: formData.owner_name,
            email: formData.owner_email,
            phone: formData.owner_phone || undefined,
            cpf: formData.owner_cpf || undefined,
          },
          address: formData.address_cep ? {
            cep: formData.address_cep,
            street: formData.address_street,
            number: formData.address_number,
            complement: formData.address_complement,
            district: formData.address_district,
            city: formData.address_city,
            state: formData.address_state,
          } : undefined,
        },
      });

      if (res.error) {
        // Edge function may return error in data body
        const errorMsg = res.error?.message || (typeof res.data === 'object' && res.data?.error) || "Erro desconhecido";
        throw new Error(errorMsg);
      }

      // Check for error in response body (non-2xx wrapped by invoke)
      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      // Upload logo if provided — tenant object is in res.data.tenant
      const tenantId = res.data?.tenant?.id;
      if (logoFile && tenantId) {
        const ext = logoFile.name.split(".").pop() || "png";
        const filePath = `${tenantId}/logo.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("tenant-logos")
          .upload(filePath, logoFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("tenant-logos")
            .getPublicUrl(filePath);

          await supabase
            .from("tenants")
            .update({ logo_url: urlData.publicUrl })
            .eq("id", tenantId);
        }
      }

      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success(`Empresa "${form.name}" criada com sucesso!`, {
        description: `Subdomínio: ${data.subdomain}`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dash-tenants"] });
      setOpen(false);
      setForm(emptyForm);
      removeLogo();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar empresa", { description: error.message });
    },
  });

  const handleSlugGenerate = () => {
    if (!form.trade_name && !form.name) return;
    const base = (form.trade_name || form.name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setForm((f) => ({ ...f, slug: base }));
  };

  const set = (key: keyof TenantFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerenciar tenants cadastrados na plataforma All Vita
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar nova empresa</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); createTenant.mutate(form); }}
              className="space-y-6"
            >
              {/* Logo Upload */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Logo da Empresa</h3>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img src={logoPreview} alt="Logo preview" className="h-20 w-20 rounded-lg object-contain border border-border bg-secondary/30" />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent/50 hover:bg-secondary/30 transition-colors"
                    >
                      <Image className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground">Upload</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      {logoFile ? "Trocar logo" : "Selecionar logo"}
                    </Button>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG ou WebP · Máx 2MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />
                </div>
              </div>

              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dados da Empresa</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Razão Social *</Label>
                    <Input value={form.name} onChange={set("name")} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Fantasia</Label>
                    <Input value={form.trade_name} onChange={set("trade_name")} onBlur={handleSlugGenerate} />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input value={form.cnpj} onChange={set("cnpj")} placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (subdomínio) *</Label>
                    <div className="flex items-center gap-2">
                      <Input value={form.slug} onChange={set("slug")} required placeholder="minha-empresa" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">.allvita.com.br</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Primária</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.primary_color} onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input value={form.primary_color} onChange={set("primary_color")} className="font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Secundária</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.secondary_color} onChange={(e) => setForm(f => ({ ...f, secondary_color: e.target.value }))} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input value={form.secondary_color} onChange={set("secondary_color")} className="font-mono text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sócio Responsável (Usuário Master)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input value={form.owner_name} onChange={set("owner_name")} required />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail *</Label>
                    <Input type="email" value={form.owner_email} onChange={set("owner_email")} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.owner_phone} onChange={set("owner_phone")} placeholder="+55 11 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input value={form.owner_cpf} onChange={set("owner_cpf")} />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Endereço</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input value={form.address_cep} onChange={set("address_cep")} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Rua</Label>
                    <Input value={form.address_street} onChange={set("address_street")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input value={form.address_number} onChange={set("address_number")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input value={form.address_complement} onChange={set("address_complement")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input value={form.address_district} onChange={set("address_district")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input value={form.address_city} onChange={set("address_city")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input value={form.address_state} onChange={set("address_state")} placeholder="SP" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createTenant.isPending}>
                {createTenant.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cadastrar Empresa
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tenant list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tenants && tenants.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((t: any) => (
            <Card key={t.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: t.primary_color || "#6366f1" }} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {t.logo_url ? (
                      <img src={t.logo_url} alt={t.name} className="h-10 w-10 rounded-lg object-contain" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: t.primary_color || "#6366f1" }}>
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{t.trade_name || t.name}</CardTitle>
                      {t.trade_name && <p className="text-xs text-muted-foreground">{t.name}</p>}
                    </div>
                  </div>
                  <Badge variant={t.status === "active" || t.active ? "default" : "secondary"}>
                    {t.status === "active" || t.active ? "Ativa" : "Suspensa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{t.slug}.allvita.com.br</span>
                </div>
                {t.cnpj && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{formatCnpj(t.cnpj)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>Criado em {new Date(t.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhuma empresa cadastrada ainda.</p>
          <p className="text-xs mt-1">Clique em "Nova Empresa" para começar.</p>
        </Card>
      )}
    </div>
  );
};

function formatCnpj(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export default AdminTenants;
