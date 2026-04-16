import type React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Integration } from '@prisma/client'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getClientById } from '@/lib/db/clients'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MetaAdsIcon, GoogleAdsIcon, GA4Icon } from '@/components/brand-icons'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Plus,
  AlertTriangle,
  UserPlus,
  Eye,
} from 'lucide-react'

const platformConfig: Record<string, {
  label: string
  icon: React.ReactNode
  connectPath: string
}> = {
  META_ADS: {
    label: 'Meta Ads',
    icon: <MetaAdsIcon className="w-9 h-9" />,
    connectPath: '/api/integrations/meta/connect',
  },
  GOOGLE_ADS: {
    label: 'Google Ads',
    icon: <GoogleAdsIcon className="w-9 h-9" />,
    connectPath: '/api/integrations/google-ads/connect',
  },
  GA4: {
    label: 'Google Analytics 4',
    icon: <GA4Icon className="w-9 h-9" />,
    connectPath: '/api/integrations/ga4/connect',
  },
}

const allPlatforms = ['META_ADS', 'GOOGLE_ADS', 'GA4'] as const

function formatDate(date: Date | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function ClientAvatar({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <div className="w-11 h-11 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-violet-300">{initials}</span>
    </div>
  )
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
      <span className="text-xs font-medium text-slate-300">{initials}</span>
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px flex-1 bg-slate-800" />
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="h-px flex-1 bg-slate-800" />
    </div>
  )
}

function IntegrationStatusBadge({ integration }: { integration: Integration }) {
  if (integration.status === 'CONNECTED') {
    return (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400">Conectado</span>
      </div>
    )
  }
  if (integration.status === 'EXPIRED') {
    return (
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-medium text-amber-400">Token expirado</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5">
      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      <span className="text-xs font-medium text-red-400">Erro</span>
    </div>
  )
}

function cardBorderClass(integration: Integration | undefined): string {
  if (!integration) return 'border-dashed border-slate-700/60'
  if (integration.status === 'CONNECTED') return 'border-emerald-500/20'
  if (integration.status === 'EXPIRED') return 'border-amber-500/20'
  return 'border-red-500/20'
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { integration?: string; status?: string; reason?: string }
}) {
  const session = await requireAgencyAdmin()
  const client = await getClientById(params.id, session.agencyId)

  if (!client) notFound()

  const connectedPlatforms = new Map(client.integrations.map((i: Integration) => [i.platform, i]))

  const feedbackKey = searchParams.integration?.toUpperCase().replace('-', '_') ?? ''
  const callbackFeedback =
    searchParams.status === 'success'
      ? { type: 'success' as const, message: `${platformConfig[feedbackKey]?.label ?? 'Integração'} conectada com sucesso.` }
      : searchParams.status === 'error'
      ? { type: 'error' as const, message: searchParams.reason ?? 'Erro ao conectar integração.' }
      : searchParams.status === 'denied'
      ? { type: 'warning' as const, message: 'Autorização negada pelo usuário.' }
      : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <ClientAvatar name={client.name} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-white leading-tight">{client.name}</h1>
          <p className="text-sm text-slate-400 truncate">{client.email}</p>
        </div>
        <Badge
          variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}
          className={
            client.status === 'ACTIVE'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-slate-700 text-slate-400 border-slate-600'
          }
        >
          {client.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {/* Feedback de callback OAuth */}
      {callbackFeedback && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${
            callbackFeedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : callbackFeedback.type === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          }`}
        >
          {callbackFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : callbackFeedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          {callbackFeedback.message}
        </div>
      )}

      {/* Integrações */}
      <SectionDivider label="Integrações" />
      <div className="grid grid-cols-3 gap-4 mb-8">
        {allPlatforms.map((platform) => {
          const integration = connectedPlatforms.get(platform)
          const config = platformConfig[platform]
          const connectUrl = `${config.connectPath}?client_id=${client.id}`
          const borderClass = cardBorderClass(integration)

          return (
            <Card key={platform} className={`p-5 bg-slate-900 ${borderClass} shadow-none`}>
              <div className="flex items-start justify-between mb-4">
                {config.icon}
                {integration && <IntegrationStatusBadge integration={integration} />}
              </div>

              <p className="text-sm font-medium text-white mb-1">{config.label}</p>

              {integration ? (
                <>
                  {integration.accountId && (
                    <p className="text-xs text-slate-500 mb-0.5">ID: {integration.accountId}</p>
                  )}
                  <p className="text-xs text-slate-500 mb-4">
                    Sync: {formatDate(integration.lastSyncAt)}
                  </p>
                  {integration.status === 'CONNECTED' ? (
                    <Link href={connectUrl}>
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                        <RefreshCw className="w-3 h-3" />
                        Reconectar
                      </Button>
                    </Link>
                  ) : integration.status === 'EXPIRED' ? (
                    <Link href={connectUrl}>
                      <Button size="sm" className="w-full gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white border-0">
                        <RefreshCw className="w-3 h-3" />
                        Reconectar
                      </Button>
                    </Link>
                  ) : (
                    <Link href={connectUrl}>
                      <Button size="sm" className="w-full gap-1.5 text-xs bg-red-500 hover:bg-red-600 text-white border-0">
                        <RefreshCw className="w-3 h-3" />
                        Tentar novamente
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-500 mb-4">Não conectado</p>
                  <Link href={connectUrl}>
                    <Button size="sm" className="w-full gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white border-0">
                      <Plus className="w-3 h-3" />
                      Conectar
                    </Button>
                  </Link>
                </>
              )}
            </Card>
          )
        })}
      </div>

      {/* Acessos */}
      <SectionDivider label="Acessos" />
      <div className="mb-8">
        {client.users.length > 0 ? (
          <Card className="bg-slate-900 border-slate-800 shadow-none overflow-hidden">
            <div className="divide-y divide-slate-800">
              {client.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.name ?? user.email} />
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="bg-slate-900 border-dashed border-slate-700/60 shadow-none">
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">Nenhum acesso configurado</p>
                <p className="text-xs text-slate-500 mt-1">Convide o cliente para acessar o dashboard</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Dashboard */}
      <SectionDivider label="Dashboard" />
      <Card className="bg-slate-900 border-slate-800 shadow-none p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Dashboard do cliente</p>
            <p className="text-xs text-slate-500 mt-0.5">Visualize o dashboard como o cliente vê</p>
          </div>
          <Link href={`/dashboard/clientes/${client.id}/preview`} target="_blank">
            <Button size="sm" className="gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white border-0">
              <Eye className="w-3.5 h-3.5" />
              Pré-visualizar
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
