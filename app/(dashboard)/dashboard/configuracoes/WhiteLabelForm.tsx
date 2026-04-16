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
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor ?? initialPrimaryColor ?? '#2563eb')
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
