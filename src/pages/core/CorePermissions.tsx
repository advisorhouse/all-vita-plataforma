import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Crown, Users, BookOpen, Eye, Pencil, Download, CheckCircle,
  Settings, Lock, History, AlertTriangle, Plus, Trash2, Search,
  Key, UserCheck, Clock, ChevronRight, Activity, Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Types & Data ─── */
type Perm = "view" | "edit" | "export" | "approve" | "configure";

const ROLES = [
  { key: "master", label: "Master Admin", icon: Crown, desc: "Acesso global total à plataforma", color: "text-accent", users: 2 },
  { key: "partner_mgr", label: "Partner Manager", icon: Users, desc: "Gestão de partners e performance", color: "text-success", users: 3 },
  { key: "client_mgr", label: "Client Manager", icon: Eye, desc: "Gestão de clientes e retenção", color: "text-warning", users: 4 },
  { key: "content_mgr", label: "Content Manager", icon: BookOpen, desc: "Conteúdo, formação e materiais", color: "text-destructive", users: 1 },
];

interface PermItem {
  label: string;
  category: string;
  permissions: Record<string, Perm[]>;
}

const PERMISSION_MATRIX: PermItem[] = [
  { label: "KPIs Globais", category: "Dashboard", permissions: { master: ["view", "export"], partner_mgr: ["view"], client_mgr: ["view"], content_mgr: [] } },
  { label: "Relatórios Financeiros", category: "Dashboard", permissions: { master: ["view", "edit", "export"], partner_mgr: [], client_mgr: [], content_mgr: [] } },
  { label: "Comissões", category: "Financeiro", permissions: { master: ["view", "edit", "configure"], partner_mgr: ["view"], client_mgr: [], content_mgr: [] } },
  { label: "Regras de Margem", category: "Financeiro", permissions: { master: ["view", "edit", "configure"], partner_mgr: [], client_mgr: [], content_mgr: [] } },
  { label: "Partners", category: "Gestão", permissions: { master: ["view", "edit", "approve", "export"], partner_mgr: ["view", "edit", "approve"], client_mgr: [], content_mgr: [] } },
  { label: "Clientes", category: "Gestão", permissions: { master: ["view", "edit", "export"], partner_mgr: ["view"], client_mgr: ["view", "edit"], content_mgr: [] } },
  { label: "Assinaturas", category: "Gestão", permissions: { master: ["view", "edit", "configure"], partner_mgr: ["view"], client_mgr: ["view"], content_mgr: [] } },
  { label: "Conteúdo & Formação", category: "Conteúdo", permissions: { master: ["view", "edit", "configure"], partner_mgr: ["view"], client_mgr: [], content_mgr: ["view", "edit", "configure"] } },
  { label: "Materiais & Mídia", category: "Conteúdo", permissions: { master: ["view", "edit"], partner_mgr: ["view"], client_mgr: [], content_mgr: ["view", "edit"] } },
  { label: "Campanhas", category: "Marketing", permissions: { master: ["view", "edit", "approve", "configure"], partner_mgr: ["view"], client_mgr: [], content_mgr: ["view", "edit"] } },
  { label: "Gamificação", category: "Engajamento", permissions: { master: ["view", "edit", "configure"], partner_mgr: ["view"], client_mgr: ["view"], content_mgr: [] } },
  { label: "Alertas IA", category: "Sistema", permissions: { master: ["view", "configure"], partner_mgr: ["view"], client_mgr: ["view"], content_mgr: [] } },
  { label: "Webhooks & API", category: "Sistema", permissions: { master: ["view", "edit", "configure"], partner_mgr: [], client_mgr: [], content_mgr: [] } },
  { label: "Permissões", category: "Sistema", permissions: { master: ["view", "edit", "configure"], partner_mgr: [], client_mgr: [], content_mgr: [] } },
];

const PERM_ICONS: Record<Perm, React.ElementType> = {
  view: Eye, edit: Pencil, export: Download, approve: CheckCircle, configure: Settings,
};

const PERM_LABELS: Record<Perm, string> = {
  view: "Ver", edit: "Editar", export: "Exportar", approve: "Aprovar", configure: "Configurar",
};

const PERM_COLORS: Record<Perm, string> = {
  view: "bg-accent/10 text-accent", edit: "bg-warning/10 text-warning", export: "bg-success/10 text-success",
  approve: "bg-primary/10 text-primary", configure: "bg-destructive/10 text-destructive",
};

