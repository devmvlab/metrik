import { requireAgencyAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileHeader from '@/components/dashboard/MobileHeader'

export default async function BillingLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAgencyAdmin()

  const agency = await db.agency.findUnique({
    where: { id: session.agencyId },
    select: { trialEndsAt: true, stripeSubscriptionStatus: true },
  })

  const hasActiveSubscription =
    agency?.stripeSubscriptionStatus === 'active' ||
    agency?.stripeSubscriptionStatus === 'trialing' ||
    agency?.stripeSubscriptionStatus === 'incomplete'

  const trialExpired =
    !hasActiveSubscription &&
    agency?.trialEndsAt != null &&
    new Date(agency.trialEndsAt) < new Date()

  const isPastDue = agency?.stripeSubscriptionStatus === 'past_due'
  const isRestricted = trialExpired || isPastDue

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader restricted={isRestricted} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
