import { Router } from 'express'
import * as projectController from '../controllers/project.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator'

const router = Router()

router.use(authenticate, authorize('ADMIN', 'PROJECT_MANAGER'))

router.get('/', projectController.list)
router.get('/:id', projectController.get)
router.post('/', validate(createProjectSchema), projectController.create)
router.patch('/:id', validate(updateProjectSchema), projectController.update)
router.delete('/:id', projectController.remove)

export default router
