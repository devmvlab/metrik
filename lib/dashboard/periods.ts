import { startOfMonth, endOfMonth, subMonths, subDays, format } from 'date-fns'

export type PeriodPreset =
  | '7d'
  | '15d'
  | '30d'
  | 'current_month'
  | 'last_month'

export interface DateRange {
  start: Date
  end: Date
}

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  '7d': 'Últimos 7 dias',
  '15d': 'Últimos 15 dias',
  '30d': 'Últimos 30 dias',
  current_month: 'Mês atual',
  last_month: 'Mês anterior',
}

export const PERIOD_PRESETS: PeriodPreset[] = [
  '7d',
  '15d',
  '30d',
  'current_month',
  'last_month',
]

/**
 * Retorna o intervalo de datas para um preset.
 * "end" é sempre ontem (dados de hoje podem ser incompletos nas APIs de ads).
 */
export function getDateRange(preset: PeriodPreset): DateRange {
  const today = new Date()
  const yesterday = subDays(today, 1)

  switch (preset) {
    case '7d':
      return { start: subDays(yesterday, 6), end: yesterday }
    case '15d':
      return { start: subDays(yesterday, 14), end: yesterday }
    case '30d':
      return { start: subDays(yesterday, 29), end: yesterday }
    case 'current_month':
      return { start: startOfMonth(today), end: yesterday }
    case 'last_month': {
      const lastMonth = subMonths(today, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    }
  }
}

/**
 * Valida se uma string é um preset válido. Retorna o preset ou o fallback.
 */
export function parsePeriod(value: string | undefined, fallback: PeriodPreset = '30d'): PeriodPreset {
  if (value && PERIOD_PRESETS.includes(value as PeriodPreset)) {
    return value as PeriodPreset
  }
  return fallback
}

/**
 * Formata uma data para YYYY-MM-DD (formato aceito pelas APIs de ads).
 */
export function formatApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
