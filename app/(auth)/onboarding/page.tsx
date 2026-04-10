'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { completeGoogleSignup } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
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
    <Card className="p-6 shadow-sm border border-neutral-200">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Quase lá!</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Dê um nome para a sua agência para começar.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="agencyName" className="text-sm font-medium text-neutral-700">
            Nome da agência
          </label>
          <Input
            id="agencyName"
            name="agencyName"
            type="text"
            placeholder="Agência Exemplo"
            autoComplete="organization"
            required
          />
        </div>

        <SubmitButton />
      </form>
    </Card>
  )
}
