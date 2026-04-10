'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'
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

  if (allDone) return null

  return (
    <Card className="p-5 mb-8 border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Configuração inicial</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {completedCount} de {items.length} etapas concluídas
          </p>
        </div>
        <div className="text-xs text-neutral-400">
          {Math.round((completedCount / items.length) * 100)}%
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-1.5 bg-neutral-100 rounded-full mb-5">
        <div
          className="h-1.5 bg-neutral-900 rounded-full transition-all"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const content = (
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                item.done
                  ? 'opacity-50'
                  : item.href
                    ? 'hover:bg-neutral-50 cursor-pointer'
                    : ''
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-neutral-300 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
              </div>
              {!item.done && item.href && (
                <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
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
