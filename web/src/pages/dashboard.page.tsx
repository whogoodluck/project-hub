import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth.context'
import { Layers } from 'lucide-react'

export default function DashboardPage() {
  const { user, signout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-mono text-sm font-bold text-foreground">Project Hub</span>
        </div>
        <Button
          onClick={signout}
          variant="ghost"
          className="font-mono text-xs uppercase text-muted-foreground"
        >
          Sign out
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 font-mono text-4xl font-bold text-foreground">
            Hey, {user?.name} 👋
          </div>
          <div className="font-mono text-sm text-muted-foreground">
            Role: <span className="text-foreground">{user?.role.replace('_', ' ')}</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Dashboard coming soon...</p>
        </div>
      </div>
    </div>
  )
}