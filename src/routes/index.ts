import { Router } from 'express'
import { PROJECT_NAME } from '../utils/env'
import activityRouter from './activity.route'
import authRouter from './auth.route'
import clientRouter from './client.route'
import dashboardRouter from './dashboard.route'
import notificationRouter from './notification.route'
import projectRouter from './project.route'
import taskRouter from './task.route'
import userRouter from './user.route'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ message: `Welcome to the ${PROJECT_NAME} API!` })
})

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

router.use('/auth', authRouter)
router.use('/clients', clientRouter)
router.use('/projects', projectRouter)
router.use('/projects/:projectId/tasks', taskRouter)
router.use('/activity', activityRouter)
router.use('/notifications', notificationRouter)
router.use('/users', userRouter)
router.use('/dashboard', dashboardRouter)

export default router
