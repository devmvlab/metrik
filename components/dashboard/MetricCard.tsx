import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  description?: string
}

export function MetricCard({ label, value, icon: Icon, description }: MetricCardProps) {
  return (
    <Card className="p-5 border border-neutral-200 shadow-sm bg-white">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-neutral-600" />
        </div>
      </div>
      <p className="text-2xl font-bold text-neutral-900 tabular-nums">{value}</p>
      {description && (
        <p className="text-xs text-neutral-400 mt-1">{description}</p>
      )}
    </Card>
  )
}
