import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface TrialExpiringEmailProps {
  name: string
  agencyName: string
  daysLeft: number
  trialEndsAt: string
  billingUrl: string
}

export default function TrialExpiringEmail({
  name,
  agencyName,
  daysLeft,
  trialEndsAt,
  billingUrl,
}: TrialExpiringEmailProps) {
  const daysText = daysLeft === 1 ? '1 dia' : `${daysLeft} dias`

  return (
    <Html>
      <Head />
      <Preview>
        Seu trial do Metrik encerra em {daysText}. Escolha um plano para continuar.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Seu trial está acabando</Heading>

          <Text style={text}>Olá, {name}!</Text>

          <Text style={text}>
            O trial gratuito da <strong>{agencyName}</strong> encerra em{' '}
            <strong>{trialEndsAt}</strong> — faltam apenas {daysText}.
          </Text>

          <Text style={text}>
            Após o encerramento, o acesso ao painel será suspenso até que um plano seja escolhido.
            Seus dados e configurações são mantidos por 30 dias.
          </Text>

          <Section style={buttonSection}>
            <Button href={billingUrl} style={button}>
              Escolher um plano
            </Button>
          </Section>

          <Text style={planInfo}>
            Planos a partir de R$ 197/mês. Sem fidelidade — cancele a qualquer momento.
          </Text>

          <Text style={footer}>
            Se já assinou um plano, pode ignorar este email com segurança.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const container: React.CSSProperties = {
  maxWidth: '480px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #fcd34d',
  padding: '40px',
}

const heading: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 24px',
}

const text: React.CSSProperties = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const buttonSection: React.CSSProperties = {
  margin: '32px 0 16px',
  textAlign: 'center',
}

const button: React.CSSProperties = {
  backgroundColor: '#111827',
  color: '#ffffff',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  display: 'inline-block',
}

const planInfo: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  textAlign: 'center',
  margin: '0 0 24px',
}

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '1.5',
  margin: '0',
}
