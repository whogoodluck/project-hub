import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError'
import { Role } from '../generated/prisma/client'

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated', 'UNAUTHORIZED')
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions', 'FORBIDDEN')
    }

    next()
  }
}
