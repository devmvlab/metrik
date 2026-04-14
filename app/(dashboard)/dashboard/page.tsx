import { requireAgencyAdmin } from '@/lib/auth/session'
import { getAgencyById, getAgencyStats } from '@/lib/db/agencies'
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist'
import { Card } from '@/components/ui/card'
import { Users, Activity } from 'lucide-react'

export default async function DashboardPage() {
  const session = await requireAgencyAdmin()
  const [agency, stats] = await Promise.all([
    getAgencyById(session.agencyId),
    getAgencyStats(session.agencyId),
  ])

  const checklistItems = [
    {
      id: 'agency',
      label: 'Agência criada',
      description: 'Sua agência foi configurada com sucesso.',
      done: true,
    },
    {
      id: 'client',
      label: 'Adicionar primeiro cliente',
      description: 'Convide um cliente para acessar o dashboard.',
      done: stats.totalClients > 0,
      href: '/dashboard/clientes',
    },
    {
      id: 'integration',
      label: 'Conectar primeira integração',
      description: 'Vincule Meta Ads, Google Ads ou GA4 ao seu cliente.',
      done: stats.hasConnectedIntegration,
      href: '/dashboard/clientes',
    },
    {
      id: 'whitelabel',
      label: 'Personalizar white-label',
      description: 'Configure logo e cores da sua marca.',
      done: Boolean(agency?.whiteLabelConfig?.logoUrl),
      href: '/dashboard/configuracoes',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900">
          Olá{agency ? `, ${agency.name}` : ''}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Aqui está um resumo da sua agência.</p>
      </div>

      <OnboardingChecklist items={checklistItems} />

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-neutral-500">Total de clientes</p>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{stats.totalClients}</p>
        </Card>

        <Card className="p-5 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-neutral-500">Clientes ativos</p>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{stats.activeClients}</p>
        </Card>
      </div>
    </div>
  )
}
