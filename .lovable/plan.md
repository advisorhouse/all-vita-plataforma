## Diagnóstico do problema

Existe uma inconsistência real entre as duas telas:

- **`/admin/staff`** (convidar staff) oferece 8 papéis: Super Admin, Admin, Manager, Staff, Operações, Financeiro, Suporte, Growth.
- **`/admin/settings` → Permissões da Plataforma** mostra apenas 4: Super Admin, Admin, Manager, Staff.

A causa: o enum `staff_role` no banco de dados **só aceita 4 valores** (`super_admin`, `admin`, `manager`, `staff`). Os outros 4 (`ops`, `finance`, `support`, `growth`) foram colocados apenas como labels no frontend de `AdminStaff.tsx`, mas:
- Não existem no enum do Postgres → qualquer convite com esses papéis **falharia ao gravar** no banco.
- Não aparecem na matriz de permissões porque a matriz só conhece o que existe no enum.
- Confundem o usuário porque sugerem papéis que na verdade não funcionam.

## Decisão recomendada

Manter o modelo simples e consistente que já está implementado no banco e na matriz de permissões: **4 papéis de staff da plataforma**.

| Papel | O que é |
|---|---|
| Super Admin | Acesso total. Não editável, não convidável (criado manualmente). |
| Admin | Gestão completa, exceto exclusões críticas e edição de permissões. |
| Manager | Leitura ampla e edição moderada. |
| Staff | Acesso somente leitura. |

Se no futuro fizer sentido criar papéis especializados (Financeiro, Suporte, etc.), a forma correta é adicionar valores ao enum `staff_role` **e** criar as linhas correspondentes em `platform_role_permissions` na mesma migration — para que apareçam nas duas telas automaticamente.

## Mudanças

### 1. `src/pages/admin/AdminStaff.tsx`
- Reduzir `StaffRole` para `"super_admin" | "admin" | "manager" | "staff"`.
- Remover de `ROLE_LABELS` as entradas `ops`, `finance`, `support`, `growth`.
- Reduzir `EDITABLE_ROLES` para `["admin", "manager", "staff"]` (super_admin não é convidável).
- Adicionar uma descrição curta ao lado de cada papel no select de convite, igual à da tela de Permissões, para o admin entender o que está concedendo.

### 2. `src/components/admin/AdminPermissions.tsx`
- Adicionar um link/aviso no topo: "Estes são os mesmos papéis usados ao convidar staff em /admin/staff" — para reforçar a coerência entre as telas.

### 3. Banco de dados
- Nenhuma migration necessária. O enum já está correto com 4 valores.

## Como ficará para o usuário

- Em **/admin/staff**, o select de convite mostrará exatamente 3 opções convidáveis (Admin, Manager, Staff), cada uma com uma frase descrevendo o nível de acesso.
- Em **/admin/settings → Permissões da Plataforma**, os mesmos 3 papéis aparecem como cards editáveis (Super Admin é mencionado como "não editável").
- A correspondência entre as duas telas fica 1:1, sem papéis fantasmas.
