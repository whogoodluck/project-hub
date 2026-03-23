import { Role } from '../generated/prisma/client'

export interface JwtPayload {
  id: string
  sub: string
  email: string
  name: string
  role: Role
  iat?: number
  exp?: number
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload
}
