import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const plans = [
  {
    name: 'Starter',
    price: 'R$ 197',
    period: '/mês',
    description: 'Para agências que estão começando a escalar a entrega.',
    clients: 'Até 5 clientes',
    highlight: false,
    features: [
      'Até 5 clientes conectados',
      'White-label (logo e cores)',
      'Meta Ads, Google Ads e GA4',
      'Dashboard por cliente',
      'Exportação em PDF',
      'Suporte por email',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 397',
    period: '/mês',
    description: 'Para agências em crescimento que entregam relatórios semanalmente.',
    clients: 'Até 15 clientes',
    highlight: true,
    features: [
      'Até 15 clientes conectados',
      'White-label + domínio customizado',
      'Meta Ads, Google Ads e GA4',
      'Dashboard por cliente',
      'Exportação em PDF',
      'Suporte prioritário',
    ],
  },
  {
    name: 'Agency',
    price: 'R$ 697',
    period: '/mês',
    description: 'Para agências consolidadas com carteira grande de clientes.',
    clients: 'Até 40 clientes',
    highlight: false,
    features: [
      'Até 40 clientes conectados',
      'White-label + domínio customizado',
      'Meta Ads, Google Ads e GA4',
      'Dashboard por cliente',
      'Exportação em PDF',
      'Suporte dedicado',
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
            Preços
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Simples, transparente, sem surpresas
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-400">
            7 dias de trial sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-6 ${
                plan.highlight
                  ? 'border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-slate-900'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  Mais popular
                </Badge>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-400">{plan.clients}</p>
                <h3 className="mt-1 text-xl font-bold text-white">{plan.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="mb-1 text-slate-400">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
              </div>

              <ul className="mb-6 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 shrink-0 text-violet-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`mt-auto w-full ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700'
                    : 'border border-slate-700 bg-transparent text-white hover:bg-slate-800'
                }`}
                variant={plan.highlight ? 'default' : 'outline'}
              >
                <Link href="/cadastro">Começar grátis</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
