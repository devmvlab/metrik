'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { DailyPoint } from '@/lib/dashboard/aggregator'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface InvestmentLineChartProps {
  data: DailyPoint[]
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM', { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function InvestmentLineChart({ data }: InvestmentLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 text-sm">
        Sem dados para o período selecionado.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    dateLabel: formatDate(d.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
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
          labelFormatter={(label) => `Data: ${label}`}
          contentStyle={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
        />
        <Line
          yAxisId="spend"
          type="monotone"
          dataKey="spend"
          name="Investimento"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          yAxisId="conversions"
          type="monotone"
          dataKey="conversions"
          name="Conversões"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
