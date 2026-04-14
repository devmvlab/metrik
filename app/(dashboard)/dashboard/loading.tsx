export default function DashboardLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="h-6 w-48 rounded bg-neutral-200 animate-pulse" />
        <div className="h-4 w-64 rounded bg-neutral-100 animate-pulse mt-2" />
      </div>

      {/* Checklist skeleton */}
      <div className="mb-8 rounded-lg border border-neutral-200 bg-white shadow-sm p-5 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-neutral-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 rounded bg-neutral-200 animate-pulse" />
              <div className="h-3 w-64 rounded bg-neutral-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="p-5 border border-neutral-200 rounded-lg shadow-sm bg-white"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-28 rounded bg-neutral-200 animate-pulse" />
              <div className="h-4 w-4 rounded bg-neutral-100 animate-pulse" />
            </div>
            <div className="h-7 w-12 rounded bg-neutral-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
