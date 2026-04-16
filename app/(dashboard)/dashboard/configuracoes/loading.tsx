export default function ConfiguracoesLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="h-6 w-36 rounded bg-slate-800 animate-pulse" />
        <div className="h-4 w-80 rounded bg-slate-800/60 animate-pulse mt-2" />
      </div>

      <div className="space-y-6">
        {/* Divider identidade visual */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <div className="h-3 w-32 rounded bg-slate-800 animate-pulse" />
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Card logo */}
        <div className="border border-slate-800 rounded-lg bg-slate-900 p-6">
          <div className="h-4 w-28 rounded bg-slate-800 animate-pulse mb-5" />
          {/* Dropzone skeleton */}
          <div className="h-28 w-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 animate-pulse mb-5" />
          {/* Mini header preview skeleton */}
          <div className="h-3 w-48 rounded bg-slate-800/60 animate-pulse mb-2" />
          <div className="h-11 w-full rounded-lg bg-slate-800 animate-pulse" />
        </div>

        {/* Card cores */}
        <div className="border border-slate-800 rounded-lg bg-slate-900 p-6">
          <div className="h-4 w-32 rounded bg-slate-800 animate-pulse mb-5" />
          <div className="grid grid-cols-2 gap-6 mb-6">
            {[0, 1].map((i) => (
              <div key={i}>
                <div className="h-3 w-36 rounded bg-slate-800/60 animate-pulse mb-3" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse shrink-0" />
                  <div className="flex-1 h-9 rounded-md bg-slate-800 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          {/* Preview combinado skeleton */}
          <div className="h-3 w-40 rounded bg-slate-800/60 animate-pulse mb-2" />
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="h-10 bg-slate-800 animate-pulse" />
            <div className="h-10 bg-slate-700/30 animate-pulse" />
          </div>
        </div>

        {/* Divider domínio */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <div className="h-3 w-36 rounded bg-slate-800 animate-pulse" />
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Card domínio */}
        <div className="border border-slate-800 rounded-lg bg-slate-900 p-6">
          <div className="h-4 w-36 rounded bg-slate-800 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded bg-slate-800/60 animate-pulse mb-4" />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-9 rounded-md bg-slate-800 animate-pulse" />
            <div className="h-9 w-24 rounded-md bg-slate-800 animate-pulse" />
          </div>
        </div>

        {/* Sticky bar skeleton */}
        <div className="flex justify-end pt-2">
          <div className="h-9 w-36 rounded-md bg-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
