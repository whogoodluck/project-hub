import { Role } from '../generated/prisma/client'

export interface JwtPayload {
  sub: string
  email: string
  role: Role
  iat?: number
  exp?: number
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload
}
