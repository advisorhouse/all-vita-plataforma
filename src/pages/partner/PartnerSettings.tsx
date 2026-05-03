import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Camera, Shield, Lock, CreditCard,
  Landmark, FileText, Eye, EyeOff, CheckCircle2, Copy,
  Sun, Moon, CloudSun, Info, ChevronRight, Upload,
  Smartphone, Key, Download, Calendar, DollarSign,
  Settings, MapPin, Hash, Building, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const } }),
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Bom dia", Icon: Sun };
  if (h < 18) return { text: "Boa tarde", Icon: CloudSun };
  return { text: "Boa noite", Icon: Moon };
};

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipUI>
    <TooltipTrigger asChild>
      <span className="inline-flex cursor-help">
        <Info className="h-3.5 w-3.5 text-muted-foreground/40" />
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[220px] text-[11px]"><p>{text}</p></TooltipContent>
  </TooltipUI>
);

const PARTNER_NAME = "Camila";

const RECEIPTS = [
  { id: 1, date: "01/02/2026", amount: "R$ 2.480,00", status: "Pago", method: "PIX" },
  { id: 2, date: "01/01/2026", amount: "R$ 2.120,00", status: "Pago", method: "PIX" },
  { id: 3, date: "01/12/2025", amount: "R$ 1.890,00", status: "Pago", method: "TED" },
  { id: 4, date: "01/11/2025", amount: "R$ 1.560,00", status: "Pago", method: "PIX" },
];

