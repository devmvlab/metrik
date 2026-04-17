import type { Plan } from '@prisma/client'

export const PLAN_LIMITS: Record<Plan, number> = {
  STARTER: 5,
  PRO: 15,
  AGENCY: 40,
}

export const PLAN_LABELS: Record<Plan, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  AGENCY: 'Agency',
}

export const PLAN_PRICES: Record<Plan, string> = {
  STARTER: 'R$ 197/mês',
  PRO: 'R$ 397/mês',
  AGENCY: 'R$ 697/mês',
}

export function getPlanLimit(plan: Plan): number {
  return PLAN_LIMITS[plan]
}

/** Retorna true se o número de clientes atingiu o limite do plano */
export function isAtPlanLimit(plan: Plan, clientCount: number): boolean {
  return clientCount >= PLAN_LIMITS[plan]
}

/** Retorna o Stripe Price ID configurado para o plano */
export function getStripePriceId(plan: Plan): string {
  const ids: Record<Plan, string | undefined> = {
    STARTER: process.env.STRIPE_PRICE_ID_STARTER,
    PRO: process.env.STRIPE_PRICE_ID_PRO,
    AGENCY: process.env.STRIPE_PRICE_ID_AGENCY,
  }
  const id = ids[plan]
  if (!id) throw new Error(`STRIPE_PRICE_ID_${plan} não configurado nas variáveis de ambiente`)
  return id
}

/**
 * Retorna o label correto considerando o estado atual da conta.
 * Mostra "Trial Gratuito" quando não há assinatura Stripe e o trial ainda está ativo.
 */
export function getDisplayPlanLabel(agency: {
  plan: Plan
  stripeSubscriptionStatus: string | null
  trialEndsAt: Date | null
}): string {
  const hasStripeSubscription =
    agency.stripeSubscriptionStatus === 'active' ||
    agency.stripeSubscriptionStatus === 'trialing' ||
    agency.stripeSubscriptionStatus === 'incomplete' ||
    agency.stripeSubscriptionStatus === 'past_due'

  const isInTrial =
    !hasStripeSubscription &&
    agency.trialEndsAt != null &&
    new Date(agency.trialEndsAt) > new Date()

  if (isInTrial) return 'Trial Gratuito'
  return PLAN_LABELS[agency.plan] ?? agency.plan
}

/**
 * Mapeia um Stripe Price ID de volta para o plano correspondente.
 * Retorna null se o priceId não corresponder a nenhum plano configurado.
 */
export function getPlanByPriceId(priceId: string): Plan | null {
  const entries: Array<[string | undefined, Plan]> = [
    [process.env.STRIPE_PRICE_ID_STARTER, 'STARTER'],
    [process.env.STRIPE_PRICE_ID_PRO, 'PRO'],
    [process.env.STRIPE_PRICE_ID_AGENCY, 'AGENCY'],
  ]
  for (const [id, plan] of entries) {
    if (id && id === priceId) return plan
  }
  return null
}
