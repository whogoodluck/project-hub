import { notificationsApi } from '@/api'
import { useAuth } from '@/contexts/auth.context'
import { useSocket } from '@/contexts/socket.context'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  ChevronDown,
  FolderOpen,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { NotificationDropdown } from '../notifications/notification-dropdown'
import { useTheme } from '../theme-provider'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'

const navItems = {
  ADMIN: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/activity', icon: Activity, label: 'Activity Feed' },
  ],
  PROJECT_MANAGER: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/activity', icon: Activity, label: 'Activity Feed' },
  ],
  DEVELOPER: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'My Projects' },
    { to: '/activity', icon: Activity, label: 'Activity Feed' },
  ],
}

function NavItems({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth()
  const items = navItems[user?.role ?? 'DEVELOPER']

  return (
    <nav className='flex flex-col gap-1'>
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Icon className='h-4 w-4 shrink-0' />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, signout } = useAuth()
  const { onlineCount } = useSocket()
  const navigate = useNavigate()

  async function handleSignout() {
    await signout()
    navigate('/signin', { replace: true })
    toast.success('Signed out')
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center gap-2.5 px-4 py-5 border-b border-border'>
        <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary shrink-0'>
          <Layers className='h-4 w-4 text-primary-foreground' />
        </div>
        <span className='font-mono text-sm font-bold text-foreground'>
          Project Hub
        </span>
        {onClose && (
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='ml-auto text-muted-foreground hover:text-foreground'
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      <div className='flex-1 overflow-y-auto px-3 py-4'>
        <NavItems onClose={onClose} />
      </div>

      {user?.role === 'ADMIN' && (
        <div className='px-4 py-2 border-t border-border'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse' />
            <span>{onlineCount} online</span>
          </div>
        </div>
      )}

      <div className='px-3 py-3 border-t border-border'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex w-full items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted transition-colors text-left'>
              <Avatar className='h-7 w-7'>
                <AvatarFallback className='text-xs bg-primary text-primary-foreground'>
                  {user?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium text-foreground truncate'>
                  {user?.name}
                </div>
                <div className='text-xs text-muted-foreground truncate'>
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='top' align='end' className='w-48'>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignout}
              className='text-destructive focus:text-destructive'
            >
              <LogOut className='mr-2 h-4 w-4' />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 60_000,
  })

  const { theme, setTheme } = useTheme()

  return (
    <div className='flex h-screen bg-background overflow-hidden'>
      <aside className='hidden lg:flex w-60 border-r border-border flex-col shrink-0'>
        <SidebarContent />
      </aside>

      <div className='flex flex-1 flex-col min-w-0'>
        <header className='flex h-14 items-center gap-3 border-b border-border px-4 shrink-0'>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='lg:hidden'>
                <Menu className='h-4 w-4' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0 w-64'>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className='flex lg:hidden items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary'>
              <Layers className='h-3 w-3 text-primary-foreground' />
            </div>
            <span className='font-mono text-sm font-bold'>Project Hub</span>
          </div>

          <div className='ml-auto flex items-center gap-2 md:gap-4'>
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
            <NotificationDropdown unreadCount={unreadCount} />
          </div>
        </header>

        <main className='flex-1 overflow-y-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
