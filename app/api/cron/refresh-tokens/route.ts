import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { refreshMetaToken, refreshGoogleToken } from '@/lib/integrations/refresh'
import { sendIntegrationExpiredEmail } from '@/lib/email'

/**
 * Rota de cron chamada pelo Vercel a cada 6 horas.
 * Renova tokens que expiram em menos de 24h.
 * Protegida por CRON_SECRET no header Authorization.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  // Buscar integrações conectadas cujo token expira em menos de 24h
  // O Meta não tem expires_at explícito — renovamos todas as CONNECTED do Meta por precaução
  // O Google tem token de 1h — qualquer CONNECTED com lastSyncAt > 50min é candidata
  const integrations = await db.integration.findMany({
    where: {
      status: 'CONNECTED',
      OR: [
        // Meta: renovar se não sincronizou nas últimas 50 horas (token dura ~60 dias)
        {
          platform: 'META_ADS',
          lastSyncAt: { lt: new Date(Date.now() - 50 * 60 * 60 * 1000) },
        },
        // Google: renovar se o último sync foi há mais de 50 minutos (token dura 1h)
        {
          platform: { in: ['GOOGLE_ADS', 'GA4'] },
          lastSyncAt: { lt: new Date(Date.now() - 50 * 60 * 1000) },
        },
      ],
    },
    select: { id: true, platform: true },
  })

  const results = { refreshed: 0, failed: 0 }

  await Promise.allSettled(
    integrations.map(async (integration) => {
      const success =
        integration.platform === 'META_ADS'
          ? await refreshMetaToken(integration.id)
          : await refreshGoogleToken(integration.id)

      if (success) {
        results.refreshed++
        return
      }

      results.failed++

      // Notifica o admin da agência sobre a integração expirada
      const integrationWithRelations = await db.integration.findUnique({
        where: { id: integration.id },
        include: {
          client: {
            include: {
              agency: {
                include: {
                  users: { where: { role: 'AGENCY_ADMIN' }, take: 1 },
                },
              },
            },
          },
        },
      })

      const admin = integrationWithRelations?.client.agency.users[0]
      if (admin?.email) {
        void sendIntegrationExpiredEmail({
          to: admin.email,
          name: admin.name,
          agencyName: integrationWithRelations!.client.agency.name,
          platform: integration.platform,
          clientName: integrationWithRelations!.client.name,
          clientId: integrationWithRelations!.client.id,
        })
      }
    }),
  )

  console.log('[cron/refresh-tokens]', results)

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...results,
  })
}
