import { AppError } from '../errors/AppError'
import prisma from '../lib/prisma'
import type { CreateClientInput, UpdateClientInput } from '../validators/client.validator'

export async function getClients() {
  return prisma.client.findMany({ orderBy: { name: 'asc' } })
}

export async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { projects: { select: { id: true, name: true, isArchived: true } } },
  })
  if (!client) throw new AppError(404, 'Client not found', 'NOT_FOUND')
  return client
}

export async function createClient(data: CreateClientInput) {
  return prisma.client.create({ data })
}

export async function updateClient(id: string, data: UpdateClientInput) {
  await getClient(id)
  return prisma.client.update({ where: { id }, data })
}

export async function deleteClient(id: string) {
  await getClient(id)
  const hasProjects = await prisma.project.count({ where: { clientId: id } })
  if (hasProjects)
    throw new AppError(409, 'Cannot delete client with existing projects', 'CONFLICT')
  return prisma.client.delete({ where: { id } })
}
