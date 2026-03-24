import { activityApi, projectsApi, tasksApi } from '@/api'
import { TaskForm } from '@/components/tasks/task-form'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PriorityBadge, StatusBadge } from '@/components/ui/status-badges'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth.context'
import { useSocket } from '@/contexts/socket.context'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  Activity,
  ChevronDown,
  Clock,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  User2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

const STATUS_OPTIONS: TaskStatus[] = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
  'OVERDUE',
]
const PRIORITY_OPTIONS: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

function TaskCard({
  task,
  projectId,
  canManage,
  onEdit,
  onDelete,
}: {
  task: Task
  projectId: string
  canManage: boolean
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
}) {
  const qc = useQueryClient()
  const { user } = useAuth()

  const updateStatus = useMutation({
    mutationFn: (status: string) =>
      tasksApi.updateStatus(projectId, task.id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
    onError: () => toast.error('Failed to update status'),
  })

  const canChangeStatus =
    canManage || (user?.role === 'DEVELOPER' && task.assigneeId === user.id)

  return (
    <Card
      className={`group transition-shadow hover:shadow-sm ${task.isOverdue ? 'border-red-200 dark:border-red-900' : ''}`}
    >
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2'>
              <p className='text-sm font-medium text-foreground leading-snug'>
                {task.title}
              </p>
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100'
                    >
                      <MoreHorizontal className='h-3.5 w-3.5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive'
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className='mr-2 h-3.5 w-3.5' /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {task.description && (
              <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                {task.description}
              </p>
            )}

            <div className='mt-3 flex flex-wrap items-center gap-2'>
              <PriorityBadge priority={task.priority} />
              {canChangeStatus ? (
                <Select
                  value={task.status}
                  onValueChange={(v) => updateStatus.mutate(v)}
                >
                  <SelectTrigger className='h-6 w-auto text-xs px-2 gap-1 border-0 bg-transparent hover:bg-muted p-0'>
                    <StatusBadge status={task.status} />
                    <ChevronDown className='h-3 w-3 text-muted-foreground ml-0.5' />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((s) => s !== 'OVERDUE').map((s) => (
                      <SelectItem key={s} value={s} className='text-xs'>
                        <StatusBadge status={s} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <StatusBadge status={task.status} />
              )}
            </div>

            <div className='mt-2.5 flex items-center gap-3 text-xs text-muted-foreground'>
              {task.assignee ? (
                <div className='flex items-center gap-1.5'>
                  <Avatar className='h-4 w-4'>
                    <AvatarFallback className='text-[9px]'>
                      {task.assignee.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{task.assignee.name}</span>
                </div>
              ) : (
                <div className='flex items-center gap-1'>
                  <User2 className='h-3.5 w-3.5' />
                  <span>Unassigned</span>
                </div>
              )}

              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 ${task.isOverdue ? 'text-red-500' : ''}`}
                >
                  <Clock className='h-3.5 w-3.5' />
                  <span>
                    {formatDistanceToNow(new Date(task.dueDate), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityFeed({ projectId }: { projectId: string }) {
  const { recentActivity } = useSocket()
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: () => activityApi.feed(projectId),
  })

  const combined = [
    ...recentActivity.filter((a) => a.projectId === projectId),
    ...logs,
  ]
    .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 30)

  if (isLoading)
    return (
      <div className='flex justify-center py-8'>
        <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
      </div>
    )

  if (combined.length === 0)
    return (
      <EmptyState
        icon={Activity}
        title='No activity yet'
        description='Activity will appear here as work happens'
      />
    )

  return (
    <div className='space-y-0 divide-y divide-border'>
      {combined.map((log) => (
        <div key={log.id} className='flex gap-3 py-3 px-1'>
          <Avatar className='h-6 w-6 shrink-0 mt-0.5'>
            <AvatarFallback className='text-[9px]'>
              {log.actor.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-sm text-foreground'>{log.message}</p>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {formatDistanceToNow(new Date(log.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const { joinProject, leaveProject } = useSocket()
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const statusFilter = searchParams.get('status') ?? ''
  const priorityFilter = searchParams.get('priority') ?? ''

  useEffect(() => {
    if (projectId) {
      joinProject(projectId)
      return () => leaveProject(projectId)
    }
  }, [projectId, joinProject, leaveProject])

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.get(projectId!),
    enabled: !!projectId,
  })

  const { data: taskData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId, statusFilter, priorityFilter],
    queryFn: () =>
      tasksApi.list(projectId!, {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      }),
    enabled: !!projectId,
  })

  const tasks = taskData?.tasks ?? []

  const remove = useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(projectId!, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      setDeleteId(null)
      toast.success('Task deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const canManage =
    user?.role === 'ADMIN' ||
    (user?.role === 'PROJECT_MANAGER' && project?.managerId === user.id)

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  if (projectLoading)
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )

  if (!project)
    return (
      <div className='p-6 text-center text-muted-foreground'>
        Project not found
      </div>
    )

  return (
    <div>
      <PageHeader
        title={project.name}
        description={`Client: ${project.client.name} · PM: ${project.manager.name}`}
        action={
          canManage ? (
            <Button
              onClick={() => {
                setEditTask(undefined)
                setTaskFormOpen(true)
              }}
              size='sm'
              className='gap-1.5'
            >
              <Plus className='h-4 w-4' /> New Task
            </Button>
          ) : undefined
        }
      />

      <div className='p-6'>
        <Tabs defaultValue='tasks'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-4'>
            <TabsList>
              <TabsTrigger value='tasks'>Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value='activity'>Activity</TabsTrigger>
            </TabsList>

            <div className='flex gap-2 sm:ml-auto'>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(v) => setFilter('status', v === 'all' ? '' : v)}
              >
                <SelectTrigger className='h-8 text-xs w-36'>
                  <SelectValue placeholder='All statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All statuses</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={priorityFilter || 'all'}
                onValueChange={(v) =>
                  setFilter('priority', v === 'all' ? '' : v)
                }
              >
                <SelectTrigger className='h-8 text-xs w-32'>
                  <SelectValue placeholder='All priorities' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All priorities</SelectItem>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value='tasks'>
            {tasksLoading ? (
              <div className='flex justify-center py-16'>
                <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={Activity}
                title='No tasks found'
                description={
                  canManage
                    ? 'Create the first task for this project'
                    : 'No tasks assigned to you in this project'
                }
                action={
                  canManage ? (
                    <Button
                      onClick={() => setTaskFormOpen(true)}
                      size='sm'
                      className='gap-1.5'
                    >
                      <Plus className='h-4 w-4' /> New Task
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {tasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    projectId={projectId!}
                    canManage={canManage}
                    onEdit={(task) => {
                      setEditTask(task)
                      setTaskFormOpen(true)
                    }}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='activity'>
            <ActivityFeed projectId={projectId!} />
          </TabsContent>
        </Tabs>
      </div>

      <TaskForm
        open={taskFormOpen}
        onOpenChange={(v) => {
          setTaskFormOpen(v)
          if (!v) setEditTask(undefined)
        }}
        projectId={projectId!}
        task={editTask}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title='Delete task?'
        description='This will permanently delete the task and its activity log.'
        onConfirm={() => deleteId && remove.mutate(deleteId)}
        loading={remove.isPending}
      />
    </div>
  )
}
