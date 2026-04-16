# Configurações Redesign + Cor Secundária — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestruturar o layout da página de configurações para seguir o padrão das outras páginas do dashboard e adicionar suporte a cor secundária por agência, aplicada nos botões interativos do dashboard do cliente.

**Architecture:** Seis arquivos cirúrgicos — Server Action aceita `secondaryColor`, layout do cliente injeta `--agency-secondary` como CSS variable (com fallback para `--agency-primary`), formulário de configurações ganha segundo picker e novo layout com seções, e dois componentes do dashboard do cliente passam a usar `--agency-secondary` nos botões ativos.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Prisma (campo já existe no banco), Zod

---

## File Map

| Arquivo | Alteração |
|---|---|
| `app/actions/whitelabel.ts` | Adicionar `secondaryColor` ao schema Zod e ao upsert |
| `app/(client)/layout.tsx` | Injetar `--agency-secondary` como CSS variable |
| `app/(dashboard)/dashboard/configuracoes/page.tsx` | Passar `initialSecondaryColor` ao `<WhiteLabelForm>` |
| `app/(dashboard)/dashboard/configuracoes/WhiteLabelForm.tsx` | Novo layout (seções) + segundo color picker |
| `components/dashboard/PeriodSelector.tsx` | Botão ativo usa `--agency-secondary` |
| `components/dashboard/PrintButton.tsx` | Fundo usa `--agency-secondary` |

---

## Task 1: Adicionar secondaryColor ao Server Action

**Files:**
- Modify: `app/actions/whitelabel.ts`

- [ ] **Step 1: Adicionar `secondaryColor` ao schema Zod**

Localize o objeto `whitelabelSchema` (linha 9) e adicione o campo após `primaryColor`:

```typescript
const whitelabelSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida. Use o formato #RRGGBB.')
    .optional()
    .or(z.literal('')),
  secondaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor secundária inválida. Use o formato #RRGGBB.')
    .optional()
    .or(z.literal('')),
  logoUrl: z.url('URL inválida').optional().or(z.literal('')),
})
```

- [ ] **Step 2: Incluir `secondaryColor` na extração e no upsert**

Localize o bloco `const parsed = whitelabelSchema.safeParse(...)` (linha 64) e adicione `secondaryColor`:

```typescript
const parsed = whitelabelSchema.safeParse({
  primaryColor: formData.get('primaryColor') as string,
  secondaryColor: formData.get('secondaryColor') as string,
  logoUrl: rawLogoUrl !== null ? rawLogoUrl : undefined,
})
```

Localize o `db.whiteLabelConfig.upsert` (linha 78) e adicione `secondaryColor` ao `create` e ao `update`:

```typescript
await db.whiteLabelConfig.upsert({
  where: { agencyId: session.agencyId },
  create: {
    agencyId: session.agencyId,
    primaryColor: parsed.data.primaryColor || null,
    secondaryColor: parsed.data.secondaryColor || null,
    logoUrl: parsed.data.logoUrl || null,
  },
  update: {
    ...(parsed.data.primaryColor !== undefined && {
      primaryColor: parsed.data.primaryColor || null,
    }),
    ...(parsed.data.secondaryColor !== undefined && {
      secondaryColor: parsed.data.secondaryColor || null,
    }),
    ...(parsed.data.logoUrl !== undefined && {
      logoUrl: parsed.data.logoUrl || null,
    }),
  },
})
```

- [ ] **Step 3: Verificar lint**

```bash
npm run lint
```

Esperado: sem erros em `app/actions/whitelabel.ts`.

- [ ] **Step 4: Commit**

```bash
git add app/actions/whitelabel.ts
git commit -m "feat: add secondaryColor to whitelabel server action"
```

---

## Task 2: Injetar --agency-secondary no layout do cliente

**Files:**
- Modify: `app/(client)/layout.tsx`

- [ ] **Step 1: Ler e preparar `secondaryColor`**

Após a linha `const agencyName = agency?.name ?? 'Dashboard'` (linha 11), adicione:

```typescript
const secondaryColor = agency?.whiteLabelConfig?.secondaryColor ?? primaryColor
```

Isso garante que, se a agência não configurou cor secundária, o fallback é a cor primária (comportamento atual preservado).

- [ ] **Step 2: Injetar `--agency-secondary` no bloco `<style>`**

Substitua o bloco `<style>` existente (linhas 27–32) por:

```tsx
<style>{`
  :root {
    --agency-primary: ${primaryColor};
    --agency-primary-rgb: ${primaryRgb};
    --agency-secondary: ${secondaryColor};
  }
`}</style>
```

- [ ] **Step 3: Verificar lint**

```bash
npm run lint
```

