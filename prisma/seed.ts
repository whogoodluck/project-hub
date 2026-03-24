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

  /* eslint-disable @typescript-eslint/no-unused-vars */
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
    // dev1 — proj1
    prisma.task.create({
      data: {
        title: 'Design system audit',
        description: 'Audit existing components against the new design tokens',
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
        description: 'Bootstrap Storybook with base UI components',
        projectId: proj1.id,
        assigneeId: dev1.id,
        status: 'DONE',
        priority: 'HIGH',
        dueDate: past(5),
        isOverdue: false,
      },
    }),
    // dev2 — proj1 (dev1 cannot see these)
    prisma.task.create({
      data: {
        title: 'Homepage redesign',
        description: 'Implement new hero, features section, and CTA layout',
        projectId: proj1.id,
        assigneeId: dev2.id,
        status: 'IN_REVIEW',
        priority: 'CRITICAL',
        dueDate: past(2),
        isOverdue: true, // overdue #1
      },
    }),
    prisma.task.create({
      data: {
        title: 'Navigation refactor',
        description: 'Replace legacy nav with accessible dropdown menu',
        projectId: proj1.id,
        assigneeId: dev2.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: future(3),
      },
    }),
    // dev3 — proj1 (dev1 and dev2 cannot see these)
    prisma.task.create({
      data: {
        title: 'Mobile responsiveness',
        description: 'Ensure all pages render correctly on 320px–768px viewports',
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
        description: 'Achieve Lighthouse score ≥ 90 on all pages',
        projectId: proj1.id,
        assigneeId: dev3.id,
        status: 'TODO',
        priority: 'LOW',
        dueDate: future(14),
      },
    }),
  ])

  const p2tasks = await Promise.all([
    // dev1 — proj2
    prisma.task.create({
      data: {
        title: 'API integration spec',
        description: 'Document all REST endpoints and response shapes',
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
        title: 'Dark mode support',
        description: 'Add CSS variable overrides for dark theme',
        projectId: proj2.id,
        assigneeId: dev1.id,
        status: 'TODO',
        priority: 'LOW',
        dueDate: future(10),
      },
    }),
    // dev4 — proj2 (dev1 cannot see these)
    prisma.task.create({
      data: {
        title: 'Chart components',
        description: 'Build reusable line, bar, and pie chart wrappers',
        projectId: proj2.id,
        assigneeId: dev4.id,
        status: 'IN_REVIEW',
        priority: 'HIGH',
        dueDate: past(1),
        isOverdue: true, // overdue #2
      },
    }),
    prisma.task.create({
      data: {
        title: 'Real-time data feed',
        description: 'WebSocket integration for live KPI updates',
        projectId: proj2.id,
        assigneeId: dev4.id,
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        dueDate: future(2),
      },
    }),
    // unassigned tasks — visible to pm1 and admin only; no developer can see these
    prisma.task.create({
      data: {
        title: 'Export to PDF/CSV',
        description: 'Allow users to export any dashboard view',
        projectId: proj2.id,
        assigneeId: null,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: future(6),
      },
    }),
    prisma.task.create({
      data: {
        title: 'User permissions UI',
        description: 'Role selector and permission matrix screen',
        projectId: proj2.id,
        assigneeId: null,
        status: 'TODO',
        priority: 'HIGH',
        dueDate: future(5),
      },
    }),
  ])

  const p3tasks = await Promise.all([
    // dev2 — proj3
    prisma.task.create({
      data: {
        title: 'App architecture planning',
        description: 'Choose React Native vs Expo and define folder structure',
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
        description: 'Email/password + OAuth2 login screens',
        projectId: proj3.id,
        assigneeId: dev2.id,
        status: 'DONE',
        priority: 'CRITICAL',
        dueDate: past(7),
        isOverdue: false,
      },
    }),
    // dev3 — proj3 (dev2 cannot see these)
    prisma.task.create({
      data: {
        title: 'Carbon tracker screen',
        description: 'Daily carbon footprint input and running total UI',
        projectId: proj3.id,
        assigneeId: dev3.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: future(4),
      },
    }),
    prisma.task.create({
      data: {
        title: 'App Store submission',
        description: 'Prepare screenshots, metadata and submit for review',
        projectId: proj3.id,
        assigneeId: dev3.id,
        status: 'TODO',
        priority: 'CRITICAL',
        dueDate: future(20),
      },
    }),
    // dev4 — proj3 (dev2 and dev3 cannot see these)
    prisma.task.create({
      data: {
        title: 'Push notifications',
        description: 'FCM/APNs integration for daily reminders',
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
        description: 'Cache last 7 days of data with SQLite',
        projectId: proj3.id,
        assigneeId: dev4.id,
        status: 'TODO',
        priority: 'LOW',
        dueDate: future(12),
      },
    }),
  ])

  console.log('✓ Tasks created')

  const logEntries = [
    {
      projectId: proj1.id,
      taskId: p1tasks[0].id,
      actorId: dev1.id,
      message: 'Sam Dev completed "Design system audit"',
      fromStatus: 'IN_REVIEW' as TaskStatus,
      toStatus: 'DONE' as TaskStatus,
      affectedAssigneeId: dev1.id,
      createdAt: past(10),
    },
    {
      projectId: proj1.id,
      taskId: p1tasks[1].id,
      actorId: dev1.id,
      message: 'Sam Dev completed "Component library setup"',
      fromStatus: 'IN_PROGRESS' as TaskStatus,
      toStatus: 'DONE' as TaskStatus,
      affectedAssigneeId: dev1.id,
      createdAt: past(5),
    },
    {
      projectId: proj1.id,
      taskId: p1tasks[2].id,
      actorId: dev2.id,
      message: 'Nina Dev moved "Homepage redesign" from In Progress → In Review',
      fromStatus: 'IN_PROGRESS' as TaskStatus,
      toStatus: 'IN_REVIEW' as TaskStatus,
      affectedAssigneeId: dev2.id, // dev1/dev3/dev4 cannot see this
      createdAt: past(2),
    },
    {
      projectId: proj1.id,
      taskId: p1tasks[3].id,
      actorId: pm1.id,
      message: 'Priya Manager created "Navigation refactor" and assigned to Nina Dev',
      affectedAssigneeId: dev2.id,
      createdAt: past(3),
    },
    {
      projectId: proj1.id,
      taskId: p1tasks[4].id,
      actorId: pm1.id,
      message: 'Priya Manager assigned "Mobile responsiveness" to Arjun Dev',
      affectedAssigneeId: dev3.id, // only dev3 sees this among developers
      createdAt: past(1),
    },
    // ── proj2 (pm1 scope) ──
    {
      projectId: proj2.id,
      taskId: p2tasks[0].id,
      actorId: dev1.id,
      message: 'Sam Dev completed "API integration spec"',
      fromStatus: 'IN_REVIEW' as TaskStatus,
      toStatus: 'DONE' as TaskStatus,
      affectedAssigneeId: dev1.id,
      createdAt: past(8),
    },
    {
      projectId: proj2.id,
      taskId: p2tasks[2].id,
      actorId: dev4.id,
      message: 'Zara Dev moved "Chart components" from In Progress → In Review',
      fromStatus: 'IN_PROGRESS' as TaskStatus,
      toStatus: 'IN_REVIEW' as TaskStatus,
      affectedAssigneeId: dev4.id, // dev1 cannot see this
      createdAt: past(1),
    },
    {
      projectId: proj2.id,
      taskId: p2tasks[3].id,
      actorId: dev4.id,
      message: 'Zara Dev started "Real-time data feed"',
      fromStatus: 'TODO' as TaskStatus,
      toStatus: 'IN_PROGRESS' as TaskStatus,
      affectedAssigneeId: dev4.id,
      createdAt: past(0),
    },
    // ── proj3 (pm2 scope — pm1 cannot see any of these) ──
    {
      projectId: proj3.id,
      taskId: p3tasks[0].id,
      actorId: dev2.id,
      message: 'Nina Dev completed "App architecture planning"',
      fromStatus: 'IN_REVIEW' as TaskStatus,
      toStatus: 'DONE' as TaskStatus,
      affectedAssigneeId: dev2.id,
      createdAt: past(15),
    },
    {
      projectId: proj3.id,
      taskId: p3tasks[1].id,
      actorId: dev2.id,
      message: 'Nina Dev completed "Auth flow implementation"',
      fromStatus: 'IN_PROGRESS' as TaskStatus,
      toStatus: 'DONE' as TaskStatus,
      affectedAssigneeId: dev2.id,
      createdAt: past(7),
    },
    {
      projectId: proj3.id,
      taskId: p3tasks[2].id,
      actorId: dev3.id,
      message: 'Arjun Dev started "Carbon tracker screen"',
      fromStatus: 'TODO' as TaskStatus,
      toStatus: 'IN_PROGRESS' as TaskStatus,
      affectedAssigneeId: dev3.id, // dev2/dev4 cannot see this
      createdAt: past(1),
    },
    {
      projectId: proj3.id,
      taskId: p3tasks[4].id,
      actorId: dev4.id,
      message: 'Zara Dev moved "Push notifications" to In Review',
      fromStatus: 'IN_PROGRESS' as TaskStatus,
      toStatus: 'IN_REVIEW' as TaskStatus,
      affectedAssigneeId: dev4.id, // dev2/dev3 cannot see this
      createdAt: past(0),
    },
  ]

  for (const entry of logEntries) {
    await prisma.activityLog.create({ data: entry })
  }

  console.log('✓ Activity logs created')

  await Promise.all([
    // dev1 (Sam) — assigned to tasks in proj1 + proj2
    prisma.notification.create({
      data: {
        recipientId: dev1.id,
        taskId: p1tasks[0].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Design system audit" in TechNova Platform Redesign',
        isRead: true,
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: dev1.id,
        taskId: p2tasks[0].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "API integration spec" in Bright Finance Dashboard',
        isRead: true,
      },
    }),
    // dev2 (Nina) — assigned to tasks in proj1 + proj3; no notifications about dev1/dev3/dev4 tasks
    prisma.notification.create({
      data: {
        recipientId: dev2.id,
        taskId: p1tasks[2].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Homepage redesign" in TechNova Platform Redesign',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: dev2.id,
        taskId: p3tasks[0].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "App architecture planning" in GreenLeaf Mobile App',
        isRead: true,
      },
    }),
    // dev3 (Arjun) — assigned to tasks in proj1 + proj3
    prisma.notification.create({
      data: {
        recipientId: dev3.id,
        taskId: p1tasks[4].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Mobile responsiveness" in TechNova Platform Redesign',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: dev3.id,
        taskId: p3tasks[2].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Carbon tracker screen" in GreenLeaf Mobile App',
        isRead: false,
      },
    }),
    // dev4 (Zara) — assigned to tasks in proj2 + proj3
    prisma.notification.create({
      data: {
        recipientId: dev4.id,
        taskId: p2tasks[2].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Chart components" in Bright Finance Dashboard',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: dev4.id,
        taskId: p3tasks[4].id,
        type: 'TASK_ASSIGNED',
        message: 'You were assigned to "Push notifications" in GreenLeaf Mobile App',
        isRead: true,
      },
    }),
    // pm1 (Priya) — IN_REVIEW from proj1 and proj2 ONLY; never receives proj3 notifications
    prisma.notification.create({
      data: {
        recipientId: pm1.id,
        taskId: p1tasks[2].id,
        type: 'TASK_IN_REVIEW',
        message: '"Homepage redesign" is ready for review in TechNova Platform Redesign',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        recipientId: pm1.id,
        taskId: p2tasks[2].id,
        type: 'TASK_IN_REVIEW',
        message: '"Chart components" is ready for review in Bright Finance Dashboard',
        isRead: false,
      },
    }),
    // pm2 (Ravi) — IN_REVIEW from proj3 ONLY; never receives proj1/proj2 notifications
    prisma.notification.create({
      data: {
        recipientId: pm2.id,
        taskId: p3tasks[4].id,
        type: 'TASK_IN_REVIEW',
        message: '"Push notifications" is ready for review in GreenLeaf Mobile App',
        isRead: false,
      },
    }),
  ])

  console.log('✓ Notifications created')

  console.log('\n✅ Seed complete!\n')
  console.log('Role access summary:')
  console.log('  ADMIN (Alex)    all 3 projects · all tasks · all activity · all users')
  console.log('  pm1 (Priya)     proj1 + proj2 only · cannot access proj3')
  console.log('  pm2 (Ravi)      proj3 only · cannot access proj1 or proj2')
  console.log('  dev1 (Sam)      only his tasks in proj1 + proj2')
  console.log('  dev2 (Nina)     only her tasks in proj1 + proj3')
  console.log('  dev3 (Arjun)    only his tasks in proj1 + proj3')
  console.log('  dev4 (Zara)     only her tasks in proj2 + proj3')
  console.log('\nLogin credentials:')
  console.log('  admin@hub.dev   Admin1234!')
  console.log('  pm1@hub.dev     Manager123!')
  console.log('  pm2@hub.dev     Manager123!')
  console.log('  dev1@hub.dev    Dev12345!')
  console.log('  dev2@hub.dev    Dev12345!')
  console.log('  dev3@hub.dev    Dev12345!')
  console.log('  dev4@hub.dev    Dev12345!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
