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

interface WelcomeEmailProps {
  name: string
  agencyName: string
  dashboardUrl: string
  trialEndsAt: string
}

export default function WelcomeEmail({
  name,
  agencyName,
  dashboardUrl,
  trialEndsAt,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Metrik! Seu trial de 7 dias começou.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Bem-vindo ao Metrik!</Heading>

          <Text style={text}>Olá, {name}!</Text>

          <Text style={text}>
            Sua agência <strong>{agencyName}</strong> foi criada com sucesso. Você tem{' '}
            <strong>7 dias de trial gratuito</strong> para explorar todas as funcionalidades — sem
            precisar cadastrar cartão.
          </Text>

          <Text style={text}>
            Aproveite para conectar suas integrações (Meta Ads, Google Ads e GA4) e personalizar o
            dashboard white-label dos seus clientes.
          </Text>

          <Text style={highlight}>Seu trial encerra em {trialEndsAt}.</Text>

          <Section style={buttonSection}>
            <Button href={dashboardUrl} style={button}>
              Ir para o painel
            </Button>
          </Section>

          <Text style={footer}>
            Dúvidas? Responda este email — estamos aqui para ajudar.
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
  border: '1px solid #e5e7eb',
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

const highlight: React.CSSProperties = {
  fontSize: '14px',
  color: '#6d28d9',
  fontWeight: '500',
  backgroundColor: '#f5f3ff',
  borderRadius: '6px',
  padding: '10px 14px',
  margin: '0 0 24px',
}

const buttonSection: React.CSSProperties = {
  margin: '8px 0 32px',
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

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '1.5',
  margin: '0',
}
