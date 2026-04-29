import type { Metadata } from 'next'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'Sobre — Metrik',
  description:
    'Conheça o Metrik, a plataforma white-label de dashboards de performance para agências de marketing digital.',
}

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-3xl px-6 py-32">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Sobre o Metrik</h1>
        <p className="mb-12 text-lg text-slate-400">
          Dashboards white-label de performance para agências de marketing digital.
        </p>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">O que é o Metrik</h2>
          <p className="mb-4 text-slate-300 leading-relaxed">
            O Metrik é uma plataforma SaaS white-label que permite a agências de marketing digital
            centralizar, visualizar e compartilhar dados de performance de seus clientes em
            dashboards profissionais e personalizados com a identidade visual da própria agência.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Com o Metrik, agências eliminam horas de trabalho manual com relatórios em planilhas e
            apresentações, substituindo esse processo por dashboards em tempo real que os clientes
            acessam diretamente, de qualquer dispositivo.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Nossa missão</h2>
          <p className="text-slate-300 leading-relaxed">
            Dar às agências de marketing digital uma ferramenta profissional para entregar dados com
            transparência e clareza, fortalecendo a relação com seus clientes e diferenciando-se no
            mercado — sem precisar investir em desenvolvimento próprio de software.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">O que nossa plataforma faz</h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="mt-1 text-violet-400">→</span>
              <span>
                Conecta as contas de anúncios dos clientes via OAuth seguro (Meta Ads, Google Ads e
                Google Analytics 4)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-violet-400">→</span>
              <span>
                Consolida métricas de performance (investimento, impressões, cliques, conversões,
                ROAS, CPA, entre outras) em um único painel visual
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-violet-400">→</span>
              <span>
                Permite à agência personalizar os dashboards com sua logomarca, cores e domínio
                próprio (white-label completo)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-violet-400">→</span>
              <span>
                Gera acessos individuais para cada cliente, com isolamento total de dados entre
                contas
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Para quem é o Metrik</h2>
          <p className="mb-4 text-slate-300 leading-relaxed">
            O Metrik é desenvolvido para agências de marketing digital de todos os portes que
            gerenciam campanhas pagas para múltiplos clientes e precisam de uma solução eficiente
            para reportar resultados.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Nossa plataforma é especialmente útil para agências que valorizam a experiência do
            cliente final e querem oferecer um produto de nível enterprise sem o custo de
            desenvolvimento interno.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Uso da API do Google Ads</h2>
          <p className="mb-4 text-slate-300 leading-relaxed">
            O Metrik utiliza a API do Google Ads exclusivamente para leitura de dados de
            performance das campanhas dos clientes das agências usuárias da plataforma. O acesso é
            concedido pelo próprio cliente através de fluxo OAuth oficial do Google, e os dados são
            utilizados unicamente para exibição nos dashboards da respectiva agência.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Não realizamos nenhuma alteração em campanhas, orçamentos, lances ou configurações de
            conta via API. O escopo de acesso solicitado é estritamente de leitura
            (<code className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-violet-300">
              https://www.googleapis.com/auth/adwords
            </code>
            ).
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="mb-4 text-2xl font-semibold">Contato</h2>
          <p className="mb-6 text-slate-300 leading-relaxed">
            Para dúvidas sobre a plataforma, parcerias ou qualquer outro assunto, entre em contato
            conosco:
          </p>
          <div className="space-y-2 text-slate-300">
            <p>
              <span className="font-medium text-white">Email:</span>{' '}
              <a
                href="mailto:contato@metrikapp.com.br"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                contato@metrikapp.com.br
              </a>
            </p>
            <p>
              <span className="font-medium text-white">Endereço:</span>{' '}
              <span className="text-slate-400">
                Rua [ENDEREÇO COMPLETO], [CIDADE] — [ESTADO], [CEP], Brasil
              </span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
