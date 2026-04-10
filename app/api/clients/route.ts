import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { sendClientInviteEmail } from '@/lib/email/invite'

const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
})

export async function POST(request: Request) {
  // 1. Autenticação — apenas agency_admin
  const session = await requireAgencyAdmin()

  // 2. Validação do body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const parse = createClientSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 422 })
  }

  const { name, email } = parse.data
  const agencyId = session.agencyId // sempre da session, nunca do body

  // 3. Verifica se já existe cliente com esse email nesta agência
  const existing = await db.client.findFirst({ where: { email, agencyId } })
  if (existing) {
    return NextResponse.json(
      { error: 'Já existe um cliente com este email nesta agência' },
      { status: 409 },
    )
  }

  // 4. Busca o nome da agência para o email
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: { name: true },
  })

  if (!agency) {
    return NextResponse.json({ error: 'Agência não encontrada' }, { status: 404 })
  }

  const adminSupabase = createAdminClient()

  // 5. Cria o cliente no banco
  const client = await db.client.create({
    data: { name, email, agencyId },
  })

  // 6. Gera link de convite via Supabase Auth
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/convite`,
      data: {
        name,
        agency_id: agencyId,
        client_id: client.id,
        role: 'CLIENT_VIEWER',
      },
    },
  })

  if (linkError || !linkData.properties?.action_link) {
    // Rollback do cliente criado se o convite falhou
    await db.client.delete({ where: { id: client.id } })
    return NextResponse.json({ error: 'Erro ao gerar link de convite' }, { status: 500 })
  }

  // 7. Cria o usuário no banco (será vinculado ao Supabase Auth quando aceitar o convite)
  // O Supabase Auth cria o usuário ao gerar o link de invite
  const authUserId = linkData.user?.id
  if (authUserId) {
    await db.user.create({
      data: {
        id: authUserId,
        email,
        name,
        role: 'CLIENT_VIEWER',
        agencyId,
        clientId: client.id,
      },
    })

    // Atualiza app_metadata com role e ids para o JWT
    await adminSupabase.auth.admin.updateUserById(authUserId, {
      app_metadata: {
        agency_id: agencyId,
        role: 'CLIENT_VIEWER',
        client_id: client.id,
      },
    })
  }

  // 8. Envia email de convite
  try {
    await sendClientInviteEmail({
      to: email,
      clientName: name,
      agencyName: agency.name,
      inviteUrl: linkData.properties.action_link,
    })
  } catch (emailErr) {
    // Email falhou mas cliente foi criado — não é crítico, logar e continuar
    console.error('[invite] Falha ao enviar email de convite para', email, emailErr)
  }

  return NextResponse.json({ client }, { status: 201 })
}
