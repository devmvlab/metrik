'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth/actions'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => signOut())}
      disabled={isPending}
      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      {isPending ? 'Saindo...' : 'Sair'}
    </button>
  )
}
