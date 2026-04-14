import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Role } from '@prisma/client'

export type SessionUser = {
  id: string
  email: string
  agencyId: string
  role: Role
  clientId?: string
}

/**
 * Retorna o usuário autenticado com agency_id e role do app_metadata.
 * Usa getUser() (valida JWT contra o servidor) — seguro para uso em Server Components.
 * Retorna null se não houver sessão ou se o usuário não tiver app_metadata configurado.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const { agency_id, role, client_id } = user.app_metadata ?? {}

  // Usuário existe no Supabase Auth mas ainda não tem app_metadata configurado
  // (ex.: recém cadastrado via Google OAuth antes de completar onboarding)
  if (!agency_id || !role) return null

  return {
    id: user.id,
    email: user.email!,
    agencyId: agency_id as string,
    role: role as Role,
    clientId: client_id as string | undefined,
  }
})

/**
 * Retorna o usuário autenticado ou redireciona para /login.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

/**
 * Requer usuário autenticado com role AGENCY_ADMIN.
 * Redireciona para /login se não autenticado, ou para /login se role incorreto.
 */
export async function requireAgencyAdmin(): Promise<SessionUser> {
  const session = await requireSession()
  if (session.role !== 'AGENCY_ADMIN') redirect('/client')
  return session
}

/**
 * Requer usuário autenticado com role CLIENT_VIEWER.
 * Redireciona para /dashboard se for um admin tentando acessar área do cliente.
 */
export async function requireClientViewer(): Promise<SessionUser> {
  const session = await requireSession()
  if (session.role !== 'CLIENT_VIEWER') redirect('/dashboard')
  return session
}
