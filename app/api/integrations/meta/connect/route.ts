import { NextRequest, NextResponse } from 'next/server'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getClientById } from '@/lib/db/clients'
import { getMetaAuthUrl } from '@/lib/integrations/meta/auth'

export async function GET(request: NextRequest) {
  const session = await requireAgencyAdmin()

  const clientId = request.nextUrl.searchParams.get('client_id')
  if (!clientId) {
    return NextResponse.json({ error: 'client_id obrigatório', code: 'MISSING_CLIENT_ID' }, { status: 400 })
  }

  // Confirmar que o cliente pertence à agência autenticada
  const client = await getClientById(clientId, session.agencyId)
  if (!client) {
    return NextResponse.json({ error: 'Cliente não encontrado', code: 'CLIENT_NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.redirect(getMetaAuthUrl(clientId))
}
