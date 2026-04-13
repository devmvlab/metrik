import Link from 'next/link'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getClientsByAgency } from '@/lib/db/clients'
import { getAgencyWithPlanUsage } from '@/lib/db/agencies'
import { PLAN_LABELS, PLAN_LIMITS, isAtPlanLimit } from '@/lib/billing/plans'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { NewClientModal } from './NewClientModal'
import { formatDistanceToNow } from './utils'

const platformLabels: Record<string, string> = {
  META_ADS: 'Meta Ads',
  GOOGLE_ADS: 'Google Ads',
  GA4: 'GA4',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
}

export default async function ClientesPage() {
  const session = await requireAgencyAdmin()
  const [clients, agency] = await Promise.all([
    getClientsByAgency(session.agencyId),
    getAgencyWithPlanUsage(session.agencyId),
  ])

  const plan = agency?.plan ?? 'STARTER'
  const clientCount = agency?.clientCount ?? clients.length
  const limit = PLAN_LIMITS[plan]
  const atLimit = isAtPlanLimit(plan, clientCount)
  const usagePercent = Math.min(100, Math.round((clientCount / limit) * 100))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Clientes</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {clientCount} de {limit} clientes do plano {PLAN_LABELS[plan]}.
          </p>
        </div>
        <NewClientModal atLimit={atLimit} planName={PLAN_LABELS[plan]} planLimit={limit} />
      </div>

      {/* Barra de uso do plano */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-neutral-500">Uso do plano</span>
          {atLimit ? (
            <Link
              href="/dashboard/billing"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Fazer upgrade →
            </Link>
          ) : (
            <span className="text-xs text-neutral-400">
              {clientCount}/{limit}
            </span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              atLimit ? 'bg-red-500' : usagePercent >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-sm">Nenhum cliente ainda. Clique em &quot;Novo cliente&quot; para começar.</p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="text-xs">Nome</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Integrações</TableHead>
                <TableHead className="text-xs">Criado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-neutral-50">
                  <TableCell>
                    <Link
                      href={`/dashboard/clientes/${client.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {client.name}
                    </Link>
                    <p className="text-xs text-neutral-400">{client.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[client.status] ?? 'outline'} className="text-xs">
                      {client.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {client.integrations.length === 0 ? (
                      <span className="text-xs text-neutral-400">Nenhuma</span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {client.integrations.map((int) => (
                          <Badge key={int.platform} variant="outline" className="text-xs">
                            {platformLabels[int.platform] ?? int.platform}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-400">
                    {formatDistanceToNow(client.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
