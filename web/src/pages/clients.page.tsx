import { clientsApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import type { Client } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

function ClientForm({
  open,
  onOpenChange,
  client,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  client?: Client
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: client?.name ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    company: client?.company ?? '',
  })

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const mutation = useMutation({
    mutationFn: client
      ? (d: typeof form) => clientsApi.update(client.id, d)
      : clientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      onOpenChange(false)
      toast.success(client ? 'Client updated' : 'Client created')
    },
    onError: () => toast.error('Something went wrong'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'New Client'}</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <div>
            <Label className='text-xs'>Name *</Label>
            <Input
              value={form.name}
              onChange={set('name')}
              placeholder='Acme Inc.'
              className='mt-1'
            />
          </div>
          <div>
            <Label className='text-xs'>Company</Label>
            <Input
              value={form.company}
              onChange={set('company')}
              placeholder='Acme Corp'
              className='mt-1'
            />
          </div>
          <div>
            <Label className='text-xs'>Email</Label>
            <Input
              value={form.email}
              onChange={set('email')}
              type='email'
              placeholder='contact@acme.com'
              className='mt-1'
            />
          </div>
          <div>
            <Label className='text-xs'>Phone</Label>
            <Input
              value={form.phone}
              onChange={set('phone')}
              placeholder='+1 555 000'
              className='mt-1'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={!form.name || mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ClientsPage() {
  const qc = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsApi.list,
  })

  const remove = useMutation({
    mutationFn: clientsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      setDeleteId(null)
      toast.success('Client deleted')
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? 'Cannot delete'),
  })

  function openEdit(client: Client) {
    setEditClient(client)
    setFormOpen(true)
  }

  function openNew() {
    setEditClient(undefined)
    setFormOpen(true)
  }

  return (
    <div>
      <PageHeader
        title='Clients'
        description='Manage your agency clients'
        action={
          <Button onClick={openNew} size='sm' className='gap-1.5'>
            <Plus className='h-4 w-4' /> New Client
          </Button>
        }
      />

      <div className='p-6'>
        {isLoading ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={Building2}
            title='No clients yet'
            description='Add your first client to start creating projects'
            action={
              <Button onClick={openNew} size='sm' className='gap-1.5'>
                <Plus className='h-4 w-4' />
                Add Client
              </Button>
            }
          />
        ) : (
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {clients.map((c) => (
              <Card key={c.id} className='group'>
                <CardContent className='p-5'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0'>
                      <Building2 className='h-5 w-5 text-primary' />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 opacity-0 group-hover:opacity-100'
                        >
                          <MoreHorizontal className='h-3.5 w-3.5' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => openEdit(c)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive'
                          onClick={() => setDeleteId(c.id)}
                        >
                          <Trash2 className='mr-2 h-3.5 w-3.5' /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className='font-semibold text-foreground'>{c.name}</h3>
                  {c.company && (
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      {c.company}
                    </p>
                  )}
                  <div className='mt-3 space-y-1.5'>
                    {c.email && (
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Mail className='h-3 w-3' /> {c.email}
                      </div>
                    )}
                    {c.phone && (
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Phone className='h-3 w-3' /> {c.phone}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ClientForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v)
          if (!v) setEditClient(undefined)
        }}
        client={editClient}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title='Delete client?'
        description='This cannot be undone. Clients with projects cannot be deleted.'
        onConfirm={() => deleteId && remove.mutate(deleteId)}
        loading={remove.isPending}
      />
    </div>
  )
}
