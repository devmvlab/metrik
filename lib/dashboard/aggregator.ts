import { db } from '@/lib/db'
import { Platform } from '@prisma/client'
import { getMetaMetrics } from '@/lib/integrations/meta/data'
import { getGoogleAdsMetrics } from '@/lib/integrations/google-ads/data'
import { getGA4Metrics } from '@/lib/integrations/ga4/data'
import { getMetaDailyData } from '@/lib/integrations/meta/daily'
import { getGoogleAdsDailyData } from '@/lib/integrations/google-ads/daily'
import { getGA4DailyData } from '@/lib/integrations/ga4/daily'
import { eachDayOfInterval, format } from 'date-fns'

// ---------------------------------------------------------------------------
// Tipos exportados
// ---------------------------------------------------------------------------

export interface ConsolidatedMetrics {
  totalSpend: number
  totalImpressions: number
  totalClicks: number
  avgCtr: number
  avgCpc: number
  totalConversions: number
  avgCpa: number
  avgRoas: number
}

export interface PlatformBreakdown {
  platform: string
  label: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
}

export interface DailyPoint {
  date: string          // YYYY-MM-DD
  spend: number         // Meta + Google Ads
  conversions: number   // Meta + Google Ads
  sessions: number      // GA4
}

export interface UnifiedCampaign {
  platform: Platform
  platformLabel: string
  campaignId: string
  campaignName: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  conversions: number
  cpa: number
  roas: number
}

export interface DashboardData {
  consolidated: ConsolidatedMetrics
  platformBreakdown: PlatformBreakdown[]
  dailySeries: DailyPoint[]
  campaigns: UnifiedCampaign[]
}

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

/**
 * Agrega dados de todas as integrações CONNECTED de um cliente para um período.
 * Usado como única fonte de dados do dashboard do cliente.
 */
