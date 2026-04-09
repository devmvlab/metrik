'use server'

import { z } from 'zod'
import { db } from '@/lib/db'

const waitlistSchema = z.object({
  email: z.string().email('Email inválido'),
  agencyName: z.string().max(100).optional(),
})

type WaitlistResult =
  | { success: true; message: string }
  | { success: false; error: string; code: string }

export async function joinWaitlist(
  email: string,
  agencyName?: string
): Promise<WaitlistResult> {
  const parsed = waitlistSchema.safeParse({ email, agencyName })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      code: 'VALIDATION_ERROR',
    }
  }

  try {
    await db.waitlist.create({
      data: {
        email: parsed.data.email,
        agencyName: parsed.data.agencyName,
      },
    })

    return { success: true, message: 'Você entrou na lista! Entraremos em contato em breve.' }
  } catch (error: unknown) {
    const dbError = error as { code?: string }
    if (dbError?.code === 'P2002') {
      return {
        success: false,
        error: 'Este email já está na lista de espera.',
        code: 'DUPLICATE_EMAIL',
      }
    }

    return {
      success: false,
      error: 'Erro ao salvar. Tente novamente.',
      code: 'INTERNAL_ERROR',
    }
  }
}
