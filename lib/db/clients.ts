import { db } from '@/lib/db'

export async function getClientsByAgency(agencyId: string) {
  return db.client.findMany({
    where: { agencyId },
    include: {
      integrations: {
        select: { platform: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getClientById(clientId: string, agencyId: string) {
  return db.client.findFirst({
    where: { id: clientId, agencyId },
    include: {
      integrations: true,
      users: { select: { id: true, name: true, email: true } },
    },
  })
}
