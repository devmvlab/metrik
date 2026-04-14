import { formatDistanceToNow as dateFnsFormatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDistanceToNow(date: Date): string {
  return dateFnsFormatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}
