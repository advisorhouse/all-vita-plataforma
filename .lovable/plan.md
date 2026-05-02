# Onboarding Educacional do Partner — White-label + Vitacoins dinâmico

## Objetivo

Reaproveitar **somente as telas informativas** do fluxo antigo do Vision Lift (3 telas: Welcome, Sistema de Vínculo, Vitacoins) e transformá-las em um **onboarding educacional universal** disparado para todo partner em qualquer tenant, com:

- Logo, nome e cores do tenant atual (white-label)
- Nome do programa fixo: **"Vitacoins"** (não mais "VisionPoints Coin", não mais "Vision Lift")
- Exemplo prático **dinâmico**, calculado a partir das configurações que o Super Admin define em `vitacoin_settings`
- **Sem** etapas de cadastro de CRM/PIX (partner já está cadastrado)
- Marcação de "visto" persistente: o onboarding aparece **uma única vez** por partner

## Escopo das telas (3 telas, todas educacionais)

```text
┌─────────────────────────────────────────────────────────┐
│ Tela 1 — Boas-vindas                                    │
│  Logo do tenant + "Bem-vindo(a) ao {Tenant} Partners"   │
│  4 pilares: Vínculo · Vitacoins · Resgate · Ético       │
│  CTA: "Começar tour"                                    │
├─────────────────────────────────────────────────────────┤
│ Tela 2 — Sistema de Vínculo Médico–Paciente             │
│  4 passos (quiz → paciente → LGPD → pontos automáticos) │
│  Caixa destaque: "Modelo Último Click"                  │
│  CTA: "Continuar"                                       │
├─────────────────────────────────────────────────────────┤
│ Tela 3 — Vitacoins (moeda interna)                      │
│  5 formas de ganhar pontos                              │
│  Wallet: Pendentes (30d) · Liberados · Expiram (2 anos) │
│  6 opções de resgate (Pix, Produtos, Cursos…)           │
│  💡 Exemplo prático DINÂMICO ← lê vitacoin_settings     │
│  CTA: "Ir para o painel"                                │
└─────────────────────────────────────────────────────────┘
```

**Telas removidas do fluxo antigo:** `s1` a `s7` (cadastro de CRM, dados pessoais, endereço, PIX, etc.) e `done` — partner já está cadastrado.

## Como o exemplo prático fica dinâmico

Hoje a tabela `public.vitacoin_settings` armazena:
- `conversion_rate` (ex: 1.0 → 1 Vitacoin = R$ 1,00)
- `min_redemption`
- `max_redemption_daily`
- `metadata` (jsonb — usaremos para guardar % por evento)

O Super Admin já edita `conversion_rate` em `/admin/vitacoins`. O onboarding vai ler **em tempo real** essa configuração e recalcular o exemplo:

> "Paciente adquire plano de R$ 528 → você recebe **528 Vitacoins** (com `conversion_rate = 1.0`)"
> Se admin mudar `conversion_rate` para `0.5`, o exemplo passa a mostrar "264 Vitacoins" automaticamente.

A página de admin **não precisa de mudança de UI** — a fonte da verdade já existe.

## Quando o onboarding aparece

- Ao acessar `/partner` (ou `/<slug>/partner`) pela primeira vez
- Lê flag `profiles.partner_onboarding_seen` (nova coluna, separada de `tour_completed` que é do tour por tooltips)
- Se `false` → modal full-screen abre automaticamente
- Ao concluir a Tela 3 ou clicar "Pular" → grava `true` e fecha
- Botão "Rever apresentação" disponível em `/partner/settings` para reabrir manualmente

## Arquivos a criar / modificar

**Novos:**
- `src/components/partner/PartnerOnboardingTour.tsx` — componente das 3 telas (full-screen, framer-motion, white-label via `useTenant()` e `useTenantBranding()`)
- `src/hooks/usePartnerOnboarding.ts` — controla flag `partner_onboarding_seen`, expõe `shouldShow` e `markAsSeen()`
- `src/hooks/useVitacoinSettings.ts` — busca `vitacoin_settings` do tenant atual (com fallback global) para alimentar o exemplo dinâmico

**Modificados:**
- `src/layouts/PartnerLayout.tsx` — monta `<PartnerOnboardingTour />` controlado pelo hook
- `src/pages/partner/PartnerSettings.tsx` — adiciona botão "Rever apresentação inicial"

**Banco (migration):**
- `ALTER TABLE public.profiles ADD COLUMN partner_onboarding_seen boolean NOT NULL DEFAULT false;`

**Não tocar:**
- `PartnerOnboarding.tsx` antigo (cadastro de CRM da Vision Lift) — permanece nas rotas `/partner/onboarding` e `/partner/start` para compatibilidade do fluxo legado
- `useProductTour.ts` — continua sendo o tour de tooltips (Driver.js), independente do onboarding educacional

## Detalhes técnicos

**White-label (Tela 1):**
```tsx
const { currentTenant } = useTenant();
const tenantName = currentTenant?.trade_name || currentTenant?.name;
const logoUrl = currentTenant?.logo_url; // sem fallback Vision Lift
const primary = currentTenant?.brand_primary_color; // aplicado via inline style/CSS var
```

**Exemplo dinâmico (Tela 3):**
```tsx
const { conversionRate } = useVitacoinSettings(tenantId);
const exampleSale = 528; // valor base do exemplo
const earnedCoins = Math.round(exampleSale / conversionRate);
// renderiza: "Você recebe {earnedCoins} Vitacoins"
```

**Controle de exibição:**
```tsx
// PartnerLayout
const { shouldShow, markAsSeen } = usePartnerOnboarding();
return (
  <AppShell ...>
    {shouldShow && <PartnerOnboardingTour onClose={markAsSeen} />}
    <Outlet />
  </AppShell>
);
```

## Branding strategy (alinhado à memória do projeto)

- **Zero referência hardcoded** a "Vision Lift", `logo-vision-lift.png` ou imagem `partnerHeroImg` específica
- Logo no header: `currentTenant.logo_url` (placeholder neutro se ausente)
- Cor de destaque dos ícones e CTA: usar tokens `accent`/`primary` que já são sobrescritos por `useTenantBranding`
- Texto "Vision Lift Partners" → `"{tenantName} Partners"`

## Fora de escopo (não será feito agora)

- Tornar `vitacoin_settings.metadata` editável com % por tipo de evento (venda/quiz/indicação) — hoje só `conversion_rate` é exposto na UI admin. Se quiser % específicos por evento no exemplo, é uma evolução à parte
- Resetar a flag para todos os partners existentes (decisão sua: aplicar só para novos, ou disparar para todos atualmente cadastrados também)

## Pergunta antes de implementar

Quer que o onboarding apareça **apenas para novos partners** que logarem após o deploy, **ou também para todos os partners atuais** (resetando a flag uma vez para que vejam a apresentação no próximo login)?
