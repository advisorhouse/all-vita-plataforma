

## Simulação de Subdomínio via Query Parameter

### Problema
Lovable não suporta wildcard DNS, impossibilitando testar `slug.allvita.com.br` no ambiente de preview.

### Solução
Adicionar detecção de `?tenant=slug` no hook `useSubdomainTenant.ts` como fallback quando não há subdomínio real detectado.

### Alterações

**Arquivo: `src/hooks/useSubdomainTenant.ts`**
- Na função `extractTenantSlug()`, após verificar subdomínios reais, checar `URLSearchParams` por `?tenant=<slug>`
- Tratar esse slug exatamente como se fosse um subdomínio real (setar `isSubdomainAccess`, auto-selecionar tenant, aplicar branding)

### Fluxo
```text
URL acessada
  ├─ Subdomínio real detectado? → usa slug do subdomínio
  ├─ Custom domain detectado?   → busca tenant por domínio
  └─ ?tenant=slug presente?     → usa slug do query param (dev/preview)
```

### Resultado
- Acesso via `?tenant=vision-lift` simula experiência completa do tenant
- Branding, logo, cores aplicados automaticamente
- Login contextualizado para aquele tenant
- Zero impacto em produção (subdomínios reais continuam funcionando)

### Técnico
- Apenas 1 arquivo modificado: `useSubdomainTenant.ts`
- Adicionar ~5 linhas na função `extractTenantSlug`

