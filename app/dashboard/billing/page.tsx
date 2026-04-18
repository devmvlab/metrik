import Link from 'next/link'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getAgencyWithPlanUsage } from '@/lib/db/agencies'
import { PLAN_LABELS, PLAN_LIMITS, PLAN_PRICES, getPlanByPriceId } from '@/lib/billing/plans'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, CheckCircle } from 'lucide-react'
import { CheckoutButton } from '@/components/billing/CheckoutButton'
import { ManageSubscriptionButton } from '@/components/billing/ManageSubscriptionButton'
import { stripe } from '@/lib/billing/stripe'
import { db } from '@/lib/db'
import type { Plan } from '@prisma/client'

const PLAN_ORDER: Plan[] = ['STARTER', 'PRO', 'AGENCY']

const PLAN_FEATURES: Record<Plan, string[]> = {
  STARTER: [
    'Até 5 clientes',
    'Meta Ads, Google Ads e GA4',
    'Dashboard white-label',
    'Exportação em PDF',
  ],
  PRO: [
    'Até 15 clientes',
    'Meta Ads, Google Ads e GA4',
    'Dashboard white-label',
    'Exportação em PDF',
    'Domínio customizado',
  ],
  AGENCY: [
    'Até 40 clientes',
    'Meta Ads, Google Ads e GA4',
    'Dashboard white-label',
    'Exportação em PDF',
    'Domínio customizado',
    'Suporte prioritário',
  ],
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function TrialBanner({ trialEndsAt, expired }: { trialEndsAt: Date; expired: boolean }) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  )

  if (expired) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-300">Trial expirado</p>
          <p className="text-sm text-red-400">
            Seu período de teste encerrou em {formatDate(trialEndsAt)}. Escolha um plano abaixo para
            continuar usando o Metrik.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <div>
        <p className="text-sm font-medium text-amber-300">
          Trial gratuito — {daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante
          {daysLeft !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-amber-400">
          Seu trial encerra em {formatDate(trialEndsAt)}. Escolha um plano para não perder o acesso.
        </p>
      </div>
    </div>
  )
}

/**
 * Sincroniza o estado da assinatura diretamente do Stripe.
 * Chamado quando o usuário retorna do checkout com sucesso, como fallback
 * para o caso do webhook ainda não ter chegado (race condition em dev/prod).
 */
