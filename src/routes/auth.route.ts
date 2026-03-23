import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { signinSchema, signupSchema } from '../validators/auth.validator'

const router = Router()

router.post('/signup', validate(signupSchema), authController.signup)
router.post('/signin', validate(signinSchema), authController.signin)
router.post('/refresh', authController.refresh)
router.post('/signout', authController.signout)
router.get('/me', authenticate, authController.me)

export default router
