import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Client Supabase para uso em Server Components, Server Actions e Route Handlers.
 * Lê e escreve cookies automaticamente para manter a sessão.
 * Usa a chave anon (permissões do usuário autenticado).
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Em Server Components o cookie não pode ser escrito (read-only).
            // Isso é esperado — a atualização da sessão ocorre no middleware.
          }
        },
      },
    },
  )
}
