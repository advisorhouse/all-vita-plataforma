import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, Upload, X } from "lucide-react";

interface TenantEditTabProps {
  tenant: any;
}

interface ImageUploadState {
  file: File | null;
  preview: string | null;
}

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
  });

  const [logo, setLogo] = useState<ImageUploadState>({ file: null, preview: tenant.logo_url });
  const [isotipo, setIsotipo] = useState<ImageUploadState>({ file: null, preview: tenant.isotipo_url });
  const [favicon, setFavicon] = useState<ImageUploadState>({ file: null, preview: tenant.favicon_url });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<ImageUploadState>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({ file, preview: URL.createObjectURL(file) });
    }
  };

  const uploadImage = async (imageState: ImageUploadState, pathSuffix: string, currentUrl: string | null) => {
    if (!imageState.file) return currentUrl;
    const ext = imageState.file.name.split(".").pop();
    const path = `${tenant.id}/${pathSuffix}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("tenant-logos")
      .upload(path, imageState.file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from("tenant-logos").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const logo_url = await uploadImage(logo, "logo", tenant.logo_url);
      const isotipo_url = await uploadImage(isotipo, "isotipo", tenant.isotipo_url);
      const favicon_url = await uploadImage(favicon, "favicon", tenant.favicon_url);

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
        } as any)
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

  const ImageUploadWidget = ({
    label,
    state,
    setter,
  }: {
    label: string;
    state: ImageUploadState;
    setter: React.Dispatch<React.SetStateAction<ImageUploadState>>;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {state.preview ? (
          <div className="relative">
            <img src={state.preview} alt={label} className="h-16 w-16 rounded-lg object-contain border bg-white" />
            <button
              onClick={() => setter({ file: null, preview: null })}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, setter)} />
          </label>
        )}
      </div>
    </div>
  );

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
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => handleChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Domínio Personalizado</Label>
              <Input
                value={form.domain}
                onChange={(e) => handleChange("domain", e.target.value)}
                placeholder={`${form.slug || "empresa"}.allvita.com.br`}
              />
              <p className="text-xs text-muted-foreground">
                Domínio padrão: <span className="font-mono">{form.slug}.allvita.com.br</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Images */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ImageUploadWidget label="Logo" state={logo} setter={setLogo} />
            <ImageUploadWidget label="Isotipo" state={isotipo} setter={setIsotipo} />
            <ImageUploadWidget label="Favicon" state={favicon} setter={setFavicon} />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
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
