
# Manual All Vita — Versão Completa (Apresentação + Testes)

## Objetivo
Entregar um PDF denso (~30-40 páginas) que sirva tanto como **apresentação institucional** da plataforma All Vita quanto como **roteiro guiado de testes** para o time da All Vita. Em vez de gerar o PDF dentro do app (botão "Baixar Manual"), vou produzir o arquivo diretamente como artefato, com qualidade editorial e capturas reais do sistema. O botão atual no admin permanece, mas passará a baixar este novo PDF estático (servido de `/public`).

## Estrutura do Manual

**Parte I — Apresentação Institucional**
1. Capa + sumário com paginação
2. O que é a All Vita (propósito, mercado, diferenciais)
3. Arquitetura Multi-Tenant explicada (o que é um tenant, isolamento de dados, white-label, subdomínios `*.allvita.com.br`)
4. Visão geral dos 4 portais: `/admin` (global), `/core` (tenant), `/partner`, `/club`
5. Glossário (Tenant, Partner, Vitacoins, CORE, Clube, Quiz, IA Assistant)

**Parte II — Configuração da Plataforma (Admin Global)**
6. Login e MFA do super admin
7. Cadastro de colaboradores All Vita e matriz de permissões da plataforma
8. Configuração global de comissões padrão
9. Economia de Vitacoins (regras de ganho, conversão, resgate via PIX)
10. Integrações globais (Resend, OpenAI/Lovable AI, Pagar.me, Shopify)
11. Hierarquia de visualização para colaboradores (RBAC dois domínios)
12. Auditoria, segurança e LGPD

**Parte III — Criação e Setup de um Tenant**
13. Como criar um tenant (modal 3 passos: dados, branding com logo/ícone/favicon, slug)
14. Configuração de DNS / subdomínio
15. Onboarding do administrador do tenant + 2FA
16. Branding white-label (paleta, logos, favicon)
17. Cadastro de colaboradores do tenant e permissões granulares

**Parte IV — Operação do Tenant (CORE)**
18. Configuração de chaves de API (pagamento, e-mail, IA)
19. Cadastro de produtos: campos, estoque, preço, margem para partner, vinculação
20. Configuração da IA do tenant (prompt, tom de voz, base de conhecimento)
21. Upload de documentos para treinamento do Quiz/IA (PDFs, manuais)
22. Configuração de e-mails transacionais (templates, remetente)
23. Configuração do Quiz (perguntas, lógica, recomendação)
24. Configuração de comissões e níveis de Vitacoins do tenant

**Parte V — Ecossistema Partner**
25. Cadastro de Partner e níveis (estrutura hierárquica multi-nível)
26. Os três links do Partner: Chat (IA), Quiz, Recrutamento de rede
27. Personalização dos links e rastreamento de leads
28. Como o tenant disponibiliza um produto para o partner
29. Como o partner compartilha o produto / fluxo de venda
30. Comissões em cascata na rede

**Parte VI — Clube All Vita (Cliente)**
31. Cadastro do cliente, calendário de consistência
32. Carteira de Vitacoins, regras de acúmulo
33. Fluxo de resgate de Vitacoins (produto ou PIX)
34. Conteúdo educativo

**Parte VII — Roteiro de Testes Operacionais (passo a passo)**
35. Fase 1: Setup Admin (checklist com prints)
36. Fase 2: Criar tenant e configurar
37. Fase 3: Criar partner + produto + simular venda (cartão sandbox)
38. Fase 4: Validar comissões, Vitacoins e liberação no Clube
39. Checklist final de auditoria por módulo

## Como vou produzir

1. **Capturar screenshots reais** do sistema usando o browser tool: login admin → percorrer telas-chave (dashboard global, criação de tenant, CORE config, catálogo, partner, clube). Salvar em `/tmp/screenshots/`.
2. **Gerar o PDF** com Python + ReportLab (Platypus) usando:
   - Capa com identidade All Vita (preto #1A1A1A + verde #6B8E23)
   - Sumário com âncoras
   - Tipografia Helvetica, hierarquia clara H1/H2/H3, espaçamento generoso (sem sobreposição)
   - Imagens redimensionadas com legendas
   - Caixas de destaque (dicas, atenção)
   - Tabelas de checklist com bordas limpas
   - Cabeçalho/rodapé com paginação "Página X de Y"
3. **QA visual obrigatório**: converter cada página para JPG via `pdftoppm` e inspecionar 100% das páginas em busca de sobreposição, corte de texto, imagens estouradas. Iterar até zero defeitos.
4. **Entregar** em `/mnt/documents/Manual_AllVita_Completo_v3.pdf` via `<lov-artifact>` e também copiar para `public/manuais/` para que o botão atual do admin baixe esta versão.

## Detalhes técnicos
- Script: `/tmp/build_manual.py` (ReportLab Platypus, SimpleDocTemplate, PageTemplate com header/footer).
- Screenshots: rota autenticada via browser tool → login com `somosallvita@gmail.com` (você fornecerá a senha quando eu solicitar, ou vou usar uma sessão já existente). Se o login falhar, monto o manual com mockups visuais em vez de screenshots reais e marco essa decisão.
- Botão "Baixar Manual de Testes" passa a apontar para `/manuais/Manual_AllVita_Completo_v3.pdf` (download estático), eliminando a geração client-side com jsPDF e qualquer chance de sobreposição.

## Entregáveis
- `Manual_AllVita_Completo_v3.pdf` (artefato baixável)
- Mesmo PDF servido em `public/manuais/` e linkado pelo botão do admin
- Remoção do gerador antigo `src/lib/manualGenerator.ts` (substituído por download direto)
