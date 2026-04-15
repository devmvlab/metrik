'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, ChevronRight, PartyPopper } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ChecklistItem {
  id: string
  label: string
  description: string
  done: boolean
  href?: string
}

interface OnboardingChecklistProps {
  items: ChecklistItem[]
}

export default function OnboardingChecklist({ items }: OnboardingChecklistProps) {
  const completedCount = items.filter((i) => i.done).length
  const allDone = completedCount === items.length

  if (allDone) {
    return (
      <Card className="p-5 mb-8 bg-emerald-500/10 border-emerald-500/30 shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <PartyPopper className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-300">Configuração completa!</p>
            <p className="text-xs text-emerald-400 mt-0.5">
              Sua agência está pronta para entregar dashboards para os seus clientes.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5 mb-8 bg-slate-900 border-slate-800 shadow-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Configuração inicial</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedCount} de {items.length} etapas concluídas
          </p>
        </div>
        <span className="text-xs font-semibold text-violet-400">
          {Math.round((completedCount / items.length) * 100)}%
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-5">
        <div
          className="h-1.5 bg-violet-600 rounded-full transition-all"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      <div className="space-y-1">
        {items.map((item) => {
          const content = (
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                item.done
                  ? 'opacity-40'
                  : item.href
                    ? 'hover:bg-slate-800 cursor-pointer'
                    : ''
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              </div>
              {!item.done && item.href && (
                <ChevronRight className="w-4 h-4 text-violet-400 shrink-0" />
              )}
            </div>
          )

          return item.href && !item.done ? (
            <Link key={item.id} href={item.href}>
              {content}
            </Link>
          ) : (
            <div key={item.id}>{content}</div>
          )
        })}
      </div>
    </Card>
  )
}
