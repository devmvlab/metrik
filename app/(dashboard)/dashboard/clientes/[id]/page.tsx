import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Integration } from '@prisma/client'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getClientById } from '@/lib/db/clients'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

const platformLabels: Record<string, string> = {
  META_ADS: 'Meta Ads',
  GOOGLE_ADS: 'Google Ads',
  GA4: 'Google Analytics 4',
}

const statusConfig: Record<
  string,
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  CONNECTED: { label: 'Conectado', icon: CheckCircle2, color: 'text-green-600' },
  EXPIRED: { label: 'Expirado', icon: Clock, color: 'text-amber-600' },
  ERROR: { label: 'Erro', icon: AlertCircle, color: 'text-red-600' },
}

const allPlatforms = ['META_ADS', 'GOOGLE_ADS', 'GA4'] as const

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const session = await requireAgencyAdmin()
  const client = await getClientById(params.id, session.agencyId)

  if (!client) notFound()

  const connectedPlatforms = new Map(client.integrations.map((i: Integration) => [i.platform, i]))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/clientes">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Clientes
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{client.name}</h1>
          <p className="text-sm text-neutral-500">{client.email}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {client.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>

      {/* Cards de integração */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-900 mb-3">Integrações</h2>
        <div className="grid grid-cols-3 gap-4">
          {allPlatforms.map((platform) => {
            const integration = connectedPlatforms.get(platform)
            const status = integration ? statusConfig[integration.status] : null

            return (
              <Card key={platform} className="p-4 border border-neutral-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-neutral-900">
                    {platformLabels[platform]}
                  </p>
                  {status ? (
                    <status.icon className={`w-4 h-4 ${status.color}`} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-neutral-200 mt-1" />
                  )}
                </div>
                {integration ? (
                  <>
                    <p className={`text-xs font-medium ${statusConfig[integration.status].color}`}>
                      {statusConfig[integration.status].label}
                    </p>
                    {integration.accountId && (
                      <p className="text-xs text-neutral-400 mt-0.5">ID: {integration.accountId}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-neutral-400">Não conectado</p>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Acessos de cliente */}
      {client.users.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Acessos</h2>
          <Card className="border border-neutral-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-neutral-100">
              {client.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                    <p className="text-xs text-neutral-400">{user.email}</p>
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
          href={`/client`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver dashboard do cliente
        </Link>
      </div>
    </div>
  )
}
