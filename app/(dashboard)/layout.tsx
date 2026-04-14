import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAgencyAdmin()

  // Verifica acesso — exceto na própria página de billing para evitar loop
  const pathname = headers().get('x-pathname') ?? ''
  if (!pathname.startsWith('/dashboard/billing')) {
    const agency = await db.agency.findUnique({
      where: { id: session.agencyId },
      select: { trialEndsAt: true, stripeSubscriptionStatus: true },
    })

    // Tem assinatura Stripe ativa, em trialing ou incompleta (durante checkout) → acesso liberado
    const hasActiveSubscription =
      agency?.stripeSubscriptionStatus === 'active' ||
      agency?.stripeSubscriptionStatus === 'trialing' ||
      agency?.stripeSubscriptionStatus === 'incomplete'

    // Sem assinatura ativa: verifica se o trial ainda é válido
    const trialExpired =
      !hasActiveSubscription &&
      agency?.trialEndsAt != null &&
      new Date(agency.trialEndsAt) < new Date()

    if (trialExpired) {
      redirect('/dashboard/billing')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
