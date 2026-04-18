import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'

const patchSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAgencyAdmin()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const parse = patchSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 422 })
  }

  const client = await db.client.findFirst({
    where: { id: params.id, agencyId: session.agencyId },
  })

  if (!client) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  const updated = await db.client.update({
    where: { id: params.id },
    data: { status: parse.data.status },
  })

  return NextResponse.json({ client: updated })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireAgencyAdmin()

  const client = await db.client.findFirst({
    where: { id: params.id, agencyId: session.agencyId },
  })

  if (!client) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  await db.client.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
