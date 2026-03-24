import { activityApi, projectsApi } from '@/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badges'
import { useSocket } from '@/contexts/socket.context'
import type { ActivityLog } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Activity, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

function LogEntry({ log }: { log: ActivityLog }) {
  return (
    <div className='flex gap-3 py-3.5 border-b border-border last:border-0'>
      <Avatar className='h-7 w-7 shrink-0 mt-0.5'>
        <AvatarFallback className='text-xs'>
          {log.actor.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 min-w-0'>
        <p className='text-sm text-foreground'>{log.message}</p>
        {log.fromStatus && log.toStatus && (
          <div className='flex items-center gap-2 mt-1.5'>
            <StatusBadge status={log.fromStatus} />
            <ArrowRight className='h-3 w-3 text-muted-foreground' />
            <StatusBadge status={log.toStatus} />
          </div>
        )}
        <p className='text-xs text-muted-foreground mt-1'>
          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}

export default function ActivityPage() {
  const [projectFilter, setProjectFilter] = useState('')
  const { recentActivity } = useSocket()

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity', projectFilter],
    queryFn: () => activityApi.feed(projectFilter || undefined),
  })

  const combined = [...recentActivity, ...logs]
    .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    .filter((l) => !projectFilter || l.projectId === projectFilter)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 50)

  return (
    <div>
      <PageHeader
        title='Activity Feed'
        description='Live updates across all projects'
        action={
          <div className='flex items-center gap-2'>
            <span className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
            <span className='text-xs text-muted-foreground'>Live</span>
          </div>
        }
      />

      <div className='p-6'>
        <div className='mb-4'>
          <Select
            value={projectFilter || 'all'}
            onValueChange={(v) => setProjectFilter(v === 'all' ? '' : v)}
          >
            <SelectTrigger className='w-48 h-8 text-xs'>
              <SelectValue placeholder='All projects' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : combined.length === 0 ? (
          <EmptyState
            icon={Activity}
            title='No activity yet'
            description='Activity will appear here as team members work on tasks'
          />
        ) : (
          <div className='max-w-2xl'>
            {combined.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
