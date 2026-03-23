import { Router } from 'express'
import { getFeed } from '../controllers/activity.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.get('/feed', authenticate, getFeed)

export default router
