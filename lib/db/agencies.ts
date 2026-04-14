import { db } from '@/lib/db'

export async function getAgencyById(agencyId: string) {
  return db.agency.findUnique({
    where: { id: agencyId },
    include: { whiteLabelConfig: true },
  })
}

export async function getAgencyStats(agencyId: string) {
  const [totalClients, activeClients, connectedIntegrations] = await Promise.all([
    db.client.count({ where: { agencyId } }),
    db.client.count({ where: { agencyId, status: 'ACTIVE' } }),
    db.integration.count({ where: { client: { agencyId }, status: 'CONNECTED' } }),
  ])

  return { totalClients, activeClients, hasConnectedIntegration: connectedIntegrations > 0 }
}

/**
 * Busca agência pelo Stripe Customer ID.
 * Usado nos webhooks do Stripe para associar eventos à agência certa.
 */
export async function getAgencyByStripeCustomerId(stripeCustomerId: string) {
  return db.agency.findFirst({ where: { stripeCustomerId } })
}

/**
 * Retorna a agência com o total de clientes cadastrados.
 * Usado para verificar uso do plano e exibir barra de progresso.
 */
export async function getAgencyWithPlanUsage(agencyId: string) {
  const [agency, clientCount] = await Promise.all([
    db.agency.findUnique({
      where: { id: agencyId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        trialEndsAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        createdAt: true,
        whiteLabelConfig: true,
      },
    }),
    db.client.count({ where: { agencyId } }),
  ])

  if (!agency) return null

  return { ...agency, clientCount }
}
