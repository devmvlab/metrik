'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { completeGoogleSignup } from '@/lib/auth/actions'
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
      {pending ? 'Configurando...' : 'Ir para o painel'}
    </Button>
  )
}

/**
 * Página de onboarding para usuários que se cadastraram via Google OAuth.
 * Solicita o nome da agência para completar o cadastro.
 */
export default function OnboardingPage() {
  const [state, action] = useFormState(completeGoogleSignup, null)

  return (
    <Card className="p-6 bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Quase lá!</h1>
        <p className="text-sm text-slate-400 mt-1">
          Dê um nome para a sua agência para começar.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="agencyName" className="text-sm font-medium text-slate-300">
            Nome da agência
          </label>
          <Input
            id="agencyName"
            name="agencyName"
            type="text"
            placeholder="Agência Exemplo"
            autoComplete="organization"
            required
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
          />
        </div>

        <SubmitButton />
      </form>
    </Card>
  )
}
