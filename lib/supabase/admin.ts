import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase com service role key.
 * Bypassa RLS e tem permissão de admin (criar usuários, definir app_metadata, etc.).
 *
 * NUNCA use este client em componentes client-side ou exponha a service role key.
 * Use APENAS em Server Actions, Route Handlers e código server-only.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
