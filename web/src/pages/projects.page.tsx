import { clientsApi, projectsApi } from '@/api'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth.context'
import type { Project } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  FolderOpen,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

function ProjectForm({
  open,
  onOpenChange,
  project,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  project?: Project
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
    clientId: project?.clientId ?? '',
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsApi.list,
  })

  const mutation = useMutation({
    mutationFn: project
      ? (d: typeof form) => projectsApi.update(project.id, d)
      : projectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      onOpenChange(false)
      toast.success(project ? 'Project updated' : 'Project created')
    },
    onError: () => toast.error('Something went wrong'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <div>
            <Label className='text-xs'>Project Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder='Website Redesign'
              className='mt-1'
            />
          </div>
          <div>
            <Label className='text-xs'>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder='Brief description...'
              className='mt-1 resize-none'
              rows={3}
            />
          </div>
          {!project && (
            <div>
              <Label className='text-xs'>Client *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}
              >
                <SelectTrigger className='mt-1'>
                  <SelectValue placeholder='Select client' />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={
              !form.name || (!project && !form.clientId) || mutation.isPending
            }
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const remove = useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      setDeleteId(null)
      toast.success('Project deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const archive = useMutation({
    mutationFn: (p: Project) =>
      projectsApi.update(p.id, { isArchived: !p.isArchived }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  const canManage = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  function openEdit(project: Project) {
    setEditProject(project)
    setFormOpen(true)
  }

  return (
    <div>
      <PageHeader
        title='Projects'
        description='All projects you have access to'
        action={
          canManage ? (
            <Button
              onClick={() => {
                setEditProject(undefined)
                setFormOpen(true)
              }}
              size='sm'
              className='gap-1.5'
            >
              <Plus className='h-4 w-4' /> New Project
            </Button>
          ) : undefined
        }
      />

      <div className='p-6'>
        {isLoading ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title='No projects yet'
            description={
              canManage
                ? 'Create your first project to get started'
                : 'No projects assigned to you yet'
            }
            action={
              canManage ? (
                <Button
                  onClick={() => setFormOpen(true)}
                  size='sm'
                  className='gap-1.5'
                >
                  <Plus className='h-4 w-4' /> New Project
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {projects.map((p) => (
              <Card
                key={p.id}
                className={`group transition-shadow hover:shadow-md ${p.isArchived ? 'opacity-60' : ''}`}
              >
                <CardContent className='p-5'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0'>
                      <FolderOpen className='h-5 w-5 text-primary' />
                    </div>
                    {canManage && (
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
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => archive.mutate(p)}>
                            <Archive className='mr-2 h-3.5 w-3.5' />
                            {p.isArchived ? 'Unarchive' : 'Archive'}
                          </DropdownMenuItem>
                          {user?.role === 'ADMIN' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='text-destructive focus:text-destructive'
                                onClick={() => setDeleteId(p.id)}
                              >
                                <Trash2 className='mr-2 h-3.5 w-3.5' /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <Link to={`/projects/${p.id}`}>
                    <h3 className='font-semibold text-foreground hover:text-primary transition-colors line-clamp-1'>
                      {p.name}
                    </h3>
                  </Link>
                  {p.description && (
                    <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                      {p.description}
                    </p>
                  )}

                  <div className='mt-3 flex items-center gap-2 flex-wrap'>
                    <Badge variant='secondary' className='text-xs'>
                      {p.client.name}
                    </Badge>
                    {p.isArchived && (
                      <Badge variant='outline' className='text-xs'>
                        Archived
                      </Badge>
                    )}
                  </div>

                  <div className='mt-3 flex items-center justify-between text-xs text-muted-foreground'>
                    <span>PM: {p.manager.name}</span>
                    <span>{p._count?.tasks ?? 0} tasks</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProjectForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v)
          if (!v) setEditProject(undefined)
        }}
        project={editProject}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title='Delete project?'
        description='All tasks and activity logs will be permanently deleted.'
        onConfirm={() => deleteId && remove.mutate(deleteId)}
        loading={remove.isPending}
      />
    </div>
  )
}
