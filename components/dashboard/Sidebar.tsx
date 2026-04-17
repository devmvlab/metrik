import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { getAgencyById } from '@/lib/db/agencies'
import { MetrikLogo } from '@/components/marketing/MetrikLogo'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { SidebarNav } from '@/components/dashboard/SidebarNav'
import { getDisplayPlanLabel } from '@/lib/billing/plans'

function computeIsRestricted(agency: {
  trialEndsAt: Date | null
  stripeSubscriptionStatus: string | null
} | null): boolean {
  if (!agency) return false

  const hasActiveSubscription =
    agency.stripeSubscriptionStatus === 'active' ||
    agency.stripeSubscriptionStatus === 'trialing' ||
    agency.stripeSubscriptionStatus === 'incomplete'

  const trialExpired =
    !hasActiveSubscription &&
    agency.trialEndsAt != null &&
    new Date(agency.trialEndsAt) < new Date()

  return trialExpired || agency.stripeSubscriptionStatus === 'past_due'
}

export default async function Sidebar() {
  const session = await getSession()
  const agency = session ? await getAgencyById(session.agencyId) : null
  const isRestricted = computeIsRestricted(agency)

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col h-full border-r border-slate-800 bg-slate-900">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <Link href="/dashboard">
          <MetrikLogo size="sm" />
        </Link>
      </div>

      <SidebarNav isRestricted={isRestricted} />

      {/* Footer — agência + plano + logout */}
      <div className="border-t border-slate-800">
        {agency && (
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-violet-300">
                {agency.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Nome + plano */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{agency.name}</p>
              <span className="text-xs text-violet-400 font-medium">
                {getDisplayPlanLabel(agency)}
              </span>
            </div>
          </div>
        )}
        <div className="p-2">
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
