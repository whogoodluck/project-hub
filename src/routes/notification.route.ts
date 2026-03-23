import { Router } from 'express'
import * as notifController from '../controllers/notification.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/', notifController.list)
router.get('/unread-count', notifController.unreadCount)
router.patch('/:id/read', notifController.markOne)
router.patch('/read-all', notifController.markAll)

export default router
