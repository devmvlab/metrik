'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { PERIOD_LABELS, PERIOD_PRESETS, PeriodPreset } from '@/lib/dashboard/periods'

interface PeriodSelectorProps {
  current: PeriodPreset
}

export function PeriodSelector({ current }: PeriodSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [showPicker, setShowPicker] = useState(false)
  const [from, setFrom] = useState(searchParams.get('from') ?? '')
  const [to, setTo] = useState(searchParams.get('to') ?? '')
  const containerRef = useRef<HTMLDivElement>(null)

  // Fecha o picker ao clicar fora
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handlePresetChange(period: PeriodPreset) {
    setShowPicker(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    params.delete('from')
    params.delete('to')
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleApplyCustom() {
    if (!from || !to) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', 'custom')
    params.set('from', from)
    params.set('to', to)
    router.push(`${pathname}?${params.toString()}`)
    setShowPicker(false)
  }

  const canApply = Boolean(from && to && from <= to)

  return (
    <div className="relative print:hidden" ref={containerRef}>
      <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
        {PERIOD_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetChange(preset)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              current === preset
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {PERIOD_LABELS[preset]}
          </button>
        ))}
        <button
          onClick={() => setShowPicker((v) => !v)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            current === 'custom'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Calendar className="w-3 h-3" />
          {current === 'custom' ? 'Personalizado' : 'Personalizar'}
        </button>
      </div>

      {showPicker && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 z-50 w-64">
          <p className="text-xs font-semibold text-neutral-800 mb-3">Intervalo personalizado</p>
          <div className="space-y-2.5">
            <div>
              <label className="text-xs text-neutral-500 block mb-1">Data inicial</label>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded-md px-2.5 py-1.5 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1">Data final</label>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded-md px-2.5 py-1.5 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>
          <button
            onClick={handleApplyCustom}
            disabled={!canApply}
            className="mt-3 w-full py-1.5 text-xs font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}
