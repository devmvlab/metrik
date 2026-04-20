'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { signIn, signInWithGoogle } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold"
      disabled={pending}
    >
      {pending ? 'Entrando...' : 'Entrar'}
    </Button>
  )
}

function GoogleButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" className="w-full bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" disabled={pending}>
      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {pending ? 'Redirecionando...' : 'Continuar com Google'}
    </Button>
  )
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; msg?: string }
}) {
  const [state, action] = useFormState(signIn, null)

  return (
    <Card className="p-6 bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Entrar na sua conta</h1>
        <p className="text-sm text-slate-400 mt-1">
          Novo por aqui?{' '}
          <Link href="/cadastro" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
            Crie sua conta grátis
          </Link>
        </p>
      </div>

      {searchParams.msg === 'conta-criada' && (
        <div className="mb-4 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          Conta criada com sucesso! Faça login para continuar.
        </div>
      )}

      {(state?.error || searchParams.error) && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state?.error ?? 'Erro ao fazer login. Tente novamente.'}
        </div>
      )}

      {/* Google OAuth */}
      <form action={signInWithGoogle} className="mb-4">
        <GoogleButton />
      </form>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-500">
          <span className="bg-slate-900 px-2">ou continue com email</span>
        </div>
      </div>

      {/* Email + senha */}
      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@agencia.com"
            autoComplete="email"
            required
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Senha
            </label>
            <Link
              href="/esqueci-senha"
              className="text-xs text-slate-400 hover:text-violet-400 transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
          />
        </div>

        <SubmitButton />
      </form>
    </Card>
  )
}
