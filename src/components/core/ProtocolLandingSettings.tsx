import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, Plus, Trash2, Upload, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";

const ICON_OPTIONS = ["Activity", "Sparkles", "ShieldCheck", "Stethoscope", "Eye"];
const QUIZ_ICON_OPTIONS = ["Smartphone", "Monitor", "Tv", "AlertTriangle"];
const SYMPTOM_ICON_OPTIONS = ["Droplet", "Eye", "Brain", "Sun", "AlertTriangle", "Sparkles"];
const AGE_ICON_OPTIONS = ["Zap", "Activity", "Heart", "ShieldCheck", "Sparkles"];
const LASTVISIT_ICON_OPTIONS = ["Check", "Clock", "AlertTriangle", "HelpCircle", "Sparkles"];

const DEFAULTS = {
  hero_badge: "Continuação do seu atendimento",
  hero_title: "Seu médico já iniciou o cuidado com a sua saúde",
  hero_subtitle: "Agora é hora de dar continuidade ao cuidado iniciado em consulta. Vamos identificar o protocolo mais adequado para você.",
  hero_cta_label: "Iniciar minha avaliação",
  hero_meta: "Menos de 2 minutos • Recomendado pelo seu médico",
  hero_image_url: "" as string | null,
  why_eyebrow: "POR QUE VOCÊ ESTÁ VENDO ESTA PÁGINA",
  why_title: "Seu atendimento não termina na consulta",
  why_paragraph_1: "",
  why_paragraph_2: "",
  reasons: [
    { title: "Estresse contínuo", description: "", icon: "Activity" },
    { title: "Proteção progressiva", description: "", icon: "Sparkles" },
    { title: "Cuidado completo", description: "", icon: "ShieldCheck" },
  ] as Array<{ title: string; description: string; icon: string }>,
  logic_eyebrow: "A LÓGICA POR TRÁS DO PROTOCOLO",
  logic_title: "Proteção estruturada para resultados de longo prazo",
  logic_description: "",
  logic_benefits: ["", "", "", ""] as string[],
  cta_title: "Identifique o nível ideal de proteção para o seu caso",
  cta_description: "",
  cta_button_label: "Iniciar minha avaliação",
  cta_meta: "Menos de 2 minutos • Resultado personalizado",
  trust_badges: ["Dados criptografados", "Recomendado por profissionais", "Resultado individualizado"] as string[],
  // Quiz screen (first question)
  quiz_header_title: "Dr. {doctor} recomendou esta avaliação",
  quiz_header_subtitle: "Complete este diagnóstico complementar para que seu protocolo de proteção seja personalizado ao seu perfil clínico",
  quiz_question_title: "Vamos começar pelo dia a dia — quanto tempo você passa olhando para telas?",
  quiz_question_subtitle: "Pode ser computador, celular, tablet ou TV. Soma tudo, sem culpa.",
  quiz_question_options: [
    { icon: "Smartphone", title: "Menos de 4h", description: "Uso tranquilo" },
    { icon: "Monitor", title: "4 a 8 horas", description: "Bastante comum hoje em dia" },
    { icon: "Tv", title: "8 a 12 horas", description: "Rotina intensa" },
    { icon: "AlertTriangle", title: "Mais de 12h", description: "Seus olhos merecem atenção extra" },
  ] as Array<{ title: string; description: string; icon: string }>,
  quiz_footer_badges: ["Dados criptografados", "LGPD compliant", "Validado por oftalmologistas"] as string[],
  quiz_symptoms_title: "Você tem sentido algum desses incômodos nos olhos?",
  quiz_symptoms_subtitle: "Marque todos que se aplicam ao seu dia a dia — mesmo que pareçam leves.",
  quiz_symptoms_options: [
    { icon: "Droplet", title: "Olhos secos ou ardendo", description: "Sensação de areia ou ressecamento" },
    { icon: "Eye", title: "Visão embaçada às vezes", description: "Dificuldade de foco em algum momento" },
    { icon: "Brain", title: "Dor de cabeça frequente", description: "Principalmente após uso de telas" },
    { icon: "Sun", title: "Incômodo com luz forte", description: "Sensibilidade ao sair para a claridade" },
  ] as Array<{ title: string; description: string; icon: string }>,
  quiz_age_title: "Qual é a sua faixa etária?",
  quiz_age_subtitle: "A proteção natural da retina muda com o tempo — e isso faz parte do processo.",
  quiz_age_options: [
    { icon: "Zap", title: "18 a 30 anos", description: "Proteção natural ainda alta" },
    { icon: "Activity", title: "31 a 45 anos", description: "Começa a reduzir gradualmente" },
    { icon: "Heart", title: "46 a 60 anos", description: "Momento importante de cuidar" },
    { icon: "ShieldCheck", title: "Acima de 60", description: "Proteção ativa é essencial" },
  ] as Array<{ title: string; description: string; icon: string }>,
  quiz_lastvisit_title: "Faz quanto tempo que você foi ao oftalmologista pela última vez?",
  quiz_lastvisit_subtitle: "Sem julgamento — o importante é começar a cuidar a partir de agora.",
  quiz_lastvisit_options: [
    { icon: "Check", title: "Menos de 1 ano", description: "Ótimo, continue assim!" },
    { icon: "Clock", title: "1 a 2 anos", description: "Talvez seja hora de agendar" },
    { icon: "AlertTriangle", title: "Mais de 2 anos", description: "Vale a pena remarcar" },
    { icon: "AlertTriangle", title: "Não lembro", description: "Acontece — mas vamos resolver" },
  ] as Array<{ title: string; description: string; icon: string }>,
};

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <Card className="border border-border shadow-sm">
    <CardContent className="p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </CardContent>
  </Card>
);

