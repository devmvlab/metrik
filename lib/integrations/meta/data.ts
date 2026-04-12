import { db } from '@/lib/db'
import { decrypt } from '@/lib/utils/crypto'

const META_API_BASE = 'https://graph.facebook.com/v19.0'
const CACHE_TTL_MS = 4 * 60 * 60 * 1000 // 4 horas

export interface MetaCampaignMetrics {
  campaignId: string
  campaignName: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  conversions: number
  costPerConversion: number
  purchaseRoas: number
}

/**
 * Busca métricas do Meta Ads para um período.
 * Verifica o cache primeiro — só chama a API se o cache estiver expirado.
 */
export async function getMetaMetrics(
  integrationId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<MetaCampaignMetrics[]> {
  // 1. Verificar cache válido
  const cached = await db.integrationDataCache.findFirst({
    where: {
      integrationId,
      dataType: 'campaigns',
      periodStart,
      periodEnd,
      expiresAt: { gt: new Date() },
    },
  })

  if (cached) {
    return cached.data as unknown as MetaCampaignMetrics[]
  }

  // 2. Cache expirado ou inexistente — buscar na API
  const integration = await db.integration.findUnique({ where: { id: integrationId } })
  if (!integration) throw new Error('Integração não encontrada')
  if (integration.status !== 'CONNECTED') throw new Error('Integração não está conectada')

  const accessToken = decrypt(integration.accessToken)
  const accountId = `act_${integration.accountId}`

  const fields = [
    'campaign_id',
    'campaign_name',
    'spend',
    'impressions',
    'clicks',
    'ctr',
    'cpc',
    'actions',
    'cost_per_action_type',
    'purchase_roas',
  ].join(',')

  const params = new URLSearchParams({
    fields,
    time_range: JSON.stringify({
      since: formatDate(periodStart),
      until: formatDate(periodEnd),
    }),
    level: 'campaign',
    access_token: accessToken,
    limit: '100',
  })

  const res = await fetch(`${META_API_BASE}/${accountId}/insights?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Meta Ads API erro: ${err.error?.message ?? res.statusText}`)
  }

  const raw = await res.json()
  const metrics: MetaCampaignMetrics[] = (raw.data ?? []).map(parseCampaignRow)

  // 3. Salvar no cache — remove entradas antigas do mesmo período e recria
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS)
  await db.integrationDataCache.deleteMany({
    where: { integrationId, dataType: 'campaigns', periodStart, periodEnd },
  })
  await db.integrationDataCache.create({
    data: {
      integrationId,
      dataType: 'campaigns',
      data: metrics as object[],
      periodStart,
      periodEnd,
      expiresAt,
    },
  })

  // Atualizar lastSyncAt na integração
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

function getActionValue(actions: Array<{ action_type: string; value: string }> | undefined, type: string): number {
  return parseFloat(actions?.find((a) => a.action_type === type)?.value ?? '0')
}

function parseCampaignRow(row: Record<string, unknown>): MetaCampaignMetrics {
  const actions = row.actions as Array<{ action_type: string; value: string }> | undefined
  const costPerAction = row.cost_per_action_type as Array<{ action_type: string; value: string }> | undefined
  const purchaseRoas = row.purchase_roas as Array<{ action_type: string; value: string }> | undefined

  return {
    campaignId: String(row.campaign_id ?? ''),
    campaignName: String(row.campaign_name ?? ''),
    spend: parseFloat(String(row.spend ?? '0')),
    impressions: parseInt(String(row.impressions ?? '0'), 10),
    clicks: parseInt(String(row.clicks ?? '0'), 10),
    ctr: parseFloat(String(row.ctr ?? '0')),
    cpc: parseFloat(String(row.cpc ?? '0')),
    conversions: getActionValue(actions, 'offsite_conversion.fb_pixel_purchase'),
    costPerConversion: getActionValue(costPerAction, 'offsite_conversion.fb_pixel_purchase'),
    purchaseRoas: parseFloat(purchaseRoas?.find((r) => r.action_type === 'omni_purchase')?.value ?? '0'),
  }
}
