import { NotificationType } from '../generated/prisma/client'
import prisma from '../lib/prisma'

export async function createNotification(params: {
  recipientId: string
  taskId?: string
  type: NotificationType
  message: string
}) {
  return prisma.notification.create({
    data: params,
  })
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { task: { select: { id: true, title: true, projectId: true } } },
  })
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { recipientId: userId, isRead: false },
  })
}

export async function markRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, recipientId: userId },
    data: { isRead: true },
  })
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  })
}
