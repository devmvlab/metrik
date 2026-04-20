import { Suspense } from 'react'
import { DollarSign, Eye, MousePointerClick, Percent, TrendingUp, ShoppingCart, Target, BarChart3 } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { CampaignTable } from '@/components/dashboard/CampaignTable'
import { InvestmentLineChart } from '@/components/charts/InvestmentLineChart'
import { PlatformBarChart } from '@/components/charts/PlatformBarChart'
import { Card } from '@/components/ui/card'
import type { DashboardData } from '@/lib/dashboard/aggregator'
import type { PeriodPreset } from '@/lib/dashboard/periods'
import { PERIOD_LABELS } from '@/lib/dashboard/periods'

function formatCurrency(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

interface DashboardContentProps {
  clientName: string
  period: PeriodPreset
  start: Date
  end: Date
  data: DashboardData
  headerSlot?: React.ReactNode
}

export function DashboardContent({ clientName, period, start, end, data, headerSlot }: DashboardContentProps) {
  const { consolidated, platformBreakdown, dailySeries, campaigns } = data

  return (
    <div id="dashboard-export-content">
      {/* Cabeçalho */}
      <div id="dashboard-title-section" className="flex items-start justify-between mb-6 print:mb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{clientName}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {PERIOD_LABELS[period]} — {start.toLocaleDateString('pt-BR')} até{' '}
            {end.toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div id="dashboard-header-controls" className="flex items-center gap-3 print:hidden">
          <Suspense fallback={null}>
            <PeriodSelector current={period} />
          </Suspense>
          {headerSlot}
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:grid-cols-4 print:gap-3">
        <MetricCard label="Investimento" value={formatCurrency(consolidated.totalSpend)} icon={DollarSign} />
        <MetricCard label="Impressões" value={formatNumber(consolidated.totalImpressions)} icon={Eye} />
        <MetricCard label="Cliques" value={formatNumber(consolidated.totalClicks)} icon={MousePointerClick} />
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
        <MetricCard label="Conversões" value={formatNumber(consolidated.totalConversions)} icon={ShoppingCart} />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:grid-cols-2 print:gap-4">
        <Card className="p-5 border border-neutral-200 shadow-sm bg-white">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Investimento vs. Conversões</h2>
          <Suspense fallback={<div className="h-64 animate-pulse bg-neutral-100 rounded" />}>
            <InvestmentLineChart data={dailySeries} />
          </Suspense>
        </Card>

        <Card className="p-5 border border-neutral-200 shadow-sm bg-white">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Comparativo por Plataforma</h2>
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
  )
}
