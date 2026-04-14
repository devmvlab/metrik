export default function ConfiguracoesLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="h-6 w-36 rounded bg-neutral-200 animate-pulse" />
        <div className="h-4 w-80 rounded bg-neutral-100 animate-pulse mt-2" />
      </div>

      {/* Formulário white-label skeleton */}
      <div className="space-y-8">
        {/* Seção de logo */}
        <div>
          <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse mb-3" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-neutral-200 animate-pulse" />
            <div className="h-9 w-32 rounded-md bg-neutral-100 animate-pulse" />
          </div>
        </div>

        {/* Seção de cor */}
        <div>
          <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse mb-3" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-neutral-200 animate-pulse" />
            <div className="h-9 w-32 rounded-md bg-neutral-100 animate-pulse" />
          </div>
        </div>

        {/* Preview */}
        <div className="border border-neutral-200 rounded-lg p-5 bg-white shadow-sm">
          <div className="h-4 w-20 rounded bg-neutral-200 animate-pulse mb-4" />
          <div className="h-24 w-full rounded-lg bg-neutral-100 animate-pulse" />
        </div>

        {/* Botão */}
        <div className="h-9 w-36 rounded-md bg-neutral-200 animate-pulse" />
      </div>
    </div>
  )
}
