'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { PlatformBreakdown } from '@/lib/dashboard/aggregator'


interface PlatformBarChartProps {
  data: PlatformBreakdown[]
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

export function PlatformBarChart({ data }: PlatformBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 text-sm">
        Sem dados para o período selecionado.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.label,
    Investimento: d.spend,
    Conversões: d.conversions,
    platform: d.platform,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="spend"
          orientation="left"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v}`}
        />
        <YAxis
          yAxisId="conversions"
          orientation="right"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value, name) => {
            const n = Number(value ?? 0)
            if (name === 'Investimento') return [formatCurrency(n), name]
            return [n.toLocaleString('pt-BR'), String(name)]
          }}
          contentStyle={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
        <Bar
          yAxisId="spend"
          dataKey="Investimento"
          fill="#2563eb"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
        <Bar
          yAxisId="conversions"
          dataKey="Conversões"
          fill="#16a34a"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
