import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Separator className="mb-8 bg-slate-800" />

        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <span className="text-xs font-bold text-white">M</span>
            </div>
            <span className="font-semibold text-white">Metrik</span>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Metrik. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="transition-colors hover:text-slate-300">
              Entrar
            </Link>
            <Link href="/cadastro" className="transition-colors hover:text-slate-300">
              Criar conta
            </Link>
            <a href="mailto:contato@metrik.com.br" className="transition-colors hover:text-slate-300">
              Contato
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