const TEAM_MEMBERS = [
  { name: "Lucas Admin", email: "lucas@visionlift.com.br", role: "master", lastLogin: "Hoje, 14:32", status: "online" },
  { name: "Sofia Partner", email: "sofia@visionlift.com.br", role: "partner_mgr", lastLogin: "Hoje, 10:15", status: "online" },
  { name: "Pedro Gestão", email: "pedro@visionlift.com.br", role: "partner_mgr", lastLogin: "Ontem, 18:42", status: "offline" },
  { name: "Maria CRM", email: "maria@visionlift.com.br", role: "client_mgr", lastLogin: "Hoje, 09:05", status: "online" },
  { name: "Ana Suporte", email: "ana@visionlift.com.br", role: "client_mgr", lastLogin: "Hoje, 11:28", status: "online" },
  { name: "Julia Content", email: "julia@visionlift.com.br", role: "content_mgr", lastLogin: "Ontem, 16:10", status: "offline" },
  { name: "Carlos Admin", email: "carlos@visionlift.com.br", role: "master", lastLogin: "Hoje, 13:55", status: "online" },
  { name: "Beatriz Clients", email: "bea@visionlift.com.br", role: "client_mgr", lastLogin: "2d atrás", status: "offline" },
  { name: "Rafael Partners", email: "rafael@visionlift.com.br", role: "partner_mgr", lastLogin: "Hoje, 08:30", status: "online" },
  { name: "Fernanda CRM", email: "fernanda@visionlift.com.br", role: "client_mgr", lastLogin: "Hoje, 12:45", status: "online" },
];

const AUDIT_LOG = [
  { time: "14:32", user: "Lucas Admin", action: "Alterou regra de comissão", target: "Comissão Recorrente → 12%", level: "edit" },
  { time: "13:55", user: "Carlos Admin", action: "Aprovou partner", target: "ID: AFF-045", level: "approve" },
  { time: "11:28", user: "Ana Suporte", action: "Pausou assinatura", target: "Cliente: Luciana T.", level: "edit" },
  { time: "10:15", user: "Sofia Partner", action: "Exportou relatório", target: "Performance Partners Q1", level: "export" },
  { time: "09:05", user: "Maria CRM", action: "Atualizou perfil cliente", target: "Cliente: Carla R.", level: "edit" },
  { time: "Ontem 18:42", user: "Pedro Gestão", action: "Visualizou dashboard", target: "KPIs Globais", level: "view" },
  { time: "Ontem 16:10", user: "Julia Content", action: "Publicou conteúdo", target: "Artigo: Cuidados Visuais", level: "edit" },
  { time: "Ontem 14:20", user: "Lucas Admin", action: "Alterou permissão", target: "Content Manager → +Campanhas", level: "configure" },
];

