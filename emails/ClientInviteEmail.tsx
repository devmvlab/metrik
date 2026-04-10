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

interface ClientInviteEmailProps {
  agencyName: string
  clientName: string
  inviteUrl: string
}

export default function ClientInviteEmail({
  agencyName,
  clientName,
  inviteUrl,
}: ClientInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{agencyName} convidou você para acessar seu dashboard</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Você foi convidado!</Heading>

          <Text style={text}>Olá, {clientName}!</Text>

          <Text style={text}>
            <strong>{agencyName}</strong> preparou um dashboard personalizado com os dados das suas
            campanhas de marketing.
          </Text>

          <Section style={buttonSection}>
            <Button href={inviteUrl} style={button}>
              Acessar meu dashboard
            </Button>
          </Section>

          <Text style={footer}>
            Este link expira em 7 dias. Se você não esperava este email, pode ignorá-lo com
            segurança.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, sans-serif',
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
  margin: '24px 0 0',
}
