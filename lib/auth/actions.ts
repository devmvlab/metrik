'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'

// ---------------------------------------------------------------------------
// Schemas de validação
// ---------------------------------------------------------------------------

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

const signUpSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  agencyName: z.string().min(2, 'Nome da agência deve ter ao menos 2 caracteres'),
})

const setPasswordSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
})

// ---------------------------------------------------------------------------
// Tipos de retorno (para uso com useFormState)
// ---------------------------------------------------------------------------

export type ActionResult = { error: string } | null

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function generateUniqueSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
    .replace(/\s+/g, '-') // espaços → hífens
    .replace(/-+/g, '-') // colapsa hífens repetidos
    .trim()
    .replace(/^-|-$/g, '') // remove hífens nas extremidades

  const slug = base || 'agencia'
  let candidate = slug
  let attempt = 0

  while (true) {
    const existing = await db.agency.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
    attempt++
    candidate = `${slug}-${attempt}`
  }
}

// ---------------------------------------------------------------------------
// signIn — email + senha
// ---------------------------------------------------------------------------

export async function signIn(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const parse = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parse.success) {
    return { error: parse.error.issues[0].message }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(parse.data)

  if (error) {
    return { error: 'Email ou senha incorretos' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role

  redirect(role === 'CLIENT_VIEWER' ? '/client' : '/dashboard')
}

// ---------------------------------------------------------------------------
// signUp — cria agência + usuário admin
// ---------------------------------------------------------------------------

export async function signUp(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const parse = signUpSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    agencyName: formData.get('agencyName'),
  })

  if (!parse.success) {
    return { error: parse.error.issues[0].message }
  }

  const { name, email, password, agencyName } = parse.data
  const adminSupabase = createAdminClient()

  // 1. Cria usuário no Supabase Auth (email já confirmado — sem email de verificação)
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    if (authError?.message.toLowerCase().includes('already registered')) {
      return { error: 'Este email já está cadastrado' }
    }
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  const userId = authData.user.id

  // 2. Verifica se já existe User no banco (pode ter sido criado via Google OAuth)
  const existingDbUser = await db.user.findUnique({ where: { email } })
  if (existingDbUser) {
    await adminSupabase.auth.admin.deleteUser(userId)
    return { error: 'Este email já está cadastrado. Tente entrar com Google ou redefinir sua senha.' }
  }

  // 3. Cria Agency + User no banco (em try/catch para rollback completo se falhar)
  let agencyId: string | null = null
  try {
    const slug = await generateUniqueSlug(agencyName)

    const agency = await db.agency.create({
      data: {
        name: agencyName,
        slug,
        plan: 'STARTER',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // trial 7 dias
        whiteLabelConfig: {
          create: {}, // configuração em branco — preenchida na tela de white-label
        },
      },
    })
    agencyId = agency.id

    await db.user.create({
      data: {
        id: userId, // mesmo UUID do Supabase Auth
        email,
        name,
        role: 'AGENCY_ADMIN',
        agencyId: agency.id,
      },
    })

    // 3. Adiciona agency_id e role ao app_metadata (lido pelo middleware e session helper)
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(userId, {
      app_metadata: {
        agency_id: agency.id,
        role: 'AGENCY_ADMIN',
      },
    })
    if (updateError) throw updateError
  } catch (err) {
    console.error('[signUp] rollback triggered:', err)
    // Rollback: remove auth user e agência (cascade deleta o user do banco também)
    await adminSupabase.auth.admin.deleteUser(userId)
    if (agencyId) {
      await db.agency.delete({ where: { id: agencyId } }).catch(() => {})
    }
    return { error: 'Erro ao configurar conta. Tente novamente.' }
  }

  // 4. Autentica o usuário (admin.createUser não cria sessão automaticamente)
  const supabase = createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    // Conta criada com sucesso — apenas a sessão falhou. Redireciona para login.
    redirect('/login?msg=conta-criada')
  }

  // 5. Envia email de boas-vindas (fire-and-forget — não bloqueia o redirect)
  void sendWelcomeEmail({
    to: email,
    name,
    agencyName: parse.data.agencyName,
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// signInWithGoogle — OAuth Google
// ---------------------------------------------------------------------------

export async function signInWithGoogle(): Promise<void> {
  const origin = headers().get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true, // necessário no server-side para receber a URL
    },
  })

  if (error || !data.url) {
    redirect('/login?error=google-auth-failed')
  }

  redirect(data.url)
}

// ---------------------------------------------------------------------------
// completeInvite — cliente define nome + senha após aceitar convite
// ---------------------------------------------------------------------------

export async function completeInvite(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parse = setPasswordSchema.safeParse({
    name: formData.get('name'),
    password: formData.get('password'),
  })

  if (!parse.success) {
    return { error: parse.error.issues[0].message }
  }

  const { name, password } = parse.data
  const supabase = createClient()

  // Atualiza senha e nome do usuário autenticado (sessão criada pelo link de convite)
  const { error } = await supabase.auth.updateUser({
    password,
    data: { name },
  })

  if (error) {
    return { error: 'Erro ao definir senha. O link pode ter expirado.' }
  }

  // Atualiza nome no banco também
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    await db.user.updateMany({
      where: { id: user.id },
      data: { name },
    })
  }

  redirect('/client')
}

// ---------------------------------------------------------------------------
// completeGoogleSignup — cria agência após cadastro via Google OAuth
// ---------------------------------------------------------------------------

const googleSignupSchema = z.object({
  agencyName: z.string().min(2, 'Nome da agência deve ter ao menos 2 caracteres'),
})

export async function completeGoogleSignup(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parse = googleSignupSchema.safeParse({
    agencyName: formData.get('agencyName'),
  })

  if (!parse.success) {
    return { error: parse.error.issues[0].message }
  }

  const { agencyName } = parse.data
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

  // Verifica se já foi configurado (evitar duplicação)
  if (user.app_metadata?.agency_id) {
    redirect('/dashboard')
  }

  const adminSupabase = createAdminClient()

  let agencyId: string | null = null
  try {
    const slug = await generateUniqueSlug(agencyName)

    const agency = await db.agency.create({
      data: {
        name: agencyName,
        slug,
        plan: 'STARTER',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        whiteLabelConfig: { create: {} },
      },
    })
    agencyId = agency.id

    await db.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name ?? user.email!,
        role: 'AGENCY_ADMIN',
        agencyId: agency.id,
      },
    })

    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
      app_metadata: {
        agency_id: agency.id,
        role: 'AGENCY_ADMIN',
      },
    })
    if (updateError) throw updateError
  } catch (err) {
    console.error('[completeGoogleSignup] rollback triggered:', err)
    // Rollback: cascade da agência deleta o user do banco também
    if (agencyId) {
      await db.agency.delete({ where: { id: agencyId } }).catch(() => {})
    }
    return { error: 'Erro ao configurar agência. Tente novamente.' }
  }

  // Envia email de boas-vindas (fire-and-forget)
  void sendWelcomeEmail({
    to: user.email!,
    name: user.user_metadata?.full_name ?? user.email!,
    agencyName,
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
