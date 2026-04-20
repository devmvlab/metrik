'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { updatePassword } from '@/lib/auth/actions'
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
      {pending ? 'Salvando...' : 'Redefinir senha'}
    </Button>
  )
}

export default function RedefinirSenhaPage() {
  const [state, action] = useFormState(updatePassword, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmValue, setConfirmValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  const mismatch = confirmValue.length > 0 && confirmValue !== passwordValue

  return (
    <Card className="p-6 bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Redefinir senha</h1>
        <p className="text-sm text-slate-400 mt-1">Escolha uma nova senha para sua conta.</p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}{' '}
          <Link href="/esqueci-senha" className="underline underline-offset-2 hover:text-red-300">
            Solicitar novo link
          </Link>
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-300">
            Nova senha
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              minLength={8}
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm" className="text-sm font-medium text-slate-300">
            Confirmar nova senha
          </label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repita a senha"
              autoComplete="new-password"
              required
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              className={`bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 pr-10 ${
                mismatch ? 'border-red-500/60' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {mismatch && <p className="text-xs text-red-400">As senhas não coincidem</p>}
        </div>

        <SubmitButton />
      </form>
    </Card>
  )
}
