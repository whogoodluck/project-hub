import { Router } from 'express'
import { PROJECT_NAME } from '../utils/env'
import authRouter from './auth.route'

const router = Router()

router.get('/', (_req, res) => {
  res.status(200).json({
    message: `Welcome to the ${PROJECT_NAME} API!`,
  })
})

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
  })
})

router.use('/auth', authRouter)

export default router
