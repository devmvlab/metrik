'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { completeInvite } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Salvando...' : 'Acessar dashboard'}
    </Button>
  )
}

/**
 * Página de aceitação de convite.
 *
 * O cliente chega aqui após clicar no link de convite enviado por email.
 * Fluxo: link de convite → /auth/callback?code=xxx&next=/convite → esta página.
 *
 * Aqui o cliente define seu nome e senha para completar o cadastro.
 */
export default function ConvitePage() {
  const [state, action] = useFormState(completeInvite, null)

  return (
    <Card className="p-6 shadow-sm border border-neutral-200">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Bem-vindo ao seu dashboard!</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Complete seu perfil para acessar seus dados de campanha.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-neutral-700">
            Seu nome
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="João Silva"
            autoComplete="name"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Defina sua senha
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <SubmitButton />
      </form>
    </Card>
  )
}
