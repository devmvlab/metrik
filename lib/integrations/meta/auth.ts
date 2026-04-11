import { db } from '@/lib/db'
import { encrypt } from '@/lib/utils/crypto'

const META_API_BASE = 'https://graph.facebook.com/v19.0'
const SCOPES = ['ads_read', 'ads_management'].join(',')

function getRedirectUri(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/meta/callback`
}

/**
 * Gera a URL de autorização OAuth do Meta.
 * O state é o clientId — usado no callback para saber a qual cliente associar.
 */
export function getMetaAuthUrl(clientId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    response_type: 'code',
    state: clientId,
  })

  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
}

/**
 * Troca o code pelo access_token, busca o ad account_id
 * e salva a integração no banco com tokens encriptados.
 */
export async function handleMetaCallback(code: string, clientId: string): Promise<void> {
  // 1. Trocar code por access_token
  const tokenParams = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: getRedirectUri(),
    code,
  })

  const tokenRes = await fetch(`${META_API_BASE}/oauth/access_token?${tokenParams.toString()}`)
  if (!tokenRes.ok) {
    const err = await tokenRes.json()
    throw new Error(`Meta OAuth token exchange falhou: ${err.error?.message ?? tokenRes.statusText}`)
  }
  const tokenData = await tokenRes.json()
  const accessToken: string = tokenData.access_token

  // 2. Buscar a primeira ad account associada ao token
  const accountsRes = await fetch(
    `${META_API_BASE}/me/adaccounts?fields=id,name&access_token=${accessToken}`
  )
  if (!accountsRes.ok) {
    throw new Error('Falha ao buscar ad accounts do Meta')
  }
  const accountsData = await accountsRes.json()
  const firstAccount = accountsData.data?.[0]
  if (!firstAccount) {
    throw new Error('Nenhuma ad account encontrada para este usuário do Meta')
  }

  // account_id vem no formato "act_XXXXXXXXX" — remover o prefixo para armazenar
  const accountId: string = firstAccount.id.replace('act_', '')

  // 3. Upsert na tabela Integration (um cliente só tem uma integração por plataforma)
  await db.integration.upsert({
    where: { clientId_platform: { clientId, platform: 'META_ADS' } },
    create: {
      clientId,
      platform: 'META_ADS',
      accessToken: encrypt(accessToken),
      accountId,
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
    update: {
      accessToken: encrypt(accessToken),
      accountId,
      status: 'CONNECTED',
      lastSyncAt: new Date(),
    },
  })
}
