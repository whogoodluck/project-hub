import { AppError } from '../errors/AppError'
import { NotificationType, Role, TaskStatus } from '../generated/prisma/client'
import prisma from '../lib/prisma'
import type {
  CreateTaskInput,
  TaskFilterInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from '../validators/task.validator'
import { createActivityLog } from './activity.service'
import { createNotification } from './notification.service'

const TASK_INCLUDE = {
  assignee: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true, managerId: true } },
}

async function assertProjectAccess(projectId: string, userId: string, role: Role) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new AppError(404, 'Project not found', 'NOT_FOUND')
  if (role === Role.PROJECT_MANAGER && project.managerId !== userId) {
    throw new AppError(403, 'Access denied', 'FORBIDDEN')
  }
  return project
}

async function getTaskOrThrow(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: TASK_INCLUDE })
  if (!task) throw new AppError(404, 'Task not found', 'NOT_FOUND')
  return task
}

export async function getTasks(
  projectId: string,
  userId: string,
  role: Role,
  filters: TaskFilterInput
) {
  await assertProjectAccess(projectId, userId, role)

  const { status, priority, dueDateFrom, dueDateTo, page, limit } = filters

  const where = {
    projectId,
    ...(role === Role.DEVELOPER ? { assigneeId: userId } : {}),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(dueDateFrom || dueDateTo
      ? {
          dueDate: {
            ...(dueDateFrom ? { gte: dueDateFrom } : {}),
            ...(dueDateTo ? { lte: dueDateTo } : {}),
          },
        }
      : {}),
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: TASK_INCLUDE,
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ])

  return { tasks, total, page, limit }
}

export async function getTask(taskId: string, userId: string, role: Role) {
  const task = await getTaskOrThrow(taskId)
  if (role === Role.PROJECT_MANAGER && task.project.managerId !== userId) {
    throw new AppError(403, 'Access denied', 'FORBIDDEN')
  }
  if (role === Role.DEVELOPER && task.assigneeId !== userId) {
    throw new AppError(403, 'Access denied', 'FORBIDDEN')
  }
  return task
}

export async function createTask(
  projectId: string,
  data: CreateTaskInput,
  actor: { id: string; name: string; role: Role }
) {
  const project = await assertProjectAccess(projectId, actor.id, actor.role)

  if (data.assigneeId) {
    const assignee = await prisma.user.findUnique({ where: { id: data.assigneeId } })
    if (!assignee || assignee.role !== Role.DEVELOPER) {
      throw new AppError(400, 'Assignee must be an active developer', 'INVALID_ASSIGNEE')
    }
  }

  const task = await prisma.task.create({
    data: { ...data, projectId },
    include: TASK_INCLUDE,
  })

  const log = await createActivityLog({
    projectId,
    taskId: task.id,
    actorId: actor.id,
    actorName: actor.name,
    message: `${actor.name} created task "${task.title}"`,
    affectedAssigneeId: task.assigneeId ?? undefined,
  })

  if (task.assigneeId) {
    await createNotification({
      recipientId: task.assigneeId,
      taskId: task.id,
      type: NotificationType.TASK_ASSIGNED,
      message: `You were assigned to "${task.title}" in project "${project.name}"`,
    })
  }

  return { task, log }
}

export async function updateTask(
  taskId: string,
  data: UpdateTaskInput,
  actor: { id: string; name: string; role: Role }
) {
  const existing = await getTaskOrThrow(taskId)

  if (actor.role === Role.PROJECT_MANAGER && existing.project.managerId !== actor.id) {
    throw new AppError(403, 'Access denied', 'FORBIDDEN')
  }
  if (actor.role === Role.DEVELOPER) {
    throw new AppError(403, 'Developers cannot edit task details', 'FORBIDDEN')
  }

  const prevAssigneeId = existing.assigneeId
  const task = await prisma.task.update({
    where: { id: taskId },
    data,
    include: TASK_INCLUDE,
  })

  const log = await createActivityLog({
    projectId: task.projectId,
    taskId: task.id,
    actorId: actor.id,
    actorName: actor.name,
    message: `${actor.name} updated task "${task.title}"`,
    affectedAssigneeId: task.assigneeId ?? undefined,
  })

  if (data.assigneeId && data.assigneeId !== prevAssigneeId) {
    await createNotification({
      recipientId: data.assigneeId,
      taskId: task.id,
      type: NotificationType.TASK_ASSIGNED,
      message: `You were assigned to "${task.title}" in project "${task.project.name}"`,
    })
  }

  return { task, log }
}

export async function updateTaskStatus(
  taskId: string,
  data: UpdateTaskStatusInput,
  actor: { id: string; name: string; role: Role }
) {
  const existing = await getTaskOrThrow(taskId)

  if (actor.role === Role.PROJECT_MANAGER && existing.project.managerId !== actor.id) {
    throw new AppError(403, 'Access denied', 'FORBIDDEN')
  }
  if (actor.role === Role.DEVELOPER && existing.assigneeId !== actor.id) {
    throw new AppError(403, 'You can only update your own tasks', 'FORBIDDEN')
  }

  const fromStatus = existing.status
  const toStatus = data.status

  if (fromStatus === toStatus) return { task: existing, log: null }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status: toStatus, ...(toStatus === TaskStatus.DONE ? { isOverdue: false } : {}) },
    include: TASK_INCLUDE,
  })

  const statusLabel = (s: TaskStatus) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const log = await createActivityLog({
    projectId: task.projectId,
    taskId: task.id,
    actorId: actor.id,
    actorName: actor.name,
    message: `${actor.name} moved "${task.title}" from ${statusLabel(fromStatus)} → ${statusLabel(toStatus)}`,
    affectedAssigneeId: task.assigneeId ?? undefined,
    fromStatus,
    toStatus,
  })

  if (toStatus === TaskStatus.IN_REVIEW && task.project.managerId) {
    await createNotification({
      recipientId: task.project.managerId,
      taskId: task.id,
      type: NotificationType.TASK_IN_REVIEW,
      message: `"${task.title}" is ready for review`,
    })
  }

  return { task, log }
}

export async function deleteTask(taskId: string, actor: { id: string; name: string; role: Role }) {
  const task = await getTaskOrThrow(taskId)
  if (actor.role === Role.PROJECT_MANAGER && task.project.managerId !== actor.id) {
    throw new AppError(403, 'Access denied', 'FORBIDDEN')
  }
  if (actor.role === Role.DEVELOPER) {
    throw new AppError(403, 'Developers cannot delete tasks', 'FORBIDDEN')
  }
  await prisma.task.delete({ where: { id: taskId } })
}
