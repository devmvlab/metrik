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
          <h1 className="text-xl font-semibold text-white">Clientes</h1>
          <p className="text-sm text-slate-400 mt-1">
            {clientCount} de {limit} clientes do plano {PLAN_LABELS[plan]}.
          </p>
        </div>
        <NewClientModal atLimit={atLimit} planName={PLAN_LABELS[plan]} planLimit={limit} />
      </div>

      {/* Barra de uso do plano */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">Uso do plano</span>
          {atLimit ? (
            <Link
              href="/dashboard/billing"
              className="text-xs font-medium text-violet-400 hover:text-violet-300 hover:underline"
            >
              Fazer upgrade →
            </Link>
          ) : (
            <span className="text-xs text-slate-500">
              {clientCount}/{limit}
            </span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              atLimit ? 'bg-red-500' : usagePercent >= 80 ? 'bg-amber-400' : 'bg-violet-600'
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm">Nenhum cliente ainda. Clique em &quot;Novo cliente&quot; para começar.</p>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-800 border-slate-700 hover:bg-slate-800">
                <TableHead className="text-xs text-slate-400">Nome</TableHead>
                <TableHead className="text-xs text-slate-400">Status</TableHead>
                <TableHead className="text-xs text-slate-400">Integrações</TableHead>
                <TableHead className="text-xs text-slate-400">Criado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="border-slate-800 hover:bg-slate-800/60">
                  <TableCell>
                    <Link
                      href={`/dashboard/clientes/${client.id}`}
                      className="font-medium text-white hover:text-violet-300 transition-colors"
                    >
                      {client.name}
                    </Link>
                    <p className="text-xs text-slate-500">{client.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        client.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {client.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {client.integrations.length === 0 ? (
                      <span className="text-xs text-slate-500">Nenhuma</span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {client.integrations.map((int) => (
                          <Badge
                            key={int.platform}
                            variant="outline"
                            className="text-xs border-slate-700 text-slate-300 bg-slate-800"
                          >
                            {platformLabels[int.platform] ?? int.platform}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
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
