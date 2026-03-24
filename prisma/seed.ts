import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { PrismaClient, TaskStatus } from '../src/generated/prisma/client'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const hash = (p: string) => bcrypt.hash(p, 12)

async function clearDatabase() {
  await prisma.notification.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.client.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.presenceSession.deleteMany()
  await prisma.user.deleteMany()
}

async function main() {
  console.log('🌱 Seeding database...')

  await clearDatabase()
  console.log('🧹 Database cleared')

  await prisma.$executeRaw`TRUNCATE TABLE presence_sessions, notifications, activity_logs, tasks, projects, clients, refresh_tokens, users RESTART IDENTITY CASCADE`

  const [admin, pm1, pm2, dev1, dev2, dev3, dev4] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alex Admin',
        email: 'admin@hub.dev',
        password: await hash('Admin1234!'),
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya Manager',
        email: 'pm1@hub.dev',
        password: await hash('Manager123!'),
        role: 'PROJECT_MANAGER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ravi Manager',
        email: 'pm2@hub.dev',
        password: await hash('Manager123!'),
        role: 'PROJECT_MANAGER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sam Dev',
        email: 'dev1@hub.dev',
        password: await hash('Dev12345!'),
        role: 'DEVELOPER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Nina Dev',
        email: 'dev2@hub.dev',
        password: await hash('Dev12345!'),
        role: 'DEVELOPER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Arjun Dev',
        email: 'dev3@hub.dev',
        password: await hash('Dev12345!'),
        role: 'DEVELOPER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Zara Dev',
        email: 'dev4@hub.dev',
        password: await hash('Dev12345!'),
        role: 'DEVELOPER',
      },
    }),
  ])

  console.log('✓ Users created')

  const [clientA, clientB, clientC] = await Promise.all([
    prisma.client.create({
      data: {
        name: 'TechNova Inc.',
        email: 'contact@technova.io',
        company: 'TechNova',
        phone: '+1 555 001',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Bright Finance',
        email: 'hello@brightfin.com',
        company: 'Bright Finance',
        phone: '+1 555 002',
      },
    }),
    prisma.client.create({
      data: {
        name: 'GreenLeaf Co.',
        email: 'ops@greenleaf.co',
        company: 'GreenLeaf',
        phone: '+1 555 003',
      },
    }),
  ])

  console.log('✓ Clients created')

  const [proj1, proj2, proj3] = await Promise.all([
    prisma.project.create({
      data: {
        name: 'TechNova Platform Redesign',
        description: 'Full redesign of the customer-facing web platform',
        clientId: clientA.id,
        managerId: pm1.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Bright Finance Dashboard',
        description: 'Real-time analytics dashboard for finance team',
        clientId: clientB.id,
        managerId: pm1.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'GreenLeaf Mobile App',
        description: 'Cross-platform mobile app for sustainability tracking',
        clientId: clientC.id,
        managerId: pm2.id,
      },
    }),
  ])

  console.log('✓ Projects created')

  const now = new Date()
  const past = (d: number) => new Date(now.getTime() - d * 86_400_000)
  const future = (d: number) => new Date(now.getTime() + d * 86_400_000)

  const p1tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design system audit',
        projectId: proj1.id,
        assigneeId: dev1.id,
        status: 'DONE',
        priority: 'HIGH',
        dueDate: past(10),
        isOverdue: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Component library setup',
        projectId: proj1.id,
        assigneeId: dev1.id,
        status: 'DONE',
        priority: 'HIGH',
        dueDate: past(5),
        isOverdue: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Homepage redesign',
        projectId: proj1.id,
        assigneeId: dev2.id,
        status: 'IN_REVIEW',
        priority: 'CRITICAL',
        dueDate: past(2),
        isOverdue: true,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Navigation refactor',
        projectId: proj1.id,
        assigneeId: dev2.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: future(3),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Mobile responsiveness',
        projectId: proj1.id,
        assigneeId: dev3.id,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: future(7),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Performance optimisation',
        projectId: proj1.id,
        assigneeId: dev3.id,
        status: 'TODO',
        priority: 'LOW',
        dueDate: future(14),
      },
    }),
  ])

  const p2tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'API integration spec',
        projectId: proj2.id,
        assigneeId: dev1.id,
        status: 'DONE',
        priority: 'CRITICAL',
        dueDate: past(8),
        isOverdue: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Chart components',
        projectId: proj2.id,
        assigneeId: dev4.id,
        status: 'IN_REVIEW',
        priority: 'HIGH',
        dueDate: past(1),
        isOverdue: true,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Real-time data feed',
        projectId: proj2.id,
        assigneeId: dev4.id,
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        dueDate: future(2),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Export to PDF/CSV',
        projectId: proj2.id,
        assigneeId: dev2.id,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: future(6),
      },
    }),
    prisma.task.create({
      data: {
        title: 'User permissions UI',
        projectId: proj2.id,
        assigneeId: dev3.id,
        status: 'TODO',
        priority: 'HIGH',
        dueDate: future(5),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Dark mode support',
        projectId: proj2.id,
        assigneeId: dev1.id,
        status: 'TODO',
        priority: 'LOW',
        dueDate: future(10),
      },
    }),
  ])

  const p3tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'App architecture planning',
        projectId: proj3.id,
        assigneeId: dev2.id,
        status: 'DONE',
        priority: 'HIGH',
        dueDate: past(15),
        isOverdue: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Auth flow implementation',
        projectId: proj3.id,
        assigneeId: dev2.id,
        status: 'DONE',
        priority: 'CRITICAL',
        dueDate: past(7),
        isOverdue: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Carbon tracker screen',
        projectId: proj3.id,
        assigneeId: dev3.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: future(4),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Push notifications',
        projectId: proj3.id,
        assigneeId: dev4.id,
        status: 'IN_REVIEW',
        priority: 'MEDIUM',
        dueDate: future(1),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Offline mode support',
        projectId: proj3.id,
        assigneeId: dev4.id,
        status: 'TODO',
        priority: 'LOW',
        dueDate: future(12),
      },
    }),
    prisma.task.create({
      data: {
        title: 'App Store submission',
        projectId: proj3.id,
        assigneeId: dev3.id,
        status: 'TODO',
        priority: 'CRITICAL',
        dueDate: future(20),
      },
    }),
  ])

  console.log('✓ Tasks created')

  const logEntries = [
    {
      projectId: proj1.id,
      taskId: p1tasks[0].id,
      actorId: dev1.id,
      message: `Sam Dev completed "Design system audit"`,
      toStatus: 'DONE' as TaskStatus,
      fromStatus: 'IN_REVIEW' as TaskStatus,
      affectedAssigneeId: dev1.id,
      createdAt: past(10),
    },
    {
      projectId: proj1.id,
      taskId: p1tasks[1].id,
      actorId: dev1.id,
      message: `Sam Dev completed "Component library setup"`,
      toStatus: 'DONE' as TaskStatus,
      fromStatus: 'IN_PROGRESS' as TaskStatus,
      affectedAssigneeId: dev1.id,
      createdAt: past(5),
    },
    {
      projectId: proj1.id,
      taskId: p1tasks[2].id,
      actorId: dev2.id,
      message: `Nina Dev moved "Homepage redesign" from In Progress → In Review`,
      toStatus: 'IN_REVIEW' as TaskStatus,
      fromStatus: 'IN_PROGRESS' as TaskStatus,
      affectedAssigneeId: dev2.id,
      createdAt: past(2),
    },
    {
      projectId: proj1.id,
      taskId: p1tasks[3].id,
      actorId: pm1.id,
      message: `Priya Manager created task "Navigation refactor"`,
      affectedAssigneeId: dev2.id,
      createdAt: past(3),
    },
    {
      projectId: proj2.id,
      taskId: p2tasks[0].id,
      actorId: dev1.id,
      message: `Sam Dev completed "API integration spec"`,
      toStatus: 'DONE' as TaskStatus,
      fromStatus: 'IN_REVIEW' as TaskStatus,
      affectedAssigneeId: dev1.id,
      createdAt: past(8),
    },
    {
      projectId: proj2.id,
      taskId: p2tasks[1].id,
      actorId: dev4.id,
      message: `Zara Dev moved "Chart components" from In Progress → In Review`,
      toStatus: 'IN_REVIEW' as TaskStatus,
      fromStatus: 'IN_PROGRESS' as TaskStatus,
      affectedAssigneeId: dev4.id,
      createdAt: past(1),
    },
    {
      projectId: proj2.id,
      taskId: p2tasks[2].id,
      actorId: dev4.id,
      message: `Zara Dev started "Real-time data feed"`,
      toStatus: 'IN_PROGRESS' as TaskStatus,
      fromStatus: 'TODO' as TaskStatus,
      affectedAssigneeId: dev4.id,
      createdAt: past(0),
    },
    {
      projectId: proj3.id,
      taskId: p3tasks[0].id,
      actorId: dev2.id,
      message: `Nina Dev completed "App architecture planning"`,
      toStatus: 'DONE' as TaskStatus,
      fromStatus: 'IN_REVIEW' as TaskStatus,
      affectedAssigneeId: dev2.id,
      createdAt: past(15),
    },
    {
      projectId: proj3.id,
      taskId: p3tasks[3].id,
      actorId: dev4.id,
      message: `Zara Dev moved "Push notifications" to In Review`,
      toStatus: 'IN_REVIEW' as TaskStatus,
      fromStatus: 'IN_PROGRESS' as TaskStatus,
      affectedAssigneeId: dev4.id,
      createdAt: past(0),
    },
    {
      projectId: proj1.id,
      taskId: p1tasks[4].id,
      actorId: pm1.id,
      message: `Priya Manager assigned "Mobile responsiveness" to Arjun Dev`,
      affectedAssigneeId: dev3.id,
      createdAt: past(1),
    },
  ]

  for (const entry of logEntries) {
    await prisma.activityLog.create({ data: entry })
  }

  console.log('✓ Activity logs created')

  await Promise.all([
    prisma.notification.create({
      data: {
        recipientId: dev1.id,
        taskId: p1tasks[0].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Design system audit" in TechNova Platform Redesign',
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: dev2.id,
        taskId: p1tasks[2].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Homepage redesign" in TechNova Platform Redesign',
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: pm1.id,
        taskId: p1tasks[2].id,
        type: 'TASK_IN_REVIEW',
        message: '"Homepage redesign" is ready for review',
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: dev4.id,
        taskId: p2tasks[1].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Chart components" in Bright Finance Dashboard',
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: pm1.id,
        taskId: p2tasks[1].id,
        type: 'TASK_IN_REVIEW',
        message: '"Chart components" is ready for review',
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: dev4.id,
        taskId: p3tasks[3].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Push notifications" in GreenLeaf Mobile App',
        isRead: true,
      },
    }),
  ])

  console.log('✓ Notifications created')

  console.log('\n✅ Seed complete!\n')
  console.log('Login credentials:')
  console.log('  Admin:           admin@hub.dev       / Admin1234!')
  console.log('  Project Manager: pm1@hub.dev         / Manager123!')
  console.log('  Project Manager: pm2@hub.dev         / Manager123!')
  console.log('  Developer:       dev1@hub.dev        / Dev12345!')
  console.log('  Developer:       dev2@hub.dev        / Dev12345!')
  console.log('  Developer:       dev3@hub.dev        / Dev12345!')
  console.log('  Developer:       dev4@hub.dev        / Dev12345!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
