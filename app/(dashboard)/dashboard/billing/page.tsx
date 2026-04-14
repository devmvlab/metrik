import Link from 'next/link'
import { requireAgencyAdmin } from '@/lib/auth/session'
import { getAgencyWithPlanUsage } from '@/lib/db/agencies'
import { PLAN_LABELS, PLAN_LIMITS, PLAN_PRICES } from '@/lib/billing/plans'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, CheckCircle } from 'lucide-react'
import { CheckoutButton } from '@/components/billing/CheckoutButton'
import { ManageSubscriptionButton } from '@/components/billing/ManageSubscriptionButton'
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
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-medium text-red-900">Trial expirado</p>
          <p className="text-sm text-red-700">
            Seu período de teste encerrou em {formatDate(trialEndsAt)}. Escolha um plano abaixo para
            continuar usando o Metrik.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div>
        <p className="text-sm font-medium text-amber-900">
          Trial gratuito — {daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante
          {daysLeft !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-amber-700">
          Seu trial encerra em {formatDate(trialEndsAt)}. Escolha um plano para não perder o acesso.
        </p>
      </div>
    </div>
  )
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { checkout?: string }
}) {
  const session = await requireAgencyAdmin()
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
  const trialExpired =
    !hasActiveSubscription && trialEndsAt != null && new Date(trialEndsAt) < new Date()
  const onTrial = !stripeCustomerId && trialEndsAt != null && new Date(trialEndsAt) >= new Date()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900">Plano & Billing</h1>
        <p className="text-sm text-neutral-500 mt-1">Gerencie seu plano e assinatura.</p>
      </div>

      {/* Feedback de retorno do checkout */}
      {searchParams.checkout === 'success' && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-medium text-emerald-900">Assinatura ativada com sucesso!</p>
            <p className="text-sm text-emerald-700">
              Seu plano foi atualizado. Bem-vindo ao Metrik.
            </p>
          </div>
        </div>
      )}

      {searchParams.checkout === 'canceled' && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          <p className="text-sm text-neutral-600">
            Pagamento cancelado. Seu plano não foi alterado.
          </p>
        </div>
      )}

      {/* Banner de trial */}
      {(onTrial || trialExpired) && trialEndsAt && (
        <TrialBanner trialEndsAt={trialEndsAt} expired={trialExpired} />
      )}

      {/* Aviso de pagamento em atraso */}
      {isPastDue && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-900">Pagamento em atraso</p>
            <p className="text-sm text-red-700">
              Houve um problema com o seu pagamento. Atualize seu método de pagamento para continuar.
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <ManageSubscriptionButton />
          </div>
        </div>
      )}

      {/* Card do plano atual */}
      <Card className="mb-8 border border-neutral-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Plano atual</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-neutral-900">
                {onTrial || trialExpired ? 'Trial gratuito' : PLAN_LABELS[plan]}
              </p>
              {!onTrial && !trialExpired && (
                <Badge variant="outline" className="text-xs">
                  {PLAN_PRICES[plan]}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveSubscription && (
              <Badge className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
                Ativo
              </Badge>
            )}
            {stripeCustomerId && <ManageSubscriptionButton />}
          </div>
        </div>

        {/* Barra de uso */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-neutral-500">Clientes cadastrados</span>
            <span
              className={`text-xs font-medium ${atLimit ? 'text-red-600' : 'text-neutral-600'}`}
            >
              {clientCount}/{limit}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                atLimit ? 'bg-red-500' : usagePercent >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {atLimit && (
            <p className="text-xs text-red-600 mt-1.5">
              Limite atingido. Faça upgrade para adicionar mais clientes.
            </p>
          )}
        </div>
      </Card>

      {/* Cards de planos */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Planos disponíveis</h2>
        <div className="grid grid-cols-3 gap-4">
          {PLAN_ORDER.map((p) => {
            // Durante trial ou trial expirado, nenhum plano é "atual" — usuário ainda não assinou
            const isCurrent = !onTrial && !trialExpired && p === plan && hasActiveSubscription
            const isUpgrade = onTrial || trialExpired
              ? true
              : PLAN_ORDER.indexOf(p) > PLAN_ORDER.indexOf(plan)

            return (
              <Card
                key={p}
                className={`p-5 border shadow-sm flex flex-col ${
                  isCurrent ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-neutral-900">{PLAN_LABELS[p]}</p>
                  {isCurrent && (
                    <Badge className="text-xs bg-neutral-900 text-white">Atual</Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-neutral-600 mb-4">{PLAN_PRICES[p]}</p>

                <ul className="space-y-2 flex-1 mb-5">
                  {PLAN_FEATURES[p].map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-neutral-600">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {isUpgrade ? (
                  <CheckoutButton plan={p} hasSubscription={!!stripeSubscriptionId} />
                ) : isCurrent ? (
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    Plano atual
                  </Button>
                ) : (
                  // Downgrade — via portal Stripe
                  <ManageSubscriptionButton />
                )}
              </Card>
            )
          })}
        </div>

        <p className="text-xs text-neutral-400 mt-4">
          Pagamento via cartão de crédito. Cancele a qualquer momento.{' '}
          <Link href="/dashboard/configuracoes" className="underline underline-offset-2">
            Dúvidas? Fale conosco.
          </Link>
        </p>
      </div>
    </div>
  )
}
