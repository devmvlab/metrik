import type React from 'react'
import Link from 'next/link'
import type { Plan } from '@prisma/client'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getAgencyById, getAgencyStats } from '@/lib/db/agencies'
import { getPlanLimit, PLAN_LABELS } from '@/lib/billing/plans'
import { MetaAdsIcon, GoogleAdsIcon, GA4Icon } from '@/components/brand-icons'
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist'
import { TrialBanner } from '@/components/dashboard/TrialBanner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Activity,
  Plug,
  AlertCircle,
  UserPlus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

const PLATFORM_LABELS: Record<string, string> = {
  META_ADS: 'Meta Ads',
  GOOGLE_ADS: 'Google Ads',
  GA4: 'GA4',
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  META_ADS: <MetaAdsIcon className="w-4 h-4" />,
  GOOGLE_ADS: <GoogleAdsIcon className="w-4 h-4" />,
  GA4: <GA4Icon className="w-4 h-4" />,
}

export default async function DashboardPage() {
  const session = await requireAgencyAdmin()
  const [agency, stats] = await Promise.all([
    getAgencyById(session.agencyId),
    getAgencyStats(session.agencyId),
  ])

  const planLimit = getPlanLimit(stats.plan as Plan)
  const planUsagePct = Math.min((stats.totalClients / planLimit) * 100, 100)
  const planLabel = PLAN_LABELS[stats.plan as Plan] ?? stats.plan

  const planBarColor =
    planUsagePct >= 90 ? 'bg-red-500' : planUsagePct >= 70 ? 'bg-amber-400' : 'bg-violet-600'

const checklistItems = [
    {
      id: 'agency',
      label: 'Agência criada',
      description: 'Sua agência foi configurada com sucesso.',
      done: true,
    },
    {
      id: 'client',
      label: 'Adicionar primeiro cliente',
      description: 'Convide um cliente para acessar o dashboard.',
      done: stats.totalClients > 0,
      href: '/dashboard/clientes',
    },
    {
      id: 'integration',
      label: 'Conectar primeira integração',
      description: 'Vincule Meta Ads, Google Ads ou GA4 ao seu cliente.',
      done: stats.hasConnectedIntegration,
      href: '/dashboard/clientes',
    },
    {
      id: 'whitelabel',
      label: 'Personalizar white-label',
      description: 'Configure logo e cores da sua marca.',
      done:
        Boolean(agency?.whiteLabelConfig?.logoUrl) ||
        Boolean(agency?.whiteLabelConfig?.primaryColor),
      href: '/dashboard/configuracoes',
    },
  ]

  const agencyName = agency?.name ?? ''

  return (
    <div>
      {/* Banner de trial / pagamento */}
      <TrialBanner
        trialEndsAt={stats.trialEndsAt}
        stripeSubscriptionStatus={stats.stripeSubscriptionStatus}
        stripeCustomerId={stats.stripeCustomerId}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá{agencyName ? `, ${agencyName}` : ''} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">Aqui está um resumo da sua agência.</p>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Link href="/dashboard/clientes">
            <UserPlus className="w-4 h-4 mr-1.5" />
            Adicionar cliente
          </Link>
        </Button>
      </div>

      {/* Checklist de onboarding */}
      <OnboardingChecklist items={checklistItems} />

      {/* Cards de métricas — 4 colunas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total de clientes */}
        <Card className="p-5 bg-slate-900 border-slate-800 shadow-none">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Total de clientes
            </p>
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalClients}</p>
          <p className="text-xs text-slate-500 mt-1">cadastrados na agência</p>
        </Card>

        {/* Clientes ativos */}
        <Card className="p-5 bg-slate-900 border-slate-800 shadow-none">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Clientes ativos
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.activeClients}</p>
          <p className="text-xs text-slate-500 mt-1">com acesso habilitado</p>
        </Card>

        {/* Integrações conectadas */}
        <Card className="p-5 bg-slate-900 border-slate-800 shadow-none">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Integrações
            </p>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Plug className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.connectedIntegrations}</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.expiredIntegrations > 0 ? (
              <span className="text-amber-400">{stats.expiredIntegrations} com problema</span>
            ) : (
              'todas conectadas'
            )}
          </p>
        </Card>

        {/* Uso do plano */}
        <Card className="p-5 bg-slate-900 border-slate-800 shadow-none">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Plano {planLabel}
            </p>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.totalClients}
            <span className="text-base font-normal text-slate-500"> / {planLimit}</span>
          </p>
          <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full">
            <div
              className={`h-1.5 rounded-full transition-all ${planBarColor}`}
              style={{ width: `${planUsagePct}%` }}
            />
          </div>
          {planUsagePct >= 90 && (
            <Link
              href="/dashboard/billing"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-colors"
            >
              Fazer upgrade
              <span aria-hidden>→</span>
            </Link>
          )}
        </Card>
      </div>

      {/* Clientes recentes */}
      {stats.recentClients.length > 0 && (
        <Card className="bg-slate-900 border-slate-800 shadow-none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white">Clientes recentes</h2>
            <Link
              href="/dashboard/clientes"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {stats.recentClients.map((client) => {
              const connected = client.integrations.filter((i) => i.status === 'CONNECTED')
              const hasIssue = client.integrations.some(
                (i) => i.status === 'EXPIRED' || i.status === 'ERROR',
              )

              return (
                <Link
                  key={client.id}
                  href={`/dashboard/clientes/${client.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/60 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-violet-300">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Nome + status */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{client.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {connected.length === 0 && !hasIssue && (
                        <span className="text-xs text-slate-500">Sem integrações</span>
                      )}
                      {connected.map((i) => (
                        <div
                          key={i.platform}
                          title={PLATFORM_LABELS[i.platform] ?? i.platform}
                          className="shrink-0"
                        >
                          {PLATFORM_ICONS[i.platform] ?? (
                            <span className="text-xs text-slate-400">{i.platform}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status / indicadores */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasIssue && (
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-500/40 text-amber-400 bg-amber-500/10"
                      >
                        Reconectar
                      </Badge>
                    )}
                    {!hasIssue && connected.length > 0 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>
      )}

      {/* Empty state — nenhum cliente ainda */}
      {stats.recentClients.length === 0 && (
        <Card className="bg-slate-900 border border-dashed border-slate-700 shadow-none">
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-violet-400" />
            </div>
            <p className="text-sm font-medium text-slate-200 mb-1">Nenhum cliente ainda</p>
            <p className="text-xs text-slate-500 max-w-xs mb-5">
              Adicione seu primeiro cliente para começar a conectar integrações e entregar
              dashboards.
            </p>
            <Button
              asChild
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Link href="/dashboard/clientes">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Adicionar cliente
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
