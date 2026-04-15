'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import type { Plan } from '@prisma/client'

type Props = {
  plan: Plan
  hasSubscription: boolean
}

export function CheckoutButton({ plan, hasSubscription }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    // Se já tem assinatura ativa, fazer upgrade direto via Stripe API (sem redirecionar para portal)
    if (hasSubscription) {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (res.ok) {
        window.location.href = '/dashboard/billing?checkout=success'
      } else {
        setLoading(false)
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erro ao atualizar plano. Tente novamente.')
      }
      return
    }

    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })

    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      setLoading(false)
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Erro ao iniciar pagamento. Tente novamente.')
    }
  }

  return (
    <div>
      <Button
        size="sm"
        className="w-full gap-1.5 bg-violet-600 hover:bg-violet-700 text-white border-0"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowUpRight className="w-4 h-4" />
        )}
        {loading ? 'Aguarde...' : 'Fazer upgrade'}
      </Button>
      {error && <p className="text-xs text-red-400 mt-1.5 text-center">{error}</p>}
    </div>
  )
}
