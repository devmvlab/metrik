'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, CreditCard } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users, exact: false },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings, exact: false },
  { href: '/dashboard/billing', label: 'Plano & Billing', icon: CreditCard, exact: false },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
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
