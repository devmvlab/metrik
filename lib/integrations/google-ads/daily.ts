import { GoogleAdsApi } from 'google-ads-api'
import { db } from '@/lib/db'
import { decrypt } from '@/lib/utils/crypto'
import { formatApiDate } from '@/lib/dashboard/periods'

const CACHE_TTL_MS = 4 * 60 * 60 * 1000

export interface GoogleAdsDailyData {
  date: string      // YYYY-MM-DD
  costBrl: number
  conversions: number
  impressions: number
  clicks: number
}

/**
 * Busca dados diários do Google Ads para o período informado.
 * Agrupa por segments.date — um ponto por dia.
 */
export async function getGoogleAdsDailyData(
  integrationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<GoogleAdsDailyData[]> {
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
    return cached.data as unknown as GoogleAdsDailyData[]
  }

  // 2. Buscar na API
  const integration = await db.integration.findUnique({ where: { id: integrationId } })
  if (!integration || integration.status !== 'CONNECTED') return []

  const refreshToken = integration.refreshToken ? decrypt(integration.refreshToken) : ''

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '',
  })

  const customer = client.Customer({
    customer_id: integration.accountId,
    refresh_token: refreshToken,
  })

  const since = formatApiDate(periodStart)
  const until = formatApiDate(periodEnd)

  const rows = await customer.query(`
    SELECT
      segments.date,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions
    FROM customer
    WHERE segments.date BETWEEN '${since}' AND '${until}'
    ORDER BY segments.date ASC
  `)

  const data: GoogleAdsDailyData[] = rows.map((row) => ({
    date: String(row.segments?.date ?? ''),
    costBrl: Number(row.metrics?.cost_micros ?? 0) / 1_000_000,
    conversions: Number(row.metrics?.conversions ?? 0),
    impressions: Number(row.metrics?.impressions ?? 0),
    clicks: Number(row.metrics?.clicks ?? 0),
  }))

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
