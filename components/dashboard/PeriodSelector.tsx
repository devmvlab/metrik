'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PERIOD_LABELS, PERIOD_PRESETS, PeriodPreset } from '@/lib/dashboard/periods'

interface PeriodSelectorProps {
  current: PeriodPreset
}

export function PeriodSelector({ current }: PeriodSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(period: PeriodPreset) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1 print:hidden">
      {PERIOD_PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => handleChange(preset)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            current === preset
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {PERIOD_LABELS[preset]}
        </button>
      ))}
    </div>
  )
}
