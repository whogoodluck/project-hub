import type { Socket, Server as SocketIoServer } from 'socket.io'
import prisma from '../lib/prisma'
import { getMissedLogs } from '../services/activity.service'
import { getUnreadCount } from '../services/notification.service'
import { verifyAccessToken } from '../utils/jwt'

interface AuthSocket extends Socket {
  userId: string
  userRole: string
  userName: string
}

export function registerSocketHandlers(io: SocketIoServer) {
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '')

    if (!token) return next(new Error('UNAUTHORIZED'))

    try {
      const payload = verifyAccessToken(token)
      ;(socket as AuthSocket).userId = payload.sub
      ;(socket as AuthSocket).userRole = payload.role
      ;(socket as AuthSocket).userName = payload.name
      next()
    } catch {
      next(new Error('UNAUTHORIZED'))
    }
  })

  io.on('connection', async socket => {
    const s = socket as AuthSocket
    const { userId, userRole } = s

    s.join(`user:${userId}`)

    await prisma.presenceSession.upsert({
      where: { socketId: s.id },
      create: { userId, socketId: s.id },
      update: { lastPing: new Date() },
    })

    const onlineCount = await prisma.presenceSession.count()
    io.to('role:ADMIN').emit('presence:count', { count: onlineCount })

    s.join(`role:${userRole}`)

    const unread = await getUnreadCount(userId)
    s.emit('notification:count', { count: unread })

    s.on('project:join', async (projectId: string) => {
      if (!projectId) return

      if (userRole === 'PROJECT_MANAGER') {
        const project = await prisma.project.findUnique({ where: { id: projectId } })
        if (!project || project.managerId !== userId) {
          s.emit('error', { message: 'Access denied to project room' })
          return
        }
      }

      if (userRole === 'DEVELOPER') {
        const hasTasks = await prisma.task.count({ where: { projectId, assigneeId: userId } })
        if (!hasTasks) {
          s.emit('error', { message: 'Access denied to project room' })
          return
        }
      }

      s.join(`project:${projectId}`)
      await prisma.presenceSession.updateMany({
        where: { socketId: s.id },
        data: { projectId },
      })

      const missed = await getMissedLogs({ userId, role: userRole, projectId })
      s.emit('activity:catchup', { logs: missed, projectId })
    })

    s.on('project:leave', async (projectId: string) => {
      s.leave(`project:${projectId}`)
      await prisma.presenceSession.updateMany({
        where: { socketId: s.id },
        data: { projectId: null },
      })
    })

    s.on('ping', async () => {
      await prisma.presenceSession.updateMany({
        where: { socketId: s.id },
        data: { lastPing: new Date() },
      })
    })

    s.on('disconnect', async () => {
      await prisma.presenceSession.deleteMany({ where: { socketId: s.id } })

      const onlineCount = await prisma.presenceSession.count()
      io.to('role:ADMIN').emit('presence:count', { count: onlineCount })
    })
  })
}
