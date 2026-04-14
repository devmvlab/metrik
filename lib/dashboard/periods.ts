import { startOfMonth, endOfMonth, subMonths, subDays, format } from 'date-fns'

export type PeriodPreset =
  | '7d'
  | '15d'
  | '30d'
  | 'current_month'
  | 'last_month'
  | 'custom'

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
  custom: 'Personalizado',
}

export const PERIOD_PRESETS: PeriodPreset[] = [
  '7d',
  '15d',
  '30d',
  'current_month',
  'last_month',
]

/**
 * Retorna o intervalo de datas para um preset fixo (não-custom).
 * "end" é sempre ontem (dados de hoje podem ser incompletos nas APIs de ads).
 */
export function getDateRange(preset: Exclude<PeriodPreset, 'custom'>): DateRange {
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
 * Parseia um intervalo de datas customizado a partir de strings YYYY-MM-DD.
 * Retorna null se os valores forem inválidos ou se start > end.
 */
export function parseCustomDateRange(
  from: string | undefined,
  to: string | undefined,
): DateRange | null {
  if (!from || !to) return null
  const start = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T23:59:59')
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return null
  return { start, end }
}

/**
 * Resolve o DateRange a partir do preset e, opcionalmente, das datas customizadas.
 * Usa fallback '30d' se o preset for 'custom' mas as datas forem inválidas.
 */
export function resolveDateRange(
  period: PeriodPreset,
  from?: string,
  to?: string,
): DateRange {
  if (period === 'custom') {
    return parseCustomDateRange(from, to) ?? getDateRange('30d')
  }
  return getDateRange(period)
}

/**
 * Valida se uma string é um preset válido. Retorna o preset ou o fallback.
 */
export function parsePeriod(value: string | undefined, fallback: PeriodPreset = '30d'): PeriodPreset {
  const allPresets: string[] = [...PERIOD_PRESETS, 'custom']
  if (value && allPresets.includes(value)) {
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
