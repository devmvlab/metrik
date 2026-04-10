import Link from 'next/link'
import { LayoutDashboard, Users, BarChart3 } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getAgencyById } from '@/lib/db/agencies'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
]

const planLabels: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  AGENCY: 'Agency',
}

export default async function Sidebar() {
  const session = await getSession()
  const agency = session ? await getAgencyById(session.agencyId) : null

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full border-r border-neutral-200 bg-white">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-neutral-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-neutral-900" />
          <span className="font-semibold text-neutral-900 text-sm">Metrik</span>
        </Link>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer — agência + plano */}
      {agency && (
        <div className="px-4 py-4 border-t border-neutral-200">
          <p className="text-xs font-medium text-neutral-900 truncate">{agency.name}</p>
          <div className="mt-1">
            <Badge variant="outline" className="text-xs">
              {planLabels[agency.plan] ?? agency.plan}
            </Badge>
          </div>
        </div>
      )}
    </aside>
  )
}