async function syncSubscriptionFromStripe(agencyId: string): Promise<void> {
  try {
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: { stripeSubscriptionId: true, stripeSubscriptionStatus: true },
    })

    if (!agency) return

    // Se o webhook já atualizou, não faz nada
    if (
      agency.stripeSubscriptionId &&
      (agency.stripeSubscriptionStatus === 'active' || agency.stripeSubscriptionStatus === 'trialing')
    ) {
      return
    }

    // Busca checkout sessions recentes para esta agência via metadata
    // Necessário porque no primeiro checkout o stripeCustomerId ainda não está no banco
    const sessions = await stripe.checkout.sessions.list({
      limit: 5,
      expand: ['data.subscription'],
    })

    const completedSession = sessions.data.find(
      (s) => s.metadata?.agencyId === agencyId && s.payment_status === 'paid',
    )

    if (!completedSession) return

    const subscription =
      typeof completedSession.subscription === 'object' ? completedSession.subscription : null

    if (!subscription || subscription.status !== 'active') return

    const customerId =
      typeof completedSession.customer === 'string'
        ? completedSession.customer
        : completedSession.customer?.id

    const priceId = subscription.items.data[0]?.price.id
    const plan = priceId ? getPlanByPriceId(priceId) : null

    await db.agency.update({
      where: { id: agencyId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionStatus: subscription.status,
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        ...(plan ? { plan } : {}),
      },
    })
  } catch (err) {
    // Falha silenciosa — o webhook eventual vai corrigir
    console.error('[billing] syncSubscriptionFromStripe failed:', err)
  }
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { checkout?: string }
}) {
  const session = await requireAgencyAdmin()

  // Se voltou do checkout com sucesso, sincroniza com Stripe antes de carregar os dados
  // (fallback para race condition entre redirect e webhook)
  if (searchParams.checkout === 'success') {
    await syncSubscriptionFromStripe(session.agencyId)
  }

  const agency = await getAgencyWithPlanUsage(session.agencyId)

  if (!agency) return null

  const { plan, clientCount, trialEndsAt, stripeCustomerId, stripeSubscriptionId, stripeSubscriptionStatus } =
    agency
  const limit = PLAN_LIMITS[plan]
  const usagePercent = Math.min(100, Math.round((clientCount / limit) * 100))
  const atLimit = clientCount >= limit

  const hasActiveSubscription =
    stripeSubscriptionStatus === 'active' || stripeSubscriptionStatus === 'trialing'
  const isPastDue = stripeSubscriptionStatus === 'past_due'
  const isIncomplete = stripeSubscriptionStatus === 'incomplete'
  const trialExpired =
    !hasActiveSubscription && trialEndsAt != null && new Date(trialEndsAt) < new Date()
  const onTrial = !stripeCustomerId && trialEndsAt != null && new Date(trialEndsAt) >= new Date()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Plano & Billing</h1>
        <p className="text-sm text-slate-400 mt-1">Gerencie seu plano e assinatura.</p>
      </div>

      {/* Feedback de retorno do checkout */}
      {searchParams.checkout === 'success' && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-300">Assinatura ativada com sucesso!</p>
            <p className="text-sm text-emerald-400">
              Seu plano foi atualizado. Bem-vindo ao Metrik.
            </p>
          </div>
        </div>
      )}

      {searchParams.checkout === 'canceled' && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-sm text-slate-400">
            Pagamento cancelado. Seu plano não foi alterado.
          </p>
        </div>
      )}

      {/* Banner de trial */}
      {(onTrial || trialExpired) && trialEndsAt && (
        <TrialBanner trialEndsAt={trialEndsAt} expired={trialExpired} />
      )}

      {/* Aviso de pagamento incompleto (ex: 3D Secure pendente) */}
      {isIncomplete && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">Pagamento pendente</p>
            <p className="text-sm text-amber-400">
              Seu pagamento está aguardando confirmação (ex: autenticação 3D Secure). Acesse o
              portal para concluir.
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <ManageSubscriptionButton />
          </div>
        </div>
      )}

      {/* Aviso de pagamento em atraso */}
      {isPastDue && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">Pagamento em atraso</p>
            <p className="text-sm text-red-400">
              Houve um problema com o seu pagamento. Atualize seu método de pagamento para continuar.
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <ManageSubscriptionButton />
          </div>
        </div>
      )}

      {/* Card do plano atual */}
      <Card className="mb-8 bg-slate-900 border-slate-800 shadow-none p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Plano atual</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-white">
                {onTrial || trialExpired ? 'Trial gratuito' : PLAN_LABELS[plan]}
              </p>
              {!onTrial && !trialExpired && (
                <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                  {PLAN_PRICES[plan]}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveSubscription && (
              <Badge className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20">
                Ativo
              </Badge>
            )}
            {stripeCustomerId && <ManageSubscriptionButton />}
          </div>
        </div>

        {/* Barra de uso */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Clientes cadastrados</span>
            <span className={`text-xs font-medium ${atLimit ? 'text-red-400' : 'text-slate-400'}`}>
              {clientCount}/{limit}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                atLimit ? 'bg-red-500' : usagePercent >= 80 ? 'bg-amber-400' : 'bg-violet-600'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {atLimit && (
            <p className="text-xs text-red-400 mt-1.5">
              Limite atingido. Faça upgrade para adicionar mais clientes.
            </p>
          )}
        </div>
      </Card>

      {/* Cards de planos */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Planos disponíveis</h2>
        <div className="grid grid-cols-3 gap-4">
          {PLAN_ORDER.map((p) => {
            const isCurrent = !onTrial && !trialExpired && p === plan && hasActiveSubscription
            const isUpgrade = onTrial || trialExpired
              ? true
              : PLAN_ORDER.indexOf(p) > PLAN_ORDER.indexOf(plan)

            return (
              <Card
                key={p}
                className={`p-5 shadow-none flex flex-col bg-slate-900 ${
                  isCurrent
                    ? 'border-violet-500 ring-1 ring-violet-500/50'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white">{PLAN_LABELS[p]}</p>
                  {isCurrent && (
                    <Badge className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/20">
                      Atual
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-400 mb-4">{PLAN_PRICES[p]}</p>

                <ul className="space-y-2 flex-1 mb-5">
                  {PLAN_FEATURES[p].map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {isUpgrade ? (
                  <CheckoutButton plan={p} hasSubscription={!!stripeSubscriptionId} />
                ) : isCurrent ? (
                  <Button size="sm" variant="outline" className="w-full border-slate-700 text-slate-400" disabled>
                    Plano atual
                  </Button>
                ) : (
                  <ManageSubscriptionButton />
                )}
              </Card>
            )
          })}
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Pagamento via cartão de crédito. Cancele a qualquer momento.{' '}
          <Link href="/dashboard/configuracoes" className="underline underline-offset-2 hover:text-slate-300">
            Dúvidas? Fale conosco.
          </Link>
        </p>
      </div>
    </div>
  )
}
