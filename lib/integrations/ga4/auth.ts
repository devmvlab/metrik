import { db } from '@/lib/db'
import { encrypt } from '@/lib/utils/crypto'

const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly']
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

function getRedirectUri(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/ga4/callback`
}

/**
 * Gera a URL de autorização OAuth para o GA4.
 * Escopo separado do Google Ads — cada integração tem sua própria autorização.
 */
export function getGA4AuthUrl(clientId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: clientId,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Troca o code por tokens, busca o property_id da GA4
 * e salva encriptado com status CONNECTED.
 */
export async function handleGA4Callback(code: string, clientId: string): Promise<void> {
  // 1. Trocar code por tokens
  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code',
    }).toString(),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.json()
    throw new Error(`GA4 OAuth token exchange falhou: ${err.error_description ?? tokenRes.statusText}`)
  }

  const tokenData = await tokenRes.json()
  const accessToken: string = tokenData.access_token
  const refreshToken: string = tokenData.refresh_token

  if (!refreshToken) {
    throw new Error('Google não retornou refresh_token — usuário pode precisar revogar e reconectar')
  }

  // 2. Listar propriedades GA4 via Admin API
  const propertiesRes = await fetch(
    'https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=10',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  let propertyId = 'unknown'
  if (propertiesRes.ok) {
    const propertiesData = await propertiesRes.json()
    // propertySummaries[0].property vem no formato "properties/XXXXXXXXX"
    const firstProperty = propertiesData.accountSummaries?.[0]?.propertySummaries?.[0]
    if (firstProperty?.property) {
      propertyId = (firstProperty.property as string).replace('properties/', '')
    }
  }

  // 3. Upsert na tabela Integration
  await db.integration.upsert({
    where: { clientId_platform: { clientId, platform: 'GA4' } },
    create: {
      clientId,
      platform: 'GA4',
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      accountId: propertyId,
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
    update: {
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      accountId: propertyId,
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
  })
}
