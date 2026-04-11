import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MetrikLogo } from '@/components/marketing/MetrikLogo'

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-8 flex justify-center">
          <MetrikLogo size="hero" glow />
        </div>

        <Badge
          variant="outline"
          className="mb-6 border-violet-500/40 bg-violet-500/10 text-violet-300"
        >
          7 dias grátis · Sem cartão de crédito
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

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 font-semibold"
          >
            <Link href="/cadastro">Criar conta grátis</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 px-8 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <a href="#features">Ver como funciona</a>
          </Button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-slate-400 underline underline-offset-2 hover:text-white transition-colors">
            Entrar
          </Link>
        </p>

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
