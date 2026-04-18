'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

interface ResendInviteButtonProps {
  clientId: string
}

export function ResendInviteButton({ clientId }: ResendInviteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function resend() {
    setLoading(true)
    setError(null)
    setSent(false)
    try {
      const res = await fetch(`/api/clients/${clientId}/resend-invite`, { method: 'POST' })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Erro ao reenviar convite')
        return
      }
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={resend}
        disabled={loading || sent}
        className="gap-1.5 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300 bg-transparent"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : sent ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Mail className="w-3.5 h-3.5" />
        )}
        {sent ? 'Convite enviado!' : 'Reenviar convite'}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
