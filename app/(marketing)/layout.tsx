import type { Metadata } from 'next'
import { Navbar } from '@/components/marketing/Navbar'

export const metadata: Metadata = {
  title: 'Metrik — Dashboards white-label para agências de marketing',
  description:
    'Conecte Meta Ads, Google Ads e GA4 dos seus clientes e entregue dashboards profissionais com a sua marca. Sem relatórios manuais.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
