import { AppShell } from '@/components/layout/app-shell'
import { ProtectedRoute, PublicRoute } from '@/components/route-guards'
import { AuthProvider } from '@/contexts/auth.context'
import { SocketProvider } from '@/contexts/socket.context'
import ActivityPage from '@/pages/activity.page'
import SigninPage from '@/pages/auth/signin.page'
import SignupPage from '@/pages/auth/signup.page'
import ClientsPage from '@/pages/clients.page'
import DashboardPage from '@/pages/dashboard.page'
import HomePage from '@/pages/home.page'
import ProjectDetailPage from '@/pages/project-detail.page'
import ProjectsPage from '@/pages/projects.page'
import UsersPage from '@/pages/users.page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

function AuthenticatedApp() {
  return (
    <SocketProvider>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/projects' element={<ProjectsPage />} />
            <Route
              path='/projects/:projectId'
              element={<ProjectDetailPage />}
            />
            <Route path='/clients' element={<ClientsPage />} />
            <Route path='/users' element={<UsersPage />} />
            <Route path='/activity' element={<ActivityPage />} />
          </Route>
        </Route>
      </Routes>
    </SocketProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<HomePage />} />

            <Route element={<PublicRoute />}>
              <Route path='/signin' element={<SigninPage />} />
              <Route path='/signup' element={<SignupPage />} />
            </Route>

            <Route path='/*' element={<AuthenticatedApp />} />
          </Routes>

          <Toaster
            position='top-right'
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
