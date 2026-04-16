import type React from 'react'
import { MetaAdsIcon, GoogleAdsIcon, GA4Icon } from '@/components/brand-icons'
import { UnifiedCampaign } from '@/lib/dashboard/aggregator'

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  META_ADS: <MetaAdsIcon className="w-4 h-4 shrink-0" />,
  GOOGLE_ADS: <GoogleAdsIcon className="w-4 h-4 shrink-0" />,
  GA4: <GA4Icon className="w-4 h-4 shrink-0" />,
}

function fmt(n: number, style: 'currency' | 'percent' | 'decimal' = 'decimal', decimals = 0): string {
  if (style === 'currency') {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
  }
  if (style === 'percent') {
    return `${n.toFixed(2)}%`
  }
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

interface CampaignTableProps {
  campaigns: UnifiedCampaign[]
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 text-sm">
        Nenhuma campanha ativa no período selecionado.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Campanha</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Investimento</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Impressões</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Cliques</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">CTR</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Conversões</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">CPA</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">ROAS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {campaigns.map((campaign) => (
            <tr key={`${campaign.platform}-${campaign.campaignId}`} className="hover:bg-neutral-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div title={campaign.platformLabel}>
                    {PLATFORM_ICONS[campaign.platform] ?? (
                      <span className="text-[10px] font-medium text-neutral-500">{campaign.platformLabel}</span>
                    )}
                  </div>
                  <span className="text-neutral-900 font-medium truncate max-w-[200px]" title={campaign.campaignName}>
                    {campaign.campaignName}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-medium text-neutral-900 tabular-nums">{fmt(campaign.spend, 'currency')}</td>
              <td className="py-3 px-4 text-right text-neutral-600 tabular-nums">{fmt(campaign.impressions)}</td>
              <td className="py-3 px-4 text-right text-neutral-600 tabular-nums">{fmt(campaign.clicks)}</td>
              <td className="py-3 px-4 text-right text-neutral-600 tabular-nums">{fmt(campaign.ctr, 'percent')}</td>
              <td className="py-3 px-4 text-right text-neutral-600 tabular-nums">{fmt(campaign.conversions, 'decimal', 0)}</td>
              <td className="py-3 px-4 text-right text-neutral-600 tabular-nums">{campaign.cpa > 0 ? fmt(campaign.cpa, 'currency') : '—'}</td>
              <td className="py-3 px-4 text-right tabular-nums">
                <span className={`font-medium ${campaign.roas >= 1 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {campaign.roas > 0 ? `${campaign.roas.toFixed(2)}x` : '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
