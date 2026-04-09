import { Badge } from '@/components/ui/badge'
import { WaitlistForm } from './WaitlistForm'

export function HeroSection() {
  return (
    <section
      id="waitlist"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20 text-center"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <Badge
          variant="outline"
          className="mb-6 border-violet-500/40 bg-violet-500/10 text-violet-300"
        >
          Lista de espera aberta
        </Badge>

        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
          Dashboards com a{' '}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            sua marca
          </span>{' '}
          para cada cliente
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
          Conecte Meta Ads, Google Ads e GA4 dos seus clientes e entregue dashboards profissionais
          em tempo real — sem uma linha de código, sem relatórios manuais.
        </p>

        <div className="mx-auto max-w-2xl">
          <WaitlistForm />
          <p className="mt-3 text-xs text-slate-500">
            Sem spam. Só avisamos quando abrirmos o beta.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-violet-400">✓</span> White-label completo
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-400">✓</span> Meta, Google Ads e GA4
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-400">✓</span> Trial de 7 dias grátis
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-400">✓</span> Sem cartão no trial
          </div>
        </div>
      </div>
    </section>
  )
}
