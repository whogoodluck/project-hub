import { ProtectedRoute, PublicRoute } from '@/components/route-guards'
import { AuthProvider } from '@/contexts/auth.context'
import SigninPage from '@/pages/auth/signin.page'
import SignupPage from '@/pages/auth/signup.page'
import DashboardPage from '@/pages/dashboard.page'
import HomePage from '@/pages/home.page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

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

            <Route element={<ProtectedRoute />}>
              <Route path='/dashboard' element={<DashboardPage />} />
            </Route>
          </Routes>

          <Toaster
            position='top-right'
            theme='dark'
            toastOptions={{
              style: {
                background: '#18181b',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '13px',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
