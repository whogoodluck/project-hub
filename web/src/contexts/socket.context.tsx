import { useAuth } from '@/contexts/auth.context'
import type { ActivityLog } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { io, type Socket } from 'socket.io-client'

interface SocketCtx {
  socket: Socket | null
  onlineCount: number
  joinProject: (projectId: string) => void
  leaveProject: (projectId: string) => void
  recentActivity: ActivityLog[]
}

const SocketContext = createContext<SocketCtx | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const token = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('access_token='))
      ?.split('=')[1]

    const socket = io('/', {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('presence:count', ({ count }: { count: number }) => {
      setOnlineCount(count)
    })

    socket.on('activity:new', ({ log }: { log: ActivityLog }) => {
      setRecentActivity((prev) => [log, ...prev].slice(0, 50))
      qc.invalidateQueries({ queryKey: ['activity'] })
    })

    socket.on('activity:catchup', ({ logs }: { logs: ActivityLog[] }) => {
      setRecentActivity(logs)
    })

    socket.on('notification:new', () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'count'] })
    })

    socket.on('notification:count', ({ count }: { count: number }) => {
      qc.setQueryData(['notifications', 'count'], count)
    })

    const pingInterval = setInterval(() => {
      socket.emit('ping')
    }, 30_000)

    return () => {
      clearInterval(pingInterval)
      socket.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, user, qc])

  const joinProject = useCallback((projectId: string) => {
    socketRef.current?.emit('project:join', projectId)
  }, [])

  const leaveProject = useCallback((projectId: string) => {
    socketRef.current?.emit('project:leave', projectId)
  }, [])

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineCount,
        joinProject,
        leaveProject,
        recentActivity,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider')
  return ctx
}