Esperado: sem erros em `app/(client)/layout.tsx`.

- [ ] **Step 4: Commit**

```bash
git add app/(client)/layout.tsx
git commit -m "feat: inject --agency-secondary CSS variable in client layout"
```

---

## Task 3: Passar initialSecondaryColor para o formulário

**Files:**
- Modify: `app/(dashboard)/dashboard/configuracoes/page.tsx`

- [ ] **Step 1: Adicionar `initialSecondaryColor` ao `<WhiteLabelForm>`**

Substitua o bloco `<WhiteLabelForm ... />` existente (linhas 18–22) por:

```tsx
<WhiteLabelForm
  initialLogoUrl={agency?.whiteLabelConfig?.logoUrl ?? null}
  initialPrimaryColor={agency?.whiteLabelConfig?.primaryColor ?? null}
  initialSecondaryColor={agency?.whiteLabelConfig?.secondaryColor ?? null}
  agencyName={agency?.name ?? 'Sua agência'}
/>
```

- [ ] **Step 2: Verificar lint**

```bash
npm run lint
```

Esperado: sem erros. TypeScript vai reclamar que a prop não existe ainda no componente — isso será resolvido na Task 4.

- [ ] **Step 3: Commit após Task 4 passar no lint**

Este arquivo será commitado junto com o WhiteLabelForm na Task 4.

---

## Task 4: Reestruturar WhiteLabelForm

**Files:**
- Modify: `app/(dashboard)/dashboard/configuracoes/WhiteLabelForm.tsx`

- [ ] **Step 1: Substituir o arquivo completo pelo novo conteúdo**

Substitua todo o conteúdo de `WhiteLabelForm.tsx` por:

```tsx
'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Upload, X, Palette, Globe } from 'lucide-react'
import { updateWhitelabel } from '@/app/actions/whitelabel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

interface WhiteLabelFormProps {
  initialLogoUrl: string | null
  initialPrimaryColor: string | null
  initialSecondaryColor: string | null
  agencyName: string
}

export function WhiteLabelForm({
  initialLogoUrl,
  initialPrimaryColor,
  initialSecondaryColor,
  agencyName,
}: WhiteLabelFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl)
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor ?? '#2563eb')
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor ?? '#2563eb')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handleRemoveLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)

    const formData = new FormData(e.currentTarget)
    if (logoFile) {
      formData.set('logoFile', logoFile)
    }
    if (!logoPreview && !logoFile) {
      formData.set('logoUrl', '')
    }

    startTransition(async () => {
      const res = await updateWhitelabel(formData)
      setResult(res)
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback */}
      {result && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            result.success
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {result.success ? result.message : result.error}
        </div>
      )}

      {/* Seção: Identidade Visual */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
            Identidade Visual
          </span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="space-y-4">
          {/* Logo */}
          <Card className="p-6 bg-slate-900 border-slate-800 shadow-none">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-white">Logo da agência</h2>
            </div>

            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <div className="w-32 h-16 rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={120}
                      height={48}
                      className="w-auto h-auto max-w-[112px] max-h-[48px] object-contain"
                      unoptimized={logoPreview.startsWith('blob:')}
                    />
                  ) : (
                    <span className="text-xs text-slate-500 text-center px-2">Sem logo</span>
                  )}
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Remover
                  </button>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-3">
                  Recomendado: PNG ou SVG com fundo transparente, 200×60px. Máximo 2MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Escolher imagem
                </Button>
                {logoFile && (
                  <p className="mt-2 text-xs text-slate-400">{logoFile.name}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Cores da marca */}
          <Card className="p-6 bg-slate-900 border-slate-800 shadow-none">
            <div className="flex items-center gap-2 mb-5">
              <Palette className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-white">Cores da marca</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Cor primária */}
              <div>
                <p className="text-xs text-slate-400 mb-3">Cor primária — fundo do header</p>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer p-0.5 bg-slate-800"
                    title="Escolher cor primária"
                  />
                  <div className="flex-1">
                    <Label htmlFor="primaryColor" className="text-xs text-slate-400 mb-1.5 block">
                      Código hex
                    </Label>
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#2563eb"
                      className="text-sm font-mono h-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
                      maxLength={7}
                    />
                  </div>
                </div>
                <div
                  className="mt-3 h-9 rounded-md flex items-center px-4 text-sm font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {agencyName}
                </div>
              </div>

              {/* Cor secundária */}
              <div>
                <p className="text-xs text-slate-400 mb-3">Cor secundária — botões interativos</p>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer p-0.5 bg-slate-800"
                    title="Escolher cor secundária"
                  />
                  <div className="flex-1">
                    <Label htmlFor="secondaryColor" className="text-xs text-slate-400 mb-1.5 block">
                      Código hex
                    </Label>
                    <Input
                      id="secondaryColor"
                      name="secondaryColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#2563eb"
                      className="text-sm font-mono h-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
                      maxLength={7}
                    />
                  </div>
                </div>
                <div
                  className="mt-3 h-9 rounded-md flex items-center px-4 text-sm font-medium text-white"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Período ativo · Exportar PDF
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Seção: Domínio Customizado */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Domínio Customizado
          </span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 shadow-none opacity-50 pointer-events-none select-none">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-white">Em breve</h2>
          </div>
          <p className="text-sm text-slate-400">dashboard.suaagencia.com.br</p>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-[120px] bg-violet-600 hover:bg-violet-700 text-white"
        >
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Verificar lint e tipos**

```bash
npm run lint
```

Esperado: sem erros nos dois arquivos (`page.tsx` e `WhiteLabelForm.tsx`).

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/dashboard/configuracoes/page.tsx \
        app/(dashboard)/dashboard/configuracoes/WhiteLabelForm.tsx
git commit -m "feat: restructure configuracoes page with sections and secondary color picker"
```

