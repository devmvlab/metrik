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
  agencyName: string
}

export function WhiteLabelForm({
  initialLogoUrl,
  initialPrimaryColor,
  agencyName,
}: WhiteLabelFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl)
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor ?? '#2563eb')
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
    // Se removeu o logo, envia string vazia para limpar
    if (!logoPreview && !logoFile) {
      formData.set('logoUrl', '')
    }

    startTransition(async () => {
      const res = await updateWhitelabel(formData)
      setResult(res)
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {/* Feedback */}
      {result && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            result.success
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {result.success ? result.message : result.error}
        </div>
      )}

      {/* Logo */}
      <Card className="p-6 border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900">Logo da agência</h2>
        </div>

        <div className="flex items-start gap-6">
          {/* Preview */}
          <div className="shrink-0">
            <div className="w-32 h-16 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden">
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
                <span className="text-xs text-neutral-400 text-center px-2">Sem logo</span>
              )}
            </div>
            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
                Remover
              </button>
            )}
          </div>

          {/* Upload */}
          <div className="flex-1">
            <p className="text-sm text-neutral-600 mb-3">
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
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />
              Escolher imagem
            </Button>
            {logoFile && (
              <p className="mt-2 text-xs text-neutral-500">{logoFile.name}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Cor primária */}
      <Card className="p-6 border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900">Cor da marca</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5 bg-white"
              title="Escolher cor"
            />
          </div>
          <div className="flex-1 max-w-[160px]">
            <Label htmlFor="primaryColor" className="text-xs text-neutral-500 mb-1.5 block">
              Código hex
            </Label>
            <Input
              id="primaryColor"
              name="primaryColor"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#2563eb"
              className="text-sm font-mono h-9"
              maxLength={7}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-500 mb-1.5">Prévia</p>
            <div className="flex items-center gap-2">
              <div
                className="h-9 px-4 rounded-md flex items-center text-sm font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {agencyName}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="min-w-[120px]">
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
