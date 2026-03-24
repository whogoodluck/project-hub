import { Router } from 'express'
import { get } from '../controllers/dashboard.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', authenticate, get)

export default router
