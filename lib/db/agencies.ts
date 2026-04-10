import { db } from '@/lib/db'

export async function getAgencyById(agencyId: string) {
  return db.agency.findUnique({
    where: { id: agencyId },
    include: { whiteLabelConfig: true },
  })
}

export async function getAgencyStats(agencyId: string) {
  const [totalClients, activeClients] = await Promise.all([
    db.client.count({ where: { agencyId } }),
    db.client.count({ where: { agencyId, status: 'ACTIVE' } }),
  ])

  return { totalClients, activeClients }
}
