import React, { useState, useCallback, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence, LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Presentation, Layers, Code2, Database, Brain, Shield, Clock, DollarSign, Rocket, CheckCircle2, Server, Globe, Zap, BarChart3, Users, FileText, Wrench, CreditCard, TrendingUp, Target, Award, AlertTriangle, Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoVisionLift from "@/assets/logo-vision-lift.png";
import clubDashboardPreview from "@/assets/club-dashboard-preview.png";
import partnerDashboardPreview from "@/assets/partner-dashboard-preview.png";
import coreDashboardPreview from "@/assets/core-dashboard-preview.png";

const PdfStaticContext = createContext(false);
const usePdfStatic = () => useContext(PdfStaticContext);

/* ─── Static wrapper: disables all framer-motion animations for PDF capture ─── */
const StaticSlideWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PdfStaticContext.Provider value={true}>
    <MotionConfig reducedMotion="always">
      {children}
    </MotionConfig>
  </PdfStaticContext.Provider>
);

/* ─── shared micro-animation variants ─── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } } };
const fadeScale = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } } };
const popIn = { hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 400, damping: 18 } } };
const countPop = { hidden: { opacity: 0, y: 24, scale: 0.8 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 16 } } };

const MStagger = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const isStatic = usePdfStatic();
  if (isStatic) return <div className={className}>{children}</div>;
  return <motion.div variants={stagger} initial="hidden" animate="visible" className={className}>{children}</motion.div>;
};
const MItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const isStatic = usePdfStatic();
  if (isStatic) return <div className={className}>{children}</div>;
  return <motion.div variants={fadeUp} className={className}>{children}</motion.div>;
};
const MScaleItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const isStatic = usePdfStatic();
  if (isStatic) return <div className={className}>{children}</div>;
  return <motion.div variants={fadeScale} className={className}>{children}</motion.div>;
};
const MPopItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const isStatic = usePdfStatic();
  if (isStatic) return <div className={className}>{children}</div>;
  return <motion.div variants={popIn} className={className}>{children}</motion.div>;
};
const MCountItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const isStatic = usePdfStatic();
  if (isStatic) return <div className={className}>{children}</div>;
  return <motion.div variants={countPop} className={className}>{children}</motion.div>;
};
/* ─── slide data ─── */
const slides = [
  {
    id: "cover",
    title: "Proposta de Desenvolvimento",
    content: () => (
      <MStagger className="flex flex-col items-center justify-center h-full gap-8 text-center px-12">
        <MPopItem><img src={logoVisionLift} alt="Vision Lift" className="h-14 w-auto" /></MPopItem>
        <MItem>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Proposta de Desenvolvimento<br />
            <span className="text-primary">Vision Lift Platform</span>
          </h1>
        </MItem>
        <MItem>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Ecossistema digital completo para gestão de assinaturas, afiliados e inteligência de negócios — 
            com integração de pagamentos, IA preditiva e escalabilidade nativa.
          </p>
        </MItem>
        <MItem className="flex items-center gap-6 mt-4">
          {[
            { icon: Globe, label: "SaaS Multi-tenant" },
            { icon: Zap, label: "Real-time" },
            { icon: Shield, label: "Enterprise Security" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <b.icon className="h-4 w-4 text-primary" />
              <span>{b.label}</span>
            </div>
          ))}
        </MItem>
        <MScaleItem className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-6 py-3 max-w-2xl">
          <p className="text-xs text-primary font-medium">
            🔒 Projeto 100% exclusivo — Todo o código-fonte é desenvolvido do zero, sob medida para a Vision Lift, e pertence integralmente ao cliente.
          </p>
        </MScaleItem>
      </MStagger>
    ),
  },
  {
    id: "objetivo",
    title: "Objetivo do Projeto",
    content: () => (
      <MStagger className="flex flex-col h-full px-12 py-8 gap-6">
        <MItem className="flex items-center gap-3">
          <motion.div variants={popIn} className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Presentation className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground">Objetivo do Projeto</h2>
        </MItem>
        <MItem>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
            Desenvolver uma plataforma SaaS moderna, responsiva e escalável que conecte <strong className="text-foreground">clientes</strong>, <strong className="text-foreground">parceiros afiliados</strong> e <strong className="text-foreground">administração</strong> em um único ecossistema inteligente.
          </p>
        </MItem>
        <motion.div variants={stagger} className="grid grid-cols-3 gap-6 mt-2 flex-1">
          {[
            { icon: Users, title: "Vision Lift Club", desc: "Portal do assinante com gamificação, calendário de uso e biblioteca de conteúdo streaming.", image: clubDashboardPreview },
            { icon: BarChart3, title: "Vision Partner", desc: "Portal do afiliado com comissões multinível, simulador financeiro e progressão de níveis.", image: partnerDashboardPreview },
            { icon: Layers, title: "Vision Core", desc: "Painel administrativo com dashboards de MRR/Churn/LTV, projeções e gestão de regras.", image: coreDashboardPreview },
          ].map((item) => (
            <MScaleItem key={item.title} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3">
              <motion.div variants={popIn} className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              {item.image && (
                <motion.div variants={fadeScale} className="mt-2 rounded-xl overflow-hidden border border-border shadow-sm">
                  <img src={item.image} alt={`${item.title} preview`} className="w-full h-auto object-cover" />
                </motion.div>
              )}
            </MScaleItem>
          ))}
        </motion.div>
      </MStagger>
    ),
  },
  {
    id: "funcionalidades-club",
    title: "Funcionalidades — Club",
    content: () => (
      <MStagger className="flex flex-col h-full px-12 py-8 gap-6">
        <MItem className="flex items-center gap-3">
          <motion.div variants={popIn} className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground">Portal do Assinante — Club</h2>
        </MItem>
        <motion.div variants={stagger} className="grid grid-cols-2 gap-4 flex-1">
          {[
            { title: "Dashboard Personalizado", desc: "Visão geral da jornada, nível atual, progresso, próximos marcos e conteúdo sugerido por IA." },
            { title: "Calendário de Consistência", desc: "Tracking diário de uso do produto com streaks, badges e pontuação de engajamento." },
            { title: "Gestão de Assinatura", desc: "Visualização de plano, ciclos, próximo envio, histórico de pedidos e status de pagamento." },
            { title: "Gamificação & Níveis", desc: "Sistema de 5 níveis com desbloqueio progressivo de benefícios, desafios mensais e recompensas." },
            { title: "Biblioteca de Conteúdo", desc: "Vídeos educativos, artigos e playlists organizados por tema — interface estilo streaming." },
            { title: "Programa de Indicação", desc: "Link único para indicar amigos, dashboard de conversões e recompensas por indicação." },
            { title: "Comunidade", desc: "Feed de destaques, ranking de engajamento e celebrações de marcos alcançados." },
            { title: "Suporte Integrado", desc: "Central de ajuda com FAQ contextual, chat e sistema de tickets." },
          ].map((item, i) => (
            <MItem key={i} className="rounded-xl border border-border bg-card/50 p-4 flex gap-3">
              <motion.div variants={popIn}><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /></motion.div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </MItem>
          ))}
        </motion.div>
      </MStagger>
    ),
  },
  {
    id: "funcionalidades-partner",
    title: "Funcionalidades — Partner",
    content: () => (
      <MStagger className="flex flex-col h-full px-12 py-8 gap-6">
        <MItem className="flex items-center gap-3">
          <motion.div variants={popIn} className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground">Portal do Parceiro — Partner</h2>
        </MItem>
        <motion.div variants={stagger} className="grid grid-cols-2 gap-4 flex-1">
          {[
            { title: "Dashboard de Performance", desc: "Métricas de receita recorrente, clientes ativos, taxa de retenção e comissões em tempo real." },
            { title: "Motor de Comissões", desc: "Engine multinível com regras por nível, tipo (inicial/recorrente/bônus), proteção de margem e audit log." },
            { title: "Simulador Financeiro", desc: "Projeção de ganhos com base em cenários de crescimento, retenção e evolução de nível." },
            { title: "Progressão de Níveis", desc: "5 níveis de parceiro (Starter → Elite) com requisitos claros, benefícios crescentes e roadmap visual." },
            { title: "Gestão de Links", desc: "Criação e tracking de links de afiliado com atribuição automática e analytics por campanha." },
            { title: "Rede & Ranking", desc: "Visualização de downline, ranking entre parceiros e métricas de performance comparativa." },
            { title: "Formação", desc: "Trilha de onboarding, materiais de vendas, scripts e certificações progressivas." },
            { title: "Materiais de Marketing", desc: "Banco de assets prontos: banners, stories, copy para WhatsApp e e-mail templates." },
          ].map((item, i) => (
            <MItem key={i} className="rounded-xl border border-border bg-card/50 p-4 flex gap-3">
              <motion.div variants={popIn}><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /></motion.div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </MItem>
          ))}
        </motion.div>
      </MStagger>
    ),
  },
  {
    id: "funcionalidades-core",
    title: "Funcionalidades — Core",
    content: () => (
      <MStagger className="flex flex-col h-full px-12 py-8 gap-6">
        <MItem className="flex items-center gap-3">
          <motion.div variants={popIn} className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground">Painel Administrativo — Core</h2>
        </MItem>
        <motion.div variants={stagger} className="grid grid-cols-2 gap-4 flex-1">
          {[
            { title: "Dashboard Executivo", desc: "KPIs de MRR, ARR, Churn Rate, LTV médio, CAC e projeções de crescimento com IA." },
            { title: "Gestão de Clientes", desc: "Listagem avançada com filtros, scores preditivos (churn, LTV, engajamento) e ações em massa." },
            { title: "Gestão de Partners", desc: "Visão completa de afiliados, níveis, performance, rede e histórico de comissões." },
            { title: "Motor de Comissões", desc: "Configuração de regras, templates, proteção de margem, simulação e audit trail completo." },
            { title: "Financeiro", desc: "Receita bruta vs. líquida, projeções, payouts pendentes e relatórios de margem." },
            { title: "Insights & BI", desc: "Dashboards analíticos com cohort analysis, funil de retenção e análise comportamental." },
            { title: "Gamificação", desc: "Gestão de desafios, benefícios, níveis e métricas de engajamento da base." },
            { title: "Permissões & Segurança", desc: "Controle de acesso por papel (RBAC), API keys, logs de auditoria e fraud detection." },
          ].map((item, i) => (
            <MItem key={i} className="rounded-xl border border-border bg-card/50 p-4 flex gap-3">
              <motion.div variants={popIn}><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /></motion.div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </MItem>
          ))}
        </motion.div>
      </MStagger>
    ),
  },
  {
    id: "stack",
    title: "Stack Tecnológica",
    content: () => (
      <MStagger className="flex flex-col h-full px-12 py-8 gap-6">
        <MItem className="flex items-center gap-3">
          <motion.div variants={popIn} className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Code2 className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground">Stack Tecnológica</h2>
        </MItem>
        <motion.div variants={stagger} className="grid grid-cols-3 gap-6 flex-1">
          {[
            { icon: Globe, title: "Frontend", items: ["React 18 — Biblioteca UI reativa","TypeScript — Tipagem estática e segura","Vite — Build tool ultrarrápido","Tailwind CSS — Design system utility-first","Framer Motion — Animações fluidas","Shadcn/UI — Componentes acessíveis","Recharts — Visualização de dados","React Query — Cache e sync de dados"] },
            { icon: Server, title: "Backend", items: ["Supabase — BaaS completo","PostgreSQL — Banco relacional robusto","Edge Functions (Deno) — Serverless backend","Row Level Security — Segurança no DB","Realtime — WebSockets nativos","Supabase Auth — Autenticação completa","Supabase Storage — Armazenamento de arquivos","REST + GraphQL — APIs auto-geradas"] },
            { icon: Brain, title: "IA & Integrações", items: ["OpenAI GPT — Análise preditiva","Pagar.me — Gateway de pagamento","Webhooks — Eventos em tempo real","API Gateway — Rate limiting + auth","Churn Prediction — ML com OpenAI","LTV Projection — Projeção financeira","SEO Otimizado — Meta tags dinâmicas","Analytics — Eventos customizados"] },
          ].map((col) => (
            <MScaleItem key={col.title} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <col.icon className="h-5 w-5 text-primary" /> {col.title}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.items.map((it) => {
                  const [bold, rest] = it.split(" — ");
                  return <li key={it}><strong className="text-foreground">{bold}</strong> — {rest}</li>;
                })}
              </ul>
            </MScaleItem>
          ))}
        </motion.div>
      </MStagger>
    ),
  },
  {
    id: "banco-dados",
    title: "Arquitetura de Banco de Dados",
    content: () => (
      <div className="flex flex-col h-full px-12 py-8 gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Arquitetura de Banco de Dados</h2>
        </div>
        <p className="text-sm text-muted-foreground">PostgreSQL via Supabase — 20+ tabelas com RLS, views materializadas e triggers</p>
        <div className="grid grid-cols-3 gap-4 flex-1">
          {[
            { title: "Perfis & Autenticação", tables: ["profiles", "user_roles", "client_profiles", "client_activation", "affiliates"] },
            { title: "Transações & Comissões", tables: ["orders", "commissions", "commission_rules", "commission_audit_log", "commission_templates"] },
            { title: "Gamificação & Engajamento", tables: ["gamification_benefits", "client_benefits", "monthly_challenges", "client_challenge_progress", "client_usage_logs"] },
            { title: "BI & Analytics", tables: ["dim_client (view)", "dim_affiliate (view)", "fact_revenue (view)", "fact_retention (view)", "fact_churn (view)"] },
            { title: "Integrações & Logs", tables: ["webhook_logs", "api_keys", "api_request_logs", "attribution_logs", "affiliate_links"] },
            { title: "Segurança & Governança", tables: ["fraud_alerts", "margin_protection_rules", "ai_alerts", "ai_model_logs", "report_access_logs"] },
          ].map((group, i) => (
            <div key={i} className="rounded-xl border border-border bg-card/50 p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">{group.title}</h4>
              <ul className="space-y-1">
                {group.tables.map((t) => (
                  <li key={t} className="text-xs text-muted-foreground font-mono bg-secondary/50 rounded px-2 py-1">{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "seguranca",
    title: "Segurança & Compliance",
    content: () => (
      <div className="flex flex-col h-full px-12 py-8 gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Segurança & Compliance</h2>
        </div>
        <div className="grid grid-cols-2 gap-6 flex-1">
          {[
            { title: "Row Level Security (RLS)", desc: "Todas as tabelas possuem políticas de segurança a nível de linha, garantindo que cada usuário acessa apenas seus próprios dados.", icon: Database },
            { title: "Autenticação Multi-fator", desc: "Supabase Auth com suporte a e-mail/senha, magic links, OAuth e 2FA. Tokens JWT com refresh automático.", icon: Shield },
            { title: "Criptografia de Dados", desc: "CPF criptografado em repouso, hash SHA-256 para buscas. Comunicação via HTTPS/TLS em todas as camadas.", icon: Code2 },
            { title: "RBAC (Role-Based Access)", desc: "Sistema de papéis (admin, partner, client) com função security definer que impede escalação de privilégios.", icon: Users },
            { title: "Fraud Detection", desc: "Alertas automatizados para padrões suspeitos de atribuição, auto-indicação e anomalias de comissão.", icon: Zap },
            { title: "Audit Trail Completo", desc: "Log de todas as operações críticas: comissões, mudanças de regras, acessos a relatórios e webhooks processados.", icon: FileText },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card/50 p-5 flex gap-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "edge-functions",
    title: "Backend Functions",
    content: () => (
      <div className="flex flex-col h-full px-12 py-8 gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Edge Functions — Backend Serverless</h2>
        </div>
        <p className="text-sm text-muted-foreground">12 funções serverless em Deno/TypeScript, deploy automático e escalabilidade infinita</p>
        <div className="grid grid-cols-3 gap-4 flex-1">
          {[
            { name: "commission-engine-v2", desc: "Motor de comissões multinível com stacking, proteção de margem e audit log." },
            { name: "commission-simulator", desc: "Simulação financeira com projeções de ganhos por cenário." },
            { name: "process-commission", desc: "Processamento de comissão por pedido com regras dinâmicas." },
            { name: "process-attribution", desc: "Atribuição de cliente → afiliado com lock e tracking." },
            { name: "payment-webhook", desc: "Receptor de webhooks do Pagar.me para atualizar pagamentos." },
            { name: "webhook-receiver", desc: "Gateway de webhooks genérico com validação e logging." },
            { name: "retention-engine", desc: "Engine de retenção com scoring e alertas automáticos." },
            { name: "gamification-engine", desc: "Motor de gamificação: níveis, badges, desafios e rewards." },
            { name: "ai-revenue-projections", desc: "Projeções de receita com OpenAI para insights preditivos." },
            { name: "financial-projections", desc: "Projeções financeiras detalhadas com cenários de crescimento." },
            { name: "analytics-api", desc: "API unificada para queries analíticas e dashboards BI." },
            { name: "api-gateway", desc: "Gateway com rate limiting, API keys e controle de acesso." },
          ].map((fn, i) => (
            <div key={i} className="rounded-lg border border-border bg-card/50 p-3">
              <h4 className="text-xs font-mono font-semibold text-primary">{fn.name}</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{fn.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "cronograma",
    title: "Cronograma de Desenvolvimento",
    content: () => (
      <div className="flex flex-col h-full px-12 py-8 gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Cronograma de Desenvolvimento</h2>
        </div>
        <div className="flex flex-col gap-4 flex-1">
          {[
            { phase: "Fase 1", title: "Definição & Arquitetura", time: "~14h", items: ["Levantamento de requisitos", "Modelagem de banco de dados", "Definição de regras de negócio", "Prototipação de fluxos"], color: "bg-blue-500" },
            { phase: "Fase 2", title: "Frontend — Portais", time: "~40h", items: ["Club: Dashboard, gamificação, conteúdo", "Partner: Performance, comissões, rede", "Core: BI, gestão, configurações", "Design system, responsividade e animações"], color: "bg-violet-500" },
            { phase: "Fase 3", title: "Backend & Integrações", time: "~45h", items: ["Edge Functions (12 endpoints)", "Integração Pagar.me (cobranças + webhooks)", "Motor de comissões e retenção", "IA preditiva com OpenAI"], color: "bg-emerald-500" },
            { phase: "Fase 4", title: "Banco de Dados & Segurança", time: "~15h", items: ["20+ tabelas com RLS policies", "Views materializadas para BI", "RBAC e fraud detection", "Triggers e validações"], color: "bg-amber-500" },
            { phase: "Fase 5", title: "Testes, QA & Deploy", time: "~14h", items: ["Testes funcionais end-to-end", "Performance e otimização", "Deploy em produção", "Domínio customizado + SSL"], color: "bg-rose-500" },
          ].map((phase) => (
            <div key={phase.phase} className="flex items-stretch gap-4 rounded-xl border border-border bg-card/50 p-4">
              <div className="flex flex-col items-center gap-1">
                <div className={`h-8 w-8 rounded-lg ${phase.color} flex items-center justify-center text-white text-xs font-bold`}>{phase.phase.split(" ")[1]}</div>
                <span className="text-[10px] text-muted-foreground font-mono">{phase.time}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">{phase.title}</h4>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                  {phase.items.map((item, j) => (
                    <span key={j} className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />{item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="text-center mt-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
              <Clock className="h-4 w-4" /> Tempo Total Estimado: ~128h / 30–45 dias úteis
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "investimento",
    title: "Investimento",
    content: () => (
      <MStagger className="flex flex-col h-full px-12 py-8 gap-6">
        <MItem className="flex items-center gap-3">
          <motion.div variants={popIn} className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground">Investimento</h2>
        </MItem>
        <motion.div variants={stagger} className="grid grid-cols-3 gap-6 flex-1">
          {[
            {
              plan: "Pacote Básico",
              price: "R$ 5.500",
              features: [
                "3 portais (Club, Partner, Core)",
                "Cadastro e login com e-mail/senha",
                "Dashboard básico por perfil",
                "Calendário de uso (Club)",
                "Gestão de assinatura e pedidos",
                "Comissões com regra fixa (% único)",
                "Painel Core com listagem de clientes e parceiros",
                "Integração Pagar.me (cobrança + webhook)",
                "Deploy em produção + domínio",
                "30 dias de garantia pós-deploy",
                "1 revisão de escopo",
              ],
              highlight: false,
            },
            {
              plan: "Pacote Avançado",
              price: "R$ 8.500",
              features: [
                "Tudo do Básico +",
                "Gamificação completa (5 níveis, badges, desafios)",
                "Biblioteca de conteúdo estilo streaming",
                "Programa de indicação com link rastreável",
                "Motor de comissões multinível (inicial, recorrente, bônus)",
                "Simulador financeiro para parceiros",
                "Progressão de níveis do parceiro (Starter → Elite)",
                "Proteção de margem no motor de comissões",
                "Relatórios de performance mensais automatizados",
                "Entrega em prazo reduzido",
                "60 dias de garantia pós-deploy",
                "3 revisões de escopo",
              ],
              highlight: true,
            },
            {
              plan: "Pacote Premium",
              price: "R$ 14.500",
              features: [
                "Tudo do Avançado +",
                "IA preditiva (Churn Prediction + LTV + Insights)",
                "Análise comportamental e scoring automático",
                "Fraud Detection e alertas de anomalia",
                "Audit trail completo (comissões, acessos, webhooks)",
                "Dashboards BI com KPIs (MRR, Churn, LTV)",
                "Cohort analysis e funil de retenção",
                "Acompanhamento dedicado e reuniões periódicas",
                "90 dias de garantia pós-deploy",
                "Revisões ilimitadas",
              ],
              highlight: false,
            },
          ].map((pkg) => (
            <MScaleItem key={pkg.plan} className={`rounded-2xl border p-6 flex flex-col gap-4 ${pkg.highlight ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card"}`}>
              <div>
                <h3 className="text-lg font-bold text-foreground">{pkg.plan}</h3>
                <motion.p variants={countPop} className="text-3xl font-bold text-primary mt-1">{pkg.price}</motion.p>
                <p className="text-xs text-muted-foreground mt-0.5">parcelável em até 6x no cartão (juros por conta da administradora)</p>
              </div>
              <ul className="space-y-2 flex-1">
                {pkg.features.map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {pkg.highlight && (
                <motion.span variants={popIn} className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 text-center">Mais Popular</motion.span>
              )}
            </MScaleItem>
          ))}
        </motion.div>
        <MItem className="rounded-xl border border-border bg-secondary/30 px-5 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            <Wrench className="h-3 w-3 inline mr-1 text-primary" />
            <strong className="text-foreground">Garantia pós-deploy:</strong> cada plano inclui um período de acompanhamento gratuito (correções e ajustes). Após esse período, o suporte contínuo é coberto pelo <strong className="text-foreground">Plano de Manutenção (R$ 790/mês)</strong> — detalhado no próximo slide.
          </p>
        </MItem>
      </MStagger>
    ),
  },
  {
    id: "custos-operacionais",
    title: "Custos Operacionais Mensais",
    content: () => (
      <div className="flex flex-col h-full px-12 py-8 gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Custos Operacionais Mensais</h2>
        </div>
        <p className="text-sm text-muted-foreground">Custos reais de infraestrutura para manter a plataforma em funcionamento após o deploy.</p>

        <div className="grid grid-cols-2 gap-6 flex-1">
          {/* Left: cost breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-foreground">Detalhamento de Custos</h3>
            <div className="space-y-3 flex-1">
              {[
                { item: "Hospedagem & Backend (Supabase)", cost: "~R$ 150/mês", desc: "Banco de dados PostgreSQL, autenticação, Edge Functions, storage e realtime." },
                { item: "Hospedagem de Vídeos (Panda Video)", cost: "R$ 87,50/mês", desc: "Até 50 GB de vídeos com player seguro, streaming adaptativo e analytics." },
                { item: "IA — OpenAI API", cost: "~R$ 50-150/mês", desc: "Análise preditiva de churn, projeções de LTV, insights automatizados. Varia com volume." },
                { item: "SMS 2FA (Verificação)", cost: "~R$ 50-100/mês", desc: "Disparador de SMS para autenticação de dois fatores. Custo por mensagem (~R$0,08/SMS)." },
                { item: "Domínio + SSL", cost: "~R$ 7/mês", desc: "Domínio .com.br com certificado SSL incluso." },
              ].map((c, i) => (
                <div key={i} className="flex justify-between items-start gap-3 border-b border-border/50 pb-2 last:border-0">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{c.item}</p>
                    <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-primary whitespace-nowrap">{c.cost}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-border pt-3">
              <span className="text-sm font-semibold text-foreground">Custo Total Estimado</span>
              <span className="text-lg font-bold text-primary">~R$ 345 – 495/mês</span>
            </div>
          </div>

          {/* Right: maintenance pricing */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-foreground">Plano de Manutenção & Hospedagem</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Para cobrir os custos de infraestrutura e garantir suporte técnico contínuo, oferecemos um plano mensal que inclui:
              </p>
              <ul className="space-y-2">
                {[
                  "Hospedagem completa (backend, banco, storage)",
                  "Hospedagem de vídeos (Panda Video)",
                  "IA preditiva (OpenAI) inclusa",
                  "SMS 2FA para verificação de contas",
                  "Monitoramento e uptime",
                  "Suporte técnico e correções de bugs",
                  "Atualizações de segurança",
                ].map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-center">
                <p className="text-3xl font-bold text-primary">R$ 790/mês</p>
                <p className="text-xs text-muted-foreground mt-1">Valor que cobre infraestrutura + manutenção técnica</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">💡 Por que esse valor?</strong> O custo real de infraestrutura gira entre R$ 345–495/mês. O plano de manutenção inclui suporte técnico contínuo, monitoramento, atualizações de segurança e correções — garantindo que sua plataforma funcione sem interrupções.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "diferencial",
    title: "Por que investir agora?",
    content: () => (
      <MStagger className="flex flex-col h-full px-12 py-8 gap-5">
        <MItem className="flex items-center gap-3">
          <motion.div variants={popIn} className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground">Por que investir agora?</h2>
        </MItem>

        {/* Impact stats */}
        <motion.div variants={stagger} className="grid grid-cols-4 gap-4">
          {[
            { stat: "+30%", label: "retenção com jornada gamificada vs. e-commerce tradicional" },
            { stat: "+27%", label: "controle operacional com BI próprio e dashboards em tempo real" },
            { stat: "3x", label: "mais engajamento com calendário de consistência e rewards" },
            { stat: "-40%", label: "churn com IA preditiva e re-engajamento automatizado" },
          ].map((d, i) => (
            <MCountItem key={i} className="rounded-2xl border border-border bg-card p-4 text-center flex flex-col justify-center">
              <p className="text-2xl font-bold text-primary">{d.stat}</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{d.label}</p>
            </MCountItem>
          ))}
        </motion.div>

        {/* Problem vs Solution */}
        <motion.div variants={stagger} className="grid grid-cols-2 gap-6 flex-1">
          <MScaleItem className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 flex flex-col gap-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> O que seus concorrentes fazem
            </h3>
            <ul className="space-y-2">
              {[
                "Vendem suplementos como commodities — sem relacionamento",
                "Perdem clientes após 2-3 meses por falta de engajamento",
                "Não rastreiam uso, consistência nem resultados",
                "Afiliados sem ferramentas — indicam e torcem pelo melhor",
                "Zero inteligência de dados — decisões no achismo",
                "Sem gamificação — experiência genérica e esquecível",
              ].map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive mt-0.5 shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </MScaleItem>

          <MScaleItem className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col gap-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> O que a Vision Lift Platform entrega
            </h3>
            <ul className="space-y-2">
              {[
                "Jornada personalizada que transforma compra em hábito",
                "Retenção inteligente: IA prevê churn antes que aconteça",
                "Calendário de consistência com gamificação e rewards",
                "Parceiros com motor de comissões, simulador e ranking",
                "BI completo: MRR, LTV, cohort, projeções em tempo real",
                "Experiência premium tipo streaming — ninguém no mercado tem",
              ].map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </MScaleItem>
        </motion.div>

        {/* Closing CTA */}
        <MItem className="rounded-xl border border-primary bg-primary/10 px-6 py-3 text-center">
          <p className="text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 inline mr-2 text-primary" />
            Em um mercado de <strong className="text-primary">R$ 12 bilhões/ano</strong> no Brasil, quem profissionaliza primeiro leva o cliente. A Vision Lift Platform posiciona sua marca como <strong className="text-primary">líder de categoria</strong>.
          </p>
        </MItem>
      </MStagger>
    ),
  },
  {
    id: "consideracoes",
    title: "Considerações Finais",
    content: () => (
      <MStagger className="flex flex-col items-center justify-center h-full gap-8 text-center px-12">
        <MPopItem><img src={logoVisionLift} alt="Vision Lift" className="h-12 w-auto" /></MPopItem>
        <MItem><h2 className="text-3xl font-bold text-foreground">Considerações Finais</h2></MItem>
        <MItem>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Nosso compromisso é garantir um produto de <strong className="text-foreground">alta qualidade</strong>, <strong className="text-foreground">seguro</strong> e <strong className="text-foreground">eficiente</strong>. A Vision Lift Platform foi arquitetada para escalar desde o primeiro dia, 
            com tecnologias de ponta e práticas de engenharia de software modernas.
          </p>
        </MItem>

        <MItem className="max-w-2xl space-y-3 mt-2">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-3">
            <p className="text-xs text-primary font-medium">
              🔒 <strong>Código 100% exclusivo do cliente</strong> — O projeto é criado do zero, sob medida, conforme as necessidades levantadas. Todo o código-fonte e propriedade intelectual pertencem integralmente ao contratante.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              <Wrench className="h-3 w-3 inline mr-1 text-primary" />
              <strong className="text-foreground">Processo colaborativo:</strong> ajustes de funcionalidades, escopo e prioridades podem ser realizados durante todo o desenvolvimento, garantindo que o resultado final atenda perfeitamente às necessidades do negócio.
            </p>
          </div>
        </MItem>

        <MItem className="flex flex-col items-center gap-2 mt-2">
          <p className="text-sm text-muted-foreground">Estamos à disposição para esclarecimentos e ajustes.</p>
          <p className="text-sm font-semibold text-foreground">easymore.com.br</p>
        </MItem>
      </MStagger>
    ),
  },
];

/* ─── presentation shell ─── */
const ProposalPresentation: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [generating, setGenerating] = useState(false);
  const total = slides.length;

  const goNext = useCallback(() => setCurrent((c) => Math.min(c + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  const handleDownloadPDF = useCallback(async () => {
    if (generating) return;
    setGenerating(true);

    try {
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = 297;
      const pdfHeight = 210;
      const captureWidth = 1280;
      const captureHeight = 720;

      const slideRatio = captureWidth / captureHeight;
      let renderWidth = pdfWidth;
      let renderHeight = renderWidth / slideRatio;
      if (renderHeight > pdfHeight) {
        renderHeight = pdfHeight;
        renderWidth = renderHeight * slideRatio;
      }
      const offsetX = (pdfWidth - renderWidth) / 2;
      const offsetY = (pdfHeight - renderHeight) / 2;

      const bgRaw = getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
      const bgColor = bgRaw ? `hsl(${bgRaw})` : "#ffffff";

      const { createRoot } = await import("react-dom/client");
      const { flushSync } = await import("react-dom");

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const isCanvasUniform = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return false;

        const { width, height } = canvas;
        const samplePoints = 80;
        let base: [number, number, number] | null = null;

        for (let i = 0; i < samplePoints; i++) {
          const x = Math.floor((i / (samplePoints - 1)) * (width - 1));
          const y = Math.floor((((i * 37) % samplePoints) / (samplePoints - 1)) * (height - 1));
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const rgb: [number, number, number] = [pixel[0], pixel[1], pixel[2]];

          if (!base) {
            base = rgb;
            continue;
          }

          const delta = Math.abs(base[0] - rgb[0]) + Math.abs(base[1] - rgb[1]) + Math.abs(base[2] - rgb[2]);
          if (delta > 6) return false;
        }

        return true;
      };

      for (let i = 0; i < slides.length; i++) {
        const SlideComp = slides[i].content;

        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-pdf-capture", "true");
        wrapper.style.cssText = `
          width:${captureWidth}px;
          height:${captureHeight}px;
          position:fixed;
          top:0;
          left:-100000px;
          background:${bgColor};
          overflow:hidden;
          pointer-events:none;
        `;

        const rootStyles = getComputedStyle(document.documentElement);
        ["--background","--foreground","--primary","--secondary","--muted","--muted-foreground","--accent","--border","--card","--card-foreground","--primary-foreground","--secondary-foreground","--accent-foreground","--destructive","--destructive-foreground","--ring","--input","--popover","--popover-foreground"].forEach((token) => {
          const value = rootStyles.getPropertyValue(token);
          if (value) wrapper.style.setProperty(token, value);
        });

        const forceVisibleStyle = document.createElement("style");
        forceVisibleStyle.textContent = `
          [data-pdf-capture="true"] *,
          [data-pdf-capture="true"] *::before,
          [data-pdf-capture="true"] *::after {
            animation: none !important;
            transition: none !important;
          }
          [data-pdf-capture="true"] [style*="opacity: 0"] {
            opacity: 1 !important;
          }
        `;
        wrapper.appendChild(forceVisibleStyle);

        document.body.appendChild(wrapper);

        const root = createRoot(wrapper);

        try {
          flushSync(() => {
            root.render(
              <StaticSlideWrapper>
                <div style={{ width: `${captureWidth}px`, height: `${captureHeight}px`, display: "flex", flexDirection: "column" }}>
                  <SlideComp />
                </div>
              </StaticSlideWrapper>
            );
          });

          const images = wrapper.querySelectorAll("img");
          await Promise.all(
            Array.from(images).map(async (img) => {
              if (!img.complete) {
                await new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                });
              }
              if ("decode" in img) {
                try {
                  await img.decode();
                } catch {
                  // ignore decode failures
                }
              }
            })
          );

          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

          const captureSlide = async () => html2canvas(wrapper, {
            scale: 2,
            useCORS: true,
            logging: false,
            width: captureWidth,
            height: captureHeight,
            windowWidth: captureWidth,
            windowHeight: captureHeight,
            backgroundColor: bgColor,
          });

          let canvas = await captureSlide();

          if (isCanvasUniform(canvas)) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
            canvas = await captureSlide();
          }

          const imgData = canvas.toDataURL("image/jpeg", 0.95);

          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "JPEG", offsetX, offsetY, renderWidth, renderHeight);
        } finally {
          root.unmount();
          document.body.removeChild(wrapper);
        }
      }

      pdf.save("Proposta-Vision-Lift-Platform.pdf");
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setGenerating(false);
    }
  }, [generating]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const Slide = slides[current].content;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* top bar */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-background/80 backdrop-blur-md shrink-0">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Home className="h-4 w-4" />
          Voltar
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{current + 1} / {total}</span>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={generating} className="gap-2 text-xs">
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {generating ? "Gerando PDF…" : "Baixar PDF"}
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">Use ← → para navegar</span>
      </header>

      {/* slide area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col"
          >
            <Slide />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* bottom nav */}
      <footer className="flex items-center justify-between px-6 h-16 border-t border-border bg-background/80 backdrop-blur-md shrink-0">
        <Button variant="ghost" size="sm" onClick={goPrev} disabled={current === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>

        {/* dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"}`}
            />
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={goNext} disabled={current === total - 1}>
          Próximo <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </footer>
    </div>
  );
};

export default ProposalPresentation;
