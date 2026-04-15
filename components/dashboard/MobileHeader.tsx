'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, CreditCard } from 'lucide-react'
import { MetrikLogo } from '@/components/marketing/MetrikLogo'
import { LogoutButton } from '@/components/dashboard/LogoutButton'

const navItems = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users, exact: false },
  { href: '/dashboard/configuracoes', label: 'Config.', icon: Settings, exact: false },
  { href: '/dashboard/billing', label: 'Plano', icon: CreditCard, exact: false },
]

export default function MobileHeader() {
  const pathname = usePathname()

  return (
    <header className="md:hidden flex flex-col border-b border-slate-800 bg-slate-900 shrink-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12">
        <Link href="/dashboard">
          <MetrikLogo size="sm" />
        </Link>
        <LogoutButton />
      </div>

      {/* Nav links — horizontal scroll */}
      <nav className="flex overflow-x-auto px-3 pb-2 gap-1 scrollbar-none">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-violet-500/20 text-violet-300 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
