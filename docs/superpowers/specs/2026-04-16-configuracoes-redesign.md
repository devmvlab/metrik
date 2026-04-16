# Spec: Configurações Redesign + Cor Secundária

**Data:** 2026-04-16  
**Status:** Aprovado

---

## Contexto

A página `dashboard/configuracoes` ficou visualmente fora do padrão das demais páginas do dashboard (como `billing` e `clientes`). Além disso, a agência só pode configurar uma cor (primária), limitando a customização do dashboard entregue ao cliente.

Este spec cobre duas melhorias simultâneas:
1. Reestruturar o layout da página de configurações seguindo o padrão das outras páginas
2. Adicionar suporte a cor secundária por agência, aplicada nos elementos interativos do dashboard do cliente

---

## Decisões de design

### Layout
Opção C escolhida pelo usuário: seções com separadores temáticos ("Identidade Visual" + "Domínio Customizado"). Prepara espaço para features futuras sem implementá-las.

### Cor secundária — onde é aplicada
Opção A escolhida pelo usuário: cor secundária aplicada nos **botões de ação interativos** do dashboard do cliente:
- Botão do período ativo (`PeriodSelector`)
- Botão "Exportar PDF" (`PrintButton` ou equivalente)

Header e gráficos continuam com a cor primária.

---

## Banco de dados

Nenhuma alteração necessária. O campo `secondaryColor String? @map("secondary_color")` já existe no modelo `WhiteLabelConfig` do Prisma schema.

---

## Arquivos a modificar

### 1. `app/actions/whitelabel.ts`
- Adicionar `secondaryColor` ao schema Zod (string hex opcional, mesmo padrão de `primaryColor`)
- Incluir `secondaryColor` no `db.whiteLabelConfig.upsert` (tanto no `create` quanto no `update`)

### 2. `app/(client)/layout.tsx`
- Ler `whiteLabelConfig.secondaryColor`
- Injetar CSS variable `--agency-secondary` no elemento raiz
- Fallback: se `secondaryColor` não estiver configurado, usar o valor de `primaryColor` como fallback (comportamento atual preservado)

### 3. `app/(dashboard)/dashboard/configuracoes/page.tsx`
- Passar `initialSecondaryColor={agency.whiteLabelConfig?.secondaryColor ?? null}` para `<WhiteLabelForm>`

### 4. `app/(dashboard)/dashboard/configuracoes/WhiteLabelForm.tsx`
- Adicionar prop `initialSecondaryColor: string | null`
- Adicionar estado `secondaryColor` (default `#2563eb` ou valor salvo)
- Reestruturar layout com dois separadores de seção:
  - **Identidade Visual**: card Logo + card "Cores da marca" (dois pickers lado a lado: Primária / Secundária, com prévia split)
  - **Domínio Customizado**: card desabilitado com texto "Em breve" (visível, não interativo)
- Botão "Salvar" fora dos cards, alinhado à direita (padrão das outras páginas)
- Incluir `secondaryColor` no `formData` enviado à Server Action

### 5. `components/dashboard/PeriodSelector.tsx`
- Botão do período ativo: trocar cor de `--agency-primary` para `--agency-secondary`

### 6. `components/dashboard/PrintButton.tsx` (ou equivalente)
- Botão "Exportar PDF": trocar cor de `--agency-primary` para `--agency-secondary`

---

## Comportamento de fallback

Se a agência não configurou cor secundária:
- CSS variable `--agency-secondary` recebe o valor de `--agency-primary`
- Botões interativos ficam com a cor primária (comportamento idêntico ao atual)
- Nenhum estado visual quebrado

---

## Fora de escopo

- Migration de banco (campo já existe)
- Domínio customizado (placeholder visual apenas)
- Outros elementos além de `PeriodSelector` e `PrintButton`
- Gráficos e header (permanecem com cor primária)
