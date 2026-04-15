export default function ClientesLoading() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 rounded bg-slate-800 animate-pulse" />
          <div className="h-4 w-52 rounded bg-slate-800/60 animate-pulse mt-2" />
        </div>
        <div className="h-9 w-32 rounded-md bg-slate-800 animate-pulse" />
      </div>

      {/* Barra de uso do plano */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1.5">
          <div className="h-3 w-20 rounded bg-slate-800/60 animate-pulse" />
          <div className="h-3 w-10 rounded bg-slate-800/60 animate-pulse" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 animate-pulse" />
      </div>

      {/* Tabela skeleton */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
        {/* Header da tabela */}
        <div className="bg-slate-800 grid grid-cols-4 gap-4 px-4 py-3 border-b border-slate-700">
          {['Nome', 'Status', 'Integrações', 'Criado'].map((col) => (
            <div key={col} className="h-3 w-16 rounded bg-slate-700 animate-pulse" />
          ))}
        </div>

        {/* Linhas */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-4 px-4 py-4 border-b border-slate-800/60 last:border-0"
          >
            {/* Nome + email */}
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded bg-slate-800 animate-pulse" />
              <div className="h-3 w-40 rounded bg-slate-800/60 animate-pulse" />
            </div>
            {/* Status badge */}
            <div className="h-5 w-14 rounded-full bg-slate-800 animate-pulse" />
            {/* Integrações */}
            <div className="flex gap-1">
              <div className="h-5 w-16 rounded-full bg-slate-800/60 animate-pulse" />
            </div>
            {/* Data */}
            <div className="h-3 w-20 rounded bg-slate-800/60 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
