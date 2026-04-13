import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/billing/stripe'
import { getPlanByPriceId } from '@/lib/billing/plans'
import { getAgencyByStripeCustomerId } from '@/lib/db/agencies'
import { db } from '@/lib/db'
import { sendPaymentFailedEmail } from '@/lib/email'

// Stripe exige o body RAW (não parseado) para validar a assinatura
export const runtime = 'nodejs'

async function handleCheckoutCompleted(event: Stripe.CheckoutSessionCompletedEvent) {
  const session = event.data.object

  const agencyId = session.metadata?.agencyId
  const plan = session.metadata?.plan as 'STARTER' | 'PRO' | 'AGENCY' | undefined

  if (!agencyId || !plan) {
    console.error('[stripe] checkout.session.completed: metadata ausente', session.id)
    return
  }

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

  if (!customerId || !subscriptionId) {
    console.error('[stripe] checkout.session.completed: customer ou subscription ausente')
    return
  }

  // Busca o status real da subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  await db.agency.update({
    where: { id: agencyId },
    data: {
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripeSubscriptionStatus: subscription.status,
    },
  })
}

async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  const subscription = event.data.object

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  const agency = await getAgencyByStripeCustomerId(customerId)
  if (!agency) {
    console.error('[stripe] subscription.updated: agência não encontrada para customer', customerId)
    return
  }

  // Determina o novo plano pelo price ID
  const priceId = subscription.items.data[0]?.price.id
  const newPlan = priceId ? getPlanByPriceId(priceId) : null

  await db.agency.update({
    where: { id: agency.id },
    data: {
      stripeSubscriptionStatus: subscription.status,
      ...(newPlan ? { plan: newPlan } : {}),
    },
  })
}

async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const subscription = event.data.object

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  const agency = await getAgencyByStripeCustomerId(customerId)
  if (!agency) {
    console.error('[stripe] subscription.deleted: agência não encontrada para customer', customerId)
    return
  }

  await db.agency.update({
    where: { id: agency.id },
    data: {
      plan: 'STARTER',
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: 'canceled',
    },
  })
}

async function handleInvoicePaymentFailed(event: Stripe.InvoicePaymentFailedEvent) {
  const invoice = event.data.object

  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

  if (!customerId) return

  const agency = await getAgencyByStripeCustomerId(customerId)
  if (!agency) return

  await db.agency.update({
    where: { id: agency.id },
    data: { stripeSubscriptionStatus: 'past_due' },
  })

  // Notifica o admin da agência sobre a falha no pagamento
  const admin = await db.user.findFirst({
    where: { agencyId: agency.id, role: 'AGENCY_ADMIN' },
    select: { email: true, name: true },
  })

  if (admin?.email) {
    void sendPaymentFailedEmail({
      to: admin.email,
      name: admin.name,
      agencyName: agency.name,
    })
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe] Assinatura inválida:', err)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event as Stripe.CheckoutSessionCompletedEvent)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event as Stripe.CustomerSubscriptionUpdatedEvent)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event as Stripe.CustomerSubscriptionDeletedEvent)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event as Stripe.InvoicePaymentFailedEvent)
        break

      default:
        // Evento não tratado — ignora silenciosamente
        break
    }
  } catch (err) {
    console.error(`[stripe] Erro ao processar evento ${event.type}:`, err)
    // Retorna 500 para que o Stripe tente reenviar o evento
    return NextResponse.json({ error: 'Erro interno ao processar evento' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
