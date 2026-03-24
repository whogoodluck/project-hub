import { Router } from 'express'
import * as clientController from '../controllers/client.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createClientSchema, updateClientSchema } from '../validators/client.validator'

const router = Router()

router.use(authenticate)

router.get('/', clientController.list)
router.get('/:id', clientController.get)

router.post(
  '/',
  authorize('ADMIN', 'PROJECT_MANAGER'),
  validate(createClientSchema),
  clientController.create
)
router.patch(
  '/:id',
  authorize('ADMIN', 'PROJECT_MANAGER'),
  validate(updateClientSchema),
  clientController.update
)
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), clientController.remove)

export default router
