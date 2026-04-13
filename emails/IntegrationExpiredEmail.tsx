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

interface IntegrationExpiredEmailProps {
  name: string
  agencyName: string
  platform: string
  clientName: string
  reconnectUrl: string
}

export default function IntegrationExpiredEmail({
  name,
  agencyName,
  platform,
  clientName,
  reconnectUrl,
}: IntegrationExpiredEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Integração {platform} do cliente {clientName} precisa ser reconectada.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Integração expirada</Heading>

          <Text style={text}>Olá, {name}!</Text>

          <Text style={text}>
            A integração com o <strong>{platform}</strong> do cliente{' '}
            <strong>{clientName}</strong> expirou e não está mais sincronizando dados.
          </Text>

          <Text style={text}>
            Isso geralmente acontece quando o token de acesso é revogado ou expira. Reconecte a
            integração para restaurar os dados no dashboard.
          </Text>

          <Section style={buttonSection}>
            <Button href={reconnectUrl} style={button}>
              Reconectar integração
            </Button>
          </Section>

          <Text style={footer}>
            Enquanto a integração estiver desconectada, o dashboard do cliente{' '}
            {clientName} exibirá os últimos dados sincronizados. Reconecte o quanto antes para
            evitar dados desatualizados.
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

const buttonSection: React.CSSProperties = {
  margin: '32px 0',
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
