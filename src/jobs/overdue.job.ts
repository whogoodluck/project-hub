import cron from 'node-cron'
import prisma from '../lib/prisma'
import { info } from '../utils/logger'

export function startOverdueJob() {
  cron.schedule('0 * * * *', async () => {
    const now = new Date()
    const result = await prisma.task.updateMany({
      where: {
        dueDate: { lt: now },
        isOverdue: false,
        status: { notIn: ['DONE', 'OVERDUE'] },
      },
      data: { isOverdue: true, status: 'OVERDUE' },
    })
    if (result.count > 0) {
      info(`Overdue job: flagged ${result.count} tasks`)
    }
  })
  info('Overdue task scheduler started')
}
