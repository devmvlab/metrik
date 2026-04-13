import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Propaga o pathname para Server Components via header (lido com headers() nos layouts)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

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
  // getUser() valida o JWT contra o servidor Supabase e atualiza o token se necessário.
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
      // CLIENT_VIEWER tentando acessar o painel da agência
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
      // AGENCY_ADMIN tentando acessar área do cliente
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // ---------------------------------------------------------------------------
  // /onboarding — requer usuário autenticado mas SEM agency_id ainda
  // (Google OAuth: usuário criado mas agência não configurada)
  // ---------------------------------------------------------------------------
  if (pathname.startsWith('/onboarding')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Se já tem agency_id, o onboarding já foi concluído
    if (role) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Aplica o middleware em todas as rotas, exceto assets estáticos
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
