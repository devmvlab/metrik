import { requireClientViewer } from '@/lib/auth/session'
import { getAgencyById } from '@/lib/db/agencies'
import Image from 'next/image'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await requireClientViewer()
  const agency = await getAgencyById(session.agencyId)

  const HEX_RE = /^#[0-9a-fA-F]{6}$/
  const rawPrimary = agency?.whiteLabelConfig?.primaryColor ?? ''
  const primaryColor = HEX_RE.test(rawPrimary) ? rawPrimary : '#2563eb'
  const logoUrl = agency?.whiteLabelConfig?.logoUrl ?? null
  const agencyName = agency?.name ?? 'Dashboard'
  const rawSecondary = agency?.whiteLabelConfig?.secondaryColor ?? ''
  const secondaryColor = HEX_RE.test(rawSecondary) ? rawSecondary : primaryColor

  // Converte hex para componentes RGB para permitir rgba() nos componentes
  // Normaliza hex curto (#RGB → #RRGGBB) antes de fazer o parse
  const rawHex = primaryColor.replace('#', '')
  const hex = rawHex.length === 3
    ? rawHex.split('').map((c) => c + c).join('')
    : rawHex
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const primaryRgb = [r, g, b].some(isNaN) ? '37, 99, 235' : `${r}, ${g}, ${b}`

  return (
    <>
      {/* Injeta CSS variables de cor para uso nos componentes do dashboard do cliente */}
      <style>{`
        :root {
          --agency-primary: ${primaryColor};
          --agency-primary-rgb: ${primaryRgb};
          --agency-secondary: ${secondaryColor};
        }
      `}</style>

      <div className="min-h-screen bg-neutral-50 print:bg-white">
        {/* Header white-label com cor da marca */}
        <header
          style={{ backgroundColor: 'var(--agency-primary)' }}
          className="print:bg-white print:border-b print:border-neutral-300"
        >
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={agencyName}
                  width={120}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="font-semibold text-white print:text-neutral-900">{agencyName}</span>
              )}
            </div>
            <span className="text-xs text-white/60 print:hidden">Dashboard de Performance</span>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="max-w-6xl mx-auto px-6 py-8 print:py-4 print:px-0">
          {children}
        </main>
      </div>
    </>
  )
}
