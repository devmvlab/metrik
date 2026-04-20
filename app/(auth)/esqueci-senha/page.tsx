'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { requestPasswordReset } from '@/lib/auth/actions'
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
      {pending ? 'Enviando...' : 'Enviar link de redefinição'}
    </Button>
  )
}

export default function EsqueciSenhaPage() {
  const [state, action] = useFormState(requestPasswordReset, null)

  if (state?.success) {
    return (
      <Card className="p-6 bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Verifique seu email</h1>
            <p className="text-sm text-slate-400 mt-1">
              Enviamos um link de redefinição de senha. Verifique também a caixa de spam.
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors mt-1"
          >
            Voltar para o login
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Esqueceu sua senha?</h1>
        <p className="text-sm text-slate-400 mt-1">
          Informe seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}
        </div>
      )}

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

        <SubmitButton />
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Lembrou a senha?{' '}
        <Link
          href="/login"
          className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
        >
          Voltar para o login
        </Link>
      </p>
    </Card>
  )
}
