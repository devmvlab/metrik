'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintButton() {
  return (
    <Button
      size="sm"
      className="gap-1.5 text-white border-0 hover:opacity-90 hover:text-white"
      style={{ backgroundColor: 'var(--agency-secondary)' }}
      onClick={() => window.print()}
    >
      <Printer className="w-4 h-4" />
      Exportar PDF
    </Button>
  )
}
