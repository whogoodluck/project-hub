import { Router } from 'express'
import * as projectController from '../controllers/project.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator'

const router = Router()

router.use(authenticate)

router.get('/', projectController.list)
router.get('/:id', projectController.get)

router.post(
  '/',
  authorize('ADMIN', 'PROJECT_MANAGER'),
  validate(createProjectSchema),
  projectController.create
)
router.patch(
  '/:id',
  authorize('ADMIN', 'PROJECT_MANAGER'),
  validate(updateProjectSchema),
  projectController.update
)
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), projectController.remove)

export default router
