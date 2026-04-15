import Link from 'next/link'
import { AlertTriangle, CreditCard, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrialBannerProps {
  trialEndsAt: Date | null
  stripeSubscriptionStatus: string | null
  stripeCustomerId: string | null
}

export function TrialBanner({ trialEndsAt, stripeSubscriptionStatus }: TrialBannerProps) {
  const hasActiveSubscription =
    stripeSubscriptionStatus === 'active' ||
    stripeSubscriptionStatus === 'trialing'

  // Pagamento falhou
  if (stripeSubscriptionStatus === 'past_due') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-6">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <p className="text-sm text-red-300 flex-1">
          Pagamento não processado. Atualize seu cartão para evitar a interrupção do serviço.
        </p>
        <Button asChild size="sm" variant="outline" className="shrink-0 border-red-500/40 text-red-300 hover:bg-red-500/10 bg-transparent">
          <Link href="/dashboard/billing">
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Atualizar
          </Link>
        </Button>
      </div>
    )
  }

  // Já tem assinatura ativa — sem banner
  if (hasActiveSubscription) return null

  // Sem assinatura — calcula dias restantes do trial
  if (!trialEndsAt) return null

  const now = new Date()
  const end = new Date(trialEndsAt)
  const diffMs = end.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysLeft <= 0) return null

  const isUrgent = daysLeft <= 3

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 mb-6 ${
        isUrgent
          ? 'border-amber-500/30 bg-amber-500/10'
          : 'border-violet-500/30 bg-violet-500/10'
      }`}
    >
      <Clock className={`w-4 h-4 shrink-0 ${isUrgent ? 'text-amber-400' : 'text-violet-400'}`} />
      <p className={`text-sm flex-1 ${isUrgent ? 'text-amber-300' : 'text-violet-300'}`}>
        {isUrgent
          ? `Seu trial encerra em ${daysLeft} dia${daysLeft === 1 ? '' : 's'}. Assine agora para não perder o acesso.`
          : `Você está no trial gratuito — ${daysLeft} dia${daysLeft === 1 ? '' : 's'} restante${daysLeft === 1 ? '' : 's'}.`}
      </p>
      <Button
        asChild
        size="sm"
        className={`shrink-0 ${
          isUrgent
            ? 'bg-amber-500 hover:bg-amber-600 text-white border-0'
            : 'bg-violet-600 hover:bg-violet-700 text-white border-0'
        }`}
      >
        <Link href="/dashboard/billing">
          {isUrgent ? 'Assinar agora' : 'Ver planos'}
        </Link>
      </Button>
    </div>
  )
}
