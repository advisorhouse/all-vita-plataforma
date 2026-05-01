import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, Upload, X, Globe } from "lucide-react";

interface TenantEditTabProps {
  tenant: any;
}

interface ImageUploadProps {
  label: string;
  hint: string;
  preview: string | null;
  onFileChange: (file: File) => void;
  onClear: () => void;
  accept?: string;
  previewClass?: string;
}

const ImageUploadField: React.FC<ImageUploadProps> = ({
  label, hint, preview, onFileChange, onClear, accept = "image/png,image/svg+xml,image/webp", previewClass = "h-16 w-16"
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <p className="text-xs text-muted-foreground">{hint}</p>
    <div className="flex items-center gap-4">
      {preview ? (
        <div className="relative">
          <img src={preview} alt={label} className={`${previewClass} rounded-lg object-contain border bg-muted/30`} />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className={`${previewClass} rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition`}>
          <Upload className="h-5 w-5 text-muted-foreground" />
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileChange(file);
            }}
          />
        </label>
      )}
    </div>
  </div>
);

const TenantEditTab: React.FC<TenantEditTabProps> = ({ tenant }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: tenant.name || "",
    trade_name: tenant.trade_name || "",
    slug: tenant.slug || "",
    cnpj: tenant.cnpj || "",
    domain: tenant.domain || "",
    primary_color: tenant.primary_color || "#6366f1",
    secondary_color: tenant.secondary_color || "#818cf8",
    custom_transaction_fee: tenant.custom_transaction_fee || "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo_url);
  const [isotipoFile, setIsotipoFile] = useState<File | null>(null);
  const [isotipoPreview, setIsotipoPreview] = useState<string | null>(tenant.isotipo_url);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(tenant.favicon_url);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (file: File, key: string) => {
    const ext = file.name.split(".").pop();
    const path = `${tenant.id}/${key}.${ext}`;
    const { error } = await supabase.storage
      .from("tenant-logos")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("tenant-logos").getPublicUrl(path);
    return data.publicUrl;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let logo_url = tenant.logo_url;
      let isotipo_url = tenant.isotipo_url;
      let favicon_url = tenant.favicon_url;

      if (logoFile) logo_url = await uploadImage(logoFile, "logo");
      if (isotipoFile) isotipo_url = await uploadImage(isotipoFile, "isotipo");
      if (faviconFile) favicon_url = await uploadImage(faviconFile, "favicon");

      // Handle cleared images
      if (!logoPreview) logo_url = null;
      if (!isotipoPreview) isotipo_url = null;
      if (!faviconPreview) favicon_url = null;

      const { error } = await supabase
        .from("tenants")
        .update({
          name: form.name,
          trade_name: form.trade_name,
          slug: form.slug,
          cnpj: form.cnpj,
          domain: form.domain || null,
          primary_color: form.primary_color,
          secondary_color: form.secondary_color,
          logo_url,
          isotipo_url,
          favicon_url,
          custom_transaction_fee: form.custom_transaction_fee ? Number(form.custom_transaction_fee) : null,
        })
        .eq("id", tenant.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenant", tenant.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast.success("Empresa atualizada com sucesso!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar empresa");
    },
  });

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados Cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Razão Social *</Label>
              <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nome Fantasia</Label>
              <Input value={form.trade_name} onChange={(e) => handleChange("trade_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-1.5">
              <Label>Taxa All Vita (% sobre transação)</Label>
              <Input 
                type="number" 
                step="0.1"
                value={form.custom_transaction_fee} 
                onChange={(e) => handleChange("custom_transaction_fee", e.target.value)} 
                placeholder="Ex: 3.5"
              />
              <p className="text-[10px] text-muted-foreground">Se vazio, utiliza a taxa padrão do plano SaaS.</p>
            </div>
          </div>

          {/* Domain section */}
          <div className="space-y-6 pt-4 border-t">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Configuração de Domínio e DNS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Subdomínio Padrão</Label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 text-sm">
                    <span className="font-medium flex-1">{form.slug || "slug"}.allvita.com.br</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText(`${form.slug}.allvita.com.br`);
                        toast.success("Copiado!");
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">Este endereço é gerado automaticamente e requer o registro A no DNS do allvita.com.br.</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Domínio Personalizado (Opcional)</Label>
                  <Input value={form.domain} onChange={(e) => handleChange("domain", e.target.value)} placeholder="exemplo.com.br" />
                  <p className="text-[11px] text-muted-foreground">Configure caso o cliente queira usar um domínio próprio.</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <p className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  Registros DNS Necessários
                </p>
                
                <div className="space-y-2 font-mono text-[10px]">
                  <div className="flex items-center justify-between bg-white/80 p-2 rounded border border-amber-100">
                    <span className="font-bold text-amber-900 w-6">A</span>
                    <span className="flex-1 px-2">{form.slug || "slug"}</span>
                    <span className="font-bold">185.158.133.1</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/80 p-2 rounded border border-amber-100">
                    <span className="font-bold text-amber-900 w-6">TXT</span>
                    <span className="flex-1 px-2">_lovable</span>
                    <span className="text-amber-700 italic">lovable_verify=...</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-amber-700 leading-tight">
                  <strong>Atenção:</strong> Adicione os registros acima no Registro.br (allvita.com.br) e conecte o domínio no painel do Lovable para ativar o SSL.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
          <CardDescription>Identidade visual da empresa nos portais white-label</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <ImageUploadField
            label="Logo Principal"
            hint="Formato: PNG, SVG ou WebP · Recomendado: 400×120px · Fundo transparente"
            preview={logoPreview}
            onFileChange={(file) => { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }}
            onClear={() => { setLogoFile(null); setLogoPreview(null); }}
            previewClass="h-16 w-40"
          />

          {/* Isotipo */}
          <ImageUploadField
            label="Isotipo (Ícone da Marca)"
            hint="Formato: PNG ou SVG · Tamanho: 128×128px · Usado em avatares e ícones compactos"
            preview={isotipoPreview}
            onFileChange={(file) => { setIsotipoFile(file); setIsotipoPreview(URL.createObjectURL(file)); }}
            onClear={() => { setIsotipoFile(null); setIsotipoPreview(null); }}
            previewClass="h-14 w-14"
          />

          {/* Favicon */}
          <ImageUploadField
            label="Favicon"
            hint="Formato: PNG, ICO ou SVG · Tamanho: 32×32px ou 64×64px · Ícone da aba do navegador"
            preview={faviconPreview}
            onFileChange={(file) => { setFaviconFile(file); setFaviconPreview(URL.createObjectURL(file)); }}
            onClear={() => { setFaviconFile(null); setFaviconPreview(null); }}
            accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
            previewClass="h-10 w-10"
          />

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>Cor Principal</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color} onChange={(e) => handleChange("primary_color", e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                <Input value={form.primary_color} onChange={(e) => handleChange("primary_color", e.target.value)} className="font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.secondary_color} onChange={(e) => handleChange("secondary_color", e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                <Input value={form.secondary_color} onChange={(e) => handleChange("secondary_color", e.target.value)} className="font-mono text-sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default TenantEditTab;
