import { requireAgencyAdmin } from '@/lib/auth/session'
import { getAgencyById } from '@/lib/db/agencies'
import { WhiteLabelForm } from './WhiteLabelForm'

export default async function ConfiguracoesPage() {
  const session = await requireAgencyAdmin()
  const agency = await getAgencyById(session.agencyId)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Configurações</h1>
        <p className="text-sm text-slate-400 mt-1">
          Personalize a identidade visual da sua agência no dashboard do cliente.
        </p>
      </div>

      <WhiteLabelForm
        initialLogoUrl={agency?.whiteLabelConfig?.logoUrl ?? null}
        initialPrimaryColor={agency?.whiteLabelConfig?.primaryColor ?? null}
        initialSecondaryColor={agency?.whiteLabelConfig?.secondaryColor ?? null}
        agencyName={agency?.name ?? 'Sua agência'}
      />
    </div>
  )
}
