import { z } from 'zod'
import { Role } from '../generated/prisma/client'

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.nativeEnum(Role).optional().default(Role.DEVELOPER),
})

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type SignupInput = z.infer<typeof signupSchema>
export type SigninInput = z.infer<typeof signinSchema>
