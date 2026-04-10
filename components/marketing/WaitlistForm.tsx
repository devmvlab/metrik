'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { joinWaitlist } from '@/app/actions/waitlist'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    const result = await joinWaitlist(email, agencyName || undefined)

    if (result.success) {
      setStatus('success')
      setMessage(result.message)
      setEmail('')
      setAgencyName('')
    } else {
      setStatus('error')
      setMessage(result.error)
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-6 py-5 text-center">
        <p className="text-lg font-medium text-violet-300">Você está na lista!</p>
        <p className="mt-1 text-sm text-slate-400">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
        <Input
          type="text"
          placeholder="Nome da sua agência (opcional)"
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          className="h-12 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 sm:w-48"
        />
        <Input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 flex-1 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
        />
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="h-12 bg-gradient-to-r from-violet-600 to-indigo-600 px-6 font-semibold text-white hover:from-violet-700 hover:to-indigo-700 disabled:opacity-70"
        >
          {status === 'loading' ? 'Salvando...' : 'Quero entrar na lista'}
        </Button>
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-400">{message}</p>
      )}
    </form>
  )
}
