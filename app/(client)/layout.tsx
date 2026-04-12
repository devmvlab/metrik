import { requireClientViewer } from '@/lib/auth/session'
import { getAgencyById } from '@/lib/db/agencies'
import Image from 'next/image'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await requireClientViewer()
  const agency = await getAgencyById(session.agencyId)

  const primaryColor = agency?.whiteLabelConfig?.primaryColor ?? '#2563eb'
  const logoUrl = agency?.whiteLabelConfig?.logoUrl ?? null
  const agencyName = agency?.name ?? 'Dashboard'

  return (
    <>
      {/* Injeta a cor primária da agência como CSS variable */}
      <style>{`
        :root {
          --agency-primary: ${primaryColor};
        }
      `}</style>

      <div className="min-h-screen bg-neutral-50 print:bg-white">
        {/* Header white-label */}
        <header className="bg-white border-b border-neutral-200 print:border-neutral-300">
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
                <span className="font-semibold text-neutral-900">{agencyName}</span>
              )}
            </div>
            <span className="text-xs text-neutral-400 print:hidden">Dashboard de Performance</span>
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
