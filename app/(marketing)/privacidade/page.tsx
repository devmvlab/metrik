import type { Metadata } from 'next'
import { Footer } from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Metrik',
  description: 'Saiba como o Metrik coleta, usa e protege os seus dados pessoais.',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-3xl px-6 py-32">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Política de Privacidade</h1>
        <p className="mb-12 text-sm text-slate-500">Última atualização: abril de 2025</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">1. Quem somos</h2>
            <p>
              O Metrik é uma plataforma SaaS white-label de dashboards de performance para agências
              de marketing digital, operada por{' '}
              <strong className="text-white">MC TECH SOLUCOES LTDA</strong>, inscrita no CNPJ
              sob o nº <strong className="text-white">50.791.909/0001-83</strong>, com sede em{' '}
              <strong className="text-white">
                Rua Luís Martins, 95, apto 27, Alto da Lapa, São Paulo — SP, CEP 05060-050, Brasil
              </strong>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">2. Dados que coletamos</h2>
            <p className="mb-4">
              Coletamos dados estritamente necessários para a prestação dos nossos serviços:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  <strong className="text-white">Dados de cadastro:</strong> nome, endereço de
                  e-mail e senha (armazenada com hash seguro) fornecidos no momento do registro.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  <strong className="text-white">Dados de pagamento:</strong> informações de
                  cobrança processadas pela Stripe, Inc. O Metrik não armazena dados de cartão de
                  crédito em seus servidores.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  <strong className="text-white">Tokens de integração OAuth:</strong> tokens de
                  acesso às plataformas de anúncios (Meta Ads, Google Ads, Google Analytics 4),
                  concedidos pelo usuário. Esses tokens são armazenados encriptados com AES-256.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  <strong className="text-white">Dados de performance de campanhas:</strong>{' '}
                  métricas de anúncios (investimento, cliques, impressões, conversões etc.)
                  obtidas via APIs oficiais das plataformas, usadas exclusivamente para exibição
                  nos dashboards.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  <strong className="text-white">Dados de uso:</strong> logs de acesso, endereço IP
                  e informações técnicas do dispositivo, coletados para segurança e diagnóstico.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">3. Como usamos seus dados</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>Prestar e operar os serviços da plataforma Metrik</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>Autenticar usuários e controlar o acesso por perfil (agência e cliente)</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>Processar cobranças de assinaturas</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  Enviar comunicações transacionais (confirmação de cadastro, convite de cliente,
                  alertas de billing)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>Cumprir obrigações legais e regulatórias</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">
              4. Compartilhamento com terceiros
            </h2>
            <p className="mb-4">
              O Metrik não vende dados pessoais. Compartilhamos dados apenas com os seguintes
              prestadores de serviço, na medida necessária para a operação da plataforma:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  <strong className="text-white">Supabase:</strong> banco de dados e autenticação
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  <strong className="text-white">Stripe:</strong> processamento de pagamentos
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  <strong className="text-white">Resend:</strong> envio de e-mails transacionais
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 text-violet-400">→</span>
                <span>
                  <strong className="text-white">Vercel:</strong> hospedagem e infraestrutura
                </span>
              </li>
            </ul>
            <p className="mt-4">
              Todos os prestadores são contratualmente obrigados a proteger os dados de acordo com
              as leis de privacidade aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">5. Uso de dados do Google</h2>
            <p>
              Os dados obtidos via OAuth do Google (Google Ads e Google Analytics 4) são utilizados
              exclusivamente para exibir métricas de performance nos dashboards da agência que
              autorizou o acesso. O Metrik cumpre integralmente a{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                Política de Dados de Usuário da API do Google
              </a>
              , incluindo os requisitos de Uso Limitado. Os dados de usuários do Google não são
              transferidos para terceiros, utilizados para publicidade ou combinados com outros
              dados de fontes externas.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">6. Proteção dos dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
              encriptação em trânsito (TLS), encriptação em repouso de tokens sensíveis (AES-256),
              controle de acesso por perfil, Row Level Security no banco de dados e isolamento
              completo de dados entre tenants.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">7. Retenção de dados</h2>
            <p>
              Mantemos seus dados pelo período de vigência da conta ativa. Após o cancelamento,
              seus dados são excluídos em até 90 dias, salvo obrigação legal de retenção por prazo
              superior.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">8. Seus direitos (LGPD)</h2>
            <p className="mb-4">
              Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
            </p>
            <ul className="space-y-2">
              <li>— Confirmar a existência de tratamento de seus dados</li>
              <li>— Acessar seus dados</li>
              <li>— Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>— Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>— Revogar o consentimento a qualquer momento</li>
              <li>— Portabilidade dos dados</li>
            </ul>
            <p className="mt-4">
              Para exercer seus direitos, entre em contato pelo e-mail{' '}
              <a
                href="mailto:privacidade@metrikapp.com.br"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                privacidade@metrikapp.com.br
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">9. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Alterações relevantes
              serão comunicadas por e-mail ou notificação na plataforma. O uso continuado dos
              serviços após a comunicação implica aceite das alterações.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">10. Contato</h2>
            <p>
              Dúvidas sobre esta política ou sobre o tratamento dos seus dados:{' '}
              <a
                href="mailto:privacidade@metrikapp.com.br"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                privacidade@metrikapp.com.br
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
