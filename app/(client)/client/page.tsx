import { notFound } from 'next/navigation'
import { requireClientViewer } from '@/lib/auth/session'
import { getDashboardData } from '@/lib/dashboard/aggregator'
import { parsePeriod, resolveDateRange } from '@/lib/dashboard/periods'
import { db } from '@/lib/db'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { PrintButton } from '@/components/dashboard/PrintButton'

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
      select: { id: true, name: true },
    }),
    getDashboardData(session.clientId, session.agencyId, start, end),
  ])

  if (!client) notFound()

  return (
    <DashboardContent
      clientName={client.name}
      period={period}
      start={start}
      end={end}
      data={data}
      headerSlot={<PrintButton />}
    />
  )
}
