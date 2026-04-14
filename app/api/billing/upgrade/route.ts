import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { stripe } from '@/lib/billing/stripe'
import { getStripePriceId, PLAN_LABELS } from '@/lib/billing/plans'
import { db } from '@/lib/db'
import type { Plan } from '@prisma/client'

const upgradeSchema = z.object({
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

  const parse = upgradeSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 422 })
  }

  const { plan } = parse.data

  const agency = await db.agency.findUnique({
    where: { id: session.agencyId },
    select: { id: true, plan: true, stripeSubscriptionId: true },
  })

  if (!agency) {
    return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 })
  }

  if (!agency.stripeSubscriptionId) {
    return NextResponse.json(
      { error: 'Nenhuma assinatura ativa. Use o checkout para assinar um plano.', code: 'NO_SUBSCRIPTION' },
      { status: 404 },
    )
  }

  let priceId: string
  try {
    priceId = getStripePriceId(plan)
  } catch {
    return NextResponse.json(
      { error: `Plano ${PLAN_LABELS[plan]} não disponível no momento.` },
      { status: 503 },
    )
  }

  // Busca a subscription para obter o subscription item ID
  const subscription = await stripe.subscriptions.retrieve(agency.stripeSubscriptionId)
  const item = subscription.items.data[0]

  if (!item) {
    return NextResponse.json(
      { error: 'Assinatura inválida — nenhum item encontrado.' },
      { status: 500 },
    )
  }

  // Atualiza o plano no Stripe (dispara customer.subscription.updated no webhook)
  await stripe.subscriptions.update(agency.stripeSubscriptionId, {
    items: [{ id: item.id, price: priceId }],
    proration_behavior: 'create_prorations',
  })

  // Atualiza o plano no banco imediatamente para feedback instantâneo na UI
  // (o webhook customer.subscription.updated também atualizará — é idempotente)
  await db.agency.update({
    where: { id: agency.id },
    data: { plan: plan as Plan },
  })

  return NextResponse.json({ success: true })
}
