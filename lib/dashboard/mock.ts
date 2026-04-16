import { eachDayOfInterval, format } from 'date-fns'
import type { DashboardData } from './aggregator'

// Variação diária determinística baseada no índice do dia — curva realista sem randomness
function dailyFactor(dayIndex: number, period: number): number {
  const base = Math.sin((dayIndex / period) * Math.PI * 2) * 0.25
  const weekly = Math.sin((dayIndex / 7) * Math.PI * 2) * 0.15
  return 1 + base + weekly
}

export function getMockDashboardData(periodStart: Date, periodEnd: Date): DashboardData {
  const allDays = eachDayOfInterval({ start: periodStart, end: periodEnd })
  const period = allDays.length

  // ---------------------------------------------------------------------------
  // Séries diárias
  // ---------------------------------------------------------------------------
  const dailySeries = allDays.map((day, i) => {
    const f = dailyFactor(i, period)
    const isWeekend = [0, 6].includes(day.getDay())
    const wf = isWeekend ? 0.7 : 1.1

    return {
      date: format(day, 'yyyy-MM-dd'),
      spend: Math.round(820 * f * wf),
      conversions: Math.round(18 * f * wf),
      sessions: Math.round(1540 * f * wf),
    }
  })

  // ---------------------------------------------------------------------------
  // Campanhas Meta Ads
  // ---------------------------------------------------------------------------
  const metaCampaigns = [
    {
      platform: 'META_ADS' as const,
      platformLabel: 'Meta Ads',
      campaignId: 'mock-meta-001',
      campaignName: 'Conversões | Lookalike 2% | Produtos',
      spend: 6240,
      impressions: 412000,
      clicks: 9880,
      ctr: 2.4,
      conversions: 187,
      cpa: 33.37,
      roas: 3.82,
    },
    {
      platform: 'META_ADS' as const,
      platformLabel: 'Meta Ads',
      campaignId: 'mock-meta-002',
      campaignName: 'Remarketing | Carrinho Abandonado',
      spend: 4810,
      impressions: 198000,
      clicks: 7650,
      ctr: 3.86,
      conversions: 241,
      cpa: 19.96,
      roas: 5.24,
    },
    {
      platform: 'META_ADS' as const,
      platformLabel: 'Meta Ads',
      campaignId: 'mock-meta-003',
      campaignName: 'Conversões | Interesses Amplos | CBO',
      spend: 2390,
      impressions: 285000,
      clicks: 4120,
      ctr: 1.45,
      conversions: 64,
      cpa: 37.34,
      roas: 2.91,
    },
    {
      platform: 'META_ADS' as const,
      platformLabel: 'Meta Ads',
      campaignId: 'mock-meta-004',
      campaignName: 'Tráfego | Interesses | Top of Funnel',
      spend: 3110,
      impressions: 520000,
      clicks: 12400,
      ctr: 2.38,
      conversions: 38,
      cpa: 81.84,
      roas: 1.18,
    },
  ]

  // ---------------------------------------------------------------------------
  // Campanhas Google Ads
  // ---------------------------------------------------------------------------
  const googleCampaigns = [
    {
      platform: 'GOOGLE_ADS' as const,
      platformLabel: 'Google Ads',
      campaignId: 'mock-gads-001',
      campaignName: 'Shopping | Produtos em Destaque',
      spend: 4180,
      impressions: 198000,
      clicks: 6320,
      ctr: 3.19,
      conversions: 210,
      cpa: 19.9,
      roas: 4.51,
    },
    {
      platform: 'GOOGLE_ADS' as const,
      platformLabel: 'Google Ads',
      campaignId: 'mock-gads-002',
      campaignName: 'Pesquisa | Branded Keywords',
      spend: 1820,
      impressions: 42000,
      clicks: 8900,
      ctr: 21.19,
      conversions: 312,
      cpa: 5.83,
      roas: 8.24,
    },
    {
      platform: 'GOOGLE_ADS' as const,
      platformLabel: 'Google Ads',
      campaignId: 'mock-gads-003',
      campaignName: 'Display | Remarketing',
      spend: 1590,
      impressions: 980000,
      clicks: 2840,
      ctr: 0.29,
      conversions: 47,
      cpa: 33.83,
      roas: 2.08,
    },
  ]

  const campaigns = [...metaCampaigns, ...googleCampaigns].sort((a, b) => b.spend - a.spend)

  // ---------------------------------------------------------------------------
  // Métricas consolidadas
  // ---------------------------------------------------------------------------
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)
  const totalRevenue = campaigns.reduce((s, c) => s + c.roas * c.spend, 0)

  const consolidated = {
    totalSpend,
    totalImpressions,
    totalClicks,
    avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    totalConversions,
    avgCpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
    avgRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
  }

  // ---------------------------------------------------------------------------
  // Breakdown por plataforma
  // ---------------------------------------------------------------------------
  const platformBreakdown = [
    {
      platform: 'META_ADS',
      label: 'Meta Ads',
      spend: metaCampaigns.reduce((s, c) => s + c.spend, 0),
      impressions: metaCampaigns.reduce((s, c) => s + c.impressions, 0),
      clicks: metaCampaigns.reduce((s, c) => s + c.clicks, 0),
      conversions: metaCampaigns.reduce((s, c) => s + c.conversions, 0),
    },
    {
      platform: 'GOOGLE_ADS',
      label: 'Google Ads',
      spend: googleCampaigns.reduce((s, c) => s + c.spend, 0),
      impressions: googleCampaigns.reduce((s, c) => s + c.impressions, 0),
      clicks: googleCampaigns.reduce((s, c) => s + c.clicks, 0),
      conversions: googleCampaigns.reduce((s, c) => s + c.conversions, 0),
    },
    {
      platform: 'GA4',
      label: 'GA4',
      spend: 0,
      impressions: 42840, // total sessions
      clicks: 0,
      conversions: 987,
    },
  ]

  return { consolidated, platformBreakdown, dailySeries, campaigns }
}
