import { NextResponse } from 'next/server'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { sendClientInviteEmail } from '@/lib/email/invite'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireAgencyAdmin()

  const [agency, client] = await Promise.all([
    db.agency.findUnique({ where: { id: session.agencyId }, select: { name: true } }),
    db.client.findFirst({
      where: { id: params.id, agencyId: session.agencyId },
      select: { id: true, name: true, email: true },
    }),
  ])

  if (!client) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  if (!agency) {
    return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 })
  }

  const adminSupabase = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: 'invite',
    email: client.email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/convite`,
      data: {
        name: client.name,
        agency_id: session.agencyId,
        client_id: client.id,
        role: 'CLIENT_VIEWER',
      },
    },
  })

  if (linkError || !linkData.properties?.action_link) {
    return NextResponse.json({ error: 'Erro ao gerar link de convite' }, { status: 500 })
  }

  // Garante que o user no banco existe e tem app_metadata correto
  const authUserId = linkData.user?.id
  if (authUserId) {
    await db.user.upsert({
      where: { id: authUserId },
      create: {
        id: authUserId,
        email: client.email,
        name: client.name,
        role: 'CLIENT_VIEWER',
        agencyId: session.agencyId,
        clientId: client.id,
      },
      update: {},
    })

    await adminSupabase.auth.admin.updateUserById(authUserId, {
      app_metadata: {
        agency_id: session.agencyId,
        role: 'CLIENT_VIEWER',
        client_id: client.id,
      },
    })
  }

  try {
    await sendClientInviteEmail({
      to: client.email,
      clientName: client.name,
      agencyName: agency.name,
      inviteUrl: linkData.properties.action_link,
    })
  } catch (emailErr) {
    const message = emailErr instanceof Error ? emailErr.message : String(emailErr)
    console.error('[invite] Falha ao reenviar email de convite para', client.email, message)
    return NextResponse.json({ error: `Erro ao enviar email: ${message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