export async function getDashboardData(
  clientId: string,
  agencyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<DashboardData> {
  // Busca as integrações conectadas do cliente (valida agencyId via relação)
  const integrations = await db.integration.findMany({
    where: {
      client: { id: clientId, agencyId },
      status: 'CONNECTED',
    },
  })

  const metaIntegration = integrations.find((i) => i.platform === 'META_ADS')
  const googleAdsIntegration = integrations.find((i) => i.platform === 'GOOGLE_ADS')
  const ga4Integration = integrations.find((i) => i.platform === 'GA4')

  // Buscar dados de campanha e dados diários em paralelo.
  // Usa allSettled para que a falha de uma plataforma não derrube as demais.
  const safe = <T>(p: Promise<T[]>): Promise<T[]> =>
    p.catch((err) => {
      console.error('[aggregator] falha ao buscar dados de integração:', err?.message ?? err)
      return []
    })

  const [metaCampaigns, googleAdsCampaigns, ga4Sources, metaDaily, googleAdsDaily, ga4Daily] =
    await Promise.all([
      metaIntegration ? safe(getMetaMetrics(metaIntegration.id, periodStart, periodEnd)) : Promise.resolve([]),
      googleAdsIntegration ? safe(getGoogleAdsMetrics(googleAdsIntegration.id, periodStart, periodEnd)) : Promise.resolve([]),
      ga4Integration ? safe(getGA4Metrics(ga4Integration.id, periodStart, periodEnd)) : Promise.resolve([]),
      metaIntegration ? safe(getMetaDailyData(metaIntegration.id, periodStart, periodEnd)) : Promise.resolve([]),
      googleAdsIntegration ? safe(getGoogleAdsDailyData(googleAdsIntegration.id, periodStart, periodEnd)) : Promise.resolve([]),
      ga4Integration ? safe(getGA4DailyData(ga4Integration.id, periodStart, periodEnd)) : Promise.resolve([]),
    ])

  // ---------------------------------------------------------------------------
  // 1. Métricas consolidadas
  // ---------------------------------------------------------------------------
  const metaSpend = metaCampaigns.reduce((s, c) => s + c.spend, 0)
  const metaImpressions = metaCampaigns.reduce((s, c) => s + c.impressions, 0)
  const metaClicks = metaCampaigns.reduce((s, c) => s + c.clicks, 0)
  const metaConversions = metaCampaigns.reduce((s, c) => s + c.conversions, 0)

  const googleSpend = googleAdsCampaigns.reduce((s, c) => s + c.costBrl, 0)
  const googleImpressions = googleAdsCampaigns.reduce((s, c) => s + c.impressions, 0)
  const googleClicks = googleAdsCampaigns.reduce((s, c) => s + c.clicks, 0)
  const googleConversions = googleAdsCampaigns.reduce((s, c) => s + c.conversions, 0)

  const totalSpend = metaSpend + googleSpend
  const totalImpressions = metaImpressions + googleImpressions
  const totalClicks = metaClicks + googleClicks
  const totalConversions = metaConversions + googleConversions

  const avgCtr = totalClicks > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0
  const avgRoas = totalSpend > 0 ? totalConversions / totalSpend : 0

  const consolidated: ConsolidatedMetrics = {
    totalSpend,
    totalImpressions,
    totalClicks,
    avgCtr,
    avgCpc,
    totalConversions,
    avgCpa,
    avgRoas,
  }

  // ---------------------------------------------------------------------------
  // 2. Breakdown por plataforma
  // ---------------------------------------------------------------------------
  const platformBreakdown: PlatformBreakdown[] = []

  if (metaIntegration && metaCampaigns.length > 0) {
    platformBreakdown.push({
      platform: 'META_ADS',
      label: 'Meta Ads',
      spend: metaSpend,
      impressions: metaImpressions,
      clicks: metaClicks,
      conversions: metaConversions,
    })
  }

  if (googleAdsIntegration && googleAdsCampaigns.length > 0) {
    platformBreakdown.push({
      platform: 'GOOGLE_ADS',
      label: 'Google Ads',
      spend: googleSpend,
      impressions: googleImpressions,
      clicks: googleClicks,
      conversions: googleConversions,
    })
  }

  if (ga4Integration && ga4Sources.length > 0) {
    const ga4Sessions = ga4Sources.reduce((s, r) => s + r.sessions, 0)
    platformBreakdown.push({
      platform: 'GA4',
      label: 'GA4',
      spend: 0,
      impressions: ga4Sessions,
      clicks: 0,
      conversions: ga4Sources.reduce((s, r) => s + r.conversions, 0),
    })
  }

  // ---------------------------------------------------------------------------
  // 3. Série diária — gera todos os dias do período com zero como fallback
  // ---------------------------------------------------------------------------
  const allDays = eachDayOfInterval({ start: periodStart, end: periodEnd })
  const metaDailyMap = new Map(metaDaily.map((d) => [d.date, d]))
  const googleDailyMap = new Map(googleAdsDaily.map((d) => [d.date, d]))
  const ga4DailyMap = new Map(ga4Daily.map((d) => [d.date, d]))

  const dailySeries: DailyPoint[] = allDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const meta = metaDailyMap.get(dateStr)
    const google = googleDailyMap.get(dateStr)
    const ga4 = ga4DailyMap.get(dateStr)

    return {
      date: dateStr,
      spend: (meta?.spend ?? 0) + (google?.costBrl ?? 0),
      conversions: (meta?.conversions ?? 0) + (google?.conversions ?? 0),
      sessions: ga4?.sessions ?? 0,
    }
  })

  // ---------------------------------------------------------------------------
  // 4. Tabela de campanhas unificada
  // ---------------------------------------------------------------------------
  const campaigns: UnifiedCampaign[] = [
    ...metaCampaigns.map((c) => ({
      platform: 'META_ADS' as Platform,
      platformLabel: 'Meta Ads',
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      spend: c.spend,
      impressions: c.impressions,
      clicks: c.clicks,
      ctr: c.ctr,
      conversions: c.conversions,
      cpa: c.conversions > 0 ? c.spend / c.conversions : 0,
      roas: c.purchaseRoas,
    })),
    ...googleAdsCampaigns.map((c) => ({
      platform: 'GOOGLE_ADS' as Platform,
      platformLabel: 'Google Ads',
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      spend: c.costBrl,
      impressions: c.impressions,
      clicks: c.clicks,
      ctr: c.ctr * 100,
      conversions: c.conversions,
      cpa: c.costPerConversion,
      roas: c.roas,
    })),
  ].sort((a, b) => b.spend - a.spend)

  return { consolidated, platformBreakdown, dailySeries, campaigns }
}
