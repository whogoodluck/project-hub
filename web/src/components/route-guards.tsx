import { useAuth } from '@/contexts/auth.context'
import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullScreenSpinner />
  if (!isAuthenticated) return <Navigate to='/signin' replace />
  return <Outlet />
}

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullScreenSpinner />
  if (isAuthenticated) return <Navigate to='/dashboard' replace />
  return <Outlet />
}

function FullScreenSpinner() {
  return (
    <div className='flex h-screen w-screen items-center justify-center bg-background'>
      <div className='h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground' />
    </div>
  )
}
