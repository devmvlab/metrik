import { NextRequest, NextResponse } from 'next/server'
import { handleGA4Callback } from '@/lib/integrations/ga4/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const code = searchParams.get('code')
  const clientId = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${clientId}?integration=ga4&status=denied`, request.url)
    )
  }

  if (!code || !clientId) {
    return NextResponse.redirect(
      new URL(`/dashboard/clientes?integration=ga4&status=error&reason=missing_params`, request.url)
    )
  }

  try {
    await handleGA4Callback(code, clientId)
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${clientId}?integration=ga4&status=success`, request.url)
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[GA4 callback]', message)
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${clientId}?integration=ga4&status=error&reason=${encodeURIComponent(message)}`, request.url)
    )
  }
}
