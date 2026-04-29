import { GoogleAdsApi } from 'google-ads-api'
import { db } from '@/lib/db'
import { encrypt } from '@/lib/utils/crypto'

const SCOPES = ['https://www.googleapis.com/auth/adwords']
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

function getRedirectUri(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-ads/callback`
}

/**
 * Gera a URL de autorização OAuth do Google Ads.
 * access_type=offline para receber refresh_token.
 */
export function getGoogleAdsAuthUrl(clientId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent', // garante refresh_token a cada autorização
    state: clientId,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Troca o code por access_token + refresh_token,
 * busca o customer_id da conta Google Ads e salva encriptado.
 */
export async function handleGoogleAdsCallback(code: string, clientId: string): Promise<void> {
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
    throw new Error(`Google OAuth token exchange falhou: ${err.error_description ?? tokenRes.statusText}`)
  }

  const tokenData = await tokenRes.json()
  const accessToken: string = tokenData.access_token
  const refreshToken: string = tokenData.refresh_token

  if (!refreshToken) {
    throw new Error('Google não retornou refresh_token — usuário pode precisar revogar e reconectar')
  }

  // 2. Buscar customer_id via SDK (evita versão de API hardcoded)
  const adsClient = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '',
  })

  const customersResponse = await adsClient.listAccessibleCustomers(refreshToken)
  const resourceNames = customersResponse.resource_names

  if (!resourceNames || resourceNames.length === 0) {
    throw new Error(
      'Nenhuma conta Google Ads encontrada para este usuário. ' +
      'Verifique se a conta tem acesso ao Google Ads e se o developer token está aprovado.'
    )
  }

  // resourceNames vêm no formato "customers/XXXXXXXXXX"
  const customerId = resourceNames[0].replace('customers/', '')

  // 3. Upsert na tabela Integration
  await db.integration.upsert({
    where: { clientId_platform: { clientId, platform: 'GOOGLE_ADS' } },
    create: {
      clientId,
      platform: 'GOOGLE_ADS',
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      accountId: customerId,
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
    update: {
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      accountId: customerId,
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
  })
}
