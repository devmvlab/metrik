import Link from 'next/link'
import { headers } from 'next/headers'
import { LayoutDashboard, Users, Settings, CreditCard } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getAgencyById } from '@/lib/db/agencies'
import { Badge } from '@/components/ui/badge'
import { MetrikLogo } from '@/components/marketing/MetrikLogo'
import { LogoutButton } from '@/components/dashboard/LogoutButton'

const navItems = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users, exact: false },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings, exact: false },
  { href: '/dashboard/billing', label: 'Plano & Billing', icon: CreditCard, exact: false },
]

const planLabels: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  AGENCY: 'Agency',
}

export default async function Sidebar() {
  const session = await getSession()
  const agency = session ? await getAgencyById(session.agencyId) : null
  const pathname = headers().get('x-pathname') ?? ''

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col h-full border-r border-neutral-200 bg-white">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-neutral-200">
        <Link href="/dashboard">
          <MetrikLogo size="sm" textClassName="text-neutral-900" />
        </Link>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-neutral-100 text-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer — agência + plano + logout */}
      <div className="px-3 py-3 border-t border-neutral-200 space-y-2">
        {agency && (
          <div className="px-3">
            <p className="text-xs font-medium text-neutral-900 truncate">{agency.name}</p>
            <div className="mt-1">
              <Badge variant="outline" className="text-xs">
                {planLabels[agency.plan] ?? agency.plan}
              </Badge>
            </div>
          </div>
        )}
        <LogoutButton />
      </div>
    </aside>
  )
}
