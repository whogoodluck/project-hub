import { Role } from '../generated/prisma/client'
import prisma from '../lib/prisma'

export async function getAdminDashboard() {
  const [totalProjects, tasksByStatus, overdueCount, onlineCount] = await Promise.all([
    prisma.project.count(),
    prisma.task.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.task.count({ where: { isOverdue: true } }),
    prisma.presenceSession.count(),
  ])

  return {
    totalProjects,
    tasksByStatus: Object.fromEntries(tasksByStatus.map(r => [r.status, r._count.status])),
    overdueCount,
    onlineCount,
  }
}

export async function getPmDashboard(managerId: string) {
  const projects = await prisma.project.findMany({
    where: { managerId },
    include: {
      _count: { select: { tasks: true } },
      tasks: {
        select: { status: true, priority: true, dueDate: true, title: true, id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() + 7)

  const allTasks = projects.flatMap(p => p.tasks)
  const tasksByPriority = allTasks.reduce(
    (acc, t) => {
      acc[t.priority] = (acc[t.priority] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const upcoming = allTasks.filter(t => t.dueDate && t.dueDate >= now && t.dueDate <= weekEnd)

  return { projects, tasksByPriority, upcomingThisWeek: upcoming }
}

export async function getDeveloperDashboard(userId: string) {
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: { project: { select: { id: true, name: true } } },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
  })

  const byStatus = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return { tasks, byStatus }
}

export async function getDashboard(userId: string, role: Role) {
  switch (role) {
    case Role.ADMIN:
      return getAdminDashboard()
    case Role.PROJECT_MANAGER:
      return getPmDashboard(userId)
    case Role.DEVELOPER:
      return getDeveloperDashboard(userId)
  }
}
