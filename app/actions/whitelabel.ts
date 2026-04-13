'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

const whitelabelSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida. Use o formato #RRGGBB.')
    .optional()
    .or(z.literal('')),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

type WhitelabelResult =
  | { success: true; message: string }
  | { success: false; error: string; code: string }

export async function updateWhitelabel(formData: FormData): Promise<WhitelabelResult> {
  const session = await requireAgencyAdmin()

  // Upload de logo se enviado como arquivo
  let logoUrl: string | undefined
  const logoFile = formData.get('logoFile') as File | null

  if (logoFile && logoFile.size > 0) {
    if (logoFile.size > 2 * 1024 * 1024) {
      return { success: false, error: 'A imagem deve ter no máximo 2MB.', code: 'FILE_TOO_LARGE' }
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(logoFile.type)) {
      return {
        success: false,
        error: 'Formato inválido. Use PNG, JPG, SVG ou WebP.',
        code: 'INVALID_FILE_TYPE',
      }
    }

    const ext = logoFile.name.split('.').pop() ?? 'png'
    const path = `logos/${session.agencyId}/logo.${ext}`

    const supabase = createAdminClient()
    const { error: uploadError } = await supabase.storage
      .from('agency-assets')
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type })

    if (uploadError) {
      console.error('[whitelabel] upload error:', uploadError.message)
      return { success: false, error: 'Erro ao enviar imagem. Tente novamente.', code: 'UPLOAD_ERROR' }
    }

    const { data: publicUrlData } = supabase.storage.from('agency-assets').getPublicUrl(path)
    logoUrl = publicUrlData.publicUrl
  }

  // Valida campos de texto
  const parsed = whitelabelSchema.safeParse({
    primaryColor: formData.get('primaryColor') as string,
    logoUrl: logoUrl ?? (formData.get('logoUrl') as string),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
      code: 'VALIDATION_ERROR',
    }
  }

  try {
    await db.whiteLabelConfig.upsert({
      where: { agencyId: session.agencyId },
      create: {
        agencyId: session.agencyId,
        primaryColor: parsed.data.primaryColor || null,
        logoUrl: parsed.data.logoUrl || null,
      },
      update: {
        ...(parsed.data.primaryColor !== undefined && {
          primaryColor: parsed.data.primaryColor || null,
        }),
        ...(parsed.data.logoUrl !== undefined && {
          logoUrl: parsed.data.logoUrl || null,
        }),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/configuracoes')

    return { success: true, message: 'Configurações salvas com sucesso.' }
  } catch {
    return { success: false, error: 'Erro ao salvar configurações.', code: 'INTERNAL_ERROR' }
  }
}
