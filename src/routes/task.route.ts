import { Router } from 'express'
import * as taskController from '../controllers/task.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validator'

const router = Router({ mergeParams: true })

router.use(authenticate)

router.get('/', taskController.list)
router.get('/:taskId', taskController.get)

router.post(
  '/',
  authorize('ADMIN', 'PROJECT_MANAGER'),
  validate(createTaskSchema),
  taskController.create
)

router.patch(
  '/:taskId',
  authorize('ADMIN', 'PROJECT_MANAGER'),
  validate(updateTaskSchema),
  taskController.update
)

router.patch('/:taskId/status', validate(updateTaskStatusSchema), taskController.updateStatus)

router.delete('/:taskId', authorize('ADMIN', 'PROJECT_MANAGER'), taskController.remove)

export default router
