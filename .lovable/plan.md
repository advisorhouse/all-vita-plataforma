

# Plano: Documento PDF de Arquitetura de Software - All Vita Platform

## Objetivo
Gerar um PDF profissional (~30 paginas) documentando toda a arquitetura da plataforma All Vita, usando a logo oficial enviada e as cores da marca (preto #1A1A1A + verde #6B8E23) como paleta do documento.

## Conteudo do Documento

### Capa
- Logo All Vita (imagem enviada) centralizada
- Titulo: "Documento de Arquitetura de Software"
- Subtitulo: "All Vita Platform v1.0 - Confidencial"
- Data: Marco 2026

### Sumario com numeracao de paginas

### 1. Visao Geral da Plataforma
- SaaS multi-tenant B2B2C para gestao de parceiros, clientes e comissoes
- Stakeholders: All Vita (plataforma), Empresas (tenants), Parceiros, Clientes

### 2. Stack Tecnologica
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- Backend: Supabase (PostgreSQL 15 + Auth + Storage + 16 Edge Functions)
- Estado: TanStack React Query + Context API (AuthContext, TenantContext)

### 3. Arquitetura de Software (4 Portais)
- Club (Cliente): 10 rotas - Dashboard, Assinatura, Pedidos, Beneficios, Conteudo, Comunidade, Indicacoes, Suporte, Configuracoes
- Partner (Parceiro): 14 rotas - Dashboard, Rede, Indicacoes, Formacao, Clientes, Receita, Materiais, Links, Niveis, Ranking, Suporte, Configuracoes
- Core (Admin Empresa): 12 rotas - Dashboard, Clientes, Partners, Assinaturas, Comissoes, Financeiro, Insights, Gamificacao, Produtos, Permissoes, Configuracoes, Usuarios
- Admin (All Vita): 3 rotas - Dashboard, Tenants, Onboarding
- Componentes compartilhados: AppShell, AppSidebar, AuthGuard, PermissionGate, AppBootstrap

### 4. Arquitetura Multi-Tenant
- Isolamento por tenant_id em todas as tabelas operacionais
- Tabelas: tenants, tenant_addresses, tenant_owners, tenant_staff
- Onboarding automatico (Edge Function tenant-onboarding)
- Branding dinamico: cores, logo, subdominio por slug
- TenantSwitcher para usuarios multi-empresa

### 5. Arquitetura de Banco de Dados
Documentar todas as 37 tabelas organizadas em grupos:
- **Identidade** (6): profiles, memberships, all_vita_staff, staff, tenant_staff, user_security
- **Empresas** (4): tenants, tenant_addresses, tenant_owners, user_consents
- **Operacional** (8): partners, clients, products, subscriptions, content, courses, lessons, assets
- **Financeiro** (5): mt_commissions, commission_rules, transactions, payment_integrations, commission_to_coin_rules
- **Vitacoins** (5): wallet, vitacoin_transactions, vitacoin_settings, rewards_catalog, redemption_requests
- **Gamificacao** (5): gamification, levels, rankings, rewards, user_progress
- **Tracking** (5): affiliate_links, clicks, conversions, referrals, quiz_submissions
- **Seguranca** (6): audit_logs, access_logs, security_events, entity_versions, rate_limits, role_permissions
- **Integracao** (1): integrations

12 Funcoes SQL: has_role, is_super_admin, belongs_to_tenant, check_permission, check_rate_limit, get_partner_id, is_in_partner_downline, log_security_event, create_audit_log, create_entity_version, anonymize_user_data

2 Enums: app_role (5 valores), staff_role (5 valores)

### 6. RBAC e Permissoes
- Matrix 5x8 (roles x resources) com acoes CRUD
- Frontend: usePermissions hook + PermissionGate component
- Backend: has_role(), check_permission(), RLS policies
- Staff roles separados para equipe All Vita

### 7. Seguranca e Compliance
- RLS em todas as tabelas com filtro tenant_id
- Logs imutaveis (append-only policies)
- Rate limiting (check_rate_limit)
- Antifraude (account_locked, security_events com severity)
- 2FA infraestrutura (user_security)
- LGPD: anonymize_user_data(), user_consents, entity_versions
- Criptografia de dados sensiveis (cpf_encrypted, api_key_encrypted)

### 8. Edge Functions (16)
Tabela com nome, descricao e responsabilidade de cada uma:
api-gateway, tenant-onboarding, tenant-api, manage-users, commission-engine-v2, process-commission, commission-simulator, gamification-engine, retention-engine, ai-revenue-projections, financial-projections, analytics-api, payment-webhook, webhook-receiver, process-attribution, send-email

### 9. IA e Integracoes
- **OpenAI GPT**: Integracao centralizada All Vita para agentes verticalizados por empresa. Churn Prediction (ML preditivo), LTV Projection, analise comportamental, recomendacoes. Edge Functions: ai-revenue-projections, retention-engine
- **ElevenLabs**: Integracao centralizada All Vita para voice AI agents por empresa. Text-to-speech, atendimento automatizado
- **Shopify**: Integracao por tenant via webhook. Sincronizacao de produtos, pedidos, inventario
- **Pagar.me**: Gateway de pagamento por tenant. Tabelas: payment_integrations, transactions. Edge Function: payment-webhook
- **Webhooks**: Sistema de eventos em tempo real (webhook-receiver). Multiplos providers por tenant
- **API Gateway**: Rate limiting + auth JWT/API Key. Edge Function dedicada
- **SEO**: Meta tags dinamicas por tenant/pagina
- **Analytics**: Eventos customizados via analytics-api

### 10. Fluxos de Dados (diagramas ASCII)
- Fluxo de pagamento: Gateway externo -> webhook -> commission engine -> vitacoin ledger
- Fluxo de atribuicao: Click -> affiliate_link -> conversion -> commission
- Fluxo de autenticacao: Login -> JWT -> membership -> tenant context -> portal

### 11. Escalabilidade e Roadmap
- Arquitetura N-tenant sem hardcode
- Preparacao para 2FA completo, Resend, Shopify nativa

## Implementacao Tecnica
- Script Python com reportlab
- Logo All Vita embutida na capa e cabecalhos
- Paleta: preto (#1A1A1A), verde (#6B8E23), cinza (#F5F5F5), branco
- Tabelas formatadas, diagramas ASCII, numeracao de paginas
- QA visual em todas as paginas
- Output: `/mnt/documents/allvita-architecture.pdf`

