import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth.context'
import { Activity, Layers, Lock, Moon, Sun, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: Zap,
    title: 'Real-time feeds',
    desc: 'Live activity across every project, updated the moment it happens via WebSocket.',
  },
  {
    icon: Lock,
    title: 'Role-based access',
    desc: 'Admin, Project Manager, and Developer — each with strictly enforced permissions.',
  },
  {
    icon: Activity,
    title: 'Task tracking',
    desc: 'Priority queues, due dates, overdue flags, and a full audit log on every task.',
  },
]

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <div className='relative min-h-screen overflow-hidden bg-background'>
      <div
        className='absolute inset-0 opacity-[0.4] dark:opacity-[0.03]'
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          color: 'var(--border)',
        }}
      />

      <div className='absolute left-1/2 top-0 size-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl' />

      <nav className='relative flex items-center justify-between px-6 py-5 sm:px-12'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
            <Layers className='h-4 w-4 text-primary-foreground' />
          </div>
          <span className='font-mono text-sm font-bold text-foreground'>
            Project Hub
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant='ghost'
            size='icon'
          >
            {theme === 'dark' ? (
              <Sun className='h-4 w-4' />
            ) : (
              <Moon className='h-4 w-4' />
            )}
          </Button>
          {isAuthenticated ? (
            <Button
              asChild
              className='font-mono text-xs tracking-widest uppercase'
            >
              <Link to='/dashboard'>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant='ghost'
                className='font-mono text-xs uppercase'
              >
                <Link to='/signin'>Sign In</Link>
              </Button>
              <Button
                asChild
                className='font-mono text-xs tracking-widest uppercase'
              >
                <Link to='/signup'>Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      <main className='relative px-6 pb-24 pt-20 text-center sm:px-12 sm:pt-32'>
        <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-green-500' />
          <span className='font-mono text-xs tracking-widest text-muted-foreground uppercase'>
            Live · Real-time
          </span>
        </div>

        <h1 className='mx-auto mb-6 max-w-3xl font-mono text-5xl font-bold leading-none tracking-tight text-foreground sm:text-7xl'>
          Ship projects.
          <br />
          <span className='text-muted-foreground/40'>Not chaos.</span>
        </h1>

        <p className='mx-auto mb-10 max-w-md text-base leading-relaxed text-muted-foreground'>
          A real-time agency dashboard with role-based access, live activity
          feeds, and task management that actually works.
        </p>

        <div className='flex flex-col items-center justify-center gap-3 sm:flex-row'>
          <Button
            asChild
            size='lg'
            className='px-8 font-mono font-bold tracking-widest uppercase'
          >
            <Link to='/signup'>Start free</Link>
          </Button>
          <Button
            asChild
            size='lg'
            variant='outline'
            className='font-mono text-sm uppercase'
          >
            <Link to='/signin'>Sign in</Link>
          </Button>
        </div>

        <div className='mx-auto mt-24 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3'>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className='rounded-xl border border-border bg-card p-6 text-left'
            >
              <div className='mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted'>
                <f.icon className='h-4 w-4 text-muted-foreground' />
              </div>
              <h3 className='mb-2 font-mono text-sm font-bold text-card-foreground'>
                {f.title}
              </h3>
              <p className='text-xs leading-relaxed text-muted-foreground'>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
