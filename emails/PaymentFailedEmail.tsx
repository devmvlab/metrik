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

interface PaymentFailedEmailProps {
  name: string
  agencyName: string
  portalUrl: string
}

export default function PaymentFailedEmail({ name, agencyName, portalUrl }: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Problema com o pagamento da {agencyName}. Atualize seu método de pagamento.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Problema com o pagamento</Heading>

          <Text style={text}>Olá, {name}!</Text>

          <Text style={text}>
            Não conseguimos processar o pagamento da assinatura da{' '}
            <strong>{agencyName}</strong>. Isso pode acontecer quando o cartão expira, o limite é
            insuficiente ou os dados precisam ser atualizados.
          </Text>

          <Text style={text}>
            Seu acesso está temporariamente suspenso. Atualize o método de pagamento para
            reativar sua conta imediatamente.
          </Text>

          <Section style={buttonSection}>
            <Button href={portalUrl} style={button}>
              Atualizar método de pagamento
            </Button>
          </Section>

          <Text style={footer}>
            O Stripe tenta cobrar novamente de forma automática. Se o pagamento não for
            regularizado, a assinatura será cancelada e o acesso encerrado definitivamente.
            Dúvidas? Responda este email.
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
  border: '1px solid #fca5a5',
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
  margin: '32px 0',
  textAlign: 'center',
}

const button: React.CSSProperties = {
  backgroundColor: '#dc2626',
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
