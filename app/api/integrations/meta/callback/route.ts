import { NextRequest, NextResponse } from 'next/server'
import { handleMetaCallback } from '@/lib/integrations/meta/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const code = searchParams.get('code')
  const clientId = searchParams.get('state')
  const error = searchParams.get('error')

  // Usuário negou o acesso no Meta
  if (error) {
    const desc = searchParams.get('error_description') ?? error
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${clientId}?integration=meta&status=denied&reason=${encodeURIComponent(desc)}`, request.url)
    )
  }

  if (!code || !clientId) {
    return NextResponse.redirect(
      new URL(`/dashboard/clientes?integration=meta&status=error&reason=missing_params`, request.url)
    )
  }

  try {
    await handleMetaCallback(code, clientId)
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${clientId}?integration=meta&status=success`, request.url)
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[Meta callback]', message)
    return NextResponse.redirect(
      new URL(`/dashboard/clientes/${clientId}?integration=meta&status=error&reason=${encodeURIComponent(message)}`, request.url)
    )
  }
}
