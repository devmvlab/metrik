import { NextResponse } from 'next/server'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { stripe } from '@/lib/billing/stripe'
import { db } from '@/lib/db'

export async function POST() {
  const session = await requireAgencyAdmin()

  const agency = await db.agency.findUnique({
    where: { id: session.agencyId },
    select: { stripeCustomerId: true },
  })

  if (!agency?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'Nenhuma assinatura encontrada. Escolha um plano primeiro.' },
      { status: 404 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: agency.stripeCustomerId,
    return_url: `${appUrl}/dashboard/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
