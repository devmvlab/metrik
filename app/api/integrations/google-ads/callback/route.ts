import { NextRequest, NextResponse } from 'next/server'
import { handleGoogleAdsCallback } from '@/lib/integrations/google-ads/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const code = searchParams.get('code')
  const clientId = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${clientId}?integration=google-ads&status=denied`, request.url)
    )
  }

  if (!code || !clientId) {
    return NextResponse.redirect(
      new URL(`/dashboard/clientes?integration=google-ads&status=error&reason=missing_params`, request.url)
    )
  }

  try {
    await handleGoogleAdsCallback(code, clientId)
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${clientId}?integration=google-ads&status=success`, request.url)
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[Google Ads callback]', message)
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${clientId}?integration=google-ads&status=error&reason=${encodeURIComponent(message)}`, request.url)
    )
  }
}