const ProtocolLandingSettings: React.FC = () => {
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(DEFAULTS);

  useEffect(() => {
    if (!currentTenant?.id) return;
    (async () => {
      const { data: row } = await (supabase as any)
        .from("tenant_protocol_landing")
        .select("*")
        .eq("tenant_id", currentTenant.id)
        .maybeSingle();
      if (row) {
        setData({
          ...DEFAULTS,
          ...row,
          reasons: Array.isArray(row.reasons) ? row.reasons : DEFAULTS.reasons,
          logic_benefits: Array.isArray(row.logic_benefits) ? row.logic_benefits : DEFAULTS.logic_benefits,
          trust_badges: Array.isArray(row.trust_badges) ? row.trust_badges : DEFAULTS.trust_badges,
          quiz_question_options: Array.isArray(row.quiz_question_options) ? row.quiz_question_options : DEFAULTS.quiz_question_options,
          quiz_footer_badges: Array.isArray(row.quiz_footer_badges) ? row.quiz_footer_badges : DEFAULTS.quiz_footer_badges,
          quiz_symptoms_options: Array.isArray(row.quiz_symptoms_options) ? row.quiz_symptoms_options : DEFAULTS.quiz_symptoms_options,
          quiz_age_options: Array.isArray(row.quiz_age_options) ? row.quiz_age_options : DEFAULTS.quiz_age_options,
        });
      }
      setLoading(false);
    })();
  }, [currentTenant?.id]);

  const set = <K extends keyof typeof DEFAULTS>(key: K, value: (typeof DEFAULTS)[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const handleUpload = async (file: File) => {
    if (!currentTenant?.id) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${currentTenant.id}/protocol-hero-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("tenant-logos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("tenant-logos").getPublicUrl(path);
      set("hero_image_url", pub.publicUrl);
      toast.success("Imagem carregada");
    } catch (e: any) {
      toast.error("Erro ao subir imagem: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTenant?.id) return;
    setSaving(true);
    try {
      const payload = { ...data, tenant_id: currentTenant.id, active: true };
      const { error } = await (supabase as any)
        .from("tenant_protocol_landing")
        .upsert(payload, { onConflict: "tenant_id" });
      if (error) throw error;
      toast.success("Configurações da landing salvas!");
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const previewUrl = `${window.location.origin}/quiz`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Edite a página de protocolo pós-consulta exibida em <span className="font-mono">/quiz</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={previewUrl} target="_blank" rel="noreferrer" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Visualizar
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* HERO */}
      <Section title="Hero (topo da página)" description="Primeira dobra com imagem e chamada principal">
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] text-muted-foreground">Imagem de fundo</Label>
            <div className="mt-1 flex items-center gap-3">
              {data.hero_image_url ? (
                <img src={data.hero_image_url} alt="" className="h-16 w-28 rounded object-cover border" />
              ) : (
                <div className="h-16 w-28 rounded border border-dashed flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <span className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs hover:bg-muted">
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {data.hero_image_url ? "Trocar imagem" : "Enviar imagem"}
                </span>
              </label>
              {data.hero_image_url && (
                <Button variant="ghost" size="sm" onClick={() => set("hero_image_url", "")} className="text-xs text-destructive">
                  Remover
                </Button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Recomendado: 1920×1080. Se vazio, usa imagem padrão.</p>
          </div>
          <Field label="Badge superior" value={data.hero_badge} onChange={(v) => set("hero_badge", v)} />
          <Field label="Título" value={data.hero_title} onChange={(v) => set("hero_title", v)} textarea />
          <Field label="Subtítulo" value={data.hero_subtitle} onChange={(v) => set("hero_subtitle", v)} textarea />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Texto do botão" value={data.hero_cta_label} onChange={(v) => set("hero_cta_label", v)} />
            <Field label="Linha de meta (abaixo do botão)" value={data.hero_meta} onChange={(v) => set("hero_meta", v)} />
          </div>
        </div>
      </Section>

      {/* WHY */}
      <Section title="Seção 'Por que você está vendo esta página'">
        <Field label="Pré-título" value={data.why_eyebrow} onChange={(v) => set("why_eyebrow", v)} />
        <Field label="Título" value={data.why_title} onChange={(v) => set("why_title", v)} />
        <Field label="Parágrafo 1" value={data.why_paragraph_1} onChange={(v) => set("why_paragraph_1", v)} textarea />
        <Field label="Parágrafo 2" value={data.why_paragraph_2} onChange={(v) => set("why_paragraph_2", v)} textarea />
      </Section>

      {/* REASONS */}
      <Section title="3 cards de motivos" description="Por que o cuidado contínuo é importante">
        {data.reasons.map((r, i) => (
          <div key={i} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Card {i + 1}</span>
              {data.reasons.length > 1 && (
                <Button
                  variant="ghost" size="icon"
                  onClick={() => set("reasons", data.reasons.filter((_, idx) => idx !== i))}
                  className="h-7 w-7 text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <Label className="text-[11px] text-muted-foreground">Ícone</Label>
                <Select value={r.icon} onValueChange={(v) => {
                  const next = [...data.reasons]; next[i] = { ...r, icon: v }; set("reasons", next);
                }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Field label="Título" value={r.title} onChange={(v) => {
                  const next = [...data.reasons]; next[i] = { ...r, title: v }; set("reasons", next);
                }} />
              </div>
            </div>
            <Field label="Descrição" value={r.description} onChange={(v) => {
              const next = [...data.reasons]; next[i] = { ...r, description: v }; set("reasons", next);
            }} textarea />
          </div>
        ))}
        {data.reasons.length < 6 && (
          <Button
            variant="outline" size="sm" className="gap-1.5"
            onClick={() => set("reasons", [...data.reasons, { title: "Novo motivo", description: "", icon: "Activity" }])}
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar motivo
          </Button>
        )}
      </Section>

      {/* LOGIC */}
      <Section title="Seção 'Lógica por trás do protocolo'">
        <Field label="Pré-título" value={data.logic_eyebrow} onChange={(v) => set("logic_eyebrow", v)} />
        <Field label="Título" value={data.logic_title} onChange={(v) => set("logic_title", v)} />
        <Field label="Descrição" value={data.logic_description} onChange={(v) => set("logic_description", v)} textarea />
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Benefícios (lista)</Label>
          {data.logic_benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={b} onChange={(e) => {
                const next = [...data.logic_benefits]; next[i] = e.target.value; set("logic_benefits", next);
              }} className="h-9 text-sm" />
              <Button variant="ghost" size="icon" onClick={() =>
                set("logic_benefits", data.logic_benefits.filter((_, idx) => idx !== i))
              } className="h-8 w-8 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-1.5"
            onClick={() => set("logic_benefits", [...data.logic_benefits, ""])}>
            <Plus className="h-3.5 w-3.5" /> Adicionar benefício
          </Button>
        </div>
      </Section>

      {/* CTA */}
      <Section title="CTA final + selos de confiança">
        <Field label="Título do card final" value={data.cta_title} onChange={(v) => set("cta_title", v)} />
        <Field label="Descrição" value={data.cta_description} onChange={(v) => set("cta_description", v)} textarea />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Texto do botão" value={data.cta_button_label} onChange={(v) => set("cta_button_label", v)} />
          <Field label="Linha de meta" value={data.cta_meta} onChange={(v) => set("cta_meta", v)} />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Selos de confiança (até 3)</Label>
          {data.trust_badges.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={b} onChange={(e) => {
                const next = [...data.trust_badges]; next[i] = e.target.value; set("trust_badges", next);
              }} className="h-9 text-sm" />
              <Button variant="ghost" size="icon" onClick={() =>
                set("trust_badges", data.trust_badges.filter((_, idx) => idx !== i))
              } className="h-8 w-8 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {data.trust_badges.length < 3 && (
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => set("trust_badges", [...data.trust_badges, ""])}>
              <Plus className="h-3.5 w-3.5" /> Adicionar selo
            </Button>
          )}
        </div>
      </Section>

      {/* QUIZ — first screen */}
      <Section
        title="Tela 1 do Quiz (rotina diária)"
        description="Cabeçalho exibido no topo do quiz e primeira pergunta. Use {doctor} no título para inserir o nome do parceiro/médico que indicou."
      >
        <Field label="Título (use {doctor} para o nome do parceiro)" value={data.quiz_header_title} onChange={(v) => set("quiz_header_title", v)} />
        <Field label="Subtítulo" value={data.quiz_header_subtitle} onChange={(v) => set("quiz_header_subtitle", v)} textarea />
        <div className="border-t border-border pt-3 mt-2">
          <Field label="Pergunta inicial" value={data.quiz_question_title} onChange={(v) => set("quiz_question_title", v)} textarea />
          <Field label="Subtexto da pergunta" value={data.quiz_question_subtitle} onChange={(v) => set("quiz_question_subtitle", v)} />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Opções de resposta</Label>
          {data.quiz_question_options.map((opt, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">Opção {i + 1}</span>
                {data.quiz_question_options.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() =>
                    set("quiz_question_options", data.quiz_question_options.filter((_, idx) => idx !== i))
                  } className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Ícone</Label>
                  <Select value={opt.icon} onValueChange={(v) => {
                    const next = [...data.quiz_question_options]; next[i] = { ...opt, icon: v }; set("quiz_question_options", next);
                  }}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUIZ_ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Título" value={opt.title} onChange={(v) => {
                    const next = [...data.quiz_question_options]; next[i] = { ...opt, title: v }; set("quiz_question_options", next);
                  }} />
                </div>
              </div>
              <Field label="Descrição" value={opt.description} onChange={(v) => {
                const next = [...data.quiz_question_options]; next[i] = { ...opt, description: v }; set("quiz_question_options", next);
              }} />
            </div>
          ))}
          {data.quiz_question_options.length < 6 && (
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => set("quiz_question_options", [...data.quiz_question_options, { icon: "Smartphone", title: "Nova opção", description: "" }])}>
              <Plus className="h-3.5 w-3.5" /> Adicionar opção
            </Button>
          )}
        </div>
        <div className="space-y-2 border-t border-border pt-3">
          <Label className="text-[11px] text-muted-foreground">Selos de confiança no rodapé do quiz (até 3)</Label>
          {data.quiz_footer_badges.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={b} onChange={(e) => {
                const next = [...data.quiz_footer_badges]; next[i] = e.target.value; set("quiz_footer_badges", next);
              }} className="h-9 text-sm" />
              <Button variant="ghost" size="icon" onClick={() =>
                set("quiz_footer_badges", data.quiz_footer_badges.filter((_, idx) => idx !== i))
              } className="h-8 w-8 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {data.quiz_footer_badges.length < 3 && (
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => set("quiz_footer_badges", [...data.quiz_footer_badges, ""])}>
              <Plus className="h-3.5 w-3.5" /> Adicionar selo
            </Button>
          )}
        </div>
      </Section>

      {/* QUIZ — second screen (symptoms) */}
      <Section
        title="Tela 2 do Quiz (sintomas)"
        description="Pergunta de múltipla escolha sobre incômodos relatados."
      >
        <Field label="Pergunta" value={data.quiz_symptoms_title} onChange={(v) => set("quiz_symptoms_title", v)} textarea />
        <Field label="Subtexto" value={data.quiz_symptoms_subtitle} onChange={(v) => set("quiz_symptoms_subtitle", v)} />
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Opções (multi-seleção)</Label>
          {data.quiz_symptoms_options.map((opt, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">Opção {i + 1}</span>
                {data.quiz_symptoms_options.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() =>
                    set("quiz_symptoms_options", data.quiz_symptoms_options.filter((_, idx) => idx !== i))
                  } className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Ícone</Label>
                  <Select value={opt.icon} onValueChange={(v) => {
                    const next = [...data.quiz_symptoms_options]; next[i] = { ...opt, icon: v }; set("quiz_symptoms_options", next);
                  }}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SYMPTOM_ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Título" value={opt.title} onChange={(v) => {
                    const next = [...data.quiz_symptoms_options]; next[i] = { ...opt, title: v }; set("quiz_symptoms_options", next);
                  }} />
                </div>
              </div>
              <Field label="Descrição" value={opt.description} onChange={(v) => {
                const next = [...data.quiz_symptoms_options]; next[i] = { ...opt, description: v }; set("quiz_symptoms_options", next);
              }} />
            </div>
          ))}
          {data.quiz_symptoms_options.length < 8 && (
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => set("quiz_symptoms_options", [...data.quiz_symptoms_options, { icon: "Sparkles", title: "Novo sintoma", description: "" }])}>
              <Plus className="h-3.5 w-3.5" /> Adicionar opção
            </Button>
          )}
        </div>
      </Section>

      {/* QUIZ — third screen (age range) */}
      <Section
        title="Tela 3 do Quiz (faixa etária)"
        description="Pergunta de seleção única sobre a faixa etária do paciente."
      >
        <Field label="Pergunta" value={data.quiz_age_title} onChange={(v) => set("quiz_age_title", v)} textarea />
        <Field label="Subtexto" value={data.quiz_age_subtitle} onChange={(v) => set("quiz_age_subtitle", v)} />
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Faixas etárias</Label>
          {data.quiz_age_options.map((opt, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">Opção {i + 1}</span>
                {data.quiz_age_options.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() =>
                    set("quiz_age_options", data.quiz_age_options.filter((_, idx) => idx !== i))
                  } className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Ícone</Label>
                  <Select value={opt.icon} onValueChange={(v) => {
                    const next = [...data.quiz_age_options]; next[i] = { ...opt, icon: v }; set("quiz_age_options", next);
                  }}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AGE_ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Título" value={opt.title} onChange={(v) => {
                    const next = [...data.quiz_age_options]; next[i] = { ...opt, title: v }; set("quiz_age_options", next);
                  }} />
                </div>
              </div>
              <Field label="Descrição" value={opt.description} onChange={(v) => {
                const next = [...data.quiz_age_options]; next[i] = { ...opt, description: v }; set("quiz_age_options", next);
              }} />
            </div>
          ))}
          {data.quiz_age_options.length < 6 && (
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => set("quiz_age_options", [...data.quiz_age_options, { icon: "Sparkles", title: "Nova faixa", description: "" }])}>
              <Plus className="h-3.5 w-3.5" /> Adicionar faixa
            </Button>
          )}
        </div>
      </Section>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Configurações
        </Button>
      </div>
    </motion.div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; textarea?: boolean }> = ({ label, value, onChange, textarea }) => (
  <div className="space-y-1">
    <Label className="text-[11px] text-muted-foreground">{label}</Label>
    {textarea ? (
      <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="min-h-[64px] text-sm" />
    ) : (
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm" />
    )}
  </div>
);

export default ProtocolLandingSettings;
