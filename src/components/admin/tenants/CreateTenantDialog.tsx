import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Upload, X, Image, Search, Globe, Plug, Copy, Check } from "lucide-react";
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

interface TenantDraftData {
  form: TenantFormData;
  logoPreview: string | null;
  iconPreview: string | null;
  faviconPreview: string | null;
  customSegment: string;
  isCustomSegment: boolean;
}

// Specs (memória tenant-identity-specifications)
const ASSET_SPECS = {
  logo: { w: 240, h: 64, label: "Logo (240×64)" },
  icon: { w: 64, h: 64, label: "Ícone (64×64)" },
  favicon: { w: 32, h: 32, label: "Favicon (32×32)" },
};

const emptyForm: TenantFormData = {
  name: "", trade_name: "", slug: "", cnpj: "", segment: "",
  primary_color: "#6366f1", secondary_color: "#8b5cf6",
  owner_name: "", owner_email: "", owner_phone: "", owner_cpf: "",
  address_cep: "", address_street: "", address_number: "",
  address_complement: "", address_district: "", address_city: "", address_state: "",
};

 interface CreateTenantDialogProps {
  trigger?: React.ReactNode;
  resumeTenant?: any;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

const CreateTenantDialog: React.FC<CreateTenantDialogProps> = ({ trigger, resumeTenant, open: externalOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setInternalOpen(val);
  };

  const [step, setStep] = useState<"form" | "branding" | "dns">("form");
  const [verifyingDns, setVerifyingDns] = useState(false);
  const [createdTenant, setCreatedTenant] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [emailDnsRecords, setEmailDnsRecords] = useState<any[]>([]);
  const [loadingEmailDns, setLoadingEmailDns] = useState(false);
  const [emailDnsError, setEmailDnsError] = useState<string | null>(null);

  const persistableLogoPreview = (preview: string | null) => {
    if (!preview) return null;
    return preview.startsWith("blob:") ? null : preview;
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copiado para a área de transferência");
    setTimeout(() => setCopiedField(null), 2000);
  };

  React.useEffect(() => {
    if (resumeTenant && open) {
      setCreatedTenant({
        tenant: resumeTenant,
        url: `https://app.allvita.com.br/${resumeTenant.slug}`,
      });
      setStep("dns");
    }
  }, [resumeTenant, open]);
  const [form, setForm] = useState<TenantFormData>(emptyForm);
  const [customSegment, setCustomSegment] = useState("");
  const [isCustomSegment, setIsCustomSegment] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [assetWarnings, setAssetWarnings] = useState<Record<string, string | null>>({ logo: null, icon: null, favicon: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const queryClient = useQueryClient();
  const STORAGE_KEY = "allvita-tenant-form-draft";
  const DNS_STEP_STORAGE_KEY = "allvita-tenant-dns-step";
  const OPEN_STATE_KEY = "allvita-tenant-dialog-open";

  // Load draft on mount
  React.useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed?.form) {
          const savedDraft = parsed as TenantDraftData;
          setForm({ ...emptyForm, ...savedDraft.form });
          setLogoPreview(savedDraft.logoPreview || null);
          setIconPreview(savedDraft.iconPreview || null);
          setFaviconPreview(savedDraft.faviconPreview || null);
          setCustomSegment(savedDraft.customSegment || "");
          setIsCustomSegment(Boolean(savedDraft.isCustomSegment));
        } else {
          setForm({ ...emptyForm, ...parsed });
        }
      } catch (e) {
        console.error("Error loading draft", e);
      }
    }

    const dnsStepData = localStorage.getItem(DNS_STEP_STORAGE_KEY);
    if (dnsStepData) {
      try {
        const parsed = JSON.parse(dnsStepData);
        const tenantId = parsed?.createdTenant?.tenant?.id;
        if (tenantId) {
          // Validate the tenant still exists in the DB before restoring DNS step
          supabase.from("tenants").select("id").eq("id", tenantId).maybeSingle().then(({ data }) => {
            if (data) {
              setCreatedTenant(parsed.createdTenant);
              setStep(parsed.step);
            } else {
              // Stale draft — discard
              localStorage.removeItem(DNS_STEP_STORAGE_KEY);
            }
          });
        }
      } catch (e) {
        console.error("Error loading DNS step draft", e);
      }
    }

    // Restore open state if we had a draft or was in DNS step
    const wasOpen = localStorage.getItem(OPEN_STATE_KEY);
    if (wasOpen === "true" && (draft || dnsStepData)) {
      setOpen(true);
    }
  }, []);

  // Save drafts on change
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      form,
      logoPreview: persistableLogoPreview(logoPreview),
      iconPreview: persistableLogoPreview(iconPreview),
      faviconPreview: persistableLogoPreview(faviconPreview),
      customSegment,
      isCustomSegment,
    } satisfies TenantDraftData));
  }, [form, logoPreview, iconPreview, faviconPreview, customSegment, isCustomSegment]);

  React.useEffect(() => {
    if (createdTenant || step === "dns") {
      localStorage.setItem(DNS_STEP_STORAGE_KEY, JSON.stringify({ createdTenant, step }));
    } else {
      localStorage.removeItem(DNS_STEP_STORAGE_KEY);
    }
  }, [createdTenant, step]);

  React.useEffect(() => {
    localStorage.setItem(OPEN_STATE_KEY, String(open));
  }, [open]);

  const { data: segments } = useQuery({
    queryKey: ["tenant-segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_segments")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

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
        // Mantemos o segmento vazio para forçar a escolha manual baseada no nicho do produto
        segment: prev.segment,
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
            setFaviconPreview(clearbitUrl);
          } else {
            // Fallback if clearbit fails
            setFaviconPreview(googleFaviconUrl);
          }
        } catch (e) {
          setFaviconPreview(googleFaviconUrl);
        }
      }

      toast.success("Dados carregados com sucesso!");
    } catch (error) {
      toast.error("Erro ao buscar CNPJ", { description: "Não foi possível carregar os dados automaticamente." });
    } finally {
      setFetchingCnpj(false);
    }
  };

  const validateImageDimensions = (file: File, target: { w: number; h: number; label: string }): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type === "image/svg+xml") return resolve(null);
      const img = new window.Image();
      img.onload = () => {
        const tolerance = 0.15; // 15%
        const wOk = Math.abs(img.width - target.w) / target.w <= tolerance;
        const hOk = Math.abs(img.height - target.h) / target.h <= tolerance;
        if (wOk && hOk) resolve(null);
        else resolve(`Dimensão recomendada: ${target.w}×${target.h}px. Você enviou ${img.width}×${img.height}px.`);
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAssetSelect = (
    asset: "logo" | "icon" | "favicon",
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void,
  ) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = asset === "favicon" ? 512 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`O arquivo deve ter no máximo ${asset === "favicon" ? "512KB" : "2MB"}`);
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
    const warning = await validateImageDimensions(file, ASSET_SPECS[asset]);
    setAssetWarnings((prev) => ({ ...prev, [asset]: warning }));
  };

  const handleLogoSelect = handleAssetSelect("logo", setLogoFile, setLogoPreview);
  const handleIconSelect = handleAssetSelect("icon", setIconFile, setIconPreview);
  const handleFaviconSelect = handleAssetSelect("favicon", setFaviconFile, setFaviconPreview);

  const removeAsset = (
    asset: "logo" | "icon" | "favicon",
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void,
    ref: React.RefObject<HTMLInputElement>,
  ) => () => {
    setFile(null);
    setPreview(null);
    setAssetWarnings((prev) => ({ ...prev, [asset]: null }));
    if (ref.current) ref.current.value = "";
  };

  const removeLogo = removeAsset("logo", setLogoFile, setLogoPreview, fileInputRef);
  const removeIcon = removeAsset("icon", setIconFile, setIconPreview, iconInputRef);
  const removeFavicon = removeAsset("favicon", setFaviconFile, setFaviconPreview, faviconInputRef);

  const removeAllAssets = () => {
    removeLogo();
    removeIcon();
    removeFavicon();
  };

  const createTenant = useMutation({
    mutationFn: async (formData: TenantFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("tenant-onboarding", {
        body: {
          ...formData,
          skip_email: true,
          trade_name: formData.trade_name || undefined,
          cnpj: formData.cnpj || undefined,
          logo_url: logoPreview && logoPreview.startsWith('http') ? logoPreview : undefined,
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
        const updates: Record<string, string> = {};

        // Helper: upload an asset to tenant-logos and return public URL
        const uploadAsset = async (file: File, name: string): Promise<string | null> => {
          const ext = file.name.split(".").pop() || "png";
          const filePath = `${tenantId}/${name}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("tenant-logos")
            .upload(filePath, file, { upsert: true });
          if (uploadError) {
            console.error(`Failed to upload ${name}`, uploadError);
            return null;
          }
          const { data: urlData } = supabase.storage.from("tenant-logos").getPublicUrl(filePath);
          return urlData.publicUrl;
        };

        // LOGO: file selected OR remote URL (Clearbit) OR persisted from draft
        let finalLogoFile = logoFile;
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
          const url = await uploadAsset(finalLogoFile, "logo");
          if (url) updates.logo_url = url;
        }

        if (iconFile) {
          const url = await uploadAsset(iconFile, "icon");
          if (url) updates.isotipo_url = url;
        }

        if (faviconFile) {
          const url = await uploadAsset(faviconFile, "favicon");
          if (url) updates.favicon_url = url;
        }

        if (Object.keys(updates).length > 0) {
          await supabase.from("tenants").update(updates).eq("id", tenantId);
        }
      }
      return res.data;
    },
    onSuccess: async (data: any) => {
      const tenantUrl = `https://app.allvita.com.br/${data.tenant.slug}`;

      // Mark tenant as fully active immediately — no DNS step required.
      try {
        await supabase
          .from('tenants')
          .update({
            dns_status: 'active',
            dns_verified_at: new Date().toISOString(),
            status: 'active',
          })
          .eq('id', data.tenant.id);
      } catch (e) {
        console.warn("Failed to auto-activate tenant", e);
      }

      toast.success(`Empresa "${form.name}" criada!`, {
        description: `URL pronta: ${tenantUrl}`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dash-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tenant-metrics"] });

      setCreatedTenant({ ...data, url: tenantUrl });
      setStep("dns");
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

  // Path-based routing: no DNS check needed. Tenant URL is ready instantly.


  // Fetch real Resend DNS records when entering DNS step
  React.useEffect(() => {
    const fetchEmailDns = async () => {
      if (step !== "dns" || !createdTenant?.tenant?.id) return;
      setLoadingEmailDns(true);
      setEmailDnsError(null);
      try {
        // Try cached first via GET
        const { data: getData } = await supabase.functions.invoke("resend-domain-setup", {
          method: "GET" as any,
          body: { tenantId: createdTenant.tenant.id },
        });

        let records = getData?.records;

        // If no cached records, create the domain
        if (!records || records.length === 0) {
          const { data: postData, error } = await supabase.functions.invoke("resend-domain-setup", {
            body: { tenantId: createdTenant.tenant.id },
          });
          if (error) throw error;
          if (postData?.error) throw new Error(postData.error);
          records = postData?.records || [];
        }

        setEmailDnsRecords(records || []);
      } catch (err: any) {
        console.error("Erro ao buscar DNS de e-mail:", err);
        setEmailDnsError(err.message || "Não foi possível obter os registros de e-mail");
      } finally {
        setLoadingEmailDns(false);
      }
    };
    fetchEmailDns();
  }, [step, createdTenant?.tenant?.id]);

  const handleVerifyDns = async () => {
    if (!createdTenant) return;
    setVerifyingDns(true);
    try {
      // Tenant is already active (set in mutation onSuccess). Just send the
      // activation e-mail to the owner.
      await supabase.functions.invoke("tenant-onboarding/send-activation", {
        body: { tenantId: createdTenant.tenant.id }
      });

      toast.success("Cadastro Concluído!", {
        description: "O e-mail de acesso foi enviado ao cliente."
      });

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DNS_STEP_STORAGE_KEY);
      localStorage.removeItem(OPEN_STATE_KEY);
      setOpen(false);
      setForm(emptyForm);
      setStep("form");
      setCreatedTenant(null);
      removeAllAssets();
    } catch (error: any) {
      toast.error("Erro ao enviar e-mail", {
        description: error.message || "A empresa foi criada, mas o e-mail de acesso não pôde ser enviado. Você pode reenviar depois."
      });
    } finally {
      setVerifyingDns(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Logic for closing
      if (!val) {
        // Here we could add logic if needed, but for now we just pass through
      }
      setOpen(val);
    }} modal={true}>
      <DialogTrigger asChild>
        {trigger || <Button><Plus className="h-4 w-4 mr-2" /> Nova Empresa</Button>}
      </DialogTrigger>
      <DialogContent 
        className="max-w-none w-screen h-screen m-0 rounded-none overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside to avoid losing work
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing on escape key
          e.preventDefault();
        }}
      >
        <DialogHeader className="max-w-4xl mx-auto w-full pt-8">
          <DialogTitle className="text-2xl flex items-center justify-between">
            {step === "form" ? "Cadastrar nova empresa" : step === "branding" ? "Identidade Visual da Empresa" : "Empresa Pronta"}
            {step === "form" && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (confirm("Deseja limpar todos os campos preenchidos?")) {
                    setForm(emptyForm);
                    setStep("form");
                    setCreatedTenant(null);
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem(DNS_STEP_STORAGE_KEY);
                    removeAllAssets();
                  }
                }}
                className="text-xs font-normal text-muted-foreground hover:text-destructive"
              >
                Limpar formulário
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            if (!form.cnpj || !validateCNPJ(form.cnpj)) {
              toast.error("CNPJ Inválido", { description: "Por favor, informe um CNPJ válido antes de prosseguir." });
              return;
            }
            if (!form.segment || form.segment.trim().length < 3) {
              toast.error("Segmento Obrigatório", { description: "Por favor, informe o segmento ou nicho da empresa." });
              return;
            }
            setStep("branding");
          }} className="space-y-8 max-w-4xl mx-auto w-full pb-12">
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
                  <Select 
                    value={isCustomSegment ? "Outros" : form.segment} 
                    onValueChange={(val) => {
                      if (val === "Outros") {
                        setIsCustomSegment(true);
                        setForm(f => ({ ...f, segment: customSegment }));
                      } else {
                        setIsCustomSegment(false);
                        setForm(f => ({ ...f, segment: val }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione o nicho/segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments?.map((s: any) => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))}
                      <SelectItem value="Outros">Outros (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {isCustomSegment && (
                    <Input 
                      value={customSegment} 
                      onChange={(e) => {
                        setCustomSegment(e.target.value);
                        setForm(f => ({ ...f, segment: e.target.value }));
                      }}
                      placeholder="Especifique o segmento..."
                      className="h-10 mt-2"
                      required
                    />
                  )}
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

            {/* Cores movidas para a segunda etapa */}


            {/* Owner */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b pb-2">Sócio Responsável (Usuário Master)</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><Label>Nome Completo *</Label><Input value={form.owner_name} onChange={set("owner_name")} required className="h-10" /></div>
                <div className="space-y-2"><Label>E-mail *</Label><Input type="email" value={form.owner_email} onChange={set("owner_email")} required className="h-10" /></div>
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
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b pb-2">Endereço da Sede</h3>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-2 space-y-2">
                  <Label>CEP</Label>
                  <IMaskInput
                    mask="00000-000"
                    value={form.address_cep}
                    unmask={true}
                    onAccept={(value) => setForm(f => ({ ...f, address_cep: value }))}
                    placeholder="00000-000"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="col-span-4 space-y-2"><Label>Rua</Label><Input value={form.address_street} onChange={set("address_street")} className="h-10" /></div>
                <div className="col-span-1 space-y-2"><Label>Número</Label><Input value={form.address_number} onChange={set("address_number")} className="h-10" /></div>
                <div className="col-span-2 space-y-2"><Label>Bairro</Label><Input value={form.address_district} onChange={set("address_district")} className="h-10" /></div>
                <div className="col-span-2 space-y-2"><Label>Cidade</Label><Input value={form.address_city} onChange={set("address_city")} className="h-10" /></div>
                <div className="col-span-1 space-y-2"><Label>UF</Label><Input value={form.address_state} onChange={set("address_state")} placeholder="SP" className="h-10" /></div>
                <div className="col-span-6 space-y-2"><Label>Complemento</Label><Input value={form.address_complement} onChange={set("address_complement")} className="h-10" /></div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button type="submit" size="lg" className="w-full text-lg h-14">
                Próximo Passo: Identidade Visual
              </Button>
            </div>
          </form>
        ) : step === "branding" ? (
          <div className="max-w-4xl mx-auto w-full pb-12 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Configure os assets visuais e cores que serão exibidos nos portais <strong>{form.trade_name || form.name}</strong>.
              </p>
              <p className="text-xs text-muted-foreground">
                Recomendamos as dimensões abaixo, mas você pode enviar qualquer tamanho — receberá apenas um aviso.
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg border space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b pb-2">Cores da Plataforma</h3>
              <div className="grid grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: "logo" as const, file: logoFile, preview: logoPreview, ref: fileInputRef, onSelect: handleLogoSelect, onRemove: removeLogo, hint: "Exibido na TopBar e tela de login.", previewClass: "h-20 w-full max-w-[180px] object-contain", boxClass: "h-32" },
                { key: "icon" as const, file: iconFile, preview: iconPreview, ref: iconInputRef, onSelect: handleIconSelect, onRemove: removeIcon, hint: "Sidebar colapsada e versão mobile.", previewClass: "h-20 w-20 object-contain", boxClass: "h-32" },
                { key: "favicon" as const, file: faviconFile, preview: faviconPreview, ref: faviconInputRef, onSelect: handleFaviconSelect, onRemove: removeFavicon, hint: "Aba do navegador.", previewClass: "h-12 w-12 object-contain", boxClass: "h-32" },
              ].map((asset) => (
                <div key={asset.key} className="space-y-3 border border-border rounded-xl p-5 bg-secondary/30">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{ASSET_SPECS[asset.key].label}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{asset.hint}</p>
                  </div>

                  <div className={`${asset.boxClass} rounded-lg border-2 border-dashed border-border bg-background flex items-center justify-center relative overflow-hidden`}>
                    {asset.preview ? (
                      <>
                        <img src={asset.preview} alt={`${asset.key} preview`} className={asset.previewClass} />
                        <button
                          type="button"
                          onClick={asset.onRemove}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => asset.ref.current?.click()}
                        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Image className="h-7 w-7" />
                        <span className="text-[11px]">Clique para enviar</span>
                      </button>
                    )}
                    <input
                      ref={asset.ref}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                      className="hidden"
                      onChange={asset.onSelect}
                    />
                  </div>

                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => asset.ref.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    {asset.file || asset.preview ? "Trocar arquivo" : "Selecionar arquivo"}
                  </Button>

                  {assetWarnings[asset.key] && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 leading-snug">
                      ⚠️ {assetWarnings[asset.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-secondary/40 border border-dashed rounded-lg p-4 text-xs text-muted-foreground">
              <strong className="text-foreground">Dica:</strong> Você pode pular este passo e configurar a identidade visual depois em <code className="text-[10px] bg-background px-1 py-0.5 rounded">/admin/tenants/:id</code>. Os portais usarão a logo do CNPJ (se encontrada) e um favicon padrão até lá.
            </div>

            <div className="pt-6 border-t flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 h-14"
                onClick={() => setStep("form")}
                disabled={createTenant.isPending}
              >
                Voltar
              </Button>
              <Button
                type="button"
                size="lg"
                className="flex-[2] text-lg h-14"
                onClick={() => createTenant.mutate(form)}
                disabled={createTenant.isPending}
              >
                {createTenant.isPending && <Loader2 className="h-5 w-5 mr-3 animate-spin" />}
                {createTenant.isPending ? "Criando empresa..." : "Criar empresa"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full py-12 space-y-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Empresa criada e ativa!</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                A URL da plataforma de <strong>{form.trade_name || form.name}</strong> já está funcionando. Sem DNS, sem propagação, sem espera.
              </p>
            </div>

            {/* URL final */}
            <div className="bg-secondary/50 border rounded-xl p-6 space-y-4 shadow-sm">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" /> URL de acesso da empresa
              </h4>
              <div className="flex items-center gap-2 bg-background border rounded-lg p-3 group">
                <span className="font-mono text-sm font-bold text-primary flex-1 break-all">
                  {createdTenant?.url || `https://app.allvita.com.br/${form.slug}`}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdTenant?.url || `https://app.allvita.com.br/${form.slug}`, 'tenant-url')}
                  className="shrink-0"
                >
                  {copiedField === 'tenant-url' ? (
                    <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Copiado</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar</>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compartilhe esse link com o cliente. O portal já carrega a logo, cores e identidade visual configuradas.
              </p>
            </div>

            {/* E-mail opcional */}
            <div className="bg-secondary/30 border border-dashed rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Plug className="h-4 w-4" /> Registros de E-mail (Opcional)
                </h4>
                <Badge variant="outline" className="text-[10px] font-normal">White-label</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Para que os e-mails da plataforma usem o domínio próprio do cliente (SPF + DKIM via Resend), adicione os registros abaixo no DNS dele. Você pode configurar isso depois.
              </p>

              {loadingEmailDns && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando chaves DKIM...
                </div>
              )}

              {emailDnsError && !loadingEmailDns && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
                  <strong>E-mail customizado não configurado.</strong>
                  <p className="mt-1">{emailDnsError}</p>
                  <p className="mt-1">A empresa funcionará normalmente; e-mails sairão pelo domínio padrão da All Vita.</p>
                </div>
              )}

              {!loadingEmailDns && !emailDnsError && emailDnsRecords.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 border-b pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-3">Nome</div>
                    <div className="col-span-7">Valor</div>
                  </div>
                  {emailDnsRecords.map((rec: any, idx: number) => {
                    const recordType = rec.record || rec.type;
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-2 font-mono text-xs items-start py-1.5 border-b border-border/30 last:border-0">
                        <div className="col-span-2">
                          <div className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded w-fit font-bold whitespace-nowrap text-[10px]">
                            {recordType}{rec.priority ? ` (${rec.priority})` : ""}
                          </div>
                        </div>
                        <div className="col-span-3 bg-muted/30 p-1.5 rounded break-all">{rec.name}</div>
                        <div className="col-span-7 bg-muted/30 p-1.5 rounded break-all whitespace-pre-wrap">{rec.value}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-6 space-y-3">
              <Button
                onClick={handleVerifyDns}
                disabled={verifyingDns}
                size="lg"
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
              >
                {verifyingDns ? (
                  <><Loader2 className="h-5 w-5 mr-3 animate-spin" /> Enviando e-mail de acesso...</>
                ) : (
                  "Enviar e-mail de acesso ao cliente e concluir"
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  localStorage.removeItem(DNS_STEP_STORAGE_KEY);
                  localStorage.removeItem(OPEN_STATE_KEY);
                  setOpen(false);
                  setForm(emptyForm);
                  setStep("form");
                  setCreatedTenant(null);
                  removeAllAssets();
                }}
                className="w-full text-muted-foreground"
              >
                Fechar sem enviar e-mail (você pode reenviar depois)
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateTenantDialog;
