import { Resend } from 'resend'
import { render } from '@react-email/components'
import ClientInviteEmail from '@/emails/ClientInviteEmail'

interface SendInviteEmailParams {
  to: string
  clientName: string
  agencyName: string
  inviteUrl: string
}

export async function sendClientInviteEmail({
  to,
  clientName,
  agencyName,
  inviteUrl,
}: SendInviteEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[invite] RESEND_API_KEY não configurada — email não enviado')
    return
  }

  const resend = new Resend(apiKey)

  const html = await render(
    ClientInviteEmail({ agencyName, clientName, inviteUrl }),
  )

  const { error } = await resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to,
    subject: `${agencyName} convidou você para acessar seu dashboard`,
    html,
  })

  if (error) {
    throw new Error(`Falha ao enviar email: ${error.message}`)
  }
}
