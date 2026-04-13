import { Resend } from 'resend'
import { render } from '@react-email/components'
import WelcomeEmail from '@/emails/WelcomeEmail'
import TrialExpiringEmail from '@/emails/TrialExpiringEmail'
import PaymentFailedEmail from '@/emails/PaymentFailedEmail'
import IntegrationExpiredEmail from '@/emails/IntegrationExpiredEmail'

// TODO: trocar para domínio verificado em produção (ex: noreply@metrik.com.br)
const FROM = 'Metrik <onboarding@resend.dev>'

const PLATFORM_LABELS: Record<string, string> = {
  META_ADS: 'Meta Ads',
  GOOGLE_ADS: 'Google Ads',
  GA4: 'Google Analytics 4',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY não configurada — email não enviado')
    return null
  }
  return new Resend(key)
}

// ---------------------------------------------------------------------------
// WelcomeEmail — disparado após criação da agência
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail({
  to,
  name,
  agencyName,
  trialEndsAt,
}: {
  to: string
  name: string
  agencyName: string
  trialEndsAt: Date
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const html = await render(
    WelcomeEmail({
      name,
      agencyName,
      dashboardUrl: `${appUrl}/dashboard`,
      trialEndsAt: formatDate(trialEndsAt),
    }),
  )

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Bem-vindo ao Metrik, ${name}!`,
    html,
  })

  if (error) {
    console.error('[email] sendWelcomeEmail falhou:', error.message)
  }
}

// ---------------------------------------------------------------------------
// TrialExpiringEmail — disparado pelo cron 3 dias antes do trial encerrar
// ---------------------------------------------------------------------------

export async function sendTrialExpiringEmail({
  to,
  name,
  agencyName,
  daysLeft,
  trialEndsAt,
}: {
  to: string
  name: string
  agencyName: string
  daysLeft: number
  trialEndsAt: Date
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const html = await render(
    TrialExpiringEmail({
      name,
      agencyName,
      daysLeft,
      trialEndsAt: formatDate(trialEndsAt),
      billingUrl: `${appUrl}/dashboard/billing`,
    }),
  )

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Seu trial do Metrik encerra em ${daysLeft === 1 ? '1 dia' : `${daysLeft} dias`}`,
    html,
  })

  if (error) {
    console.error('[email] sendTrialExpiringEmail falhou:', error.message)
  }
}

// ---------------------------------------------------------------------------
// PaymentFailedEmail — disparado pelo webhook invoice.payment_failed
// ---------------------------------------------------------------------------

export async function sendPaymentFailedEmail({
  to,
  name,
  agencyName,
}: {
  to: string
  name: string
  agencyName: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const html = await render(
    PaymentFailedEmail({
      name,
      agencyName,
      portalUrl: `${appUrl}/dashboard/billing`,
    }),
  )

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Problema com o pagamento da ${agencyName}`,
    html,
  })

  if (error) {
    console.error('[email] sendPaymentFailedEmail falhou:', error.message)
  }
}

// ---------------------------------------------------------------------------
// IntegrationExpiredEmail — disparado pelo cron de refresh quando token expira
// ---------------------------------------------------------------------------

export async function sendIntegrationExpiredEmail({
  to,
  name,
  agencyName,
  platform,
  clientName,
  clientId,
}: {
  to: string
  name: string
  agencyName: string
  platform: string
  clientName: string
  clientId: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const platformLabel = PLATFORM_LABELS[platform] ?? platform

  const html = await render(
    IntegrationExpiredEmail({
      name,
      agencyName,
      platform: platformLabel,
      clientName,
      reconnectUrl: `${appUrl}/dashboard/clientes/${clientId}`,
    }),
  )

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Integração ${platformLabel} do cliente ${clientName} precisa ser reconectada`,
    html,
  })

  if (error) {
    console.error('[email] sendIntegrationExpiredEmail falhou:', error.message)
  }
}
