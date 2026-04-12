import { db } from '@/lib/db'
import { decrypt } from '@/lib/utils/crypto'
import { formatApiDate } from '@/lib/dashboard/periods'

const META_API_BASE = 'https://graph.facebook.com/v19.0'
const CACHE_TTL_MS = 4 * 60 * 60 * 1000

export interface MetaDailyData {
  date: string      // YYYY-MM-DD
  spend: number
  conversions: number
  impressions: number
  clicks: number
}

/**
 * Busca dados diários do Meta Ads para o período informado.
 * Retorna um ponto por dia — usado no gráfico de linha do dashboard.
 */
export async function getMetaDailyData(
  integrationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<MetaDailyData[]> {
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
    return cached.data as unknown as MetaDailyData[]
  }

  // 2. Buscar na API
  const integration = await db.integration.findUnique({ where: { id: integrationId } })
  if (!integration || integration.status !== 'CONNECTED') return []

  const accessToken = decrypt(integration.accessToken)
  const accountId = `act_${integration.accountId}`

  const params = new URLSearchParams({
    fields: 'date_start,spend,impressions,clicks,actions',
    time_range: JSON.stringify({
      since: formatApiDate(periodStart),
      until: formatApiDate(periodEnd),
    }),
    time_increment: '1',
    level: 'account',
    access_token: accessToken,
    limit: '100',
  })

  const res = await fetch(`${META_API_BASE}/${accountId}/insights?${params.toString()}`)
  if (!res.ok) return []

  const raw = await res.json()
  const data: MetaDailyData[] = (raw.data ?? []).map((row: Record<string, unknown>) => {
    const actions = row.actions as Array<{ action_type: string; value: string }> | undefined
    const purchases = parseFloat(
      actions?.find((a) => a.action_type === 'offsite_conversion.fb_pixel_purchase')?.value ?? '0'
    )
    return {
      date: String(row.date_start ?? ''),
      spend: parseFloat(String(row.spend ?? '0')),
      conversions: purchases,
      impressions: parseInt(String(row.impressions ?? '0'), 10),
      clicks: parseInt(String(row.clicks ?? '0'), 10),
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
