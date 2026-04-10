import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-lg font-bold text-white">Metrik</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#problema" className="text-sm text-slate-400 transition-colors hover:text-white">
            Problema
          </a>
          <a href="#features" className="text-sm text-slate-400 transition-colors hover:text-white">
            Features
          </a>
          <a href="#pricing" className="text-sm text-slate-400 transition-colors hover:text-white">
            Preços
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Entrar
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
          >
            <Link href="/cadastro">Criar conta grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
