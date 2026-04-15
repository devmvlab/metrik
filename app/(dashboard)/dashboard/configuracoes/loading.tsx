export default function ConfiguracoesLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="h-6 w-36 rounded bg-slate-800 animate-pulse" />
        <div className="h-4 w-80 rounded bg-slate-800/60 animate-pulse mt-2" />
      </div>

      {/* Formulário white-label skeleton */}
      <div className="space-y-8">
        {/* Seção de logo */}
        <div className="border border-slate-800 rounded-lg bg-slate-900 p-6">
          <div className="h-4 w-24 rounded bg-slate-800 animate-pulse mb-5" />
          <div className="flex items-start gap-6">
            <div className="h-16 w-32 rounded-lg bg-slate-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-72 rounded bg-slate-800/60 animate-pulse" />
              <div className="h-9 w-36 rounded-md bg-slate-800 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Seção de cor */}
        <div className="border border-slate-800 rounded-lg bg-slate-900 p-6">
          <div className="h-4 w-32 rounded bg-slate-800 animate-pulse mb-5" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-slate-800 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3 w-16 rounded bg-slate-800/60 animate-pulse" />
              <div className="h-9 w-40 rounded-md bg-slate-800 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-12 rounded bg-slate-800/60 animate-pulse" />
              <div className="h-9 w-28 rounded-md bg-slate-800 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Botão */}
        <div className="flex justify-end">
          <div className="h-9 w-36 rounded-md bg-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
