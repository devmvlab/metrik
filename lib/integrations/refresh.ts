import { db } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/utils/crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const META_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token'

/**
 * Renova o access_token do Meta Ads via long-lived token exchange.
 * Meta não usa refresh_token — em vez disso, troca o token atual por um novo.
 * Se falhar, marca a integração como EXPIRED e retorna false.
 * Retorna true em caso de sucesso.
 */
export async function refreshMetaToken(integrationId: string): Promise<boolean> {
  const integration = await db.integration.findUnique({ where: { id: integrationId } })
  if (!integration) return false

  try {
    const currentToken = decrypt(integration.accessToken)

    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: currentToken,
    })

    const res = await fetch(`${META_TOKEN_URL}?${params.toString()}`)
    if (!res.ok) {
      throw new Error(`Meta token refresh falhou: ${res.statusText}`)
    }

    const data = await res.json()
    if (!data.access_token) {
      throw new Error('Meta não retornou novo access_token')
    }

    await db.integration.update({
      where: { id: integrationId },
      data: {
        accessToken: encrypt(data.access_token),
        status: 'CONNECTED',
        lastSyncAt: new Date(),
      },
    })

    return true
  } catch (err) {
    console.error(`[refresh] Meta integrationId=${integrationId}:`, err)
    await db.integration.update({
      where: { id: integrationId },
      data: { status: 'EXPIRED' },
    })
    return false
  }
}

/**
 * Renova o access_token do Google (Google Ads e GA4 compartilham o mesmo refresh_token).
 * Se falhar, marca a integração como EXPIRED e retorna false.
 * Retorna true em caso de sucesso.
 */
export async function refreshGoogleToken(integrationId: string): Promise<boolean> {
  const integration = await db.integration.findUnique({ where: { id: integrationId } })
  if (!integration || !integration.refreshToken) return false

  try {
    const refreshToken = decrypt(integration.refreshToken)

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Google token refresh falhou: ${err.error_description ?? res.statusText}`)
    }

    const data = await res.json()
    if (!data.access_token) {
      throw new Error('Google não retornou novo access_token')
    }

    await db.integration.update({
      where: { id: integrationId },
      data: {
        accessToken: encrypt(data.access_token),
        status: 'CONNECTED',
        lastSyncAt: new Date(),
      },
    })

    return true
  } catch (err) {
    console.error(`[refresh] Google integrationId=${integrationId}:`, err)
    await db.integration.update({
      where: { id: integrationId },
      data: { status: 'EXPIRED' },
    })
    return false
  }
}
