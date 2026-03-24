import { AppError } from '../errors/AppError'
import { Role } from '../generated/prisma/client'
import prisma from '../lib/prisma'
import type { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator'

const PROJECT_INCLUDE = {
  client: { select: { id: true, name: true, company: true } },
  manager: { select: { id: true, name: true, email: true } },
  _count: { select: { tasks: true } },
}

export async function getProjects(userId: string, role: Role) {
  if (role === Role.DEVELOPER) {
    return prisma.project.findMany({
      where: { tasks: { some: { assigneeId: userId } } },
      include: PROJECT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
  }
  const where = role === Role.ADMIN ? {} : { managerId: userId }
  return prisma.project.findMany({
    where,
    include: PROJECT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProject(id: string, userId: string, role: Role) {
  const project = await prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE })
  if (!project) throw new AppError(404, 'Project not found', 'NOT_FOUND')
  if (role === Role.PROJECT_MANAGER && project.managerId !== userId) {
    throw new AppError(403, 'Access denied', 'FORBIDDEN')
  }
  if (role === Role.DEVELOPER) {
    const hasTask = await prisma.task.count({ where: { projectId: id, assigneeId: userId } })
    if (!hasTask) throw new AppError(403, 'Access denied', 'FORBIDDEN')
  }
  return project
}

export async function createProject(data: CreateProjectInput, managerId: string) {
  const clientExists = await prisma.client.findUnique({ where: { id: data.clientId } })
  if (!clientExists) throw new AppError(404, 'Client not found', 'NOT_FOUND')

  return prisma.project.create({
    data: { ...data, managerId },
    include: PROJECT_INCLUDE,
  })
}

export async function updateProject(
  id: string,
  data: UpdateProjectInput,
  userId: string,
  role: Role
) {
  await getProject(id, userId, role)
  return prisma.project.update({ where: { id }, data, include: PROJECT_INCLUDE })
}

export async function deleteProject(id: string, userId: string, role: Role) {
  await getProject(id, userId, role)
  return prisma.project.delete({ where: { id } })
}
