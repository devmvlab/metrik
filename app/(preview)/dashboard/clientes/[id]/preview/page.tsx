import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye as EyeIcon, ArrowLeft } from 'lucide-react'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getDashboardData } from '@/lib/dashboard/aggregator'
import { parsePeriod, resolveDateRange } from '@/lib/dashboard/periods'
import { db } from '@/lib/db'
import { getAgencyById } from '@/lib/db/agencies'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { Button } from '@/components/ui/button'

export default async function ClientDashboardPreviewPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { period?: string; from?: string; to?: string }
}) {
  const session = await requireAgencyAdmin()

  const [client, agency] = await Promise.all([
    db.client.findFirst({
      where: { id: params.id, agencyId: session.agencyId },
      select: { id: true, name: true },
    }),
    getAgencyById(session.agencyId),
  ])

  if (!client) notFound()

  const period = parsePeriod(searchParams.period)
  const { start, end } = resolveDateRange(period, searchParams.from, searchParams.to)
  const data = await getDashboardData(client.id, session.agencyId, start, end)

  const HEX_RE = /^#[0-9a-fA-F]{6}$/
  const rawPrimary = agency?.whiteLabelConfig?.primaryColor ?? ''
  const primaryColor = HEX_RE.test(rawPrimary) ? rawPrimary : '#2563eb'
  const rawSecondary = agency?.whiteLabelConfig?.secondaryColor ?? ''
  const secondaryColor = HEX_RE.test(rawSecondary) ? rawSecondary : primaryColor
  const logoUrl = agency?.whiteLabelConfig?.logoUrl ?? null
  const agencyName = agency?.name ?? 'Dashboard'

  const hex = primaryColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const primaryRgb = [r, g, b].some(isNaN) ? '37, 99, 235' : `${r}, ${g}, ${b}`

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Injeta CSS variables de cor para uso nos componentes do dashboard do cliente */}
      <style>{`
        :root {
          --agency-primary: ${primaryColor};
          --agency-primary-rgb: ${primaryRgb};
          --agency-secondary: ${secondaryColor};
        }
      `}</style>

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

      {/* Header white-label — replica o que o cliente vê */}
      <header style={{ backgroundColor: 'var(--agency-primary)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={agencyName}
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="font-semibold text-white">{agencyName}</span>
            )}
          </div>
          <span className="text-xs text-white/60">Dashboard de Performance</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <DashboardContent
          clientName={client.name}
          period={period}
          start={start}
          end={end}
          data={data}
        />
      </div>
    </div>
  )
}
