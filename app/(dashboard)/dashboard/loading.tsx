export default function DashboardLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="h-6 w-48 rounded bg-slate-800 animate-pulse" />
        <div className="h-4 w-64 rounded bg-slate-800/60 animate-pulse mt-2" />
      </div>

      {/* Checklist skeleton */}
      <div className="mb-8 rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1.5">
            <div className="h-4 w-36 rounded bg-slate-800 animate-pulse" />
            <div className="h-3 w-24 rounded bg-slate-800/60 animate-pulse" />
          </div>
          <div className="h-4 w-8 rounded bg-slate-800/60 animate-pulse" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 animate-pulse mb-5" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-4 w-4 rounded-full bg-slate-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 rounded bg-slate-800 animate-pulse" />
              <div className="h-3 w-64 rounded bg-slate-800/60 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 border border-slate-800 rounded-lg bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-28 rounded bg-slate-800 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-slate-800 animate-pulse" />
            </div>
            <div className="h-7 w-12 rounded bg-slate-800 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Recent clients */}
      <div className="border border-slate-800 rounded-lg bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="h-4 w-28 rounded bg-slate-800 animate-pulse" />
          <div className="h-3 w-16 rounded bg-slate-800/60 animate-pulse" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-800/60 last:border-0">
            <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 rounded bg-slate-800 animate-pulse" />
              <div className="h-3 w-20 rounded bg-slate-800/60 animate-pulse" />
            </div>
            <div className="h-5 w-14 rounded-full bg-slate-800/60 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
