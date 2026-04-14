'use server'

import { z } from 'zod'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { sendClientInviteEmail } from '@/lib/email/invite'
import { getPlanLimit, PLAN_LABELS, isAtPlanLimit } from '@/lib/billing/plans'

const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
})

export type CreateClientResult =
  | { success: true }
  | { success: false; error: string }

export async function createClientAction(
  _prevState: CreateClientResult | null,
  formData: FormData,
): Promise<CreateClientResult> {
  const session = await requireAgencyAdmin()

  const parse = createClientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!parse.success) {
    return { success: false, error: parse.error.issues[0].message }
  }

  const { name, email } = parse.data
  const agencyId = session.agencyId

  const [agency, currentCount, existing] = await Promise.all([
    db.agency.findUnique({ where: { id: agencyId }, select: { name: true, plan: true } }),
    db.client.count({ where: { agencyId } }),
    db.client.findFirst({ where: { email, agencyId } }),
  ])

  if (!agency) {
    return { success: false, error: 'Agência não encontrada' }
  }

  if (isAtPlanLimit(agency.plan, currentCount)) {
    const limit = getPlanLimit(agency.plan)
    return {
      success: false,
      error: `Limite de ${limit} clientes do plano ${PLAN_LABELS[agency.plan]} atingido. Faça upgrade para continuar.`,
    }
  }

  if (existing) {
    return { success: false, error: 'Já existe um cliente com este email nesta agência' }
  }

  const adminSupabase = createAdminClient()

  const client = await db.client.create({
    data: { name, email, agencyId },
  })

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
    await db.client.delete({ where: { id: client.id } })
    return { success: false, error: 'Erro ao gerar link de convite' }
  }

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

    await adminSupabase.auth.admin.updateUserById(authUserId, {
      app_metadata: {
        agency_id: agencyId,
        role: 'CLIENT_VIEWER',
        client_id: client.id,
      },
    })
  }

  try {
    await sendClientInviteEmail({
      to: email,
      clientName: name,
      agencyName: agency.name,
      inviteUrl: linkData.properties.action_link,
    })
  } catch (emailErr) {
    console.error('[invite] Falha ao enviar email de convite para', email, emailErr)
  }

  return { success: true }
}
