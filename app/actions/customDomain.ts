'use server'

import { resolveCname } from 'dns/promises'
import { z } from 'zod'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'

const domainSchema = z
  .string()
  .min(3)
  .max(253)
  .regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
    'Formato de domínio inválido',
  )

export async function saveCustomDomain(domain: string) {
  const session = await requireAgencyAdmin()

  const parsed = domainSchema.safeParse(domain.trim().toLowerCase())
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? 'Domínio inválido' }
  }

  const cleanDomain = parsed.data

  const conflict = await db.whiteLabelConfig.findFirst({
    where: { customDomain: cleanDomain, NOT: { agencyId: session.agencyId } },
  })
  if (conflict) {
    return { success: false as const, error: 'Este domínio já está sendo usado por outra agência' }
  }

  await db.whiteLabelConfig.upsert({
    where: { agencyId: session.agencyId },
    update: { customDomain: cleanDomain, customDomainVerified: false },
    create: { agencyId: session.agencyId, customDomain: cleanDomain, customDomainVerified: false },
  })

  return { success: true as const, domain: cleanDomain }
}

export async function verifyCustomDomain() {
  const session = await requireAgencyAdmin()

  const config = await db.whiteLabelConfig.findUnique({
    where: { agencyId: session.agencyId },
  })

  if (!config?.customDomain) {
    return { success: false as const, error: 'Nenhum domínio configurado para verificar' }
  }

  const domain = config.customDomain

  try {
    const cnames = await resolveCname(domain)
    const pointsToVercel = cnames.some((c) => c.toLowerCase().includes('vercel'))
    if (!pointsToVercel) {
      return {
        success: false as const,
        error: 'CNAME não aponta para o Vercel. Verifique a configuração e aguarde a propagação do DNS (pode levar até 24h).',
      }
    }
  } catch {
    return {
      success: false as const,
      error: 'DNS ainda não propagou. Verifique o registro CNAME e tente novamente em alguns minutos.',
    }
  }

  const vercelOk = await addDomainToVercel(domain)
  if (!vercelOk) {
    return { success: false as const, error: 'Erro ao registrar domínio no Vercel. Tente novamente.' }
  }

  await db.whiteLabelConfig.update({
    where: { agencyId: session.agencyId },
    data: { customDomainVerified: true },
  })

  return { success: true as const }
}

export async function removeCustomDomain() {
  const session = await requireAgencyAdmin()

  const config = await db.whiteLabelConfig.findUnique({
    where: { agencyId: session.agencyId },
  })

  if (!config?.customDomain) {
    return { success: false as const, error: 'Nenhum domínio configurado' }
  }

  if (config.customDomainVerified) {
    await removeDomainFromVercel(config.customDomain)
  }

  await db.whiteLabelConfig.update({
    where: { agencyId: session.agencyId },
    data: { customDomain: null, customDomainVerified: false },
  })

  return { success: true as const }
}

async function addDomainToVercel(domain: string): Promise<boolean> {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !projectId) return true // sem config em dev, deixa passar

  const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: domain }),
  })

  return res.ok || res.status === 409 // 409 = já existe, tudo bem
}

async function removeDomainFromVercel(domain: string): Promise<void> {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !projectId) return

  await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}
