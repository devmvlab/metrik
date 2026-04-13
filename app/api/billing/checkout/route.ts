import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { stripe } from '@/lib/billing/stripe'
import { getStripePriceId, PLAN_LABELS } from '@/lib/billing/plans'
import { db } from '@/lib/db'

const checkoutSchema = z.object({
  plan: z.enum(['STARTER', 'PRO', 'AGENCY']),
})

export async function POST(request: Request) {
  const session = await requireAgencyAdmin()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const parse = checkoutSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 422 })
  }

  const { plan } = parse.data

  const agency = await db.agency.findUnique({
    where: { id: session.agencyId },
    select: { id: true, name: true, stripeCustomerId: true, stripeSubscriptionId: true, plan: true },
  })

  if (!agency) {
    return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 })
  }

  // Se já tem assinatura ativa, usar o portal em vez do checkout
  if (agency.stripeSubscriptionId) {
    return NextResponse.json(
      { error: 'Você já tem uma assinatura. Use o portal para alterar o plano.', code: 'HAS_SUBSCRIPTION' },
      { status: 409 },
    )
  }

  let priceId: string
  try {
    priceId = getStripePriceId(plan)
  } catch {
    return NextResponse.json(
      { error: `Plano ${PLAN_LABELS[plan]} não está disponível para pagamento no momento.` },
      { status: 503 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    ...(agency.stripeCustomerId
      ? { customer: agency.stripeCustomerId }
      : { customer_email: session.email }),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=canceled`,
    allow_promotion_codes: true,
    metadata: { agencyId: agency.id, plan },
    subscription_data: {
      metadata: { agencyId: agency.id, plan },
    },
  })

  if (!checkoutSession.url) {
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 })
  }

  return NextResponse.json({ url: checkoutSession.url })
}
