import { cn } from '@/lib/utils'
import type { TaskPriority, TaskStatus } from '@/types'
import { Badge } from './badge'

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> =
  {
    TODO: {
      label: 'To Do',
      className:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      className:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    IN_REVIEW: {
      label: 'In Review',
      className:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
    DONE: {
      label: 'Done',
      className:
        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800',
    },
    OVERDUE: {
      label: 'Overdue',
      className:
        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
    },
  }

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; className: string; dot: string }
> = {
  LOW: {
    label: 'Low',
    className:
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
  MEDIUM: {
    label: 'Medium',
    className:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  HIGH: {
    label: 'High',
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    dot: 'bg-red-500',
  },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Badge
      variant='outline'
      className={cn('font-medium text-xs', cfg.className)}
    >
      {cfg.label}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = PRIORITY_CONFIG[priority]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        cfg.className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN:
      'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    PROJECT_MANAGER:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    DEVELOPER:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        map[role] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {role.replace('_', ' ')}
    </span>
  )
}
