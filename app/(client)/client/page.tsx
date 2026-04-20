import { notFound } from 'next/navigation'
import { requireClientViewer } from '@/lib/auth/session'
import { getDashboardData } from '@/lib/dashboard/aggregator'
import { parsePeriod, resolveDateRange } from '@/lib/dashboard/periods'
import { db } from '@/lib/db'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { PrintButton } from '@/components/dashboard/PrintButton'
import { PERIOD_LABELS } from '@/lib/dashboard/periods'
import { PlugZap } from 'lucide-react'

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string }
}) {
  const session = await requireClientViewer()

  if (!session.clientId) notFound()

  const period = parsePeriod(searchParams.period)
  const { start, end } = resolveDateRange(period, searchParams.from, searchParams.to)

  const [client, data] = await Promise.all([
    db.client.findFirst({
      where: { id: session.clientId, agencyId: session.agencyId },
      select: {
        id: true,
        name: true,
        integrations: { select: { status: true } },
      },
    }),
    getDashboardData(session.clientId, session.agencyId, start, end),
  ])

  if (!client) notFound()

  const hasConnected = client.integrations.some((i) => i.status === 'CONNECTED')

  if (!hasConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center">
          <PlugZap className="w-7 h-7 text-neutral-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-neutral-800">Nenhuma integração conectada</p>
          <p className="text-sm text-neutral-500 mt-1 max-w-xs">
            Assim que sua agência conectar suas plataformas de anúncios, seus dados aparecerão aqui.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DashboardContent
      clientName={client.name}
      period={period}
      start={start}
      end={end}
      data={data}
      headerSlot={
        <PrintButton
          clientName={client.name}
          periodLabel={PERIOD_LABELS[period]}
          dateRange={`${start.toLocaleDateString('pt-BR')} até ${end.toLocaleDateString('pt-BR')}`}
        />
      }
    />
  )
}
