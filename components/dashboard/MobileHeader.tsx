import Link from 'next/link'
import { headers } from 'next/headers'
import { LayoutDashboard, Users, Settings, CreditCard } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { MetrikLogo } from '@/components/marketing/MetrikLogo'
import { LogoutButton } from '@/components/dashboard/LogoutButton'

const navItems = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users, exact: false },
  { href: '/dashboard/configuracoes', label: 'Config.', icon: Settings, exact: false },
  { href: '/dashboard/billing', label: 'Plano', icon: CreditCard, exact: false },
]

export default async function MobileHeader() {
  await getSession()
  const pathname = headers().get('x-pathname') ?? ''

  return (
    <header className="md:hidden flex flex-col border-b border-neutral-200 bg-white shrink-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12">
        <Link href="/dashboard">
          <MetrikLogo size="sm" textClassName="text-neutral-900" />
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
                  ? 'bg-neutral-100 text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
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
