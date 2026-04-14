import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getDashboardData } from '@/lib/dashboard/aggregator'
import { parsePeriod, resolveDateRange } from '@/lib/dashboard/periods'

const querySchema = z.object({
  clientId: z.string().min(1),
  period: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

/**
 * GET /api/dashboard/data?clientId=...&period=30d
 * Retorna os dados do dashboard para um cliente.
 * Usado pelo agency_admin para pré-visualizar o dashboard de qualquer cliente.
 */
export async function GET(req: NextRequest) {
  const session = await requireAgencyAdmin()

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({
    clientId: searchParams.get('clientId'),
    period: searchParams.get('period') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', code: 'INVALID_PARAMS' },
      { status: 400 }
    )
  }

  const { clientId, period: periodRaw, from, to } = parsed.data
  const period = parsePeriod(periodRaw)
  const { start, end } = resolveDateRange(period, from, to)

  try {
    const data = await getDashboardData(clientId, session.agencyId, start, end)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[dashboard/data]', err)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}
