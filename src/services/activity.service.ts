import { TaskStatus } from '../generated/prisma/client'
import prisma from '../lib/prisma'

interface CreateLogParams {
  projectId: string
  taskId?: string
  actorId: string
  actorName: string
  message: string
  affectedAssigneeId?: string
  fromStatus?: TaskStatus
  toStatus?: TaskStatus
}

export async function createActivityLog(params: CreateLogParams) {
  return prisma.activityLog.create({
    data: {
      projectId: params.projectId,
      taskId: params.taskId,
      actorId: params.actorId,
      message: params.message,
      affectedAssigneeId: params.affectedAssigneeId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
    },
    include: {
      actor: { select: { id: true, name: true, role: true } },
      task: { select: { id: true, title: true } },
    },
  })
}

export async function getMissedLogs(params: { userId: string; role: string; projectId?: string }) {
  const { userId, role, projectId } = params

  if (role === 'ADMIN') {
    return prisma.activityLog.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { actor: { select: { id: true, name: true } } },
    })
  }

  if (role === 'PROJECT_MANAGER') {
    return prisma.activityLog.findMany({
      where: {
        project: { managerId: userId },
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { actor: { select: { id: true, name: true } } },
    })
  }

  return prisma.activityLog.findMany({
    where: { affectedAssigneeId: userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { actor: { select: { id: true, name: true } } },
  })
}