const PartnerSettings: React.FC = () => {
  const greeting = getGreeting();
  const GreetingIcon = greeting.Icon;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;
      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Sucesso", description: "Foto de perfil atualizada!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message || "Falha ao enviar imagem.", variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const [showCPF, setShowCPF] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [whatsNotif, setWhatsNotif] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSave = (section: string) => {
    toast({ title: "Alterações salvas", description: `Seção "${section}" atualizada com sucesso.` });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "Texto copiado para a área de transferência." });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12 max-w-4xl">

        {/* ═══ Header ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-foreground">Configurações</h1>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent flex items-center gap-1">
              <Settings className="h-3 w-3" />
              Partner Ouro
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Gerencie seus dados pessoais, segurança e informações de pagamento.
          </p>
        </motion.div>

        {/* ═══ Foto + Info Rápida ═══ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-accent-foreground text-2xl font-bold">
                        {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    {uploadMutation.isPending ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-bold text-foreground truncate">
                      {profile ? `${profile.first_name || ""} ${profile.last_name || ""}` : "Carregando..."}
                    </h2>
                    <Badge variant="secondary" className="text-[9px] bg-accent/10 text-accent border-0 shrink-0">Partner Ouro</Badge>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{profile?.email}</p>
                  <p className="text-[11px] text-muted-foreground">Membro desde Out/2025 · ID: VL-P-00847</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-[12px] hidden sm:flex"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                  Alterar foto
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Dados Pessoais ═══ */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">Dados Pessoais</h3>
                </div>
                <Tip text="Seus dados são protegidos e utilizados apenas para identificação e contato." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Nome completo</Label>
                  <Input 
                    value={`${profile?.first_name || ""} ${profile?.last_name || ""}`} 
                    readOnly
                    className="text-[13px] bg-secondary/30" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">E-mail</Label>
                  <Input 
                    value={profile?.email || ""} 
                    readOnly
                    type="email" 
                    className="text-[13px] bg-secondary/30" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Telefone / WhatsApp</Label>
                  <Input 
                    value={profile?.phone || ""} 
                    readOnly
                    className="text-[13px] bg-secondary/30" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                    CPF
                    <button onClick={() => setShowCPF(!showCPF)} className="text-muted-foreground/60 hover:text-foreground">
                      {showCPF ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </Label>
                  <Input value={showCPF ? "123.456.789-00" : "•••.•••.•••-00"} readOnly className="text-[13px] bg-secondary/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Data de nascimento</Label>
                  <Input defaultValue="15/03/1988" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Endereço</Label>
                  <Input defaultValue="Rua das Flores, 123 — São Paulo, SP" className="text-[13px]" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={() => handleSave("Dados Pessoais")} className="text-[12px]">
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Segurança & 2FA ═══ */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <h3 className="text-[15px] font-semibold text-foreground">Segurança da Conta</h3>
                <Tip text="Proteja sua conta com senha forte e verificação em duas etapas." />
              </div>

              {/* Password */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <Lock className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">Senha de acesso</p>
                      <p className="text-[11px] text-muted-foreground">Última alteração: 15/01/2026</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-[12px]">Alterar senha</Button>
                </div>

                {/* 2FA */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", twoFA ? "bg-accent/10" : "bg-secondary")}>
                      <Smartphone className={cn("h-4 w-4", twoFA ? "text-accent" : "text-foreground")} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">Verificação em duas etapas (2FA)</p>
                      <p className="text-[11px] text-muted-foreground">
                        {twoFA ? "Ativada — código enviado por SMS ao fazer login" : "Desativada — recomendamos ativar para maior segurança"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={twoFA} onCheckedChange={setTwoFA} />
                </div>

                {twoFA && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="ml-12 p-3 rounded-lg bg-accent/5 border border-accent/20"
                  >
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Um código de 6 dígitos será enviado para <strong className="text-foreground">(11) 98765-4321</strong> sempre que 
                      você fizer login em um novo dispositivo. Você pode alterar o número de telefone na seção de dados pessoais.
                    </p>
                  </motion.div>
                )}

                {/* Sessions */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <Key className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">Sessões ativas</p>
                      <p className="text-[11px] text-muted-foreground">2 dispositivos conectados</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-[12px] text-destructive border-destructive/30 hover:bg-destructive/5">
                    Encerrar outras
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Dados Bancários / Pagamento ═══ */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">Dados para Pagamento</h3>
                </div>
                <Tip text="Informações utilizadas para resgate de Vitacoins. O pagamento é processado todo dia 5." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Tipo de conta</Label>
                  <Input defaultValue="Conta Corrente" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Banco</Label>
                  <Input defaultValue="Nu Pagamentos S.A. (260)" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Agência</Label>
                  <Input defaultValue="0001" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Conta</Label>
                  <Input defaultValue="123456-7" className="text-[13px]" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                    Chave PIX
                    <button onClick={() => setShowPix(!showPix)} className="text-muted-foreground/60 hover:text-foreground">
                      {showPix ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={showPix ? "camila.santos@email.com" : "c•••••••@email.com"}
                      readOnly
                      className="text-[13px] bg-secondary/30 flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={() => handleCopy("camila.santos@email.com")}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Próximo pagamento:</strong> 05/03/2026 · Estimativa: <strong className="text-foreground">R$ 2.480,00</strong> via PIX. 
                  Alterações nos dados bancários entram em vigor no ciclo seguinte.
                </p>
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={() => handleSave("Dados Bancários")} className="text-[12px]">
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Comprovantes ═══ */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Comprovantes de Pagamento</h3>
                    <p className="text-[11px] text-muted-foreground">Histórico de resgates de Vitacoins</p>
                  </div>
                </div>
                <Tip text="Comprovantes disponíveis para download. Use como documento fiscal se necessário." />
              </div>

              <div className="space-y-2">
                {RECEIPTS.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                        <DollarSign className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{r.amount}</p>
                        <p className="text-[10px] text-muted-foreground">{r.date} · {r.method}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[9px] bg-accent/10 text-accent border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {r.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Preferências de Comunicação ═══ */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                <h3 className="text-[15px] font-semibold text-foreground">Preferências de Comunicação</h3>
                <Tip text="Escolha por onde deseja receber atualizações sobre comissões, novos clientes e eventos." />
              </div>

              <div className="space-y-3">
                {[
                  { label: "Notificações por e-mail", desc: "Receba resumos de comissões e novos clientes por e-mail", checked: emailNotif, onChange: setEmailNotif, icon: Mail },
                  { label: "Notificações por SMS", desc: "Alertas de segurança e confirmações de pagamento", checked: smsNotif, onChange: setSmsNotif, icon: Phone },
                  { label: "Notificações por WhatsApp", desc: "Atualizações rápidas de novos clientes e eventos", checked: whatsNotif, onChange: setWhatsNotif, icon: Smartphone },
                ].map(({ label, desc, checked, onChange, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch checked={checked} onCheckedChange={onChange} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Zona de Risco ═══ */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-destructive/20 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" />
                <h3 className="text-[15px] font-semibold text-foreground">Zona Sensível</h3>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Ações irreversíveis. Pausar ou encerrar sua conta de Partner afetará suas comissões e vínculos com clientes.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="text-[12px]">
                  Pausar conta (30 dias)
                </Button>
                <Button variant="outline" size="sm" className="text-[12px] text-destructive border-destructive/30 hover:bg-destructive/5">
                  Encerrar conta de Partner
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default PartnerSettings;
