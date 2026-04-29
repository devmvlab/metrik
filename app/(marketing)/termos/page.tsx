import type { Metadata } from 'next'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'Termos de Serviço — Metrik',
  description: 'Leia os Termos de Serviço do Metrik antes de utilizar a plataforma.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-3xl px-6 py-32">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Termos de Serviço</h1>
        <p className="mb-12 text-sm text-slate-500">Última atualização: abril de 2025</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta ou utilizar a plataforma Metrik, você concorda com estes Termos de
              Serviço e com nossa{' '}
              <a href="/privacidade" className="text-violet-400 hover:text-violet-300 transition-colors">
                Política de Privacidade
              </a>
              . Se você não concordar com estes termos, não utilize a plataforma. O Metrik é
              operado por{' '}
              <strong className="text-white">[RAZÃO SOCIAL DA EMPRESA]</strong>, inscrita no CNPJ
              sob o nº <strong className="text-white">[CNPJ]</strong>.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">2. Descrição do serviço</h2>
            <p>
              O Metrik é uma plataforma SaaS (Software as a Service) que permite a agências de
              marketing digital criar, personalizar e compartilhar dashboards de performance com
              seus clientes, integrando dados de plataformas como Meta Ads, Google Ads e Google
              Analytics 4 via conexões OAuth autorizadas.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">3. Elegibilidade e conta</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Você deve ter ao menos 18 anos de idade e capacidade legal para celebrar contratos
                  para utilizar o Metrik.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Você é responsável por manter a confidencialidade das credenciais de acesso à
                  sua conta.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Você é responsável por toda a atividade realizada sob sua conta.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  É proibido criar contas em nome de terceiros sem autorização expressa.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">4. Planos e pagamentos</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  O Metrik oferece planos pagos com período de teste gratuito de 7 dias, sem
                  necessidade de cartão de crédito.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Após o período de teste, a assinatura é cobrada mensalmente de acordo com o plano
                  escolhido (Starter, Pro ou Agency).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Os preços são exibidos em reais (BRL) e podem ser alterados com aviso prévio de
                  30 dias.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Pagamentos são processados pela Stripe, Inc. O cancelamento pode ser realizado a
                  qualquer momento pelo painel da conta.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Não realizamos reembolsos de períodos já cobrados, exceto quando exigido por lei.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">
              5. Responsabilidades do usuário
            </h2>
            <p className="mb-4">Ao utilizar o Metrik, você concorda em:</p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Conectar apenas contas de anúncios para as quais você possui autorização legal
                  para acessar os dados.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Utilizar os dados de performance exclusivamente para fins relacionados à gestão e
                  reportagem das campanhas dos seus clientes.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Não utilizar a plataforma para atividades ilegais, fraudulentas ou que violem
                  os Termos de Uso das APIs integradas (Meta, Google).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Não tentar acessar dados de outros tenants, realizar engenharia reversa ou
                  comprometer a segurança da plataforma.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Manter seus dados de cadastro atualizados e precisos.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">
              6. Integrações com APIs de terceiros
            </h2>
            <p>
              O Metrik se integra com APIs de terceiros (Meta, Google) mediante autorização OAuth
              concedida pelo usuário. Você reconhece que a disponibilidade e o comportamento dessas
              integrações dependem de terceiros e que o Metrik não se responsabiliza por
              indisponibilidades, limitações de taxa ou alterações nas APIs externas. O uso dessas
              integrações também está sujeito aos termos de serviço das respectivas plataformas.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">
              7. Propriedade intelectual
            </h2>
            <p>
              Todo o código, design, marca e conteúdo do Metrik são de propriedade exclusiva da{' '}
              <strong className="text-white">[RAZÃO SOCIAL DA EMPRESA]</strong>. É vedada a
              reprodução, distribuição ou uso comercial sem autorização prévia por escrito. Os dados
              de performance das campanhas pertencem aos respectivos anunciantes e são tratados
              conforme nossa Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">
              8. Limitação de responsabilidade
            </h2>
            <p className="mb-4">
              O Metrik é fornecido &quot;como está&quot;, sem garantias de disponibilidade
              ininterrupta. Na máxima extensão permitida por lei:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Não nos responsabilizamos por decisões de negócio tomadas com base nos dados
                  exibidos na plataforma.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Não nos responsabilizamos por danos indiretos, lucros cessantes ou perda de dados
                  resultantes do uso ou indisponibilidade do serviço.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Nossa responsabilidade total, em qualquer caso, fica limitada ao valor pago pelo
                  usuário nos 3 meses anteriores ao evento.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">9. Cancelamento e rescisão</h2>
            <p>
              Você pode cancelar sua assinatura a qualquer momento pelo painel da conta. O acesso
              permanece ativo até o fim do período já pago. O Metrik pode suspender ou encerrar
              contas que violem estes Termos, com aviso prévio sempre que possível, exceto em casos
              de violações graves ou atividade fraudulenta.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">10. Alterações nos termos</h2>
            <p>
              Podemos atualizar estes Termos de Serviço a qualquer momento. Alterações serão
              comunicadas por e-mail e/ou notificação na plataforma com antecedência mínima de 15
              dias. O uso continuado após a entrada em vigor das alterações implica aceitação dos
              novos termos.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">11. Lei aplicável e foro</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
              foro da comarca de <strong className="text-white">[CIDADE]</strong> — [ESTADO], com
              exclusão de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer
              controvérsias decorrentes deste instrumento.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">12. Contato</h2>
            <p>
              Dúvidas sobre estes Termos de Serviço:{' '}
              <a
                href="mailto:contato@metrikapp.com.br"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                contato@metrikapp.com.br
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
