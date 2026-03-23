import { Router } from 'express'
import * as userController from '../controllers/user.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { updateUserSchema } from '../validators/user.validator'

const router = Router()

router.use(authenticate)

router.get('/', authorize('ADMIN'), userController.list)
router.get('/developers', userController.developers)
router.get('/:id', authorize('ADMIN'), userController.get)
router.patch('/:id', authorize('ADMIN'), validate(updateUserSchema), userController.update)

export default router
