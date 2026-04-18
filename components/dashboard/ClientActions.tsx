'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX, Trash2, Loader2 } from 'lucide-react'

interface ClientActionsProps {
  clientId: string
  currentStatus: 'ACTIVE' | 'INACTIVE'
}

export function ClientActions({ clientId, currentStatus }: ClientActionsProps) {
  const router = useRouter()
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggleStatus() {
    setLoadingStatus(true)
    setError(null)
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Erro ao atualizar status')
        return
      }
      router.refresh()
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoadingStatus(false)
    }
  }

  async function deleteClient() {
    if (!confirm(`Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.`)) {
      return
    }
    setLoadingDelete(true)
    setError(null)
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Erro ao remover cliente')
        return
      }
      router.push('/dashboard/clientes')
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleStatus}
          disabled={loadingStatus || loadingDelete}
          className={
            currentStatus === 'ACTIVE'
              ? 'gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 bg-transparent'
              : 'gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 bg-transparent'
          }
        >
          {loadingStatus ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : currentStatus === 'ACTIVE' ? (
            <UserX className="w-3.5 h-3.5" />
          ) : (
            <UserCheck className="w-3.5 h-3.5" />
          )}
          {currentStatus === 'ACTIVE' ? 'Desativar' : 'Reativar'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={deleteClient}
          disabled={loadingStatus || loadingDelete}
          className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
        >
          {loadingDelete ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Remover
        </Button>
      </div>
    </div>
  )
}
