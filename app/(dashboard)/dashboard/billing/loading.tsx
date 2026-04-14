export default function BillingLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="h-6 w-40 rounded bg-neutral-200 animate-pulse" />
        <div className="h-4 w-56 rounded bg-neutral-100 animate-pulse mt-2" />
      </div>

      {/* Card do plano atual */}
      <div className="mb-8 border border-neutral-200 rounded-lg shadow-sm bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="h-3 w-20 rounded bg-neutral-100 animate-pulse mb-2" />
            <div className="h-6 w-32 rounded bg-neutral-200 animate-pulse" />
          </div>
          <div className="h-8 w-28 rounded-md bg-neutral-100 animate-pulse" />
        </div>

        {/* Barra de uso */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="h-3 w-32 rounded bg-neutral-100 animate-pulse" />
            <div className="h-3 w-10 rounded bg-neutral-100 animate-pulse" />
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-100 animate-pulse" />
        </div>
      </div>

      {/* Cards de planos */}
      <div>
        <div className="h-4 w-36 rounded bg-neutral-200 animate-pulse mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-5 border border-neutral-200 rounded-lg shadow-sm bg-white flex flex-col"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="h-5 w-20 rounded bg-neutral-200 animate-pulse" />
              </div>
              <div className="h-4 w-24 rounded bg-neutral-100 animate-pulse mb-4" />

              <div className="space-y-2 flex-1 mb-5">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full bg-neutral-100 animate-pulse shrink-0" />
                    <div className="h-3 w-full rounded bg-neutral-100 animate-pulse" />
                  </div>
                ))}
              </div>

              <div className="h-8 w-full rounded-md bg-neutral-200 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="h-3 w-80 rounded bg-neutral-100 animate-pulse mt-4" />
      </div>
    </div>
  )
}
