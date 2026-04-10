import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

/**
 * Callback OAuth do Supabase (PKCE flow).
 *
 * Supabase redireciona aqui após:
 *   - Login com Google
 *   - Aceitação de link de convite de cliente
 *
 * Query params recebidos:
 *   - code: código PKCE para trocar por sessão
 *   - next: URL para redirecionar após sucesso (ex: /convite, /dashboard)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=callback-sem-codigo`)
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=callback-falhou`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=usuario-nao-encontrado`)
  }

  const role = user.app_metadata?.role as string | undefined

  // ---------------------------------------------------------------------------
  // Google OAuth: novo usuário (sem agency_id no app_metadata)
  // Redireciona para onboarding para completar o cadastro da agência
  // ---------------------------------------------------------------------------
  if (!role) {
    // Verifica se já existe User no banco (caso o callback seja chamado duas vezes)
    const existingUser = await db.user.findUnique({ where: { id: user.id } })

    if (existingUser) {
      // Usuário já configurado — restaura app_metadata e segue
      const adminSupabase = createAdminClient()
      await adminSupabase.auth.admin.updateUserById(user.id, {
        app_metadata: {
          agency_id: existingUser.agencyId,
          role: existingUser.role,
          ...(existingUser.clientId ? { client_id: existingUser.clientId } : {}),
        },
      })
      const redirectTo = existingUser.role === 'CLIENT_VIEWER' ? '/client' : '/dashboard'
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }

    // Novo usuário via Google OAuth → precisa criar agência
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  // ---------------------------------------------------------------------------
  // Usuário já configurado → redireciona para a rota correta
  // ---------------------------------------------------------------------------
  return NextResponse.redirect(`${origin}${next}`)
}
