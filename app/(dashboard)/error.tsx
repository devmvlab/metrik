'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard] error boundary:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <p className="text-4xl">⚠️</p>
      <h2 className="text-lg font-semibold text-neutral-900">Algo deu errado</h2>
      <p className="text-sm text-neutral-500 max-w-sm">
        Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte se o problema persistir.
      </p>
      <Button size="sm" variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  )
}
