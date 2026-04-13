import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendTrialExpiringEmail } from '@/lib/email'

/**
 * Cron diário que envia email de aviso 3 dias antes do trial encerrar.
 * Janela de ±12h ao redor de D-3 para disparar exatamente uma vez por trial.
 * Protegido por CRON_SECRET no header Authorization.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  // Janela: agências cujo trial encerra entre 2.5 e 3.5 dias a partir de agora
  const windowStart = new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000)
  const windowEnd = new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000)

  const agencies = await db.agency.findMany({
    where: {
      trialEndsAt: { gte: windowStart, lte: windowEnd },
      stripeCustomerId: null, // ainda não assinou
    },
    include: {
      users: {
        where: { role: 'AGENCY_ADMIN' },
        take: 1,
      },
    },
  })

  const results = { sent: 0, skipped: 0 }

  await Promise.allSettled(
    agencies.map(async (agency) => {
      const admin = agency.users[0]
      if (!admin?.email || !agency.trialEndsAt) {
        results.skipped++
        return
      }

      const daysLeft = Math.ceil(
        (new Date(agency.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )

      await sendTrialExpiringEmail({
        to: admin.email,
        name: admin.name,
        agencyName: agency.name,
        daysLeft,
        trialEndsAt: agency.trialEndsAt,
      })

      results.sent++
    }),
  )

  console.log('[cron/trial-reminder]', results)

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...results,
  })
}
