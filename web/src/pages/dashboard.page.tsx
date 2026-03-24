import { dashboardApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { PriorityBadge, StatusBadge } from '@/components/ui/status-badges'
import { useAuth } from '@/contexts/auth.context'
import { useSocket } from '@/contexts/socket.context'
import type { AdminDashboard, DeveloperDashboard, PmDashboard } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  FolderOpen,
  Loader2,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color?: string
}) {
  return (
    <Card>
      <CardContent className='p-5'>
        <div className='flex items-start justify-between'>
          <div>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              {label}
            </p>
            <p className='text-3xl font-bold text-foreground mt-1'>{value}</p>
            {sub && (
              <p className='text-xs text-muted-foreground mt-0.5'>{sub}</p>
            )}
          </div>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${color ?? 'bg-muted'}`}
          >
            <Icon className='h-4 w-4 text-foreground/70' />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AdminView({ data }: { data: AdminDashboard }) {
  const { onlineCount } = useSocket()
  const statusOrder = [
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
    'OVERDUE',
  ] as const
  const statusLabels: Record<string, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
    OVERDUE: 'Overdue',
  }

  const totalTasks = Object.values(data.tasksByStatus).reduce(
    (s, v) => s + (v ?? 0),
    0
  )

  return (
    <div className='p-6 space-y-6'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          icon={FolderOpen}
          label='Total Projects'
          value={data.totalProjects}
          color='bg-blue-100 dark:bg-blue-900/30'
        />
        <StatCard
          icon={TrendingUp}
          label='Total Tasks'
          value={totalTasks}
          color='bg-violet-100 dark:bg-violet-900/30'
        />
        <StatCard
          icon={AlertTriangle}
          label='Overdue'
          value={data.overdueCount}
          color='bg-red-100 dark:bg-red-900/30'
        />
        <StatCard
          icon={Users}
          label='Online Now'
          value={onlineCount}
          sub='live'
          color='bg-green-100 dark:bg-green-900/30'
        />
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-semibold'>
            Tasks by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2.5'>
            {statusOrder.map((s) => {
              const count = data.tasksByStatus[s] ?? 0
              const pct = totalTasks
                ? Math.round((count / totalTasks) * 100)
                : 0
              return (
                <div key={s} className='flex items-center gap-3'>
                  <span className='w-24 text-xs text-muted-foreground shrink-0'>
                    {statusLabels[s]}
                  </span>
                  <div className='flex-1 h-2 rounded-full bg-muted overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all ${
                        s === 'OVERDUE'
                          ? 'bg-red-500'
                          : s === 'DONE'
                            ? 'bg-green-500'
                            : s === 'IN_REVIEW'
                              ? 'bg-purple-500'
                              : s === 'IN_PROGRESS'
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className='text-xs font-medium w-8 text-right text-foreground'>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PmView({ data }: { data: PmDashboard }) {
  const upcoming = data.upcomingThisWeek.slice(0, 5)

  const totalTasks = data.projects.reduce((s, p) => s + p.tasks.length, 0)
  const doneTasks = data.projects.reduce(
    (s, p) => s + p.tasks.filter((t) => t.status === 'DONE').length,
    0
  )

  return (
    <div className='p-6 space-y-6'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          icon={FolderOpen}
          label='My Projects'
          value={data.projects.length}
          color='bg-blue-100 dark:bg-blue-900/30'
        />
        <StatCard
          icon={TrendingUp}
          label='Total Tasks'
          value={totalTasks}
          color='bg-violet-100 dark:bg-violet-900/30'
        />
        <StatCard
          icon={CheckCircle2}
          label='Completed'
          value={doneTasks}
          color='bg-green-100 dark:bg-green-900/30'
        />
        <StatCard
          icon={Clock}
          label='Due This Week'
          value={upcoming.length}
          color='bg-orange-100 dark:bg-orange-900/30'
        />
      </div>

      <div className='grid lg:grid-cols-2 gap-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-semibold'>
              Projects Overview
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            {data.projects.slice(0, 5).map((p) => {
              const done = p.tasks.filter((t) => t.status === 'DONE').length
              const total = p.tasks.length
              const pct = total ? Math.round((done / total) * 100) : 0
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className='block'>
                  <div className='flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted transition-colors'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-foreground truncate'>
                        {p.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {done}/{total} tasks done
                      </p>
                    </div>
                    <div className='w-16 h-1.5 rounded-full bg-muted overflow-hidden shrink-0'>
                      <div
                        className='h-full rounded-full bg-primary'
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className='text-xs text-muted-foreground w-8 text-right'>
                      {pct}%
                    </span>
                  </div>
                </Link>
              )
            })}
            {data.projects.length === 0 && (
              <p className='text-sm text-muted-foreground py-4 text-center'>
                No projects yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-semibold'>
              Due This Week
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            {upcoming.map((t) => (
              <div
                key={t.id}
                className='flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors'
              >
                <Circle className='h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5' />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-foreground truncate'>{t.title}</p>
                  {t.dueDate && (
                    <p className='text-xs text-muted-foreground'>
                      {formatDistanceToNow(new Date(t.dueDate), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className='text-sm text-muted-foreground py-4 text-center'>
                Nothing due this week 🎉
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DeveloperView({ data }: { data: DeveloperDashboard }) {
  const inProgress = data.tasks.filter((t) => t.status === 'IN_PROGRESS')
  const overdue = data.tasks.filter(
    (t) => t.isOverdue || t.status === 'OVERDUE'
  )
  const inReview = data.tasks.filter((t) => t.status === 'IN_REVIEW')

  return (
    <div className='p-6 space-y-6'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          icon={Zap}
          label='Assigned'
          value={data.tasks.length}
          color='bg-blue-100 dark:bg-blue-900/30'
        />
        <StatCard
          icon={TrendingUp}
          label='In Progress'
          value={inProgress.length}
          color='bg-violet-100 dark:bg-violet-900/30'
        />
        <StatCard
          icon={CheckCircle2}
          label='In Review'
          value={inReview.length}
          color='bg-purple-100 dark:bg-purple-900/30'
        />
        <StatCard
          icon={AlertTriangle}
          label='Overdue'
          value={overdue.length}
          color='bg-red-100 dark:bg-red-900/30'
        />
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-sm font-semibold'>My Tasks</CardTitle>
            <Button variant='ghost' size='sm' className='text-xs' asChild>
              <Link to='/projects'>View Projects</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {data.tasks.slice(0, 10).map((t) => (
              <div
                key={t.id}
                className='flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted transition-colors'
              >
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-foreground truncate'>
                    {t.title}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>
                    {t.project.name}
                  </p>
                </div>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            ))}
            {data.tasks.length === 0 && (
              <p className='text-sm text-muted-foreground py-4 text-center'>
                No tasks assigned yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
    refetchInterval: 30_000,
  })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0]} 👋`}
        description={`Your ${user?.role?.replace('_', ' ').toLowerCase()} dashboard`}
      />

      {isLoading ? (
        <div className='flex items-center justify-center py-20'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </div>
      ) : data ? (
        <>
          {user?.role === 'ADMIN' && (
            <AdminView data={data as AdminDashboard} />
          )}
          {user?.role === 'PROJECT_MANAGER' && (
            <PmView data={data as PmDashboard} />
          )}
          {user?.role === 'DEVELOPER' && (
            <DeveloperView data={data as DeveloperDashboard} />
          )}
        </>
      ) : null}
    </div>
  )
}
