import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Upload, X, Image, Search } from "lucide-react";
import { IMaskInput } from "react-imask";

interface TenantFormData {
  name: string;
  trade_name: string;
  slug: string;
  cnpj: string;
  segment: string;
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
  name: "", trade_name: "", slug: "", cnpj: "", segment: "",
  primary_color: "#6366f1", secondary_color: "#8b5cf6",
  owner_name: "", owner_email: "", owner_phone: "", owner_cpf: "",
  address_cep: "", address_street: "", address_number: "",
  address_complement: "", address_district: "", address_city: "", address_state: "",
};

interface CreateTenantDialogProps {
  trigger?: React.ReactNode;
}

const CreateTenantDialog: React.FC<CreateTenantDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TenantFormData>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const queryClient = useQueryClient();

  const validateCNPJ = (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) return false;

    // Reject known invalid ones
    if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;

    // Validation logic
    let size = cleanCnpj.length - 2;
    let numbers = cleanCnpj.substring(0, size);
    const digits = cleanCnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cleanCnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  };

  const fetchCnpjData = async () => {
    const cleanCnpj = form.cnpj.replace(/\D/g, "");
    
    if (!validateCNPJ(cleanCnpj)) {
      toast.error("CNPJ Inválido", { 
        description: "O número informado não é um CNPJ válido. Verifique os dígitos." 
      });
      return;
    }

    setFetchingCnpj(true);
    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`);
      if (!response.ok) throw new Error("CNPJ não encontrado");
      const data = await response.json();

      setForm((prev) => ({
        ...prev,
        name: data.razao_social || prev.name,
        trade_name: data.estabelecimento?.nome_fantasia || prev.trade_name,
        address_cep: data.estabelecimento?.cep || prev.address_cep,
        address_street: data.estabelecimento?.logradouro || prev.address_street,
        address_number: data.estabelecimento?.numero || prev.address_number,
        address_complement: data.estabelecimento?.complemento || prev.address_complement,
        address_district: data.estabelecimento?.bairro || prev.address_district,
        address_city: data.estabelecimento?.cidade?.nome || prev.address_city,
        address_state: data.estabelecimento?.estado?.sigla || prev.address_state,
        slug: prev.slug || (data.estabelecimento?.nome_fantasia || data.razao_social || "")
          .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
        owner_name: data.socios?.[0]?.nome || prev.owner_name,
      }));

      // Try to fetch logo from domain
      let domain = data.estabelecimento?.email?.split('@')[1];
      // Fallback: check if the API returns a website field (some do)
      if (!domain && data.estabelecimento?.website) {
        domain = data.estabelecimento.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      }

      if (domain && !['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'uol.com.br', 'terra.com.br', 'ig.com.br'].includes(domain)) {
        // Primary source: Clearbit
        const clearbitUrl = `https://logo.clearbit.com/${domain}`;
        // Fallback source: Google Favicon (usually lower res but always exists if site exists)
        const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        
        try {
          const logoCheck = await fetch(clearbitUrl, { method: 'HEAD' });
          if (logoCheck.ok) {
            setLogoPreview(clearbitUrl);
          } else {
            // Fallback if clearbit fails
            setLogoPreview(googleFaviconUrl);
          }
        } catch (e) {
          setLogoPreview(googleFaviconUrl);
        }
      }

      toast.success("Dados carregados com sucesso!");
    } catch (error) {
      toast.error("Erro ao buscar CNPJ", { description: "Não foi possível carregar os dados automaticamente." });
    } finally {
      setFetchingCnpj(false);
    }
  };

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

  const createTenant = useMutation({
    mutationFn: async (formData: TenantFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("tenant-onboarding", {
        body: {
          ...formData, // simplified for brevity but keeping original logic
          trade_name: formData.trade_name || undefined,
          cnpj: formData.cnpj || undefined,
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
        const errorMsg = res.error?.message || (typeof res.data === 'object' && res.data?.error) || "Erro desconhecido";
        throw new Error(errorMsg);
      }
      if (res.data?.error) throw new Error(res.data.error);

      const tenantId = res.data?.tenant?.id;
      if (tenantId) {
        let finalLogoFile = logoFile;

        // If we have a logoPreview that is a URL (from Clearbit), we need to fetch it first
        if (!finalLogoFile && logoPreview && logoPreview.startsWith('http')) {
          try {
            const logoRes = await fetch(logoPreview);
            const blob = await logoRes.blob();
            finalLogoFile = new File([blob], 'logo.png', { type: blob.type });
          } catch (e) {
            console.error("Failed to fetch remote logo", e);
          }
        }

        if (finalLogoFile) {
          const ext = finalLogoFile.name.split(".").pop() || "png";
          const filePath = `${tenantId}/logo.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("tenant-logos")
            .upload(filePath, finalLogoFile, { upsert: true });
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from("tenant-logos").getPublicUrl(filePath);
            await supabase.from("tenants").update({ logo_url: urlData.publicUrl }).eq("id", tenantId);
          }
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
      queryClient.invalidateQueries({ queryKey: ["admin-tenant-metrics"] });
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
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    setForm((f) => ({ ...f, slug: base }));
  };

  const set = (key: keyof TenantFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button><Plus className="h-4 w-4 mr-2" /> Nova Empresa</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none overflow-y-auto">
        <DialogHeader className="max-w-4xl mx-auto w-full pt-8">
          <DialogTitle className="text-2xl">Cadastrar nova empresa</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); createTenant.mutate(form); }} className="space-y-8 max-w-4xl mx-auto w-full pb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b pb-2">Identificação e CNPJ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <Label className="text-base">CNPJ *</Label>
                <div className="flex gap-2">
                  <IMaskInput
                    mask="00.000.000/0000-00"
                    value={form.cnpj}
                    unmask={true}
                    onAccept={(value) => setForm(f => ({ ...f, cnpj: value }))}
                    placeholder="00.000.000/0000-00"
                    className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button 
                    type="button" 
                    variant="default" 
                    size="lg"
                    onClick={fetchCnpjData}
                    disabled={fetchingCnpj || form.cnpj.length < 14}
                    className="h-12 px-6"
                  >
                    {fetchingCnpj ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar Dados
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Comece pelo CNPJ para preencher os dados automaticamente.</p>
              </div>

              <div className="space-y-2"><Label>Razão Social *</Label><Input value={form.name} onChange={set("name")} required className="h-10" /></div>
              <div className="space-y-2"><Label>Nome Fantasia</Label><Input value={form.trade_name} onChange={set("trade_name")} onBlur={handleSlugGenerate} className="h-10" /></div>
              
              <div className="space-y-2">
                <Label>Segmento / Nicho *</Label>
                <Input 
                  value={form.segment} 
                  onChange={set("segment")} 
                  required 
                  placeholder="Ex: Farmácia, Academia, Varejo..." 
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label>Slug (subdomínio) *</Label>
                <div className="flex items-center gap-2">
                  <Input value={form.slug} onChange={set("slug")} required placeholder="minha-empresa" className="h-10" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.allvita.com.br</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logo & Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b pb-2">Identidade Visual</h3>
              <div className="flex items-center gap-6">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo preview" className="h-24 w-24 rounded-lg object-contain border border-border bg-secondary/30 p-2" />
                    <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all">
                    <Image className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Upload Logo</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    {logoFile ? "Trocar logo" : "Selecionar logo"}
                  </Button>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG ou WebP · Máx 2MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleLogoSelect} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b pb-2">Cores da Plataforma</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.primary_color} onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))} className="h-10 w-12 rounded border cursor-pointer" />
                    <Input value={form.primary_color} onChange={set("primary_color")} className="font-mono text-xs h-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.secondary_color} onChange={(e) => setForm(f => ({ ...f, secondary_color: e.target.value }))} className="h-10 w-12 rounded border cursor-pointer" />
                    <Input value={form.secondary_color} onChange={set("secondary_color")} className="font-mono text-xs h-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Owner */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sócio Responsável (Usuário Master)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome Completo *</Label><Input value={form.owner_name} onChange={set("owner_name")} required /></div>
              <div className="space-y-2"><Label>E-mail *</Label><Input type="email" value={form.owner_email} onChange={set("owner_email")} required /></div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <IMaskInput
                  mask="(00) 00000-0000"
                  value={form.owner_phone}
                  unmask={true}
                  onAccept={(value) => setForm(f => ({ ...f, owner_phone: value }))}
                  placeholder="(00) 00000-0000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <IMaskInput
                  mask="000.000.000-00"
                  value={form.owner_cpf}
                  unmask={true}
                  onAccept={(value) => setForm(f => ({ ...f, owner_cpf: value }))}
                  placeholder="000.000.000-00"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Endereço</h3>
            <div className="grid grid-cols-3 gap-4">
               <div className="space-y-2">
                <Label>CEP</Label>
                <div className="flex gap-2">
                  <IMaskInput
                    mask="00000-000"
                    value={form.address_cep}
                    unmask={true}
                    onAccept={(value) => setForm(f => ({ ...f, address_cep: value }))}
                    placeholder="00000-000"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="col-span-2 space-y-2"><Label>Rua</Label><Input value={form.address_street} onChange={set("address_street")} /></div>
              <div className="space-y-2"><Label>Número</Label><Input value={form.address_number} onChange={set("address_number")} /></div>
              <div className="space-y-2"><Label>Complemento</Label><Input value={form.address_complement} onChange={set("address_complement")} /></div>
              <div className="space-y-2"><Label>Bairro</Label><Input value={form.address_district} onChange={set("address_district")} /></div>
              <div className="space-y-2"><Label>Cidade</Label><Input value={form.address_city} onChange={set("address_city")} /></div>
              <div className="space-y-2"><Label>Estado</Label><Input value={form.address_state} onChange={set("address_state")} placeholder="SP" /></div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={createTenant.isPending}>
            {createTenant.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Cadastrar Empresa
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTenantDialog;
