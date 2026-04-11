import { analyticsdata } from '@googleapis/analyticsdata'
import { google } from 'googleapis'
import { db } from '@/lib/db'
import { decrypt } from '@/lib/utils/crypto'

const CACHE_TTL_MS = 4 * 60 * 60 * 1000 // 4 horas

export interface GA4Metrics {
  source: string
  sessions: number
  users: number
  newUsers: number
  conversions: number
  totalRevenue: number
  bounceRate: number
}

/**
 * Busca métricas do GA4 agrupadas por sessionSource.
 * Verifica o cache primeiro — só chama a API se expirado.
 */
export async function getGA4Metrics(
  integrationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<GA4Metrics[]> {
  // 1. Verificar cache válido
  const cached = await db.integrationDataCache.findFirst({
    where: {
      integrationId,
      periodStart,
      periodEnd,
      expiresAt: { gt: new Date() },
    },
  })

  if (cached) {
    return cached.data as GA4Metrics[]
  }

  // 2. Cache expirado — buscar na API
  const integration = await db.integration.findUnique({ where: { id: integrationId } })
  if (!integration) throw new Error('Integração não encontrada')
  if (integration.status !== 'CONNECTED') throw new Error('Integração não está conectada')

  const refreshToken = integration.refreshToken ? decrypt(integration.refreshToken) : ''

  // Criar cliente OAuth2 com refresh_token para renovar access_token automaticamente
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
          startDate: formatDate(periodStart),
          endDate: formatDate(periodEnd),
        },
      ],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 50,
    },
  })

  const rows = response.data.rows ?? []
  const metrics: GA4Metrics[] = rows.map((row) => {
    const dims = row.dimensionValues ?? []
    const vals = row.metricValues ?? []

    return {
      source: dims[0]?.value ?? '(direct)',
      sessions: parseInt(vals[0]?.value ?? '0', 10),
      users: parseInt(vals[1]?.value ?? '0', 10),
      newUsers: parseInt(vals[2]?.value ?? '0', 10),
      conversions: parseInt(vals[3]?.value ?? '0', 10),
      totalRevenue: parseFloat(vals[4]?.value ?? '0'),
      bounceRate: parseFloat(vals[5]?.value ?? '0'),
    }
  })

  // 3. Salvar no cache
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS)
  await db.integrationDataCache.deleteMany({
    where: { integrationId, periodStart, periodEnd },
  })
  await db.integrationDataCache.create({
    data: {
      integrationId,
      data: metrics as object[],
      periodStart,
      periodEnd,
      expiresAt,
    },
  })

  await db.integration.update({
    where: { id: integrationId },
    data: { lastSyncAt: new Date() },
  })

  return metrics
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
