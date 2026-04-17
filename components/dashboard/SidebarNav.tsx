'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, CreditCard, Lock } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, exact: true, lockable: true },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users, exact: false, lockable: true },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings, exact: false, lockable: true },
  { href: '/dashboard/billing', label: 'Plano & Billing', icon: CreditCard, exact: false, lockable: false },
]

interface SidebarNavProps {
  isRestricted?: boolean
}

export function SidebarNav({ isRestricted = false }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {navItems.map(({ href, label, icon: Icon, exact, lockable }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        const isLocked = isRestricted && lockable

        if (isLocked) {
          return (
            <span
              key={href}
              title="Ative um plano para acessar"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-not-allowed select-none text-slate-600"
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-700" />
              <span className="flex-1">{label}</span>
              <Lock className="w-3 h-3 shrink-0 text-slate-700" />
            </span>
          )
        }

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-violet-500/20 text-violet-300 border-r-2 border-violet-500 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-400' : ''}`} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
