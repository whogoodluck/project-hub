import { Router } from 'express'
import * as clientController from '../controllers/client.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createClientSchema, updateClientSchema } from '../validators/client.validator'

const router = Router()

router.use(authenticate, authorize('ADMIN', 'PROJECT_MANAGER'))

router.get('/', clientController.list)
router.get('/:id', clientController.get)
router.post('/', validate(createClientSchema), clientController.create)
router.patch('/:id', validate(updateClientSchema), clientController.update)
router.delete('/:id', clientController.remove)

export default router
