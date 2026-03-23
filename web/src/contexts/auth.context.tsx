import { getMeApi, signoutApi } from '@/api/auth.api'
import type { User } from '@/api/auth.api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext } from 'react'
import type { ReactNode } from 'react'

interface AuthCtx {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signout: () => Promise<void>
  invalidate: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()

  const { data: user = null, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMeApi,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const signout = useCallback(async () => {
    await signoutApi()
    qc.setQueryData(['me'], null)
    qc.clear()
  }, [qc])

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['me'] })
  }, [qc])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, signout, invalidate }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}