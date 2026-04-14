export default function ClientDetailLoading() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-9 w-24 rounded-md bg-neutral-200 animate-pulse" />
        <div>
          <div className="h-6 w-40 rounded bg-neutral-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-neutral-100 animate-pulse mt-1" />
        </div>
        <div className="ml-auto h-6 w-14 rounded-full bg-neutral-200 animate-pulse" />
      </div>

      {/* Cards de integração */}
      <div className="mb-8">
        <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse mb-3" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-4 border border-neutral-200 rounded-lg shadow-sm bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse" />
                <div className="h-3 w-3 rounded-full bg-neutral-200 animate-pulse mt-0.5" />
              </div>
              <div className="h-3 w-20 rounded bg-neutral-100 animate-pulse mb-1" />
              <div className="h-3 w-32 rounded bg-neutral-100 animate-pulse mb-3" />
              <div className="h-8 w-full rounded-md bg-neutral-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Acessos */}
      <div className="mb-8">
        <div className="h-4 w-20 rounded bg-neutral-200 animate-pulse mb-3" />
        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 last:border-0"
            >
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse" />
                <div className="h-3 w-40 rounded bg-neutral-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link do dashboard */}
      <div className="h-4 w-44 rounded bg-neutral-100 animate-pulse" />
    </div>
  )
}