const CorePermissions: React.FC = () => {
  const [activeRole, setActiveRole] = useState("master");
  const [searchTeam, setSearchTeam] = useState("");
  const [searchAudit, setSearchAudit] = useState("");

  const categories = [...new Set(PERMISSION_MATRIX.map(p => p.category))];

  const filteredMembers = TEAM_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(searchTeam.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTeam.toLowerCase())
  );

  const filteredAudit = AUDIT_LOG.filter(a =>
    a.user.toLowerCase().includes(searchAudit.toLowerCase()) ||
    a.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
    a.target.toLowerCase().includes(searchAudit.toLowerCase())
  );

  // Permission counts
  const totalPerms = PERMISSION_MATRIX.reduce((sum, p) => sum + (p.permissions[activeRole]?.length || 0), 0);
  const maxPerms = PERMISSION_MATRIX.length * 5;

  return (
    <div className="space-y-6 pb-12">
      {/* KPIs */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Funções Ativas", value: ROLES.length.toString(), icon: Shield, sub: "4 níveis de acesso" },
          { label: "Usuários Admin", value: TEAM_MEMBERS.length.toString(), icon: Users, sub: `${TEAM_MEMBERS.filter(m => m.status === "online").length} online agora` },
          { label: "Permissões Configuradas", value: `${PERMISSION_MATRIX.length * ROLES.length}`, icon: Key, sub: `${PERMISSION_MATRIX.length} recursos × ${ROLES.length} funções` },
          { label: "Ações Hoje", value: AUDIT_LOG.filter(a => a.time.includes(":") && !a.time.includes("Ontem")).length.toString(), icon: Activity, sub: "Registradas no log" },
        ].map(({ label, value, icon: Icon, sub }) => (
          <Card key={label} className="border border-border shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
              <p className="text-xl font-semibold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <Tabs defaultValue="matrix" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="matrix" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Matriz de Permissões</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Equipe</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs"><History className="h-3.5 w-3.5" />Log de Auditoria</TabsTrigger>
        </TabsList>

        {/* ===== MATRIZ ===== */}
        <TabsContent value="matrix" className="space-y-4 mt-4">
          {/* Role selector */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = activeRole === role.key;
              return (
                <button key={role.key} onClick={() => setActiveRole(role.key)}
                  className={cn("flex flex-col items-start rounded-xl border p-4 text-left transition-all",
                    isActive ? "border-accent bg-accent/5 shadow-sm" : "border-border bg-card hover:bg-secondary/30"
                  )}>
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg mb-2",
                    isActive ? "bg-accent/10" : "bg-secondary"
                  )}>
                    <Icon className={cn("h-4 w-4", isActive ? role.color : "text-muted-foreground")} />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{role.label}</p>
                    <Badge variant="secondary" className="text-[9px]">{role.users}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{role.desc}</p>
                </button>
              );
            })}
          </motion.div>

          {/* Permission coverage bar */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">Cobertura de acesso</span>
                  <span className="font-semibold text-foreground">{totalPerms}/{maxPerms} permissões</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(totalPerms / maxPerms) * 100}%` }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Matrix by category */}
          {categories.map((cat, ci) => (
            <motion.div key={cat} custom={ci + 3} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border border-border shadow-sm overflow-hidden">
                <CardHeader className="py-3 px-5 bg-secondary/30">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{cat}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <TooltipProvider>
                    <div className="divide-y divide-border/50">
                      {PERMISSION_MATRIX.filter(p => p.category === cat).map((item) => {
                        const perms = item.permissions[activeRole] || [];
                        return (
                          <div key={item.label} className="flex items-center justify-between px-5 py-3">
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <div className="flex items-center gap-1.5">
                              {perms.length === 0 ? (
                                <span className="text-[11px] text-muted-foreground/40 flex items-center gap-1">
                                  <Lock className="h-3 w-3" />Sem acesso
                                </span>
                              ) : (
                                perms.map((p) => {
                                  const PIcon = PERM_ICONS[p];
                                  return (
                                    <Tooltip key={p}>
                                      <TooltipTrigger>
                                        <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", PERM_COLORS[p])}>
                                          <PIcon className="h-3 w-3" />
                                          {PERM_LABELS[p]}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="text-[10px]">
                                        {PERM_LABELS[p]} — {item.label}
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ===== EQUIPE ===== */}
        <TabsContent value="team" className="space-y-4 mt-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchTeam} onChange={(e) => setSearchTeam(e.target.value)} placeholder="Buscar membro..." className="pl-9 h-9" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
              <Plus className="h-3.5 w-3.5" />
              Convidar
            </Button>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Membro</TableHead>
                    <TableHead className="text-[10px]">Função</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                    <TableHead className="text-[10px]">Último Login</TableHead>
                    <TableHead className="text-[10px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const role = ROLES.find(r => r.key === member.role);
                    const RoleIcon = role?.icon || Users;
                    return (
                      <TableRow key={member.email}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                                {member.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
                                member.status === "online" ? "bg-success" : "bg-muted-foreground/30"
                              )} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{member.name}</p>
                              <p className="text-[10px] text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <RoleIcon className={cn("h-3.5 w-3.5", role?.color || "text-muted-foreground")} />
                            <span className="text-[11px] font-medium text-foreground">{role?.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            member.status === "online" ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                          )}>
                            {member.status === "online" ? "Online" : "Offline"}
                          </span>
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {member.lastLogin}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== LOG DE AUDITORIA ===== */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchAudit} onChange={(e) => setSearchAudit(e.target.value)} placeholder="Buscar no log..." className="pl-9 h-9" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
              <Download className="h-3.5 w-3.5" />
              Exportar
            </Button>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="border border-border shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {filteredAudit.map((entry, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-3.5">
                      <div className="flex flex-col items-center mt-0.5">
                        <div className={cn("flex h-7 w-7 items-center justify-center rounded-full",
                          entry.level === "configure" ? "bg-destructive/10" :
                          entry.level === "approve" ? "bg-success/10" :
                          entry.level === "edit" ? "bg-warning/10" :
                          entry.level === "export" ? "bg-accent/10" :
                          "bg-secondary"
                        )}>
                          {entry.level === "configure" ? <Settings className="h-3.5 w-3.5 text-destructive" /> :
                           entry.level === "approve" ? <CheckCircle className="h-3.5 w-3.5 text-success" /> :
                           entry.level === "edit" ? <Pencil className="h-3.5 w-3.5 text-warning" /> :
                           entry.level === "export" ? <Download className="h-3.5 w-3.5 text-accent" /> :
                           <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                        {i < filteredAudit.length - 1 && <div className="w-px h-full bg-border/50 mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{entry.action}</p>
                          <Badge variant="secondary" className={cn("text-[9px]", PERM_COLORS[entry.level as Perm] || "")}>
                            {PERM_LABELS[entry.level as Perm] || entry.level}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{entry.target}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">{entry.user}</span>
                          <span className="text-[10px] text-muted-foreground/50">·</span>
                          <span className="text-[10px] text-muted-foreground">{entry.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CorePermissions;
