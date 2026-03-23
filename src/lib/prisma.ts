import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { DATABASE_URL, NODE_ENV } from '../utils/env'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: DATABASE_URL!,
})

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  })

if (NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
