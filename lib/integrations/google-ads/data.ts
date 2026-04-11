import { GoogleAdsApi } from 'google-ads-api'
import { db } from '@/lib/db'
import { decrypt } from '@/lib/utils/crypto'

const CACHE_TTL_MS = 4 * 60 * 60 * 1000 // 4 horas

export interface GoogleAdsCampaignMetrics {
  campaignId: string
  campaignName: string
  costBrl: number          // cost_micros convertido para BRL (÷ 1_000_000)
  impressions: number
  clicks: number
  ctr: number
  averageCpc: number       // em BRL
  conversions: number
  costPerConversion: number
  roas: number
}

/**
 * Busca métricas do Google Ads para um período.
 * Verifica o cache primeiro — só chama a API se expirado.
 */
export async function getGoogleAdsMetrics(
  integrationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<GoogleAdsCampaignMetrics[]> {
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
    return cached.data as GoogleAdsCampaignMetrics[]
  }

  // 2. Cache expirado — buscar na API
  const integration = await db.integration.findUnique({ where: { id: integrationId } })
  if (!integration) throw new Error('Integração não encontrada')
  if (integration.status !== 'CONNECTED') throw new Error('Integração não está conectada')

  const refreshToken = integration.refreshToken ? decrypt(integration.refreshToken) : ''

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '',
  })

  const customer = client.Customer({
    customer_id: integration.accountId,
    refresh_token: refreshToken,
    // access_token como fallback se refresh_token estiver disponível
  })

  const since = formatDate(periodStart)
  const until = formatDate(periodEnd)

  const rows = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversions,
      metrics.cost_per_conversion,
      metrics.all_conversions_value
    FROM campaign
    WHERE segments.date BETWEEN '${since}' AND '${until}'
      AND campaign.status = 'ENABLED'
    ORDER BY metrics.cost_micros DESC
    LIMIT 100
  `)

  const metrics: GoogleAdsCampaignMetrics[] = rows.map((row) => {
    const costMicros = Number(row.metrics?.cost_micros ?? 0)
    const avgCpcMicros = Number(row.metrics?.average_cpc ?? 0)
    const costPerConvMicros = Number(row.metrics?.cost_per_conversion ?? 0)
    const conversionsValue = Number(row.metrics?.all_conversions_value ?? 0)
    const costBrl = costMicros / 1_000_000

    return {
      campaignId: String(row.campaign?.id ?? ''),
      campaignName: String(row.campaign?.name ?? ''),
      costBrl,
      impressions: Number(row.metrics?.impressions ?? 0),
      clicks: Number(row.metrics?.clicks ?? 0),
      ctr: Number(row.metrics?.ctr ?? 0),
      averageCpc: avgCpcMicros / 1_000_000,
      conversions: Number(row.metrics?.conversions ?? 0),
      costPerConversion: costPerConvMicros / 1_000_000,
      roas: costBrl > 0 ? conversionsValue / costBrl : 0,
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
