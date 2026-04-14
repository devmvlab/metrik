import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Percent,
  TrendingUp,
  ShoppingCart,
  Target,
  BarChart3,
  ArrowLeft,
  Eye as EyeIcon,
} from 'lucide-react'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getDashboardData } from '@/lib/dashboard/aggregator'
import { parsePeriod, resolveDateRange, PERIOD_LABELS } from '@/lib/dashboard/periods'
import { db } from '@/lib/db'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { CampaignTable } from '@/components/dashboard/CampaignTable'
import { InvestmentLineChart } from '@/components/charts/InvestmentLineChart'
import { PlatformBarChart } from '@/components/charts/PlatformBarChart'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function formatCurrency(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default async function ClientDashboardPreviewPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { period?: string; from?: string; to?: string }
}) {
  const session = await requireAgencyAdmin()

  // Valida que o cliente pertence à agência do admin autenticado
  const client = await db.client.findFirst({
    where: { id: params.id, agencyId: session.agencyId },
    select: { id: true, name: true },
  })

  if (!client) notFound()

  const period = parsePeriod(searchParams.period)
  const { start, end } = resolveDateRange(period, searchParams.from, searchParams.to)

  const data = await getDashboardData(client.id, session.agencyId, start, end)
  const { consolidated, platformBreakdown, dailySeries, campaigns } = data

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Banner de preview — visível apenas para o admin */}
      <div className="bg-neutral-900 text-white px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <EyeIcon className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-300">Pré-visualização do dashboard de</span>
          <span className="font-medium">{client.name}</span>
        </div>
        <Link href={`/dashboard/clientes/${client.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-600 bg-transparent"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar ao cliente
          </Button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{client.name}</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {PERIOD_LABELS[period]} — {start.toLocaleDateString('pt-BR')} até{' '}
              {end.toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Suspense fallback={null}>
            <PeriodSelector current={period} />
          </Suspense>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Investimento"
            value={formatCurrency(consolidated.totalSpend)}
            icon={DollarSign}
          />
          <MetricCard
            label="Impressões"
            value={formatNumber(consolidated.totalImpressions)}
            icon={Eye}
          />
          <MetricCard
            label="Cliques"
            value={formatNumber(consolidated.totalClicks)}
            icon={MousePointerClick}
          />
          <MetricCard
            label="CTR"
            value={`${formatNumber(consolidated.avgCtr, 2)}%`}
            icon={Percent}
            description="Taxa de cliques média"
          />
          <MetricCard
            label="CPC Médio"
            value={formatCurrency(consolidated.avgCpc)}
            icon={TrendingUp}
            description="Custo por clique"
          />
          <MetricCard
            label="Conversões"
            value={formatNumber(consolidated.totalConversions)}
            icon={ShoppingCart}
          />
          <MetricCard
            label="CPA"
            value={consolidated.avgCpa > 0 ? formatCurrency(consolidated.avgCpa) : '—'}
            icon={Target}
            description="Custo por conversão"
          />
          <MetricCard
            label="ROAS"
            value={consolidated.avgRoas > 0 ? `${formatNumber(consolidated.avgRoas, 2)}x` : '—'}
            icon={BarChart3}
            description="Retorno sobre investimento"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-5 border border-neutral-200 shadow-sm bg-white">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">
              Investimento vs. Conversões
            </h2>
            <Suspense fallback={<div className="h-64 animate-pulse bg-neutral-100 rounded" />}>
              <InvestmentLineChart data={dailySeries} />
            </Suspense>
          </Card>

          <Card className="p-5 border border-neutral-200 shadow-sm bg-white">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">
              Comparativo por Plataforma
            </h2>
            <Suspense fallback={<div className="h-64 animate-pulse bg-neutral-100 rounded" />}>
              <PlatformBarChart data={platformBreakdown} />
            </Suspense>
          </Card>
        </div>

        {/* Tabela de campanhas */}
        <Card className="border border-neutral-200 shadow-sm bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Campanhas ativas</h2>
            {campaigns.length > 0 && (
              <p className="text-xs text-neutral-400 mt-0.5">{campaigns.length} campanhas no período</p>
            )}
          </div>
          <CampaignTable campaigns={campaigns} />
        </Card>
      </div>
    </div>
  )
}
