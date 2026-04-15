'use client'

import { useEffect } from 'react'

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[client] error boundary:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <p className="text-4xl">⚠️</p>
      <h2 className="text-lg font-semibold text-neutral-900">Algo deu errado</h2>
      <p className="text-sm text-neutral-500 max-w-sm">
        Não foi possível carregar seu dashboard. Tente recarregar a página.
      </p>
      <button
        onClick={reset}
        className="text-sm px-4 py-2 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  )
}
