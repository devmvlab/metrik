import { Clock, MessageCircle, FileText } from 'lucide-react'

const problems = [
  {
    icon: Clock,
    title: 'Relatórios que consomem horas',
    description:
      'Exportar dados do Meta, Google e GA4, consolidar em planilha e formatar para o cliente leva de 2 a 6 horas por cliente, todo mês. Multiplique pelo número de clientes que você atende.',
  },
  {
    icon: MessageCircle,
    title: '"Como estão as campanhas?" — toda semana',
    description:
      'Sem visibilidade, os clientes acionam a agência constantemente para saber o que está acontecendo. Cada resposta é tempo operacional que poderia estar em estratégia.',
  },
  {
    icon: FileText,
    title: 'PDF e print não são diferenciais',
    description:
      'Enviar capturas de tela ou PDFs formatados à mão passa uma imagem amadora, especialmente comparado a agências concorrentes que já usam ferramentas proprietárias.',
  },
]

export function ProblemSection() {
  return (
    <section id="problema" className="bg-slate-900/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
            O problema
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Você vende resultado. Mas prova como?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Agências de todos os portes perdem tempo e clientes pelo mesmo gargalo: a entrega de
            relatórios é manual, lenta e pouco profissional.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {problems.map((problem) => {
            const Icon = problem.icon
            return (
              <div
                key={problem.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                  <Icon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{problem.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{problem.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
