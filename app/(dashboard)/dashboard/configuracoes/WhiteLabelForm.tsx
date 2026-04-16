'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Upload, X, Palette, Globe, ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react'
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

const HEX_RE = /^#[0-9a-fA-F]{6}$/

function isValidHex(color: string): boolean {
  return HEX_RE.test(color)
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
  const [isDragging, setIsDragging] = useState(false)
  const [primaryHexInput, setPrimaryHexInput] = useState(initialPrimaryColor ?? '#2563eb')
  const [secondaryHexInput, setSecondaryHexInput] = useState(initialSecondaryColor ?? initialPrimaryColor ?? '#2563eb')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function processFile(file: File) {
    if (!file.type.match(/^image\/(png|jpeg|svg\+xml|webp)$/)) return
    if (file.size > 2 * 1024 * 1024) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleRemoveLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handlePrimaryHexChange(value: string) {
    setPrimaryHexInput(value)
    if (isValidHex(value)) setPrimaryColor(value)
  }

  function handleSecondaryHexChange(value: string) {
    setSecondaryHexInput(value)
    if (isValidHex(value)) setSecondaryColor(value)
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
      if (res.success) {
        setLogoFile(null)
        if (res.logoUrl) setLogoPreview(res.logoUrl)
        else if (!logoPreview) setLogoPreview(null)
      }
    })
  }

  const primaryValid = isValidHex(primaryHexInput)
  const secondaryValid = isValidHex(secondaryHexInput)
  const safePrimary = primaryValid ? primaryHexInput : primaryColor
  const safeSecondary = secondaryValid ? secondaryHexInput : secondaryColor

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback */}
      {result && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${
            result.success
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {result.success
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
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
          {/* Card: Logo */}
          <Card className="p-6 bg-slate-900 border-slate-800 shadow-none">
            <div className="flex items-center gap-2 mb-5">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-white">Logo da agência</h2>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Dropzone ou preview com overlay */}
            {logoPreview ? (
              <div className="relative group mb-5">
                <div
                  className="w-full h-28 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage:
                      'repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%)',
                    backgroundSize: '16px 16px',
                  }}
                >
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={240}
                    height={80}
                    className="max-w-[200px] max-h-20 w-auto h-auto object-contain"
                    unoptimized={logoPreview.startsWith('blob:')}
                  />
                </div>
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Trocar
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remover
                  </button>
                </div>
                {logoFile && (
                  <p className="mt-2 text-xs text-slate-500 text-center">{logoFile.name}</p>
                )}
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mb-5 w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-300 font-medium">
                    {isDragging ? 'Solte aqui' : 'Arraste ou clique para fazer upload'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">PNG, SVG ou WebP · máx. 2MB</p>
                </div>
              </div>
            )}

            {/* Preview contextual: mini header do cliente */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Pré-visualização no dashboard do cliente:</p>
              <div
                className="rounded-lg h-11 flex items-center px-4 justify-between overflow-hidden"
                style={{ backgroundColor: safePrimary }}
              >
                <div className="flex items-center gap-2.5">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      width={80}
                      height={24}
                      className="h-6 w-auto object-contain"
                      unoptimized={logoPreview.startsWith('blob:')}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">{agencyName}</span>
                  )}
                </div>
                <span className="text-xs text-white/60">Dashboard de Performance</span>
              </div>
            </div>
          </Card>

          {/* Card: Cores da marca */}
          <Card className="p-6 bg-slate-900 border-slate-800 shadow-none">
            <div className="flex items-center gap-2 mb-5">
              <Palette className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-white">Cores da marca</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Cor primária */}
              <div>
                <Label className="text-xs text-slate-400 mb-3 block">Cor primária — header</Label>
                <div className="flex items-center gap-3">
                  <label className="shrink-0 cursor-pointer relative block w-10 h-10 group" title="Escolher cor primária">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md transition-transform group-hover:scale-110 pointer-events-none"
                      style={{ backgroundColor: safePrimary }}
                    />
                    <input
                      type="color"
                      value={safePrimary}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value)
                        setPrimaryHexInput(e.target.value)
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
                    />
                  </label>
                  <div className="flex-1">
                    <Input
                      name="primaryColor"
                      value={primaryHexInput}
                      onChange={(e) => handlePrimaryHexChange(e.target.value)}
                      placeholder="#2563eb"
                      className={`text-sm font-mono h-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 ${
                        !primaryValid ? 'border-red-500/60 focus-visible:ring-red-500' : ''
                      }`}
                      maxLength={7}
                    />
                    {!primaryValid && (
                      <p className="mt-1 text-xs text-red-400">Hex inválido</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cor secundária */}
              <div>
                <Label className="text-xs text-slate-400 mb-3 block">Cor secundária — botões</Label>
                <div className="flex items-center gap-3">
                  <label className="shrink-0 cursor-pointer relative block w-10 h-10 group" title="Escolher cor secundária">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md transition-transform group-hover:scale-110 pointer-events-none"
                      style={{ backgroundColor: safeSecondary }}
                    />
                    <input
                      type="color"
                      value={safeSecondary}
                      onChange={(e) => {
                        setSecondaryColor(e.target.value)
                        setSecondaryHexInput(e.target.value)
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
                    />
                  </label>
                  <div className="flex-1">
                    <Input
                      name="secondaryColor"
                      value={secondaryHexInput}
                      onChange={(e) => handleSecondaryHexChange(e.target.value)}
                      placeholder="#2563eb"
                      className={`text-sm font-mono h-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 ${
                        !secondaryValid ? 'border-red-500/60 focus-visible:ring-red-500' : ''
                      }`}
                      maxLength={7}
                    />
                    {!secondaryValid && (
                      <p className="mt-1 text-xs text-red-400">Hex inválido</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview combinado */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Pré-visualização combinada:</p>
              <div className="rounded-lg overflow-hidden border border-slate-700">
                {/* Mini header na cor primária */}
                <div
                  className="h-10 flex items-center px-4 justify-between"
                  style={{ backgroundColor: safePrimary }}
                >
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      width={80}
                      height={20}
                      className="h-5 w-auto object-contain"
                      unoptimized={logoPreview.startsWith('blob:')}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">{agencyName}</span>
                  )}
                  <span className="text-xs text-white/60">Dashboard de Performance</span>
                </div>
                {/* Mini barra de período + botão na cor secundária */}
                <div className="bg-neutral-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {['7d', '30d', '90d'].map((label, i) => (
                      <div
                        key={label}
                        className={`px-2.5 py-1 rounded text-xs font-medium ${
                          i === 1 ? 'text-white' : 'text-neutral-500 bg-white'
                        }`}
                        style={i === 1 ? { backgroundColor: safeSecondary } : undefined}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                  <div
                    className="px-3 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: safeSecondary }}
                  >
                    Exportar PDF
                  </div>
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

        <Card className="p-6 bg-slate-900 border-slate-800 shadow-none relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="text-xs font-semibold bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-full border border-violet-500/20">
              Em breve
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-white">Domínio personalizado</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Use seu próprio domínio para o dashboard dos clientes.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-9 rounded-md bg-slate-800 border border-slate-700 flex items-center px-3">
              <span className="text-sm text-slate-500 font-mono">dashboard.suaagencia.com.br</span>
            </div>
            <Button
              type="button"
              disabled
              size="sm"
              className="bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed hover:bg-slate-800"
            >
              Configurar
            </Button>
          </div>
        </Card>
      </div>

      {/* Barra de ação sticky */}
      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-slate-950/90 backdrop-blur border-t border-slate-800 flex justify-end">
        <Button
          type="submit"
          disabled={isPending || !primaryValid || !secondaryValid}
          className="min-w-[140px] bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
