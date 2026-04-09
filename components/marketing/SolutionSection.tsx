import { ArrowDown } from 'lucide-react'

export function SolutionSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
            A solução
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Dashboard profissional em minutos, não horas
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            O Metrik conecta as contas de mídia dos seus clientes via OAuth e entrega um painel com
            a sua marca — sem relatórios manuais, sem planilha, sem print de tela.
          </p>
        </div>

        <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
          <div className="w-full rounded-xl border border-violet-500/30 bg-violet-500/10 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              Plataforma Metrik
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Conecta Meta Ads, Google Ads e GA4 via OAuth
            </p>
          </div>

          <ArrowDown className="h-5 w-5 text-slate-600" />

          <div className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Sua Agência
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Personaliza com sua marca, adiciona clientes e define acessos
            </p>
          </div>

          <ArrowDown className="h-5 w-5 text-slate-600" />

          <div className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Cliente da Agência
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Acessa o dashboard com a sua marca e vê os dados em tempo real
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { value: '2–6h', label: 'economizadas por cliente por mês' },
            { value: '100%', label: 'white-label com a sua marca' },
            { value: '3', label: 'plataformas integradas no MVP' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-center">
              <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
