import { Palette, BarChart2, RefreshCw, Users, FileDown, Lock } from 'lucide-react'

const features = [
  {
    icon: Palette,
    title: 'White-label completo',
    description:
      'Logo, cores e até domínio customizado. O cliente vê a sua marca, não a nossa.',
  },
  {
    icon: BarChart2,
    title: 'Meta, Google Ads e GA4',
    description:
      'Conecte as três plataformas via OAuth e consolide tudo em um único painel por cliente.',
  },
  {
    icon: RefreshCw,
    title: 'Dados sempre atualizados',
    description:
      'Sincronização automática a cada 4 horas. Sem precisar exportar, copiar ou colar nada.',
  },
  {
    icon: Users,
    title: 'Convite por email',
    description:
      'Adicione um cliente, mande o convite e ele acessa o próprio dashboard. Sem você precisar estar no meio.',
  },
  {
    icon: FileDown,
    title: 'Exportação em PDF',
    description:
      'O cliente exporta o relatório do período com a sua marca. Profissional, sem trabalho extra.',
  },
  {
    icon: Lock,
    title: 'Isolamento total de dados',
    description:
      'Cada agência e cliente vê apenas os próprios dados. Row Level Security ativado no banco.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-900/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
            Features
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Tudo que sua agência precisa, pronto para usar
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-violet-500/40"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 transition-colors group-hover:bg-violet-500/20">
                  <Icon className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
