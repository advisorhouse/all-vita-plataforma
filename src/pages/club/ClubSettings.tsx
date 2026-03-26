import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Camera, Shield, Lock, CreditCard,
  Eye, EyeOff, CheckCircle2, Package, Bell, Heart,
  Sun, Moon, CloudSun, Info, Upload, Smartphone, Key,
  MapPin, Truck, Calendar, Pause, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

const MEMBER_NAME = "Carlos";

const ORDER_HISTORY = [
  { id: 1, date: "15/02/2026", product: "Vision Lift Original", status: "Entregue", tracking: "BR1234567890" },
  { id: 2, date: "15/01/2026", product: "Vision Lift Original", status: "Entregue", tracking: "BR0987654321" },
  { id: 3, date: "15/12/2025", product: "Vision Lift Original", status: "Entregue", tracking: "BR1122334455" },
];

const ClubSettings: React.FC = () => {
  const greeting = getGreeting();
  const GreetingIcon = greeting.Icon;
  const { toast } = useToast();

  const [showCPF, setShowCPF] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [whatsNotif, setWhatsNotif] = useState(true);
  const [usageReminder, setUsageReminder] = useState(true);
  const [shipmentAlert, setShipmentAlert] = useState(true);

  const handleSave = (section: string) => {
    toast({ title: "Alterações salvas", description: `Seção "${section}" atualizada com sucesso.` });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 pb-12 max-w-4xl">

        {/* ═══ Saudação ═══ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-foreground leading-tight">
              {greeting.text}, {MEMBER_NAME}
            </h1>
            <motion.div
              animate={greeting.text === "Bom dia" ? { rotate: [0, 15, -15, 0] } : { y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <GreetingIcon className="h-5 w-5 text-warning" />
            </motion.div>
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Gerencie seus dados, endereço de entrega, segurança e preferências.
          </p>
        </motion.div>

        {/* ═══ Foto + Info Rápida ═══ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-accent-foreground text-2xl font-bold">
                    CM
                  </div>
                  <button className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-bold text-foreground">Carlos Mendes</h2>
                    <Badge variant="secondary" className="text-[9px] bg-accent/10 text-accent border-0">
                      Nível Consistência
                    </Badge>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5">carlos.mendes@email.com</p>
                  <p className="text-[11px] text-muted-foreground">Membro desde Nov/2025 · ID: VL-C-01234</p>
                </div>
                <Button variant="outline" size="sm" className="text-[12px] rounded-xl">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Alterar foto
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
                <Tip text="Seus dados são protegidos pela LGPD e utilizados apenas para identificação e entrega." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Nome completo</Label>
                  <Input defaultValue="Carlos Mendes da Silva" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">E-mail</Label>
                  <Input defaultValue="carlos.mendes@email.com" type="email" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Telefone / WhatsApp</Label>
                  <Input defaultValue="(21) 99876-5432" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                    CPF
                    <button onClick={() => setShowCPF(!showCPF)} className="text-muted-foreground/60 hover:text-foreground">
                      {showCPF ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </Label>
                  <Input value={showCPF ? "987.654.321-00" : "•••.•••.•••-00"} readOnly className="text-[13px] bg-secondary/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Data de nascimento</Label>
                  <Input defaultValue="22/07/1985" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Gênero</Label>
                  <Input defaultValue="Masculino" className="text-[13px]" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={() => handleSave("Dados Pessoais")} className="text-[12px] rounded-xl">
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Endereço de Entrega ═══ */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">Endereço de Entrega</h3>
                </div>
                <Tip text="Endereço utilizado para envio mensal dos seus produtos. Alterações afetam o próximo envio." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[12px] text-muted-foreground">Rua / Avenida</Label>
                  <Input defaultValue="Rua das Palmeiras, 456, Apto 802" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Bairro</Label>
                  <Input defaultValue="Botafogo" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">CEP</Label>
                  <Input defaultValue="22250-040" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Cidade</Label>
                  <Input defaultValue="Rio de Janeiro" className="text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Estado</Label>
                  <Input defaultValue="RJ" className="text-[13px]" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-accent" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Próximo envio:</strong> 15/03/2026 · Alterações feitas até 10/03 serão aplicadas neste envio.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={() => handleSave("Endereço")} className="text-[12px] rounded-xl">
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Segurança ═══ */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <h3 className="text-[15px] font-semibold text-foreground">Segurança da Conta</h3>
                <Tip text="Proteja sua conta com senha forte e verificação em duas etapas." />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <Lock className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">Senha de acesso</p>
                      <p className="text-[11px] text-muted-foreground">Última alteração: 20/01/2026</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-[12px] rounded-xl">Alterar senha</Button>
                </div>

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
                    className="ml-12 p-3 rounded-xl bg-accent/5 border border-accent/20"
                  >
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Um código de 6 dígitos será enviado para <strong className="text-foreground">(21) 99876-5432</strong> sempre que
                      você fizer login em um novo dispositivo.
                    </p>
                  </motion.div>
                )}

                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <Key className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">Sessões ativas</p>
                      <p className="text-[11px] text-muted-foreground">1 dispositivo conectado</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-[12px] text-destructive border-destructive/30 hover:bg-destructive/5 rounded-xl">
                    Encerrar outras
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Método de Pagamento ═══ */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">Método de Pagamento</h3>
                </div>
                <Tip text="Cartão utilizado para cobrança recorrente da assinatura." />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <CreditCard className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Visa •••• 4821</p>
                    <p className="text-[11px] text-muted-foreground">Expira em 08/2028 · Titular: Carlos M. da Silva</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-[12px] rounded-xl">Alterar cartão</Button>
              </div>

              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Próxima cobrança:</strong> 15/03/2026 · R$ 196,00 · Plano Vision Lift Original
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Histórico de Envios ═══ */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-accent" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Histórico de Envios</h3>
                    <p className="text-[11px] text-muted-foreground">Seus últimos envios de produto</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {ORDER_HISTORY.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                        <Truck className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{o.product}</p>
                        <p className="text-[10px] text-muted-foreground">{o.date} · {o.tracking}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[9px] bg-accent/10 text-accent border-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> {o.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ Preferências de Comunicação ═══ */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                <h3 className="text-[15px] font-semibold text-foreground">Preferências de Comunicação</h3>
                <Tip text="Escolha como e quando deseja receber atualizações sobre envios, conteúdo e saúde ocular." />
              </div>

              <div className="space-y-3">
                {[
                  { label: "E-mail", desc: "Resumos mensais, novidades do Club e conteúdo de saúde ocular", checked: emailNotif, onChange: setEmailNotif, icon: Mail },
                  { label: "SMS", desc: "Alertas de segurança e confirmações de envio", checked: smsNotif, onChange: setSmsNotif, icon: Phone },
                  { label: "WhatsApp", desc: "Lembretes de uso, novos conteúdos e dicas rápidas", checked: whatsNotif, onChange: setWhatsNotif, icon: Smartphone },
                  { label: "Lembrete de uso diário", desc: "Receba um lembrete gentil para usar seu Vision Lift no horário ideal", checked: usageReminder, onChange: setUsageReminder, icon: Heart },
                  { label: "Alerta de envio", desc: "Notificação quando seu pedido for despachado e entregue", checked: shipmentAlert, onChange: setShipmentAlert, icon: Truck },
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

        {/* ═══ Zona Sensível ═══ */}
        <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-destructive/20 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" />
                <h3 className="text-[15px] font-semibold text-foreground">Zona Sensível</h3>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Ações que afetam sua assinatura e progresso no programa de saúde ocular. Pausar mantém seu nível por 30 dias.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="text-[12px] rounded-xl gap-1.5">
                  <Pause className="h-3.5 w-3.5" /> Pausar assinatura (30 dias)
                </Button>
                <Button variant="outline" size="sm" className="text-[12px] rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5">
                  <XCircle className="h-3.5 w-3.5" /> Cancelar assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default ClubSettings;
