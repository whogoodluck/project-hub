import { tasksApi, usersApi } from '@/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Task, TaskPriority } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

interface TaskFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  projectId: string
  task?: Task
}

export function TaskForm({
  open,
  onOpenChange,
  projectId,
  task,
}: TaskFormProps) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    assigneeId: task?.assigneeId ?? '',
    priority: task?.priority ?? 'MEDIUM',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
  })

  const { data: developers = [] } = useQuery({
    queryKey: ['developers'],
    queryFn: usersApi.developers,
  })

  const mutation = useMutation({
    mutationFn: task
      ? (d: typeof form) =>
          tasksApi.update(projectId, task.id, {
            ...d,
            assigneeId: d.assigneeId || null,
            dueDate: d.dueDate || null,
          })
      : (d: typeof form) =>
          tasksApi.create(projectId, {
            ...d,
            assigneeId: d.assigneeId || undefined,
            dueDate: d.dueDate || undefined,
          }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      onOpenChange(false)
      toast.success(task ? 'Task updated' : 'Task created')
    },
    onError: () => toast.error('Something went wrong'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <div>
            <Label className='text-xs'>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder='Implement login page'
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
              placeholder='Details...'
              className='mt-1 resize-none'
              rows={3}
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <Label className='text-xs'>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((f) => ({ ...f, priority: v as TaskPriority }))}
              >
                <SelectTrigger className='mt-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className='text-xs'>Due Date</Label>
              <Input
                type='date'
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className='mt-1'
              />
            </div>
          </div>
          <div>
            <Label className='text-xs'>Assign To</Label>
            <Select
              value={form.assigneeId || 'unassigned'}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  assigneeId: v === 'unassigned' ? '' : v,
                }))
              }
            >
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Unassigned' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='unassigned'>Unassigned</SelectItem>
                {developers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={!form.title || mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
