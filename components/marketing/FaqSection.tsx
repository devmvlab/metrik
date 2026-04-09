const faqs = [
  {
    question: 'Meu cliente vai ver a marca do Metrik?',
    answer:
      'Não. O Metrik é 100% white-label. Você sobe seu logo, define suas cores e, se quiser, aponta um domínio próprio (ex: dashboard.suaagencia.com.br). Seu cliente vê apenas a sua marca.',
  },
  {
    question: 'Como funciona a conexão com Meta Ads, Google Ads e GA4?',
    answer:
      'Via OAuth. Você clica em "Conectar" na conta do seu cliente, autoriza o acesso na tela da plataforma e pronto — o Metrik começa a buscar os dados. Sem precisar de API keys ou configurações técnicas.',
  },
  {
    question: 'Os dados são atualizados em tempo real?',
    answer:
      'No MVP, os dados são sincronizados automaticamente a cada 4 horas. É suficiente para uso diário e evita problemas de rate limit das APIs. Atualização em tempo real está planejada para versões futuras.',
  },
  {
    question: 'O que acontece quando atingir o limite de clientes do meu plano?',
    answer:
      'O sistema notifica você antes de atingir o limite e oferece upgrade com um clique. Nenhum cliente perde acesso — você só não consegue adicionar novos até fazer upgrade ou remover um cliente inativo.',
  },
  {
    question: 'Precisa de cartão de crédito no trial?',
    answer:
      'Não. O trial de 7 dias é completamente gratuito e sem cartão. Só pedimos o cartão quando você decidir assinar um plano.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim. Cancelamento self-service disponível no painel de billing, sem precisar falar com suporte. Sem fidelidade, sem multa.',
  },
]

export function FaqSection() {
  return (
    <section className="bg-slate-900/50 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
            FAQ
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">Perguntas frequentes</h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="font-semibold text-white">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