---

## Task 5: Aplicar --agency-secondary no PeriodSelector

**Files:**
- Modify: `components/dashboard/PeriodSelector.tsx`

O botão do período ativo atualmente usa classes Tailwind `bg-white text-neutral-900 shadow-sm`. Substituir por inline style com `--agency-secondary` e texto branco.

- [ ] **Step 1: Atualizar os botões de preset**

Localize o map dos `PERIOD_PRESETS` (linha 57) e substitua a className + adicione style:

```tsx
{PERIOD_PRESETS.map((preset) => (
  <button
    key={preset}
    onClick={() => handlePresetChange(preset)}
    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
      current === preset
        ? 'shadow-sm text-white'
        : 'text-neutral-500 hover:text-neutral-700'
    }`}
    style={current === preset ? { backgroundColor: 'var(--agency-secondary)' } : undefined}
  >
    {PERIOD_LABELS[preset]}
  </button>
))}
```

- [ ] **Step 2: Atualizar o botão "Personalizar"**

Localize o botão do picker customizado (linha 70) e aplique o mesmo padrão:

```tsx
<button
  onClick={() => setShowPicker((v) => !v)}
  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
    current === 'custom'
      ? 'shadow-sm text-white'
      : 'text-neutral-500 hover:text-neutral-700'
  }`}
  style={current === 'custom' ? { backgroundColor: 'var(--agency-secondary)' } : undefined}
>
  <Calendar className="w-3 h-3" />
  {current === 'custom' ? 'Personalizado' : 'Personalizar'}
</button>
```

- [ ] **Step 3: Verificar lint**

```bash
npm run lint
```

Esperado: sem erros em `components/dashboard/PeriodSelector.tsx`.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/PeriodSelector.tsx
git commit -m "feat: use --agency-secondary for active period button"
```

---

## Task 6: Aplicar --agency-secondary no PrintButton

**Files:**
- Modify: `components/dashboard/PrintButton.tsx`

- [ ] **Step 1: Substituir o conteúdo do arquivo**

```tsx
'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintButton() {
  return (
    <Button
      size="sm"
      className="gap-1.5 text-white border-0 hover:opacity-90 hover:text-white"
      style={{ backgroundColor: 'var(--agency-secondary)' }}
      onClick={() => window.print()}
    >
      <Printer className="w-4 h-4" />
      Exportar PDF
    </Button>
  )
}
```

- [ ] **Step 2: Verificar lint**

```bash
npm run lint
```

Esperado: sem erros em `components/dashboard/PrintButton.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/PrintButton.tsx
git commit -m "feat: use --agency-secondary for print button background"
```

---

## Verificação final

- [ ] **Rodar o servidor de desenvolvimento**

```bash
npm run dev
```

- [ ] **Verificar página de configurações** (`/dashboard/configuracoes`)
  - Layout com dois separadores de seção visíveis
  - Dois pickers de cor lado a lado com prévias
  - Seção "Domínio Customizado" visível mas desabilitada (opacidade reduzida, não clicável)
  - Salvar → confirmar que ambas as cores são persistidas

- [ ] **Verificar dashboard do cliente** (rota `/client/...`)
  - Botão do período ativo usa a cor secundária configurada
  - Botão "Exportar PDF" usa a cor secundária configurada
  - Se nenhuma cor secundária foi configurada, ambos usam a cor primária (fallback)
  - Header continua com a cor primária

- [ ] **Commit final de verificação (se necessário)**

Se ajustes visuais foram feitos durante a verificação, commitar com mensagem descritiva.
