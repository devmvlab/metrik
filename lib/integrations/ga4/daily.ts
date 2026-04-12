import { analyticsdata } from '@googleapis/analyticsdata'
import { google } from 'googleapis'
import { db } from '@/lib/db'
import { decrypt } from '@/lib/utils/crypto'
import { formatApiDate } from '@/lib/dashboard/periods'

const CACHE_TTL_MS = 4 * 60 * 60 * 1000

export interface GA4DailyData {
  date: string      // YYYY-MM-DD
  sessions: number
  users: number
  conversions: number
}

/**
 * Busca dados diários do GA4 para o período informado.
 * Dimensão: date — um ponto por dia.
 */
export async function getGA4DailyData(
  integrationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<GA4DailyData[]> {
  // 1. Verificar cache
  const cached = await db.integrationDataCache.findFirst({
    where: {
      integrationId,
      dataType: 'daily',
      periodStart,
      periodEnd,
      expiresAt: { gt: new Date() },
    },
  })

  if (cached) {
    return cached.data as unknown as GA4DailyData[]
  }

  // 2. Buscar na API
  const integration = await db.integration.findUnique({ where: { id: integrationId } })
  if (!integration || integration.status !== 'CONNECTED') return []

  const refreshToken = integration.refreshToken ? decrypt(integration.refreshToken) : ''

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!
  )
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  const analyticsDataClient = analyticsdata({ version: 'v1beta', auth: oauth2Client })

  const response = await analyticsDataClient.properties.runReport({
    property: `properties/${integration.accountId}`,
    requestBody: {
      dateRanges: [
        {
          startDate: formatApiDate(periodStart),
          endDate: formatApiDate(periodEnd),
        },
      ],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'conversions' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    },
  })

  const rows = (response as { data: { rows?: unknown[] } }).data?.rows ?? []
  const data: GA4DailyData[] = (rows as Array<Record<string, unknown>>).map((row) => {
    const dims = (row.dimensionValues as Array<{ value?: string }> | undefined) ?? []
    const vals = (row.metricValues as Array<{ value?: string }> | undefined) ?? []
    // GA4 retorna date como YYYYMMDD — converter para YYYY-MM-DD
    const raw = dims[0]?.value ?? ''
    const date = raw.length === 8
      ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
      : raw

    return {
      date,
      sessions: parseInt(vals[0]?.value ?? '0', 10),
      users: parseInt(vals[1]?.value ?? '0', 10),
      conversions: parseInt(vals[2]?.value ?? '0', 10),
    }
  })

  // 3. Salvar no cache
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS)
  await db.integrationDataCache.deleteMany({
    where: { integrationId, dataType: 'daily', periodStart, periodEnd },
  })
  await db.integrationDataCache.create({
    data: {
      integrationId,
      dataType: 'daily',
      data: data as object[],
      periodStart,
      periodEnd,
      expiresAt,
    },
  })

  return data
}
