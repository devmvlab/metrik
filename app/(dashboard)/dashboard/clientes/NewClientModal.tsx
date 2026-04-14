'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, ArrowUpRight } from 'lucide-react'
import { createClientAction } from '@/lib/clients/actions'
import { useState } from 'react'

type Props = {
  atLimit?: boolean
  planName?: string
  planLimit?: number
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Enviando convite...' : 'Criar e enviar convite'}
    </Button>
  )
}

export function NewClientModal({ atLimit = false, planName, planLimit }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, action] = useFormState(createClientAction, null)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
        <Plus className="w-4 h-4" />
        Novo cliente
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
        </DialogHeader>

        {atLimit ? (
          // Estado: limite do plano atingido
          <div className="pt-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-4">
              <p className="font-medium mb-1">Limite do plano {planName} atingido</p>
              <p className="text-amber-700">
                Você já tem {planLimit} cliente{planLimit !== 1 ? 's' : ''} cadastrado
                {planLimit !== 1 ? 's' : ''}, que é o máximo do seu plano atual.
                Faça upgrade para adicionar mais clientes.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Fechar
              </Button>
              <Link href="/dashboard/billing">
                <Button size="sm" className="gap-1.5">
                  <ArrowUpRight className="w-4 h-4" />
                  Ver planos
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Estado: normal — formulário de criação
          <form action={action} className="space-y-4 pt-2">
            {state && !state.success && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Nome do cliente</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Empresa Exemplo"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contato@empresa.com"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <SubmitButton />
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
