import { AppError } from '../errors/AppError'
import prisma from '../lib/prisma'
import type { UpdateUserInput } from '../validators/user.validator'

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND')
  return user
}

export async function getDevelopers() {
  return prisma.user.findMany({
    where: { role: 'DEVELOPER', isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })
}

export async function updateUser(id: string, data: UpdateUserInput) {
  await getUser(id)
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })
}
