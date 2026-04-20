import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { resolveAgencyFromHost } from '@/lib/db/tenantResolver'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // ---------------------------------------------------------------------------
  // Resolução de tenant por domínio (subdomínio Metrik ou domínio próprio)
  // Feito antes do auth check para que os headers estejam disponíveis nos layouts.
  // Para usuários já autenticados em subdomínio, o agencyId vem do JWT —
  // mas ainda injetamos os dados de white-label para o layout do cliente usá-los.
  // ---------------------------------------------------------------------------
  const agencyCtx = await resolveAgencyFromHost(host)
  if (agencyCtx) {
    requestHeaders.set('x-agency-id', agencyCtx.id)
    requestHeaders.set('x-agency-name', agencyCtx.name)
    requestHeaders.set('x-agency-slug', agencyCtx.slug)
    requestHeaders.set('x-agency-plan', agencyCtx.plan)
    if (agencyCtx.logoUrl) requestHeaders.set('x-agency-logo-url', agencyCtx.logoUrl)
    if (agencyCtx.primaryColor) requestHeaders.set('x-agency-primary-color', agencyCtx.primaryColor)
    if (agencyCtx.secondaryColor) requestHeaders.set('x-agency-secondary-color', agencyCtx.secondaryColor)
  }

  // Inicializa a resposta padrão com os headers modificados
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  // Client do Supabase no middleware — lê e atualiza cookies de sessão
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Propaga os cookies atualizados tanto na request quanto na response
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANTE: Não insira código entre createServerClient e getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user?.app_metadata?.role as string | undefined

  // ---------------------------------------------------------------------------
  // Rotas públicas de auth: redirecionar usuários já autenticados
  // ---------------------------------------------------------------------------
  const isAuthPage = pathname === '/login' || pathname === '/cadastro'

  if (isAuthPage && user && role) {
    const url = request.nextUrl.clone()
    url.pathname = role === 'CLIENT_VIEWER' ? '/client' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // ---------------------------------------------------------------------------
  // /dashboard/* — requer AGENCY_ADMIN
  // ---------------------------------------------------------------------------
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (role !== 'AGENCY_ADMIN') {
      const url = request.nextUrl.clone()
      url.pathname = '/client'
      return NextResponse.redirect(url)
    }
  }

  // ---------------------------------------------------------------------------
  // /client/* — requer CLIENT_VIEWER
  // ---------------------------------------------------------------------------
  if (pathname.startsWith('/client')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (role !== 'CLIENT_VIEWER') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // ---------------------------------------------------------------------------
  // /onboarding — requer usuário autenticado mas SEM agency_id ainda
  // ---------------------------------------------------------------------------
  if (pathname.startsWith('/onboarding')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (role) {
      const url = request.nextUrl.clone()
      url.pathname = role === 'CLIENT_VIEWER' ? '/client' : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
