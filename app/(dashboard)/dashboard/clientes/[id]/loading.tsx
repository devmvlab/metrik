export default function ClientDetailLoading() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-11 h-11 rounded-full bg-slate-800 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-6 w-40 rounded bg-slate-800 animate-pulse" />
          <div className="h-4 w-32 rounded bg-slate-800/60 animate-pulse mt-1" />
        </div>
        <div className="h-6 w-14 rounded-full bg-slate-800 animate-pulse shrink-0" />
      </div>

      {/* Divider Integrações */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-slate-800" />
        <div className="h-3 w-24 rounded bg-slate-800 animate-pulse" />
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      {/* Cards de integração */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 border border-slate-800 rounded-lg bg-slate-900">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-slate-800 animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-slate-800/60 animate-pulse mt-0.5" />
            </div>
            <div className="h-4 w-24 rounded bg-slate-800 animate-pulse mb-1" />
            <div className="h-3 w-20 rounded bg-slate-800/60 animate-pulse mb-0.5" />
            <div className="h-3 w-28 rounded bg-slate-800/60 animate-pulse mb-4" />
            <div className="h-8 w-full rounded-md bg-slate-800 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Divider Acessos */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-slate-800" />
        <div className="h-3 w-16 rounded bg-slate-800 animate-pulse" />
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      {/* Card Acessos */}
      <div className="mb-8 border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 last:border-0"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded bg-slate-800 animate-pulse" />
              <div className="h-3 w-40 rounded bg-slate-800/60 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Divider Dashboard */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-slate-800" />
        <div className="h-3 w-20 rounded bg-slate-800 animate-pulse" />
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      {/* Card Dashboard CTA */}
      <div className="p-5 border border-slate-800 rounded-lg bg-slate-900 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-36 rounded bg-slate-800 animate-pulse" />
          <div className="h-3 w-52 rounded bg-slate-800/60 animate-pulse" />
        </div>
        <div className="h-8 w-28 rounded-md bg-slate-800 animate-pulse shrink-0" />
      </div>
    </div>
  )
}
