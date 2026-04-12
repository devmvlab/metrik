type Size = "sm" | "md" | "lg" | "hero"

const sizeMap: Record<Size, { icon: number; text: string; gap: string }> = {
  sm:   { icon: 28,  text: "text-base font-bold",  gap: "gap-2"   },
  md:   { icon: 36,  text: "text-xl font-bold",    gap: "gap-2.5" },
  lg:   { icon: 48,  text: "text-2xl font-bold",   gap: "gap-3"   },
  hero: { icon: 72,  text: "text-4xl font-bold",   gap: "gap-4"   },
}

interface MetrikLogoProps {
  size?: Size
  glow?: boolean
  className?: string
  /** Classe de cor do texto. Padrão: "text-white" (para fundos escuros). */
  textClassName?: string
}

export function MetrikLogo({ size = "md", glow = false, className = "", textClassName = "text-white" }: MetrikLogoProps) {
  const { icon, text, gap } = sizeMap[size]
  const id = `metrik-grad-${size}`

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {/* Icon wrapper — relative so the glow layer stays contained */}
      <div className="relative flex items-center justify-center">

        {/* Glow layer: renders behind the SVG */}
        {glow && (
          <div
            className="absolute rounded-full bg-violet-500/50 blur-2xl"
            style={{ width: icon * 1.8, height: icon * 1.8 }}
            aria-hidden="true"
          />
        )}

        <svg
          width={icon}
          height={icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={
            glow
              ? { filter: "drop-shadow(0 0 12px rgba(139, 92, 246, 0.8)) drop-shadow(0 0 4px rgba(99, 102, 241, 0.6))" }
              : undefined
          }
        >
          <defs>
            <linearGradient id={id} x1="20" y1="80" x2="80" y2="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          <rect x="20" y="45" width="12" height="35" rx="4" fill={`url(#${id})`} />
          <rect x="44" y="30" width="12" height="50" rx="4" fill={`url(#${id})`} />
          <rect x="68" y="15" width="12" height="65" rx="4" fill={`url(#${id})`} />

          <path
            d="M26 55 L50 40 L74 25"
            stroke={`url(#${id})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <span className={`${text} ${textClassName} tracking-tight`}>
        Metrik
      </span>
    </div>
  )
}
