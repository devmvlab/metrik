import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { MetrikLogo } from '@/components/marketing/MetrikLogo'

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const headerStore = headers()
  const agencyId = headerStore.get('x-agency-id')
  const agencyName = headerStore.get('x-agency-name')
  const logoUrl = headerStore.get('x-agency-logo-url')
  const rawPrimary = headerStore.get('x-agency-primary-color') ?? ''
  const primaryColor = HEX_RE.test(rawPrimary) ? rawPrimary : '#2563eb'

  const isWhiteLabel = !!agencyId

  // Converte hex para rgba com baixa opacidade para o glow de fundo
  const hex = primaryColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const glowColor = isWhiteLabel
    ? `rgba(${r}, ${g}, ${b}, 0.1)`
    : 'rgba(124, 58, 237, 0.1)'

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sobrescreve as classes violet do Tailwind quando em modo white-label */}
      {isWhiteLabel && (
        <style>{`
          .auth-theme button[type="submit"] {
            --tw-gradient-from: ${primaryColor} !important;
            --tw-gradient-to: ${primaryColor} !important;
          }
          .auth-theme button[type="submit"]:hover {
            --tw-gradient-from: ${primaryColor}dd !important;
            --tw-gradient-to: ${primaryColor}dd !important;
          }
          .auth-theme .text-violet-400 { color: ${primaryColor} !important; }
          .auth-theme .hover\\:text-violet-300:hover { color: ${primaryColor}cc !important; }
          .auth-theme .focus-visible\\:ring-violet-500:focus-visible { --tw-ring-color: ${primaryColor}80 !important; }
        `}</style>
      )}

      {/* Glow de fundo — cor da agência no white-label, violeta padrão */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: glowColor }}
        />
      </div>

      <div className={`relative z-10 w-full max-w-md${isWhiteLabel ? ' auth-theme' : ''}`}>
        {/* Logo: agência (white-label) ou Metrik (padrão) */}
        <div className="flex justify-center mb-8">
          {isWhiteLabel ? (
            <div className="h-10 flex items-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={agencyName ?? 'Dashboard'}
                  width={160}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span className="text-xl font-semibold text-white">{agencyName}</span>
              )}
            </div>
          ) : (
            <Link href="/">
              <MetrikLogo size="md" glow />
            </Link>
          )}
        </div>

        {children}
      </div>
    </div>
  )
}
