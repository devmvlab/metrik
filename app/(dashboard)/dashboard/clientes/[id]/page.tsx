import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Integration } from '@prisma/client'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getClientById } from '@/lib/db/clients'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Clock, RefreshCw, Plus } from 'lucide-react'

const platformLabels: Record<string, string> = {
  META_ADS: 'Meta Ads',
  GOOGLE_ADS: 'Google Ads',
  GA4: 'Google Analytics 4',
}

const connectPaths: Record<string, string> = {
  META_ADS: '/api/integrations/meta/connect',
  GOOGLE_ADS: '/api/integrations/google-ads/connect',
  GA4: '/api/integrations/ga4/connect',
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

  const callbackFeedback =
    searchParams.status === 'success'
      ? { type: 'success' as const, message: `${platformLabels[searchParams.integration?.toUpperCase().replace('-', '_') ?? ''] ?? 'Integração'} conectada com sucesso.` }
      : searchParams.status === 'error'
      ? { type: 'error' as const, message: searchParams.reason ?? 'Erro ao conectar integração.' }
      : searchParams.status === 'denied'
      ? { type: 'warning' as const, message: 'Autorização negada pelo usuário.' }
      : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/clientes">
          <Button variant="outline" size="sm" className="gap-1.5 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Clientes
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white">{client.name}</h1>
          <p className="text-sm text-slate-400">{client.email}</p>
        </div>
        <div className="ml-auto">
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
      </div>

      {/* Feedback de callback OAuth */}
      {callbackFeedback && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            callbackFeedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : callbackFeedback.type === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          }`}
        >
          {callbackFeedback.message}
        </div>
      )}

      {/* Cards de integração */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-3">Integrações</h2>
        <div className="grid grid-cols-3 gap-4">
          {allPlatforms.map((platform) => {
            const integration = connectedPlatforms.get(platform)
            const connectUrl = `${connectPaths[platform]}?client_id=${client.id}`

            return (
              <Card key={platform} className="p-4 bg-slate-900 border-slate-800 shadow-none">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-white">{platformLabels[platform]}</p>
                  {integration ? (
                    <IntegrationStatusBadge integration={integration} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700 mt-1" />
                  )}
                </div>

                {integration ? (
                  <>
                    {integration.accountId && (
                      <p className="text-xs text-slate-500 mb-1">ID: {integration.accountId}</p>
                    )}
                    <p className="text-xs text-slate-500 mb-3">
                      Última sync: {formatDate(integration.lastSyncAt)}
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
                    <p className="text-xs text-slate-500 mb-3">Não conectado</p>
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
      </div>

      {/* Acessos de cliente */}
      {client.users.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white mb-3">Acessos</h2>
          <Card className="bg-slate-900 border-slate-800 shadow-none overflow-hidden">
            <div className="divide-y divide-slate-800">
              {client.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Link para o dashboard do cliente */}
      <div>
        <Link
          href={`/dashboard/clientes/${client.id}/preview`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver dashboard do cliente
        </Link>
      </div>
    </div>
  )
}
